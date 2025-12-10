import { ChatAccount } from '../ChatAccount';
import { MatrixChatRoom } from './MatrixChatRoom';
import { MatrixVideoConf } from '../../Meet/Matrix/MatrixVideoConf';
import { ChatMessage, DeliveryStatus, UserChatMessage } from '../Message';
import { ChatRoomEvent, IncomingCall, Invite, JoinLeave } from '../RoomEvent';
import { Group } from '../../Abstract/Group';
import { appGlobal } from '../../app';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { assert } from '../../util/util';
import { MapColl } from 'svelte-collections';
//import { MatrixClient, createClient } as matrix from 'matrix-js-sdk';
//import type { Room, RoomMember } from 'matrix-js-sdk/lib/matrix';
//import olm from 'olm'; // Needed for initCrypto(). Do not remove.
//Add the following to package.json:
//  "matrix-js-sdk": "^30.0.1",
//  "olm": "https://packages.matrix.org/npm/olm/olm-3.2.1.tgz",
// dummy, remove when enabling:
type MatrixClient = any;
type Room = any;
type RoomMember = any;
function createClient(opt: any) {};

export class MatrixAccount extends ChatAccount {
  readonly protocol: string = "matrix";
  readonly chats = new MapColl<ChatPerson | Group, MatrixChatRoom>;
  client: MatrixClient;
  baseURL = "https://matrix.org";
  username: string;
  password: string;
  deviceID: string;
  globalUserID: string;
  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login() {
    super.login(false);
    (window as any).global = window; // Fix Matrix
    let serverID = this.baseURL.replace("https://", "");
    let userID = `@${this.username}:${serverID}`;
    return;
    this.client = createClient({
      baseUrl: this.baseURL,
      userId: userID,
      deviceId: this.deviceID,
    });
    //(window as any).olm = olm;
    await this.client.initCrypto();
    await this.client.loginWithPassword(userID, this.password);
    await this.client.startClient();
    await this.waitForEvent("sync"); // Sync finished

    await this.getRooms();
    this.listenToRoomMessages();
    MatrixVideoConf.listenForCalls(this.client, (conf) => this.incomingCall(conf));
  };
  async waitForEvent(eventName: string) {
    await new Promise((resolve, reject) => {
      this.client.once(eventName, (...results) => resolve(results));
    });
  }
  async getRooms() {
    let allRooms = await this.client.getRooms();
    Promise.all(allRooms.map(room => this.getNewRoom(room)));
  }
  async getNewRoom(room: Room) {
    let chatRoom = new MatrixChatRoom(this);
    chatRoom.id = room.roomId;
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
    this.chats.set(chatRoom.contact as Group | ChatPerson, chatRoom);

    //let init = await this.client.roomInitialSync(room.roomId, 300);
    for (let event of room.getLiveTimeline().getEvents()) {
      try {
        let msg = await this.getEvent(event, chatRoom); // process system events
        if (msg && true || msg instanceof UserChatMessage) { // when joining, we add only user messages
          chatRoom.messages.add(msg);
        }
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
    chatRoom.lastMessage = chatRoom.messages.get(chatRoom.messages.length - 1);
  }
  getExistingRoom(roomID: string): MatrixChatRoom {
    return this.chats.find(chat => chat.id == roomID);
  }
  getExistingPerson(userId: string) {
    return appGlobal.persons.find(person => person.chatAccounts.some(acc => acc.value == userId && acc.purpose == "matrix"));
  }
  getPerson(member: RoomMember) {
    let existing = this.getExistingPerson(member.userId);
    if (existing) {
      return existing;
    }
    let person = new ChatPerson();
    person.name = member.name;
    person.id = member.userId;
    person.chatAccounts.add(new ContactEntry(member.userId, "matrix"));
    let picURL = member.getAvatarUrl(this.baseURL, 64, 64, "scale", true, false);
    // let picMXC = member.getMxcAvatarUrl();
    // let picURL = getHttpUriForMxc(this.baseURL, picMXC, 64, 64, "scale", true);
    person.picture = picURL;
    //appGlobal.persons.add(person);
    return person;
  }
  async getEvent(event, chatRoom: MatrixChatRoom): Promise<ChatMessage | null> {
    let type = event.getType();
    if (type == "m.room.message") {
      return this.getUserMessage(event);
    } else if (type == "m.room.encrypted") {
      return await this.getEncryptedUserMessage(event);
    } else if (type == "m.room.member") {
      return this.getJoinLeaveInviteEvent(event, chatRoom);
    } else if (type == "m.reaction") {
      this.getReaction(event, chatRoom);
      return null;
    } else if (type == "m.room.power_levels" ||
      type == "m.room.encryption" ||
      type == "m.room.join_rules" ||
      type == "m.room.history_visibility" ||
      type == "m.room.guest_access") {
      return null;
    } else {
      return this.getGenericChatRoomEvent(event);
    }
  }
  getUserMessage(event): ChatMessage {
    let msg = new UserChatMessage();
    this.fillMessage(event, msg);
    msg.deliveryStatus = msg.outgoing ? DeliveryStatus.User : DeliveryStatus.Server;
    let content = event.getContent();
    msg.text = content.body;
    msg.html = content.formatted_body ?? content.body.replace("\n", "<br>");
    return msg;
  }
  async getEncryptedUserMessage(event): Promise<ChatMessage> {
    await this.client.decryptEventIfNeeded(event);
    return this.getUserMessage(event);
  }
  getReaction(event, chatRoom: MatrixChatRoom): void {
    let senderUserID = event.getSender();
    let person = this.getExistingPerson(senderUserID);
    assert(person, "Reaction: Sender not found: " + senderUserID);
    let data = event.event?.content["m.relates_to"];
    assert(data.rel_type == "m.annotation", "Unknown reaction type " + data.rel_type);
    let emoji = data.key;
    let reactTo = chatRoom.messages.find(msg => msg.id == data.event_id);
    if (!reactTo) {
      // might be reacting to an older message which is not in our history
      return;
    }
    assert(reactTo instanceof UserChatMessage, "Reacting to something that is not a message");
    reactTo.reactions.set(person, emoji);
  }
  getGenericChatRoomEvent(event): ChatMessage {
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
  getJoinLeaveInviteEvent(event, chatRoom: MatrixChatRoom): ChatMessage {
    let data = event.event.content;
    let senderUserID = event.getSender();
    let person = this.getExistingPerson(senderUserID);
    if (!person) {
      person = new ChatPerson();
      person.name = event.displayname;
      person.picture = event.avatar_url; // may be null
      //appGlobal.persons.add(person);
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
  fillMessage(event, msg: ChatMessage): void {
    msg.id = event.event?.event_id;
    msg.sent = msg.received = new Date(event.getTs());
    let senderUserID = event.getSender();
    msg.contact = this.getExistingPerson(senderUserID);
    msg.outgoing = senderUserID == this.globalUserID;
  }
  async incomingCall(conf: MatrixVideoConf) {
    try {
      let room = this.getExistingRoom(conf._call.roomId);
      let msg = new IncomingCall();
      msg.contact = room.contact;
      msg.text = msg.html = `${msg.contact.name} is calling`;
      msg.outgoing = false;
      msg.sent = msg.received = new Date();
      msg.conf = conf;
      room.messages.add(msg);
    } catch (ex) {
      this.errorCallback(ex);
    }
  }
  /** Listen to messages for all rooms */
  listenToRoomMessages() {
    this.client.on("Room.timeline", async (event, room, toStartOfTimeline) => {
      try {
        if (toStartOfTimeline) {
          return; // no paginated results
        }
        let chatRoom = this.getExistingRoom(room.roomId);
        let message = await this.getEvent(event, chatRoom);
        if (!message) {
          return;
        }
        chatRoom.messages.add(message);
        chatRoom.lastMessage = message;
      } catch (ex) {
        this.errorCallback(ex);
      }
    });
  }
}
