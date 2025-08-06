import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import type { LiveKitAccount } from "./LiveKitAccount";
import { LiveKitMediaDeviceStreams } from "./LiveKitMediaDeviceStreams";
import { LiveKitRemoteParticipant } from "./LiveKitRemoteParticipant";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { catchErrors } from "../../../frontend/Util/error";
import { assert, type URLString } from "../../util/util";
import { getDateTimeFormatPref, gt } from "../../../l10n/l10n";
import { Room, RemoteParticipant, RoomEvent, type RpcInvocationData } from "livekit-client";

export class LiveKitConf extends VideoConfMeeting {
  /* Authentication */
  account: LiveKitAccount;
  /* Live connection with the controller, during a conference */
  protected webSocket: WebSocket;
  webSocketURL: URLString;
  token: string;
  room: Room | null = null;
  mediaDeviceStreams: LiveKitMediaDeviceStreams;

  constructor(account: LiveKitAccount) {
    super();
    this.mediaDeviceStreams = new LiveKitMediaDeviceStreams();
    this.listenStreamChanges();
    this.account = account;
    this.id = crypto.randomUUID();
  }

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(interactive: boolean, relogin = false): Promise<void> {
    assert(this.account.controllerBaseURL, "Need controller URL");
  }

  protected async ky() {
    assert(this.account.controllerBaseURL, "Need controller URL");
    const headers: any = {
      "Content-Type": "application/json",
      "Origin": this.account.webFrontendBaseURL, // Controller uses this to find the room
    };
    return appGlobal.remoteApp.kyCreate({
      prefixUrl: this.account.controllerBaseURL,
      headers: headers,
      timeout: 3000,
      result: "json",
    });
  }

  protected async httpPost(urlSuffix: string, sendJSON: any): Promise<any> {
    let ky = await this.ky();
    return await ky.post(urlSuffix, { json: sendJSON });
  }

  protected async httpGet(urlSuffix: string): Promise<any> {
    let ky = await this.ky();
    return await ky.get(urlSuffix);
  }

  async createNewConference() {
    await this.login(true);
    let time = new Date().toLocaleString(getDateTimeFormatPref(), { hour: "numeric", minute: "numeric" });
    this.title = `Meeting ${time}`;
    this.id = crypto.randomUUID();
    this.state = MeetingState.Init;
  }

  async createInvitationURL(): Promise<URLString> {
    assert(this.id && this.room?.name, "Need to create the conference first");
    return `${this.account.webFrontendBaseURL}/rooms/${this.room.name}`;
  }

  /**
   * Received invite URL out-of-band (using other communication methods)
   * from conference owner, who did `getInvitationURL()`.
   * URL form: https://<web-frontend-host>/rooms/<room-name>
   */
  async join(url: URLString) {
    let urlParsed = new URL(url);
    // Data comes from user. All error messages in this function are user visible. TODO Translate error messages.
    assert(this.account.isMeetingURL(urlParsed), gt`This meeting URL is not supported`);
    let roomID = urlParsed.pathname.replace("/rooms/", "");
    assert(roomID.match(/^[a-zA-Z0-9\-]*$/), gt`Not a valid meeting invitation URL`);
    this.id = roomID;
    this.state = MeetingState.JoinConference;
  }

  async start() {
    assert(this.id, "Need to create the conference first");
    await super.start();

    let myName = appGlobal.me.name;
    const e = encodeURIComponent;
    let response = await this.httpGet(`connection-details?roomName=${e(this.id)}&participantName=${e(myName)}`);
    this.webSocketURL = response.serverUrl;
    this.token = response.participantToken;
    // this.controllerWebSocketURL = `wss://${this.webSocketURL}/rtc?access_token=${e(this.token)}&auto_subscribe=1&protocol=15&adaptive_stream=1`;
    await this.joinAfterStart();
  }

  protected async joinAfterStart() {
    this.room = new Room();
    await this.room.connect(this.webSocketURL, this.token);
    this.title = this.room.name;
    this.mediaDeviceStreams.localParticipant = this.room.localParticipant;

    this.myParticipant = new MeetingParticipant();
    this.myParticipant.id = this.room.localParticipant.sid;
    this.myParticipant.name = this.room.localParticipant.name || appGlobal.me.name;
    this.myParticipant.role = ParticipantRole.User;
    this.myParticipant.subscribe((_obj, propName) => this.myUserChanged(propName));
    this.state = MeetingState.Ongoing;

    this.room.localParticipant.registerRpcMethod("handUp", async (data: RpcInvocationData) => {
      let remoteParticipant = this.participants.find((p: LiveKitRemoteParticipant) => p.rp.identity == data.callerIdentity);
      assert(remoteParticipant, "LiveKit: Remote participant not found");
      let up = sanitize.translate(data.payload, { "up": true, "down": false });
      console.log(remoteParticipant.name, "has put hand", up ? "up" : "down");
      remoteParticipant.handUp = up;
      return "";
    });

    for (let remoteParticipant of this.room.remoteParticipants.values()) {
      this.participantJoined(remoteParticipant);
    }
    this.room.on(RoomEvent.ParticipantConnected, rp => catchErrors(() => this.participantJoined(rp), this.errorCallback));
    this.room.on(RoomEvent.ParticipantDisconnected, rp => catchErrors(() => this.participantLeft(rp), this.errorCallback));

    /*if (this.myParticipant.cameraOn) {
      this.room.localParticipant.setCameraEnabled(true);
    }
    if (this.myParticipant.micOn) {
      this.room.localParticipant.setMicrophoneEnabled(true);
    }*/
  }

  protected async participantJoined(remoteParticipant: RemoteParticipant): Promise<void> {
    let participant = new LiveKitRemoteParticipant(remoteParticipant, this);
    this.participants.add(participant);
  }

  protected async participantLeft(remoteParticipant: RemoteParticipant) {
    let participant = this.participants.find(p => p.id == remoteParticipant.identity) as LiveKitRemoteParticipant | null;
    assert(participant, "Participant left, but we didn't know about him.");
    this.videos.removeAll(this.videos.filter(v => v.participant == participant));
    this.participants.remove(participant);
  }

  readonly canHandUp = true;

  protected myUserChanged(propName: string) {
    console.log("My participant changed", propName, "to", this.myParticipant[propName]);
    if (propName == "handUp") {
      this.setMyHandUp(this.myParticipant.handUp);
    }
  }

  protected async setMyHandUp(up: boolean) {
    for (let otherParticipant of this.participants) {
      await this.room.localParticipant.performRpc({
        destinationIdentity: (otherParticipant as LiveKitRemoteParticipant).rp.identity,
        method: "handUp",
        payload: up ? "up" : "down",
      });
    }
  }

  /*protected setMyAttribute(name: string, value: any) {
    if (value == null) {
      // Per docs: To delete an attribute key, set its value to an empty string ('').
      // <https://docs.livekit.io/home/client/state/participant-attributes/>
      value = "";
    }
    let attributes = {};
    Object.assign(attributes, this.room.localParticipant.attributes);
    attributes[name] = value;
    this.room.localParticipant.setAttributes(attributes);
  }*/

  async answer() {
    await super.answer();
  }

  async hangup() {
    await super.hangup();
    if (this.room) {
      await this.room.disconnect();
    }
  }
}

export function arrayRemoveLast(array, item) {
  let pos = array.lastIndexOf(item);
  if (pos > -1) {
    array.splice(pos, 1);
  }
}
