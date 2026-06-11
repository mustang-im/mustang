import { ChatAccount } from '../ChatAccount';
import type { ChatRoom } from '../ChatRoom';
import type { XMPPChat } from './XMPPChat';
import { XMPP1to1Chat } from './XMPP1to1Chat';
import { XMPPGroupChat } from './XMPPGroupChat';
import type { Group } from '../../Abstract/Group';
import { Person } from '../../Abstract/Person';
import { ChatPerson, nameFromChatID } from '../ChatPerson';
import { ConnectError, LoginError } from '../../Abstract/Account';
import { kImageMimeTypes } from '../../Files/FileType/MIMETypes';
import { appGlobal } from '../../app';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';
import { assert, blobToDataURL } from '../../util/util';
import { gt } from '../../../l10n/l10n';
import { MapColl } from 'svelte-collections';
import type * as XMPP from 'stanza';

export class XMPPAccount extends ChatAccount {
  readonly protocol: string = "xmpp";
  readonly rooms = new MapColl<ChatPerson | Group, XMPPChat>;
  /** Bare JID -> contact, for the people on our server-side contact list */
  readonly roster = new MapColl<string, Person>();
  client: XMPP.Agent;
  deviceID: string;
  /** Bare JID of our own user */
  jid: string;
  /** Whether the server supports message archives (XEP-0313) */
  hasMAM = true;

  get isLoggedIn(): boolean {
    return !!this.client?.sessionStarted;
  }

  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `roster` and `rooms`. */
  async login(interactive: boolean): Promise<void> {
    if (this.isLoggedIn) {
      return;
    }
    await super.login(interactive);
    await this.listRooms(); // saves account, loads known chats from DB
    await this.connect();
    await this.getRoster();
    await this.createChatsFromRoster();
    this.client.sendPresence();
    this.client.enableKeepAlive();
    this.client.enableCarbons()
      .catch(ex => console.log("XMPP carbons not enabled", ex?.error?.condition ?? ex));
    this.listMessagesOfAllChatRooms()
      .catch(this.errorCallback);
    this.getAllPersonDetails()
      .catch(this.errorCallback);
  }

  /** For setup only. Test that the login works. */
  async verifyLogin(): Promise<void> {
    await super.login(true);
    await this.connect();
    await this.disconnect();
  }

  async connect(): Promise<void> {
    await this.disconnect();
    this.jid = getBareJID(this.username);
    assert(this.jid?.includes("@"), gt`XMPP username must be a Jabber ID in the form username@server`);
    const XMPP = await import("stanza");
    this.client = XMPP.createClient({
      jid: this.jid,
      password: this.password,
      // credentials: { token: ... }, TODO OAuth2

      // If no URL is configured, find it using
      // `/.well-known/host-meta.json` of the JID domain, per XEP-0156.
      transports: {
        websocket: this.url?.startsWith("wss:") ? this.url : !this.url,
        bosh: this.url?.startsWith("https:") ? this.url : !this.url,
      },
    });
    this.addListeners();
    await this.connectAndWaitForSession();
    this.client.updateConfig({ autoReconnect: true });
  }

