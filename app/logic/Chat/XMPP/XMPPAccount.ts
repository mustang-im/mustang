import { ChatAccount } from '../ChatAccount';
import type { XMPPChat } from './XMPPChat';
import { XMPP1to1Chat } from './XMPP1to1Chat';
import type { Group } from '../../Abstract/Group';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { appGlobal } from '../../app';
import { MapColl } from 'svelte-collections';
import { xml, type Client } from '@xmpp/client';

export class XMPPAccount extends ChatAccount {
  readonly protocol: string = "xmpp";
  readonly chats = new MapColl<ChatPerson | Group, XMPPChat>;
  readonly roster = new MapColl<string, ChatPerson>();
  client: Client;
  deviceID: string;
  jid: string;

  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login() {
    let [username, domain] = this.jid.split("@");
    this.client = await appGlobal.remoteApp.createXMPPJSClient({
      username: username,
      password: this.password,
      service: domain,
    });
    await this.client.on("error", this.errorCallback);
    await this.client.start();
    await this.waitForEvent("status", status => status == "online");
    await this.afterConnect();

    await this.client.on("status", async status => {
      this.isOnline = status == "online";
      if (this.isOnline) {
        try {
          await this.afterConnect();
        } catch (ex) {
          this.errorCallback(ex);
        }
      }
    });
  };
  protected async afterConnect() {
    await this.client.on("stanza", stanza => this.onStanza(stanza));
    await this.client.send(xml("presence"));
    this.rosterService = await appGlobal.remoteApp.setupXMPPJSRoster(this.client);
    await this.rosterService.on("set", ({ person }) => this.onRosterPersonAdded(person));
    await this.rosterService.on("remove", ({ jid }) => this.onRosterPersonRemoved(jid));
    await this.getRoster();
    await this.client.sendPresence();

    await this.getRooms();
    await this.client.enableKeepAlive();
  };
  async waitForEvent(eventName: keyof XMPP.AgentEvents) {
    await new Promise(async resolve => {
      await this.client.on(eventName, (...results) => resolve(results));
    });
  }
  /** For setup only. Test that the login works. */
  async verifyLogin(): Promise<void> {
    await super.login(true);
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
  async getNewRoom(room: string) {
    return;
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
    await this.client.on('muc:other', xmppMsg => {
      console.log("MUC other message", xmppMsg);
    });
  }
  async getNew1to1Chat(jid: string): Promise<XMPPChat | null> {
    jid = getJID(jid);
    if (this.chats.find(chat => chat.id == jid)) {
      return null;
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
  getUserMessage(xmppMsg: any): ChatMessage {
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
  async waitForEvent(eventName: string, condition = (...results: any) => true) {
    await new Promise(async resolve => {
      await this.client.on(eventName, (...results) => {
        if (condition(...results)) {
          resolve(results);
        }
      });
    });
  }
}

export function getJID(jid: string) {
  return jid?.split("/")[0];
}
