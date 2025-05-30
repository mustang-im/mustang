import { MeetingState, VideoConfMeeting } from "../VideoConfMeeting";
import { VideoStream } from "../VideoStream";
import { MeetingParticipant } from "../Participant";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import { Chat } from "../../Chat/Chat";
import { assert } from "../../util/util";
import type { MatrixCall, MatrixClient } from "matrix-js-sdk";
import { CallErrorCode, createNewMatrixCall } from "matrix-js-sdk/lib/webrtc/call";

export class MatrixVideoConf extends VideoConfMeeting {
  protected _call: MatrixCall;
  client: MatrixClient;

  canVideo = true;
  canAudio = true;
  canScreenShare = false;
  canMultipleParticipants = false;
  canCreateURL = false;

  /**
   * You probably want to call function `call()` instead of the ctor.
   *
   * @param client Logged in, and the initial sync has already finished.
   * @param call
   */
  protected constructor(client: MatrixClient, call: MatrixCall) {
    super();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.client = client;
    this._call = call;
    this._call.on("error", ex => this.errorCallback(ex));
    this._call.on("hangup", () => this.endCallback());
  }

  async start() {
    await super.start();
    this._call.on("feeds_changed", (feeds) => {
      for (let feed of feeds) {
        if (feed.isLocal()) {
          let self = new VideoStream(feed.stream);
          self.isMe = true;
          this.videos.add(self);
        } else {
          let participant = new MeetingParticipant(); // TODO
          this.videos.add(new VideoStream(feed.stream, participant));
        }
      }
      this.participants._notifySvelteOfChanges();
    });
    await this._call.placeVideoCall();
    this.state = MeetingState.Ongoing;
  }

  async answer() {
    this._call.answer();
    await super.answer();
  }

  async hangup() {
    this._call.hangup(CallErrorCode.UserHangup, false);
    await super.hangup();
  }

  /**
   * @param client Logged in, and the initial sync has already finished.
   */
  static async call(chatRoom: Chat, client: MatrixClient): Promise<MatrixVideoConf> {
    let call = createNewMatrixCall(client, chatRoom.id);
    assert(call, "Matrix failed to start the call");
    let meet = new MatrixVideoConf(client, call);
    meet.state = MeetingState.OutgoingCallConfirm;
    return meet;
  }

  /**
   * @param client Logged in, and the initial sync has already finished.
   */
  static async createNewConference(client: MatrixClient): Promise<MatrixVideoConf> {
    let chatRoom = new Chat();
    // TODO create room using MatrixClient
    return await this.call(chatRoom, client);
  }

  /**
   * The phone is ringing!
   * Be informed of incoming calls from other users.
   *
   * This is before a conference.
   * Once somebody calls our users, the `incomingCallCallback` will be called
   * with a `MatrixVideoConf` object as parameter.
   * You then need to call `conf.answer()` on that object.
   *
   * This `listenForCalls()` function should normally be called only once in the lifetime of the app.
   */
  static listenForCalls(client: MatrixClient, incomingCallCallback: (MatrixVideoConf) => Promise<void>) {
    client.on("Call.incoming", (call: MatrixCall) => {
      console.log("Incoming call", call.roomId, call);
      let conf = new MatrixVideoConf(client, call);
      incomingCallCallback(conf);
    });
  }
}
