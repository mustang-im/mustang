import { ChatAccount } from '../Account';
import { Chat } from '../Chat';
import { ChatMessage, UserChatMessage } from '../Message';
import { ChatRoomEvent, Invite, JoinLeave } from '../RoomEvent';
import { Group } from '../../Abstract/Group';
import { appGlobal } from '../../app';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { Message } from '../../Abstract/Message';
import * as matrix from 'matrix-js-sdk';
import type { Room, RoomMember, IContent } from '../../../node_modules/matrix-js-sdk/lib/matrix';
import olm from 'olm'; // Needed for initCrypto(). Do not remove.
import { assert } from '../../util/util';

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

    await this.getRooms();
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
      let msg = this.getEvent(event, chatRoom); // process system events
      if (msg && true || msg instanceof UserChatMessage) { // when joining, we add only user messages
        chatRoom.messages.add(msg);
      }
    }
    chatRoom.lastMessage = chatRoom.messages.get(chatRoom.messages.length - 1);
    this.chats.set(chatRoom.contact, chatRoom);
  }
  getExistingRoom(roomID: string): Chat {
    return this.chats.find(chat => chat.id == roomID);
  }
  getExistingPerson(userId: string) {
    return appGlobal.persons.find(person => person.chatAccounts.find(acc => acc.value == userId));
  }
  getPerson(member: RoomMember) {
    let existing = this.getExistingPerson(member.userId);
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
  getEvent(event, chatRoom: Chat): Message | null {
    let type = event.getType();
    console.log(chatRoom.name, type, event);
    if (type == "m.room.message") {
      return this.getUserMessage(event);
    } else if (type == "m.room.member") {
      return this.getJoinLeaveInviteEvent(event, chatRoom);
    } else if (type == "m.room.power_levels" ||
      type == "m.room.join_rules" ||
      type == "m.room.history_visibility" ||
      type == "m.room.guest_access") {
      return null;
    } else {
      return this.getGenericChatRoomEvent(event);
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
  getGenericChatRoomEvent(event): Message {
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
  getJoinLeaveInviteEvent(event, chatRoom: Chat): Message {
    let data = event.event.content;
    console.log("join leave", data);
    let senderUserID = event.getSender();
    let person = this.getExistingPerson(senderUserID);
    if (!person) {
      person = new ChatPerson();
      person.name = event.displayname;
      person.picture = event.avatar_url; // may be null
      appGlobal.persons.add(person);
    }

    if (data.membership == "join" || data.membership == "leave") {
      let msg = new JoinLeave();
      msg.join = data.membership == "join";
      let group = chatRoom.contact;
      if (group instanceof Group) {
        if (msg.join) {
          group.participants.add(person);
        } else {
          group.participants.remove(person);
        }
      } else {
        // TODO change to group
      }
      this.fillMessage(event, msg);
      msg.text = (msg.join ? "%person% joined" : "%person% left the room")
        .replace("%person%", person.name);
      msg.html = `<span class="joinleave">` +
        (msg.join ? "%person% joined" : "%person% left the room")
          .replace("%person%", `<span class="person">${person.name}</span>`) +
        `</span>`;
      return msg;
    } else if (data.membership == "invite") {
      let msg = new Invite();
      this.fillMessage(event, msg);
      msg.text = "%person% is invited to this room"
        .replace("%person%", person.name);
      msg.html = `<span class="invite">` +
        "%person% is invited to this room"
          .replace("%person%", `<span class="person">${person.name}</span>`) +
        `</span>`;
      return msg;
    } else {
      return this.getGenericChatRoomEvent(event);
    }
  }
  fillMessage(event, msg: Message): void {
    msg.id = event.event?.event_id;
    msg.sent = msg.received = new Date(event.getTs());
    let senderUserID = event.getSender();
    msg.contact = this.getExistingPerson(senderUserID);
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
        let message = this.getEvent(event, chatRoom);
        chatRoom.messages.add(message);
        chatRoom.lastMessage = message;
      } catch (ex) {
        console.error(ex);
      }
    });
  }
}
