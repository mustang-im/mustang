import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { ParticipantVideo, ScreenShare, SelfVideo } from "../VideoStream";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import type { LiveKitAccount } from "./LiveKitAccount";
import { appGlobal } from "../../app";
import { assert, type URLString, NotImplemented } from "../../util/util";
import { getUILocale } from "../../../l10n/l10n";
import { Room, RemoteParticipant, RoomEvent } from "livekit-client";
import { LiveKitRemoteParticipant } from "./LiveKitRemoteParticipant";
import { catchErrors } from "../../../frontend/Util/error";

export class LiveKitConf extends VideoConfMeeting {
  /* Authentication */
  account: LiveKitAccount;
  controllerWebSocketURL: string;
  /* Live connection with the controller, during a conference */
  protected webSocket: WebSocket;
  webSocketURL: URLString;
  token: string;
  room: Room | null = null;

  constructor(account: LiveKitAccount) {
    super();
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
    let time = new Date().toLocaleString(getUILocale(), { hour: "numeric", minute: "numeric" });
    this.title = `Meeting ${time}`;
    this.id = crypto.randomUUID();
  }

  /**
   * Received invite URL out-of-band (using other communication methods)
   * from conference owner, who did `getInvitationURL()`.
   * URL form: https://<web-frontend-host>/invite/<invite-code>
   */
  async join(url: URLString) {
    let urlParsed = new URL(url);
    // Data comes from user. All error messages in this function are user visible. TODO Translate error messages.
    assert(urlParsed.pathname.startsWith("/rooms/"), "Protocol not supported");
    let roomID = urlParsed.pathname.replace("/rooms/", "");
    assert(roomID.match(/^[a-f0-9\-]*$/), "Not a valid invitation URL");
    this.id = roomID;
  }

  async getInvitationURL(): Promise<URLString> {
    assert(this.id, "Need to create the conference first");
    throw new NotImplemented();
    return `${this.account.controllerBaseURL}/rooms/${this.id}`;
  }

  async start() {
    assert(this.id, "Need to create the conference first");
    await super.start();

    let myName = appGlobal.me.name;
    const e = encodeURIComponent;
    let response = await this.httpGet(`connection-details?roomName=${e(this.id)}&participantName=${e(myName)}`);
    this.webSocketURL = response.serverUrl;
    this.token = response.participantToken;
    this.controllerWebSocketURL = `wss://${this.webSocketURL}/rtc?access_token=${e(this.token)}&auto_subscribe=1&protocol=15&adaptive_stream=1`;
    this.state = MeetingState.JoinConference;

    await this.joinAfterStart();
  }

  protected async joinAfterStart() {
    this.room = new Room();
    await this.room.connect(this.webSocketURL, this.token);
    this.title = this.room.name;

    this.myParticipant = new MeetingParticipant();
    this.myParticipant.id = this.room.localParticipant.sid;
    this.myParticipant.name = this.room.localParticipant.name ?? appGlobal.me.name;
    this.myParticipant.role = ParticipantRole.User;

    for (let remoteParticipant of this.room.remoteParticipants.values()) {
      this.participantJoined(remoteParticipant);
    }
    this.room.on(RoomEvent.ParticipantConnected, rp => catchErrors(() => this.participantJoined(rp), this.errorCallback));
    this.room.on(RoomEvent.ParticipantDisconnected, rp => catchErrors(() => this.participantLeft(rp), this.errorCallback));

    if (this.myParticipant.cameraOn) {
      this.room.localParticipant.setCameraEnabled(true);
    }
    if (this.myParticipant.micOn) {
      this.room.localParticipant.setMicrophoneEnabled(true);
    }
  }

  protected async participantJoined(remoteParticipant: RemoteParticipant): Promise<void> {
    let participant = new LiveKitRemoteParticipant(remoteParticipant, this);
    this.participants.add(participant);
  }

  protected async participantLeft(remoteParticipant: RemoteParticipant) {
    let participant = this.participants.find(p => p.id == remoteParticipant.identity) as LiveKitRemoteParticipant | null;
    assert(participant, "Participant left, but we didn't know about him.");
    this.videos.removeAll(this.videos.filter(v =>
      (v instanceof ParticipantVideo || v instanceof ScreenShare) &&
      v.participant == participant));
    this.participants.remove(participant);
  }

  async setCamera(mediaStream: MediaStream | null): Promise<void> {
    if (!mediaStream) {
      this.videos.remove(this.videos.find(v => v instanceof SelfVideo));
      // TODO set mediaStream
      await this.room?.localParticipant.setCameraEnabled(false);
      return;
    }
    assert(mediaStream instanceof MediaStream, "Need a media stream for the camera");
    await this.room?.localParticipant.setCameraEnabled(true);
    this.videos.add(new SelfVideo(mediaStream));
  }

  async setScreenShare(mediaStream: MediaStream | null): Promise<void> {
    if (!mediaStream) {
      this.videos.remove(this.videos.find(v => v instanceof ScreenShare && v.participant == this.myParticipant));
      // TODO set mediaStream
      await this.room?.localParticipant.setScreenShareEnabled(false);
      return;
    }
    assert(mediaStream instanceof MediaStream, "Need a media stream for the screen");
    this.videos.add(new ScreenShare(mediaStream, this.myParticipant));
    await this.room?.localParticipant.setScreenShareEnabled(true);
  }

  async answer() {
    await super.answer();
  }

  async hangup() {
    assert(this.room, "Didn't join yet");
    await this.room.disconnect();
    await super.hangup();
  }
}

export function arrayRemoveLast(array, item) {
  let pos = array.lastIndexOf(item);
  if (pos > -1) {
    array.splice(pos, 1);
  }
}
