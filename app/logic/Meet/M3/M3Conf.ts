import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { ParticipantVideo, ScreenShare, SelfVideo } from "../VideoStream";
import { MeetingParticipant as Participant, ParticipantRole } from "../Participant";
import { M3Account } from "./M3Account";
import { appGlobal } from "../../app";
import { notifyChangedProperty } from "../../util/Observable";
import { assert, sleep, type URLString } from "../../util/util";
import { getUILocale } from "../../../l10n/l10n";

export class M3Conf extends VideoConfMeeting {
  controllerBaseURL: string;
  controllerWebSocketURL: string;
  /* Authentication */
  account: M3Account;
  /* Live connection with the controller, during a conference */
  protected webSocket: WebSocket;
  /* Current meeting */
  eventID: string;
  roomID: string;
  inviteCode: string; // only when guest
  resumptionTicket: string;
  iceServers: ICEServer[];
  myParticipant: Participant;

  /** Our camera and mic.
   * Set this using setCamera() */
  @notifyChangedProperty
  protected camera: MediaStream | null = null;
  /** Our screen
   * Set this using setScreenShare() */
  @notifyChangedProperty
  protected screenShare: MediaStream | null = null;

  constructor(account: M3Account) {
    super();
    this.account = account;
  }

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(interactive: boolean, relogin = false): Promise<void> {
    // TODO Multi-account
    this.account = appGlobal.meetAccounts.find(acc => acc instanceof M3Account) as M3Account;
    assert(this.account.controllerBaseURL, "Need controller URL");
    this.controllerBaseURL = this.account.controllerBaseURL;
    this.controllerWebSocketURL = this.account.controllerWebSocketURL;
    if (this.account.isLoggedIn && !relogin) {
      return;
    }

    await this.account.login(interactive, relogin);
    // TODO fails with: type=REFRESH_TOKEN_ERROR, error=invalid_token, grant_type=refresh_token, client_auth_method=client-secret
    await this.httpPost("auth/login", {
      id_token: this.account.oauth2.idToken,
    });
  }

