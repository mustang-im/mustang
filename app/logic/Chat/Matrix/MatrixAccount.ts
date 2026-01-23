import { ChatAccount } from '../ChatAccount';
import { MatrixRoom } from './MatrixRoom';
import { MatrixVideoConf } from '../../Meet/Matrix/MatrixVideoConf';
import { UserChatMessage } from '../Message';
import { IncomingCall } from '../RoomEvent';
import { Group } from '../../Abstract/Group';
import { MatrixPerson } from './MatrixPerson';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';
import { appName } from '../../build';
import { assert } from '../../util/util';
import { MapColl } from 'svelte-collections';
import type { MatrixClient } from 'matrix-js-sdk';
import type { MatrixCall, Room, RoomMember } from 'matrix-js-sdk/lib/matrix';

export class MatrixAccount extends ChatAccount {
  readonly protocol: string = "matrix";
  readonly rooms = new MapColl<MatrixPerson | Group, MatrixRoom>;
  client: MatrixClient;
  baseURL = "https://matrix.org";
  username: string;
  password: string;
  deviceID: string;
  globalUserID: string;
  static personsCache = new MapColl<string, MatrixPerson>();

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
      });
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
    //let crypto = this.client.getCrypto();
    //await crypto.requestOwnUserVerification();
    await this.client.startClient();
    await this.waitForEvent("sync"); // Sync finished

    await this.listRooms(); // TODO Don't wait for it
    this.listenToRoomMessages();
  };
  async waitForEvent(eventName: string) {
    await new Promise((resolve, reject) => {
      this.client.once(eventName as any, (...results) => resolve(results));
    });
  }
  async listRooms(): Promise<void> {
    // await super.listRooms(); TODO merge fresh list from server with old
    let allRooms = await this.client.getRooms();
    await Promise.all(allRooms.map(room => this.getNewRoom(room)));
  }
  async getRoom(room: Room): Promise<MatrixRoom> {
    return this.getExistingRoom(room.roomId) ?? await this.getNewRoom(room);
  }
  async getNewRoom(room: Room): Promise<MatrixRoom> {
    let chatRoom = new MatrixRoom(this);
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
    this.rooms.set(chatRoom.contact, chatRoom);

    for (let event of room.getLiveTimeline().getEvents()) {
      try {
        let msg = await chatRoom.getEvent(event); // process system events
        if (msg && true || msg instanceof UserChatMessage) { // when joining, we add only user messages
          chatRoom.messages.add(msg);
        }
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
    chatRoom.lastMessage = chatRoom.messages.get(chatRoom.messages.length - 1);
    return chatRoom;
  }
  getExistingRoom(roomID: string): MatrixRoom {
    return this.rooms.find(chat => chat.id == roomID);
  }
  getExistingPerson(userId: string) {
    return MatrixAccount.personsCache.get(userId);
  }
  getPerson(member: RoomMember): MatrixPerson {
    let existing = this.getExistingPerson(member.userId);
    if (existing) {
      return existing;
    }
    let person = new MatrixPerson(member.userId, member.name);
    person.setAvatar(member, this);
    MatrixAccount.personsCache.set(person.chatID, person);
    return person;
  }
  async createRoom(name: string) {
    // TODO create room on server
    return new MatrixRoom(this);
  }

  /** Listen to messages for all rooms */
  listenToRoomMessages() {
    this.client.on("Room.timeline", async (event, room, toStartOfTimeline) => {
      try {
        if (toStartOfTimeline) {
          return; // no paginated results
        }
        let chatRoom = await this.getRoom(room.roomId);
        let message = await chatRoom.getEvent(event);
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

  get isLoggedIn() {
    return !!this.client;
  }

  async logout() {
    await super.logout();
    await this.client.logout();
    this.client = null;
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
