import { ChatAccount } from '../Account';
import { Chat } from '../Chat';
import { UserChatMessage } from '../Message';
import { ChatRoomEvent } from '../ChatRoomEvent';
import { Group } from '../../Abstract/Group';
import { appGlobal } from '../../app';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { Message } from '../../Abstract/Message';
import * as matrix from 'matrix-js-sdk';
import type { Room, RoomMember, IContent } from '../../../node_modules/matrix-js-sdk/lib/matrix';
import olm from 'olm'; // Needed for initCrypto(). Do not remove.

export class MatrixAccount extends ChatAccount {
  client: matrix.MatrixClient;
  baseURL = "https://matrix.org";
  username: string;
  password: string;
  deviceID: string;
  globalUserID: string;
  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login() {
    (window as any).global = window; // Fix Matrix
    this.client = matrix.createClient({
      baseUrl: this.baseURL,
      userId: this.username,
      deviceId: this.deviceID,
    });
    //(window as any).olm = olm;
    //await this.client.initCrypto();
    await this.client.loginWithPassword(this.username, this.password);
    await this.client.startClient();
    await this.waitForEvent("sync"); // Sync finished

    this.getRooms();
    this.listenToRoomMessages();
  };
  async waitForEvent(eventName: string) {
    await new Promise((resolve, reject) => {
      this.client.once(eventName, (...results) => resolve(results));
    });
  }
  async getRooms() {
    let allRooms = await this.client.getRooms();
    for (let room of allRooms) {
      this.getNewRoom(room);
    }
  }
  getNewRoom(room: Room) {
    let chatRoom = new Chat();
    chatRoom.id = room.roomId;
    console.log("Added room", room.name);
    if (!this.globalUserID) {
      this.globalUserID = room.myUserId;
    }
    let group = new Group();
    group.name = room.name;
    for (let member of room.getJoinedMembers()) {
      group.participants.add(this.getPerson(member));
    }
    chatRoom.contact = group.participants.length <= 2 && group.participants.find(person => person.id == this.globalUserID)
      ? (group.participants.find(person => person.id != this.globalUserID) ?? group.participants.first)
      : group;
    //let init = await this.client.roomInitialSync(room.roomId);
    for (let event of room.getLiveTimeline().getEvents()) {
      let msg = this.getEvent(event)
      if (msg instanceof UserChatMessage) { // when joining, we add only user messages
        chatRoom.messages.add(this.getUserMessage(event));
      }
    }
    chatRoom.lastMessage = chatRoom.messages.get(chatRoom.messages.length - 1);
    this.chats.set(chatRoom.contact, chatRoom);
  }
  getExistingRoom(roomID: string): Chat {
    return this.chats.find(chat => chat.id == roomID);
  }
  getPerson(member: RoomMember) {
    let existing = appGlobal.persons.find(person => person.chatAccounts.find(acc => acc.value == member.userId));
    if (existing) {
      return existing;
    }
    let person = new ChatPerson();
    person.name = member.name;
    person.chatAccounts.add(new ContactEntry(member.userId, "matrix"));
    let picURL = member.getAvatarUrl(this.baseURL, 64, 64, "scale", true, false);
    // let picMXC = member.getMxcAvatarUrl();
    // let picURL = getHttpUriForMxc(this.baseURL, picMXC, 64, 64, "scale", true);
    person.picture = picURL;
    appGlobal.persons.add(person);
    return person;
  }
  getEvent(event): Message {
    let type = event.getType();
    if (type == "m.room.message") {
      return this.getUserMessage(event);
    } else {
      return this.getChatRoomMessage(event);
    }
  }
  getUserMessage(event): Message {
    let msg = new UserChatMessage();
    this.fillMessage(event, msg);
    let content = event.getContent().body;
    msg.text = content;
    msg.html = content;
    return msg;
  }
  getChatRoomMessage(event): Message {
    let msg = new ChatRoomEvent();
    this.fillMessage(event, msg);
    let json = JSON.stringify(event.event?.content ?? event, null, 2);
    msg.text = json.substring(2, json.length - 2);
    msg.html =
      `<div>
        <h4>${event.getType()}</h4>
        <pre>${msg.text}</pre>
      </div>`;
    return msg;
  }
  fillMessage(event, msg: Message): void {
    msg.sent = msg.received = new Date(event.getTs());
    let senderUserID = event.getSender();
    let sender = appGlobal.persons.find(person => person.chatAccounts.find(acc => acc.value == senderUserID));
    msg.contact = sender;
    msg.outgoing = senderUserID == this.globalUserID;
  }
  /** Listen to messages for all rooms */
  listenToRoomMessages() {
    this.client.on("Room.timeline", (event, room, toStartOfTimeline) => {
      try {
        if (toStartOfTimeline) {
          return; // no paginated results
        }
        let chatRoom = this.getExistingRoom(room.id);
        let message = this.getEvent(event);
        chatRoom.messages.add(message);
        chatRoom.lastMessage = message;
      } catch (ex) {
        console.error(ex);
      }
    });
  }
}