  protected async ky() {
    assert(this.controllerBaseURL, "Need controller URL");
    const headers: any = {
      "Content-Type": "application/json",
    };
    if (this.account.oauth2?.isLoggedIn) {
      headers.Authorization = this.account.oauth2.authorizationHeader;
    }
    return appGlobal.remoteApp.kyCreate({
      prefixUrl: `${this.controllerBaseURL}/v1/`,
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
    let event = await this.httpPost("events", {
      title: `Meeting ${time}`,
      description: "",
      is_time_independent: true,
      waiting_room: false,
      recurrence_pattern: [],
      is_adhoc: true,
    });
    console.log("new conference", event);
    this.eventID = event.id;
    this.roomID = event.room.id;
  }

  /**
   * Received invite URL out-of-band (using other communication methods)
   * from conference owner, who did `getInvitationURL()`.
   * URL form: https://<web-frontend-host>/invite/<invite-code>
   */
  async join(url: URLString) {
    this.iceServers = await this.httpPost(`turn`, {});

    let urlParsed = new URL(url);
    // Data comes from user. All error messages in this function are user visible. TODO Translate error messages.
    assert(urlParsed.pathname.startsWith("/invite/"), "Protocol not supported");
    let inviteCode = urlParsed.pathname.replace("/invite/", "");
    assert(inviteCode.match(/^[a-f0-9\-]*$/), "Not a valid invitation URL");
    let roomID: string;
    try {
      let response = await this.httpPost(`invite/verify`, {
        invite_code: inviteCode,
      });
      roomID = response.room_id;
      assert(roomID, "Room ID missing");
    } catch (ex) {
      ex.message = "This invitation is not valid anymore. Please request a new invitation from the organizer of the meeting.";
      throw ex;
    }
    this.inviteCode = inviteCode;
    this.roomID = roomID;
    // uh... protocol doesn't give any way to find the controller (e.g. of a third-party server)
    urlParsed.hostname = "controller." + urlParsed.hostname.replace("www.", "");
    this.controllerBaseURL = urlParsed.origin;
    this.controllerWebSocketURL = `wss://${urlParsed.host}/signalling`;
    this.state = MeetingState.JoinConference;
  }

  async getInvitationURL(): Promise<URLString> {
    assert(this.roomID, "Need to create the conference first");
    let response = await this.httpPost(`rooms/${this.roomID}/invites`, {});
    return `${this.account.webFrontendBaseURL}/invite/${response.invite_code}`;
  }

  async aboutMe(): Promise<{ name: string, picture: URLString, email: string, id: string }> {
    if (this.account.oauth2) {
      let me = await this.httpGet("users/me");
      me.name = me.display_name;
      me.picture
      return {
        name: me.display_name,
        email: me.email,
        picture: me.avatar_url,
        id: me.id,
      };
    } else {
      let me = appGlobal.me;
      return {
        name: me.name,
        email: me.emailAddresses.first?.value,
        picture: me.picture,
        id: me.id,
      };
    }
  }

  async setCamera(mediaStream: MediaStream | null): Promise<void> {
    if (!mediaStream) {
      if (!this.camera) {
        return;
      }
      let old = this.camera;
      this.camera = null;
      this.videos.remove(this.videos.find(v => v instanceof SelfVideo && v.stream == old));
      await this.removeMyVideo(old, false);
      return;
    }
    assert(mediaStream instanceof MediaStream, "Need a media stream for the camera");
    if (this.camera) {
      await this.setCamera(null); // Remove previous
    }
    this.camera = mediaStream;
    this.videos.add(new SelfVideo(mediaStream));
    if (this.myParticipant) {
      await this.sendVideo(this.camera, false);
    }
  }

  async setScreenShare(mediaStream: MediaStream | null): Promise<void> {
    if (!mediaStream) {
      if (!this.screenShare) {
        return;
      }
      let old = this.screenShare;
      this.screenShare = null;
      this.videos.remove(this.videos.find(v => v instanceof ScreenShare && v.stream == old));
      await this.removeMyVideo(old, true);
      return;
    }
    assert(mediaStream instanceof MediaStream, "Need a media stream for the screen");
    if (this.screenShare) {
      await this.setScreenShare(null); // Remove previous
    }
    this.screenShare = mediaStream;
    this.videos.add(new ScreenShare(mediaStream, this.myParticipant));
    if (this.myParticipant) {
      await this.sendVideo(this.screenShare, true);
    }
  }

  async start() {
    assert(this.roomID, "Need to create the conference first");
    await super.start();
    let roomTicket: string;
    if (this.inviteCode) {
      let response = await this.httpPost(`rooms/${this.roomID}/start_invited`, {
        invite_code: this.inviteCode,
        breakout_room: null,
      });
      roomTicket = response.ticket;
      this.resumptionTicket = response.resumption;
    } else {
      await this.httpGet(`turn`);
      let response = await this.httpPost(`rooms/${this.roomID}/start`, {
        breakout_room: null,
      });
      roomTicket = response.ticket;
      this.resumptionTicket = response.resumption;
    }
    assert(roomTicket, "Failed to get authentication for the conference room");

    await this.createWebSocket(roomTicket);
    this.addMsgListener("control", "joined", false, false, (json) => this.participantJoined(json));
    this.addMsgListener("control", "left", false, false, (json) => this.participantLeft(json));
    this.addMsgListener("control", "update", false, false, (json) => this.participantUpdate(json));
    this.addMsgListener("media", "webrtc_down", false, false, (json) => this.participantVideoStopped(json));

    await this.joinAfterStart();
  }

  protected async joinAfterStart() {
    let me = await this.aboutMe();
    let name = me.name;

    this.send("control", "join", {
      display_name: name,
    });
    let info = await this.waitForMessage("control", "join_success") as JoinInfoJSON;
    this.myParticipant = new Participant();
    this.myParticipant.id = info.id;
    this.myParticipant.name = name;
    this.myParticipant.role = info.role;
    await Promise.all(info.participants.map(p => this.participantJoined(p)));

    if (this.camera && this.camera.active) {
      await this.sendVideo(this.camera, false);
    }
  }

  /**
   * Handles control.joined
   * Called when other participants join the conference.
   */
  protected async participantJoined(json: ParticipantJSON): Promise<void> {
    if (json.control.left_at) {
      return;
    }
    let participant = new Participant();
    participant.id = json.id;
    participant.name = json.control.display_name;
    this.setParticipateInfo(participant, json);
    this.participants.add(participant);
    if (participant.cameraOn || participant.micOn) {
      await this.getVideoFromParticipant(participant, false);
    }
  }

  /** Handles media.webrtc_down */
  protected participantVideoStopped(json: any) {
    // normally, we have already removed the video from participantUpdate(),
    // but just in case...
    let participantId = json.source;
    let isScreen = json.media_session_type == "screen";
    let video = this.videos.find(v =>
      (!isScreen && v instanceof ParticipantVideo ||
        isScreen && v instanceof ScreenShare) &&
      v.participant?.id == participantId);
    if (video) {
      this.videos.remove(video);
    }
  }

  /** Handles control.update */
  protected async participantUpdate(json: any) {
    let participantID = json.id;
    let participant = this.participants.find(p => p.id == participantID);
    assert(participant, "Got participant update before joined");
    this.setParticipateInfo(participant, json);

    let incomingMedia = participant.cameraOn || participant.micOn;
    let video = this.videos.find(v => v instanceof ParticipantVideo && v.participant?.id == participantID);
    if (!video && incomingMedia) {
      await this.getVideoFromParticipant(participant, false);
    } else if (video && !incomingMedia) {
      await this.stopVideoFromParticipant(video);
    }

    let screen = this.videos.find(v => v instanceof ScreenShare && v.participant?.id == participantID);
    if (!screen && participant.screenSharing) {
      await this.getVideoFromParticipant(participant, true);
    } else if (screen && !participant.screenSharing) {
      await this.stopVideoFromParticipant(screen);
    }
  }

  protected setParticipateInfo(participant: Participant, json: any) {
    participant.handUp = !!json.control?.hand_is_up;
    if (json.media?.video) {
      participant.cameraOn = json.media?.video?.video;
      participant.micOn = json.media?.video?.audio;
    }
    participant.screenSharing = json.media?.screen?.video;
  }

  /** Handles control.left */
  protected async participantLeft(json: any) {
    let participantId = json.id;
    let participant = this.participants.find(p => p.id == participantId);
    assert(participant, "Participant left, but we didn't know about him.");
    this.participants.remove(participant);
    let videos = this.videos.filter(v =>
      (v instanceof ParticipantVideo || v instanceof ScreenShare) &&
      v.participant == participant);
    for (let video of videos) {
      await this.stopVideoFromParticipant(video);
    }
  }

  /** Called when our metadata changes, e.g. hand up or cam/mic on/off */
  protected selfUpdate(self: Participant, propertyName?: string) {
    if (!propertyName) {
      return;
    }
    if (propertyName == "handUp") {
      this.send("control", self.handUp ? "raise_hand" : "lower_hand", {});
    } else if (propertyName == "cameraOn" || propertyName == "micOn") {
      this.send("media", "update_media_session", {
        media_session_type: "video",
        media_session_state: {
          video: self.cameraOn,
          audio: self.micOn,
          video_settings: 2,
        }
      });
    }
  }

  async answer() {
    await super.answer();
  }

  async hangup() {
    if (this.myParticipant?.peerConnection) {
      await this.removeMyVideo(this.camera, false);
    }
    if (this.myParticipant?.screenPeerConnection) {
      await this.removeMyVideo(this.screenShare, true);
    }
    await this.closeWebSocket();
    await super.hangup();
  }

  ///////////////////////
  // WebRTC handling

  protected async sendVideo(mediaStream: MediaStream, isScreen: boolean) {
    assert(mediaStream.active, "MediaStream needs to be active");
    let peerConnection = new RTCPeerConnection(this.getPeerConnectionConfig());
    if (isScreen) {
      this.myParticipant.peerConnection = peerConnection;
    } else {
      this.myParticipant.screenPeerConnection = peerConnection;
    }
    for (let track of mediaStream.getTracks()) {
      peerConnection.addTrack(track, mediaStream);
    }
    await this.sendICECandidates(peerConnection, this.myParticipant.id, isScreen);
    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    const sessionType = isScreen ? "screen" : "video";
    this.send("media", "publish", {
      target: this.myParticipant.id,
      media_session_type: sessionType,
      sdp: offer.sdp,
    });
    let answer = await this.waitForMessage("media", "sdp_answer", answer =>
      answer.source == this.myParticipant.id && answer.media_session_type == sessionType);
    await peerConnection.setRemoteDescription({
      type: "answer",
      sdp: answer.sdp,
    });
    await this.waitForMessage("media", "webrtc_up", up =>
      up.source == this.myParticipant.id && up.media_session_type == sessionType);
    // This arrives at least twice, one for audio and once for video, but we'll wait only for one of them.
    let status = await this.waitForMessage("media", "media_status", status =>
      status.source == this.myParticipant.id && status.media_session_type == sessionType);
    assert(status.receiving, "Server didn't receive our stream");
    this.send("media", "publish_complete", {
      media_session_type: sessionType,
      media_session_state: {
        video: true,
        audio: isScreen ? false : true,
        video_settings: 2,
      }
    });
  }

  protected async removeMyVideo(mediaStream: MediaStream, isScreen: boolean) {
    const sessionType = isScreen ? "screen" : "video";
    this.send("media", "unpublish", {
      media_session_type: sessionType,
    });
    /*
    this.send("media", "update_media_session", {
      media_session_type: sessionType,
      media_session_state: {
        audio: false,
        video: false,
        video_settings: 2,
      }
    });
    */
    this.closePeerConnection(this.myParticipant, isScreen);
  }

  // TODO re-subscribe to other participant's video, if it dropped

  async getVideoFromParticipant(participant: Participant, isScreen: boolean) {
    let sessionType = isScreen ? "screen" : "video";
    this.send("media", "subscribe", {
      target: participant.id,
      media_session_type: sessionType,
    });
    let videoStream = isScreen
      ? new ScreenShare(new MediaStream(), participant)
      : new ParticipantVideo(new MediaStream(), participant);
    // https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling
    // https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation
    let peerConnection = new RTCPeerConnection(this.getPeerConnectionConfig());
    if (isScreen) {
      participant.screenPeerConnection = peerConnection;
    } else {
      participant.peerConnection = peerConnection;
    }
    peerConnection.ontrack = (event) => {
      let track = event.track;
      assert(track instanceof MediaStreamTrack, "Didn't get a track");
      videoStream.stream.addTrack(track);
    };
    // TODO peerConnection.addEventListener("removetrack")?
    let offer = await this.waitForMessage("media", "sdp_offer", offer =>
      offer.source == participant.id && offer.media_session_type == sessionType);
    await peerConnection.setRemoteDescription({
      type: "offer",
      sdp: offer.sdp,
    });
    await this.sendICECandidates(peerConnection, participant.id, isScreen);
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    this.send("media", "sdp_answer", {
      target: participant.id,
      media_session_type: sessionType,
      sdp: answer.sdp,
    });
    await this.waitForMessage("media", "webrtc_up", up =>
      up.source == participant.id && up.media_session_type == sessionType);
    this.send("media", "configure", {
      target: participant.id,
      media_session_type: sessionType,
      configuration: {
        video: true,
      }
    });
    this.videos.add(videoStream);
  }

  async stopVideoFromParticipant(video: ParticipantVideo | ScreenShare): Promise<void> {
    this.closePeerConnection(video.participant, video instanceof ScreenShare);
    this.videos.remove(video);
  }

  protected closePeerConnection(participant: Participant, isScreen: boolean) {
    if (!participant) {
      return;
    }
    let prop = isScreen ? "screenPeerConnection" : "peerConnection";
    let peerConnection = participant[prop];
    participant[prop] = null;
    if (peerConnection) {
      peerConnection.close();
    }
  }

  async sendICECandidates(peerConnection: RTCPeerConnection, participantID: string, isScreen: boolean) {
    let sessionType = isScreen ? "screen" : "video";
    peerConnection.onicecandidate = (event) => {
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
      let candidateObj = event.candidate;
      if (candidateObj == null) {
        return;
      } else if (candidateObj.candidate == "") {
        this.send("media", "sdp_end_of_candidates", {
          target: participantID,
          media_session_type: sessionType,
        });
      } else if (candidateObj.candidate) {
        this.send("media", "sdp_candidate", {
          target: participantID,
          media_session_type: sessionType,
          candidate: {
            sdpMid: candidateObj.sdpMid,
            sdpMLineIndex: candidateObj.sdpMLineIndex,
            candidate: candidateObj.candidate,
          }
        });
      }
    }
    /*
    peerConnection.onicegatheringstatechange = (event) => {
      console.log("ICE gathering state", peerConnection.iceGatheringState);
    }
    await new Promise(resolve => {
      peerConnection.onicegatheringstatechange = (event) => {
        if (peerConnection.iceGatheringState == "complete") {
          resolve(null);
        }
      }
    });*/
  }

  getPeerConnectionConfig() {
    let urls = this.iceServers?.map(s => s.uris).flat();
    if (!urls?.length) {
      urls = ["stun:stun.sipgate.net:10000"]; // TODO
    }
    console.log("ice servers", this.iceServers, "urls", urls);
    return {
      iceServers: [
        {
          urls: urls,
        },
      ],
    };
  }

  ////////////////////////
  // WebSocket handling

  protected async createWebSocket(ticket: string) {
    this.webSocket = new WebSocket(this.controllerWebSocketURL, [`ticket#${ticket}`, "k3k-signaling-json-v1.0"]);
    await new Promise(resolve => { // wait for connection to be established
      this.webSocket.onopen = resolve;
    });
    this.webSocket.onmessage = (event) => this.handleIncomingMsg(event);
  }

  protected async handleIncomingMsg(event) {
    try {
      let eventData = JSON.parse(event.data);
      let module = eventData.namespace;
      let payload = eventData.payload;
      for (let listener of this.msgListeners.slice().reverse()) {
        if (listener.module != module ||
          payload.message != listener.msg) {
          continue;
        }
        try {
          await listener.listener(payload);
        } catch (ex) {
          this.errorCallback(ex);
        }
        if (listener.override) {
          break;
        }
        if (listener.once) {
          arrayRemoveLast(this.msgListeners, listener);
        }
      }
    } catch (ex) {
      this.errorCallback(ex);
    }
  }

  private msgListeners: Array<{
    /** JSON namespace */
    module: JSONNamespaces,
    /**
     * The listener will be triggered, if json.namespace == module and
     * json.payload.message == msg;
     */
    msg: string,
    /** Do not call earlier handlers for the same message */
    override: boolean,
    /** Call this listener only once, then remove it */
    once: boolean,
    /**
     * @param json: The JSON payload object
     */
    listener: (json: any) => Promise<void> | void,
  }> = [];

  /**
   * Adds a handler for the given message on the controller web socket
   * @param callback will be called with the JSON payload of the message.
   * @once Call the listener only once, then stop listening for this msg.
   * @override Do not call earlier listeners for the same message
   */
  addMsgListener(module: JSONNamespaces, msg: string, once = false, override = false,
    callback: (json: any) => Promise<void> | void) {
    this.msgListeners.push({
      module,
      msg,
      once,
      override,
      listener: callback,
    });
  }

  removeMsgListener(callback: (json: any) => Promise<void> | void) {
    let pos = this.msgListeners.findIndex(l => l.listener == callback);
    if (pos != -1) {
      this.msgListeners.splice(pos, 1);
    }
  }

  /**
   * Waits until the given message arrives on the controller web socket
   * @returns the JSON payload of that msg
   */
  async waitForMessage(module: JSONNamespaces, msg: string, condition = (json: any) => true): Promise<any> {
    return await new Promise(resolve => {
      this.addMsgListener(module, msg, true, false, (json: any) => {
        if (!condition(json)) {
          return;
        }
        resolve(json);
      });
    });
  }

  send(module: JSONNamespaces, action: string, payload: any) {
    let json = {
      namespace: module,
      payload: payload,
    };
    payload.action = action;
    this.webSocket.send(JSON.stringify(json));
  }

  protected async closeWebSocket() {
    if (this.webSocket.readyState == WebSocket.CLOSED ||
      this.webSocket.readyState == WebSocket.CLOSING) {
      return;
    }
    while (this.webSocket.bufferedAmount > 0) {
      await sleep(0.01);
    }
    this.webSocket.close();
  }
}

export function arrayRemoveLast(array, item) {
  let pos = array.lastIndexOf(item);
  if (pos > -1) {
    array.splice(pos, 1);
  }
}

type JSONNamespaces = "control" | "media";

class JoinInfoJSON {
  id: string;
  display_name: string;
  avatar_url: URLString;
  role: ParticipantRole;
  participants: ParticipantJSON[];
}

class ParticipantJSON {
  id: string;
  media: {
    is_presenter: boolean;
    video: {
      audio: boolean;
      video: boolean;
    },
  };
  control: {
    display_name: string,
    avatar_url: URLString,
    role: ParticipantRole,
    hand_is_up: boolean,
    left_at: string,
    participation_kind: "user",
  };
  chat: {
    groups: []
  };
}

class ICEServer {
  uris: string[];
}
