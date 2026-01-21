import { ChatAccount } from '../ChatAccount';
import { MatrixChatRoom } from './MatrixChatRoom';
import { MatrixVideoConf } from '../../Meet/Matrix/MatrixVideoConf';
import { ChatMessage, DeliveryStatus, UserChatMessage } from '../Message';
import { ChatRoomEvent, IncomingCall, Invite, JoinLeave } from '../RoomEvent';
import { Group } from '../../Abstract/Group';
import { appGlobal } from '../../app';
import { ChatPerson } from '../Person';
import { ContactEntry } from '../../Abstract/Person';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';
import { appName } from '../../build';
import { assert } from '../../util/util';
import { MapColl } from 'svelte-collections';
import type { MatrixClient } from 'matrix-js-sdk';
import type { MatrixCall, Room, RoomMember } from 'matrix-js-sdk/lib/matrix';

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
  async login(interactive: boolean) {
    super.login(interactive);
    let accessToken: string;
    if (this.mainAccount?.oAuth2) {
      this.oAuth2 = this.mainAccount.oAuth2;
    }
    if (this.oAuth2 && !this.oAuth2.isLoggedIn) {
      await this.oAuth2.login(interactive);
      accessToken = this.oAuth2.accessToken;
    }
    let serverID = this.baseURL.replace("https://", "");
    let userID = `@${this.username}:${serverID}`;
    this.deviceID ??= crypto.randomUUID();
    // Tutorial <https://matrix-org.github.io/matrix-js-sdk/>
    const matrix = await import("matrix-js-sdk");
    if (!this.oAuth2) {
      let loginClient = matrix.createClient({
        baseUrl: this.baseURL,
        userId: userID,
        deviceId: this.deviceID,
      })
      assert(this.password, "need password");
      let loginResponse = await loginClient.loginRequest({
        type: "m.login.password",
        password: this.password,
        identifier: {
          type: "m.id.user",
          user: this.username,
        },
        device_id: this.deviceID,
        initial_device_display_name: appName,
      });
      accessToken = loginResponse.access_token;
    }
    this.client = matrix.createClient({
      baseUrl: this.baseURL,
      userId: userID,
      deviceId: this.deviceID,
      accessToken: accessToken,
    });
    await this.client.initRustCrypto({ cryptoDatabasePrefix: this.id });
    await this.client.startClient();
    await this.waitForEvent("sync"); // Sync finished

    await this.getRooms();
    this.listenToRoomMessages();
  };
  async waitForEvent(eventName: string) {
    await new Promise((resolve, reject) => {
      this.client.once(eventName as any, (...results) => resolve(results));
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
    let others = group.participants.filterOnce(person => person.id != this.globalUserID);
    chatRoom.contact = others.length > 1
      ? group
      : others.first ?? group.participants.first;
    this.chats.set(chatRoom.contact, chatRoom);

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
  getPerson(member: RoomMember): ChatPerson {
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
  async createRoom(name: string) {
    // TODO create room on server
    return new MatrixChatRoom(this);
  }
  async getEvent(event, chatRoom: MatrixChatRoom): Promise<ChatMessage | null> {
    let type = event.getType();
    if (type == "m.room.message") {
      return chatRoom.getUserMessage(event);
    } else if (type == "m.room.redaction") {
      chatRoom.redactMessage(event);
      return null;
    } else if (type == "m.reaction") {
      chatRoom.getReaction(event);
      return null;
    } else if (type == "m.room.encrypted") {
      return await chatRoom.getEncryptedUserMessage(event);
    } else if (type == "m.room.member") {
      return chatRoom.getJoinLeaveInviteEvent(event);
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
  fillMessage(event, msg: ChatMessage): void {
    msg.id = event.event?.event_id;
    msg.sent = msg.received = new Date(event.getTs());
    let senderUserID = event.getSender();
    msg.contact = this.getExistingPerson(senderUserID);
    msg.outgoing = senderUserID == this.globalUserID;
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
  async incomingCall(call: MatrixCall) {
    try {
      console.log("Incoming call", call.roomId, call);
      let conf = new MatrixVideoConf(this, call);
      // Once the user accepts, call `conf.answer()`

      let room = this.getExistingRoom(conf._call.roomId);
      let msg = new IncomingCall(room);
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
    this.client.on("Call.incoming", (call: MatrixCall) => {
      this.incomingCall(call);
    });
  }

  async logout() {
    await super.logout();
    await this.client.logout();
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    indexedDB.deleteDatabase(this.id + "::matrix-sdk-crypto");
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.deviceID = sanitize.alphanumdash(json.deviceID);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.deviceID = this.deviceID;
    return json;
  }
}
