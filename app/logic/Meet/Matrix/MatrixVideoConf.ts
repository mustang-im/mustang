import { MeetingState, VideoConfMeeting } from "../VideoConfMeeting";
import { VideoStream } from "../VideoStream";
import { MeetingParticipant } from "../Participant";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import { assert } from "../../util/util";
import type { MatrixCall, MatrixClient } from "matrix-js-sdk";
import type { MatrixAccount } from "../../Chat/Matrix/MatrixAccount";
import type { MatrixRoom } from "../../Chat/Matrix/MatrixRoom";
import { gt } from "../../../l10n/l10n";
enum CallErrorCode {
  UserHangup = "user_hangup",
};


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
  constructor(matrixAccount: MatrixAccount, call: MatrixCall) {
    super();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.client = matrixAccount.client;
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
  static async call(chatRoom: MatrixRoom, matrixAccount: MatrixAccount): Promise<MatrixVideoConf> {
    const { createNewMatrixCall } = await import("matrix-js-sdk/lib/webrtc/call");
    let call = createNewMatrixCall(matrixAccount.client, chatRoom.id);
    assert(call, "Matrix failed to start the call");
    let meet = new MatrixVideoConf(matrixAccount, call);
    meet.state = MeetingState.OutgoingCallConfirm;
    return meet;
  }

  /**
   * @param client Logged in, and the initial sync has already finished.
   */
  static async createNewConference(matrixAccount: MatrixAccount): Promise<MatrixVideoConf> {
    let chatRoom = await matrixAccount.createRoom(gt`Meeting` + " " + new Date().toLocaleTimeString());
    return await this.call(chatRoom, matrixAccount);
  }
}
