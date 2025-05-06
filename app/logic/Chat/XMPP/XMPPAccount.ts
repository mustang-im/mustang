import { ChatAccount } from '../ChatAccount';
import type { XMPPChat } from './XMPPChat';
import { XMPP1to1Chat } from './XMPP1to1Chat';
import { XMPPGroupChat } from './XMPPGroupChat';
import type { Group } from '../../Abstract/Group';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { appGlobal } from '../../app';
import { ConnectError } from '../../Abstract/Account';
import { gt } from '../../../l10n/l10n';
import { MapColl } from 'svelte-collections';
import * as XMPP from 'stanza';

export class XMPPAccount extends ChatAccount {
  readonly protocol: string = "xmpp";
  readonly chats = new MapColl<ChatPerson | Group, XMPPChat>;
  readonly roster = new MapColl<string, ChatPerson>();
  client: XMPP.Agent;
  deviceID: string;
  jid: string;

  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login(interactive: boolean) {
    await super.login(interactive);
    await this.connect();
    await this.getRoster();
    await this.client.sendPresence();

    await this.getRooms();
    await this.client.enableKeepAlive();
  };
  async connect() {
    this.jid = getJID(this.username);
    this.client = await XMPP.createClient({
      jid: this.jid,
      password: this.password,
      // credentials: { token: ... }, TODO OAuth2

      // If you have a .well-known/host-meta.json file for your
      // domain, the connection transports can be set to `true`.
      transports: {
        websocket: this.url?.startsWith("wss:") ? this.url : !this.url,
        bosh: this.url?.startsWith("https:") ? this.url : !this.url,
      },
    });
    this.addListeners();
    await this.client.connect();
    console.log("client", this.client.config);
    if (!this.client.jid) {
      throw new ConnectError(new Error(), gt`Failed to connect to chat account ${this.name}`);
    }
    await this.waitForEvent("session:started");
  }
  async waitForEvent(eventName: keyof XMPP.AgentEvents) {
    await new Promise(async resolve => {
      await this.client.on(eventName, (...results) => resolve(results));
    });
  }
  /** For setup only. Test that the login works. */
  async verifyLogin(): Promise<void> {
    await super.login(true);
    await this.connect();
  }
  async getRoster() {
    let roster = await this.client.getRoster();
    await Promise.all(roster.items.map(p => this.getPerson(p.jid, p.name ?? ''))); // sets this.roster
    for (let jid of this.roster.keys()) {
      this.getNew1to1Chat(jid)
        .catch(this.errorCallback);
    }
  }
  async getRooms() {
    // TODO Get list of rooms
    //let allRooms = await this.client.getRooms();
    //Promise.all(allRooms.map(room => this.getNewGroupChat(room)));
  }
  async getNewGroupRoom(jid: string): Promise<XMPPChat> {
    if (this.chats.find(chat => chat.id == jid)) {
      return;
    }
    let chatRoom = new XMPPGroupChat(this, jid);
    await chatRoom.init();
    await chatRoom.listMembers();
    return chatRoom;
  }
  async getNew1to1Chat(jid: string): Promise<XMPPChat> {
    jid = getJID(jid);
    if (this.chats.find(chat => chat.id == jid)) {
      return;
    }
    let chatRoom = new XMPP1to1Chat(this, jid);
    await chatRoom.getLastMessage();
    return chatRoom;
  }
  getExistingChat(roomID: string): XMPPChat {
    roomID = getJID(roomID);
    return this.chats.find(chat => chat.id == roomID);
  }
  getExistingPerson(jid: string) {
    jid = getJID(jid);
    return this.roster.get(jid) ??
      appGlobal.persons.find(person => person.chatAccounts.some(acc => acc.value == jid));
  }
  async getPerson(jid: string, name: string) {
    jid = getJID(jid);
    let existing = this.getExistingPerson(jid);
    if (existing) {
      return existing;
    }
    let person = new ChatPerson();
    person.chatAccounts.add(new ContactEntry(jid, "xmpp"));
    let info = await this.client.getAccountInfo(jid);
    person.name = info.fullName ?? info.nick ?? name ?? jid;
    person.firstName = info.givenName ?? '';
    person.lastName = info.familyName ?? '';
    if (info.email) {
      person.chatAccounts.add(new ContactEntry(info.email, "other"));
    }
    if (info.phone) {
      person.phoneNumbers.add(new ContactEntry(info.phone, "unknown"));
    }
    person.notes = info.text ?? '';
    /*let avatar = await this.client.getAvatar(jid, 'pubsub');
    let avatarBuffer = avatar?.content?.data;
    if (avatarBuffer) {
      let blob = new Blob([avatarBuffer], { type: "image/png" });
      person.picture = URL.createObjectURL(blob);
      // Cannot save blobs to database. Use data URL? Don't save XMPP users?
    }*/
    this.roster.set(jid, person);
    return person;
  }
  protected addListeners() {
    //this.client.on("*", console.log);
    //this.client.on("raw:*", (direction, log) => console.log(direction, log));
    this.client.on("stream:error", this.errorCallback);
    this.client.on("muc:error", this.errorCallback);
    this.client.on("presence:error", this.errorCallback);
    this.client.on("message:error", this.errorCallback);

    this.client.on("groupchat", msg => this.processGroupChatMessage(msg));
    this.client.on("chat", msg => this.process1to1ChatMessage(msg));
  }
  process1to1ChatMessage(xmppMsg: XMPP.Stanzas.ReceivedMessage): void {
    let chatRoom = this.getExistingChat(xmppMsg.from);
    chatRoom.addMessage(xmppMsg);
  }
  processGroupChatMessage(xmppMsg: XMPP.Stanzas.ReceivedMessage): void {
    let chatRoom = this.getExistingChat(xmppMsg.to);
    chatRoom.addMessage(xmppMsg);
  }
}

export function getJID(jid: string) {
  return jid?.split("/")[0];
}