  /** stanza's `connect()` returns once the connection attempt started,
   * not when it's logged in, so wait for the session events. */
  protected async connectAndWaitForSession(): Promise<void> {
    let client = this.client;
    await new Promise<void>((resolve, reject) => {
      let cleanup = () => {
        clearTimeout(timeout);
        client.off("session:started", onSuccess);
        client.off("auth:failed", onAuthFailed);
        client.off("stream:error", onStreamError);
        client.off("disconnected", onDisconnected);
      };
      let onSuccess = () => {
        cleanup();
        resolve();
      };
      let onAuthFailed = () => {
        cleanup();
        reject(new LoginError(null, gt`Login failed`));
      };
      let onStreamError = (streamError: XMPP.Stanzas.StreamError, error?: Error) => {
        cleanup();
        let text = sanitize.nonemptylabel(streamError?.text, null);
        reject(new ConnectError(error, text ?? gt`Failed to connect to chat account ${this.name}`));
      };
      let onDisconnected = () => {
        cleanup();
        reject(new ConnectError(null, gt`Failed to connect to chat account ${this.name}`));
      };
      let timeout = setTimeout(onDisconnected, kNetworkTimeoutInMS);
      client.on("session:started", onSuccess);
      client.on("auth:failed", onAuthFailed);
      client.on("stream:error", onStreamError);
      client.on("disconnected", onDisconnected);
      client.connect();
    });
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }
    let client = this.client;
    this.client = null;
    this.isOnline = false;
    client.updateConfig({ autoReconnect: false });
    await client.disconnect();
  }

  /** Gets the contact list from the server, and the `Person` for each entry */
  async getRoster(): Promise<void> {
    let roster = await this.client.getRoster();
    for (let item of roster.items ?? []) {
      try {
        await this.getPerson(item.jid, item.name);
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
  }

  /** Makes sure that each roster entry has a 1:1 chat */
  protected async createChatsFromRoster(): Promise<void> {
    for (let jid of this.roster.keys()) {
      try {
        if (this.getExistingChat(jid)) {
          continue;
        }
        await this.getNewChat(jid);
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
  }

  /** Gets new messages of all chats from the server archive,
   * skipping messages that are already in our DB */
  protected async listMessagesOfAllChatRooms(): Promise<void> {
    for (let chatRoom of this.rooms.contents) {
      try {
        await chatRoom.listMessages();
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
  }

  /** Gets profile photos etc. for the roster contacts, where missing */
  protected async getAllPersonDetails(): Promise<void> {
    for (let jid of this.roster.keys()) {
      let person = this.roster.get(jid);
      if (person.picture) {
        continue;
      }
      let vcard: XMPP.Stanzas.VCardTemp;
      try {
        vcard = await this.client.getVCard(jid);
      } catch (ex) {
        continue; // contact has no vCard
      }
      try {
        let fullName = sanitize.nonemptylabel(vcard.fullName, null);
        if (fullName && person.name == nameFromChatID(jid)) {
          person.name = fullName;
        }
        let photo = vcard.records?.find(r => r.type == "photo") as XMPP.Stanzas.VCardTempPhoto;
        if (photo?.data) {
          let mimetype = sanitize.enum(photo.mediaType, kImageMimeTypes);
          let blob = new Blob([new Uint8Array(photo.data)], { type: mimetype });
          person.picture = await blobToDataURL(blob);
        }
        await person.save();
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
  }

  newRoom(): ChatRoom {
    return new XMPP1to1Chat(this);
  }

  async getNewChat(jid: string): Promise<XMPPChat> {
    jid = getBareJID(jid);
    let person = await this.getPerson(jid);
    let existing = this.getExistingChat(jid); // two messages of a new peer may race here
    if (existing) {
      return existing;
    }
    let chatRoom = new XMPP1to1Chat(this);
    chatRoom.id = jid;
    chatRoom.contact = person as any;
    this.rooms.set(person as any, chatRoom);
    await chatRoom.save();
    return chatRoom;
  }

  async getNewGroupRoom(jid: string): Promise<XMPPChat | null> {
    jid = getBareJID(jid);
    if (this.getExistingChat(jid)) {
      return null;
    }
    let chatRoom = new XMPPGroupChat(this);
    chatRoom.id = jid;
    await chatRoom.init();
    await chatRoom.listMembers();
    this.rooms.set(chatRoom.contact, chatRoom);
    return chatRoom;
  }

  getExistingChat(jid: string): XMPPChat | null {
    jid = getBareJID(jid);
    return this.rooms.find(room => room.id == jid);
  }

  getExistingPerson(jid: string): Person | null {
    return this.roster.get(getBareJID(jid));
  }

  /** Finds the contact for this JID, first in the roster, then in the
   * address books by chat ID or email address (JIDs often double as
   * email address). Creates the contact, if not found. */
  async getPerson(jid: string, name?: string): Promise<Person> {
    jid = getBareJID(jid);
    name = sanitize.nonemptylabel(name, null);
    let existing = this.roster.get(jid);
    if (existing) {
      return existing;
    }
    assert(appGlobal.personalAddressbook, "Need address book for chat contacts");
    let chatPerson = new ChatPerson("xmpp", jid, name);
    let person = chatPerson.findPerson();
    if (!person) {
      person = chatPerson.createPerson(appGlobal.personalAddressbook);
      await person.save();
    }
    this.roster.set(jid, person);
    return person;
  }

  protected addListeners(): void {
    this.client.on("session:started", () => {
      this.isOnline = true;
    });
    this.client.on("disconnected", () => {
      this.isOnline = false;
    });
    this.client.on("chat", msg => {
      this.onIncomingMessage(msg)
        .catch(this.errorCallback);
    });
    this.client.on("message:sent", (msg, sentCopy) => {
      if (sentCopy) { // sent by our user from another client
        this.onIncomingMessage(msg)
          .catch(this.errorCallback);
      }
    });
    this.client.on("message:error", msg => {
      let reason = sanitize.nonemptylabel(msg.error?.text, null) ??
        sanitize.alphanumdash(msg.error?.condition, "");
      this.errorCallback(new Error(gt`Chat message failed` + ": " + reason));
    });
  }

  /** A message arrived over the open connection */
  protected async onIncomingMessage(xmppMsg: XMPP.Stanzas.Message): Promise<void> {
    if (!xmppMsg.body) {
      return; // typing notification, read receipt etc.
    }
    let from = getBareJID(xmppMsg.from);
    let peer = from == this.jid ? getBareJID(xmppMsg.to) : from;
    if (!peer) {
      return;
    }
    let chatRoom = this.getExistingChat(peer) ?? await this.getNewChat(peer);
    let msg = chatRoom.addMessage(xmppMsg);
    if (!msg) {
      return;
    }
    chatRoom.lastMessage = msg;
    await chatRoom.saveNewMessages([msg]);
  }
}

/** @returns the JID without the resource, e.g. "fred@example.com" */
export function getBareJID(jid: string): string {
  return sanitize.nonemptystring(jid, null)?.split("/")[0].toLowerCase();
}

const kNetworkTimeoutInMS = 5 * 1000; // 5 seconds
