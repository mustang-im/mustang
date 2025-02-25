import { MeetingState, VideoConfMeeting } from "../VideoConfMeeting";
import { appGlobal } from "../../app";
import { assert, NotImplemented } from "../../util/util";

/**
 * Starts a phone call on the actual hardware phone,
 * *not* in our app. Neither voice nor video is in our app,
 * and only 1 other participant is allowed.
 * Only dials a single phone number and lets the hardware
 * phone ring. Once the user picks up his own phone,
 * the phone operator rings the other party.
 */
export class SipgateDialCall extends VideoConfMeeting {
  async start() {
    this.state = MeetingState.Ongoing;
    this.started = new Date();
  }

  async setCamera(mediaStream: MediaStream | null) {
    throw new NotImplemented();
  }

  async call() {
    assert(this.state == MeetingState.OutgoingCallPrepare, "Must be an outgoing call");
    this.state = MeetingState.OutgoingCall;
  }

  async answer() {
    throw new NotImplemented();
  }

  /** Leave this conference. */
  async hangup() {
    this.state = MeetingState.Ended;
    this.ended = new Date();
    appGlobal.meetings.remove(this);
  }
}
