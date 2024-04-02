import { ChatAccount } from '../ChatAccount';
import { XMPPChatRoom } from './XMPPChatRoom';
import { ChatMessage, DeliveryStatus, UserChatMessage } from '../Message';
import { Group } from '../../Abstract/Group';
import { appGlobal } from '../../app';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { MapColl } from 'svelte-collections';
import * as XMPP from 'stanza';

export class XMPPAccount extends ChatAccount {
  readonly protocol: string = "xmpp";
  readonly chats = new MapColl<ChatPerson | Group, XMPPChatRoom>;
  client: XMPP.Agent;
  serverDomain: string;
  deviceID: string;
  globalUserID: string;
  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login() {
    super.login(false);
    this.globalUserID = `${this.username}@${this.serverDomain}`;
    this.client = XMPP.createClient({
      jid: this.globalUserID,
      password: this.password,

      // If you have a .well-known/host-meta.json file for your
      // domain, the connection transport config can be skipped.
      transports: {
        websocket: `wss://${this.serverDomain}:5281/xmpp-websocket`,
        bosh: `https://${this.serverDomain}:5281/http-bind`,
      }
    });
    await this.client.connect();
    this.waitForEvent("session:started");
    await this.getRoster();
    let presence = await this.client.sendPresence();

    await this.getRooms();
    this.client.enableKeepAlive();
    this.listenToChatMessages();
  };
  async waitForEvent(eventName: keyof XMPP.AgentEvents) {
    await new Promise(resolve => {
      this.client.on(eventName, (...results) => resolve(results));
    });
  }
  async getRoster() {
    let roster = await this.client.getRoster();
    Promise.all(roster.items.map(p => this.getPerson(p.jid, p.name ?? '')));
  }
  async getRooms() {
    // TODO Get list of rooms
    //let allRooms = await this.client.getRooms();
    //Promise.all(allRooms.map(room => this.getNewRoom(room)));
  }
  async getNewRoom(room: string) {
    let chatRoom = new XMPPChatRoom(this);
    chatRoom.id = room;
    console.log("Added room", room);
    let group = new Group();
    group.name = room; // TODO
    //let config = await this.client.getRoomConfig(room);
    let membersResult = await this.client.getRoomMembers(room);
    let members = membersResult.muc.users || [];
    let persons = await Promise.all(members.filter(m => m.jid).map(member =>
      this.getPerson(member.jid ?? '', member.nick ?? '')));
    group.participants.addAll(persons);
    chatRoom.contact = group.participants.length <= 2 && group.participants.find(person => person.id == this.globalUserID)
      ? (group.participants.find(person => person.id != this.globalUserID) ?? group.participants.first)
      : group;
    this.chats.set(chatRoom.contact as Group | ChatPerson, chatRoom);

    // TODO Get message history
    chatRoom.lastMessage = chatRoom.messages.get(chatRoom.messages.length - 1);

    // TODO Listen to chat messages
    this.client.on('muc:other', xmppMsg => {
      console.log("MUC other message", xmppMsg);
    });
  }
  getExistingRoom(roomID: string): XMPPChatRoom {
    return this.chats.find(chat => chat.id == roomID);
  }
  getExistingPerson(userId: string) {
    return appGlobal.persons.find(person => person.chatAccounts.some(acc => acc.value == userId));
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
    let avatar = await this.client.getAvatar(jid, 'pubsub');
    let avatarBuffer = avatar?.content?.data;
    if (avatarBuffer) {
      let blob = new Blob([avatarBuffer], { type: "image/png" });
      person.picture = URL.createObjectURL(blob);
      // Cannot save blobs to database. Use data URL? Don't save XMPP users?
    }
    return person;
  }
  listenToChatMessages() {
    this.client.on("chat", msg => this.processChatMessage(msg));
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
