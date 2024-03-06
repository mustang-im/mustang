import { ChatAccount } from '../ChatAccount';
import { XMPPChatRoom } from './XMPPChatRoom';
import { ChatMessage, DeliveryStatus, UserChatMessage } from '../Message';
import { Group } from '../../Abstract/Group';
import { appGlobal } from '../../app';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { MapColl } from 'svelte-collections';
import { client, xml } from '@xmpp/client';
import setupRoster from '@xmpp-plugins/roster';

export class XMPPAccount extends ChatAccount {
  readonly chats = new MapColl<ChatPerson | Group, XMPPChatRoom>;
  client: any;
  serverDomain: string;
  username: string;
  password: string;
  deviceID: string;
  globalUserID: string;
  rosterService: any;
  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login() {
    this.globalUserID = `${this.username}@${this.serverDomain}`;
    this.client = client({
      username: this.globalUserID,
      password: this.password,
      service: this.serverDomain,
    });
    this.client.on("error", this.errorCallback);
    await this.client.start();
    await this.waitForEvent("status", status => status == "online");
    await this.afterConnect();

    this.client.on("status", async status => {
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
    this.client.on("stanza", stanza => this.onStanza(stanza));
    await this.client.send(xml("presence"));
    this.rosterService = setupRoster(this.client);
    this.rosterService.on("set", ({ person }) => this.onRosterPersonAdded(person));
    this.rosterService.on("remove", ({ jid }) => this.onRosterPersonRemoved(jid));
    await this.getRoster();
    await this.getRooms();
  }
  async getRoster() {
    // <https://github.com/xmppjs/xmpp.js/tree/main/packages/xml>
    let rosterXML = await this.client.iqCaller.get(xml('query', 'jabber:iq:roster'))
    let personsXML = rosterXML.getChildren('item', 'jabber:iq:roster');
    console.log("raw roster", personsXML);
    let roster = await this.rosterService.get();
    console.log("roster from plugin", roster);
    // Promise.all(personsXML.map(p => this.getPerson(p.jid, p.name ?? '')));
  }
  async addPersonToRoster(newFriend: ChatPerson) {
    await this.rosterService.set({ jid: newFriend.id, name: newFriend.name });
    return;
    // ?
    await this.client.send(xml('presence', {
      type: 'subscribe',
      to: newFriend.id,
    }));
  }
  async removePersonFromRoster(oldFriend: ChatPerson) {
    await this.rosterService.remove(oldFriend.id);
  }
  onRosterPersonAdded(personXML: any) {
  }
  onRosterPersonRemoved(jid: any) {

  }
  async getRooms() {
    // TODO Get list of rooms
    //let allRooms = await this.client.getRooms();
    //Promise.all(allRooms.map(room => this.getNewRoom(room)));
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
    return;
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
  protected onStanza(stanza: any) {
    try {
      if (stanza.is("message")) {
        this.onChatMessage(stanza);
      } else {
        console.log("Unknown XMPP message", stanza);
      }
    } catch (ex) {
      this.errorCallback(ex);
    }
  }
  onChatMessage(xmppMsg: any): void {
    let chatRoom = this.getExistingRoom(xmppMsg.to);
    let message = this.getUserMessage(xmppMsg);
    message.to = chatRoom;
    if (!message) {
      return;
    }
    chatRoom.messages.add(message);
    chatRoom.lastMessage = message;
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
    await new Promise(resolve => {
      this.client.on(eventName, (...results) => {
        if (condition(...results)) {
          resolve(results);
        }
      });
    });
  }
}
