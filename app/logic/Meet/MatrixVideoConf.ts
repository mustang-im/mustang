import { Chat } from "../Chat/Chat";
import { VideoConfMeeting } from "./VideoConfMeeting";
import { ParticipantVideo, SelfVideo } from "./VideoStream";
import { MatrixCall, MatrixClient } from "matrix-js-sdk";
import { CallErrorCode, createNewMatrixCall } from "matrix-js-sdk/lib/webrtc/call";
import { assert } from "../util/util";
import { MeetingParticipant } from "./Participant";

export class MatrixVideoConf extends VideoConfMeeting {
  call: MatrixCall;
  client: MatrixClient;

  /**
   * You probably want to call function `call()` instead of the ctor.
   *
   * @param client Logged in, and the initial sync has already finished.
   * @param call
   */
  protected constructor(client: MatrixClient, call: MatrixCall) {
    super();
    this.client = client;
    this.call = call;
    this.call.on("error", ex => this.errorCallback(ex));
    this.call.on("hangup", () => this.endCallback());
  }

  async start() {
    await super.start();
    this.call.on("feeds_changed", (feeds) => {
      for (let feed of feeds) {
        if (feed.isLocal()) {
          this.videos.add(new SelfVideo(feed.stream));
        } else {
          let participant = new MeetingParticipant(); // TODO
          this.videos.add(new ParticipantVideo(feed.stream, participant));
        }
      }
    });
    this.call.placeVideoCall();
  }

  async answer() {
    this.call.answer();
    super.answer();
  }

  async hangup() {
    this.call.hangup(CallErrorCode.UserHangup, false);
    super.hangup();
  }

  /**
   * @param client Logged in, and the initial sync has already finished.
   */
  static async call(chatRoom: Chat, client: MatrixClient): Promise<MatrixVideoConf> {
    let call = createNewMatrixCall(client, chatRoom.id);
    assert(call, "Matrix failed to start the call");
    let meet = new MatrixVideoConf(client, call);
    await meet.start();
    return meet;
  }

  /**
   * @param client Logged in, and the initial sync has already finished.
   */
  static async createAdhoc(client: MatrixClient): Promise<MatrixVideoConf> {
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
