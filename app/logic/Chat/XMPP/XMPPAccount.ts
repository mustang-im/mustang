import { ChatAccount } from '../ChatAccount';
import { XMPPChatRoom } from './XMPPChatRoom';
import { ChatMessage, DeliveryStatus, UserChatMessage } from '../Message';
import { Group } from '../../Abstract/Group';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { appGlobal } from '../../app';
import { getDomainForEmailAddress } from '../../util/netUtil';
import { MapColl } from 'svelte-collections';
import * as XMPP from 'stanza';

export class XMPPAccount extends ChatAccount {
  readonly protocol: string = "xmpp";
  readonly chats = new MapColl<ChatPerson | Group, XMPPChatRoom>;
  readonly roster = new MapColl<string, ChatPerson>();
  client: XMPP.Agent;
  deviceID: string;
  jid: string;

  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login(interactive: boolean) {
    super.login(interactive);
    await this.connect();
    await this.getRoster();
    let presence = await this.client.sendPresence();

    await this.getRooms();
    await this.client.enableKeepAlive();
    this.listenToChatMessages();
  };
  async connect() {
    this.jid = this.username;
    this.client = await XMPP.createClient({
      jid: this.jid,
      password: this.password,
      // credentials: { token: ... }, TODO OAuth2

      // If you have a .well-known/host-meta.json file for your
      // domain, the connection transport config can be skipped.
      transports: {
        websocket: this.url?.startsWith("wss:") ? this.url : undefined,
        // bosh: this.url.startsWith("https:") ? this.url : undefined,
      }
    });
    this.client.on("*", console.log);
    this.client.on("raw:*", (direction, log) => console.log(direction, log));
    this.client.on("error", console.error);
    await this.client.connect();
    await this.waitForEvent("session:started");
    console.log("logged in", this.jid);
  }
  async waitForEvent(eventName: keyof XMPP.AgentEvents) {
    await new Promise(async resolve => {
      await this.client.on(eventName, (...results) => resolve(results));
    });
  }
  /** For setup only. Test that the login works. */
  async verifyLogin(): Promise<void> {
    await this.connect();
  }
  async getRoster() {
    let roster = await this.client.getRoster();
    console.log("Roster", roster)
    await Promise.all(roster.items.map(p => this.getPerson(p.jid, p.name ?? ''))); // sets this.roster
    for (let jid of this.roster.keys()) {
      let chatRoom = new XMPPChatRoom(this, jid);
    }
  }
  async getRooms() {
    // TODO Get list of rooms
    //let allRooms = await this.client.getRooms();
    //Promise.all(allRooms.map(room => this.getNewRoom(room)));
  }
  async getNewRoom(room: string) {
    let chatRoom = new XMPPChatRoom(this, room);
  }
  getExistingRoom(roomID: string): XMPPChatRoom {
    return this.chats.find(chat => chat.id == roomID);
  }
  getExistingPerson(jid: string) {
    return this.roster.get(jid) ??
      appGlobal.persons.find(person => person.chatAccounts.some(acc => acc.value == jid));
  }
  async getPerson(jid: string, name: string) {
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
  async listenToChatMessages() {
    await this.client.on("chat", msg => this.processChatMessage(msg));
  }
  processChatMessage(xmppMsg: XMPP.Stanzas.ReceivedMessage): void {
    let chatRoom = this.getExistingRoom(xmppMsg.to);
    let message = this.getUserMessage(xmppMsg);
    message.to = chatRoom;
    if (!message) {
      return;
    }
    chatRoom.messages.add(message);
    chatRoom.lastMessage = message;
  }
  getUserMessage(xmppMsg: XMPP.Stanzas.ReceivedMessage): ChatMessage {
    let msg = new UserChatMessage();
    msg.contact = this.getExistingPerson(xmppMsg.from);
    msg.outgoing = false;
    msg.deliveryStatus = DeliveryStatus.User;
    msg.text = xmppMsg.body || '';
    if (typeof (xmppMsg.html) == "string") {
      msg.html = xmppMsg.html;
    } else if (xmppMsg.html) {
      msg.html = xmppMsg.html?.body?.toString() ?? '';
    } else if (xmppMsg.body) {
      msg.html = xmppMsg.body?.replace("\n", "<br>");
    } else {
      msg.html = '';
    }
    //console.log("message", msg.text, msg.html, content.formatted_body);
    return msg;
  }
}
