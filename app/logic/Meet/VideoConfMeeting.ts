import { SelfVideo, type VideoStream } from "./VideoStream";
import type { MeetingParticipant as Participant } from "./Participant";
import type { Event } from "../Calendar/Event";
import { appGlobal } from "../app";
import { SetColl } from 'svelte-collections';
import { Observable, notifyChangedProperty } from "../util/Observable";
import { assert } from "../util/util";

export class VideoConfMeeting extends Observable {
  id: string;
  @notifyChangedProperty
  event: Event;
  @notifyChangedProperty
  state: MeetingState = MeetingState.Init;
  @notifyChangedProperty
  started: Date;
  @notifyChangedProperty
  ended: Date;
  readonly participants = new SetColl<Participant>();
  readonly videos = new SetColl<VideoStream>();
  /** myParticipant.role: If I'm a moderator, I can manage other users */
  @notifyChangedProperty
  myParticipant: Participant;

  errorCallback = (ex) => {
    console.error(ex);
  };
  endCallback = () => {
    console.log("Call ended");
  };

  async start() {
    this.state = MeetingState.Ongoing;
    this.started = new Date();
  }

  /**
   * After opening our user's camera and microphone
   * using `getUserMedia()`, pass the stream here.
   *
   * You should preferably do that before `start()`ing the conference,
   * but you can do it at any time.
   *
   * This function will also add or remove the `SelfVideo` instance
   * in `.videos`, so showing all `.videos` is enough to show self.
   *
   * @param MediaStream from getUserMedia()
   *   If null, the current stream will be removed.
   */
  async setCamera(mediaStream: MediaStream | null) {
    throw new Error("not implemented");
  }

  async call() {
    assert(this.state == MeetingState.OutgoingCallPrepare, "Must be an outgoing call");
    this.state = MeetingState.OutgoingCall;
  }

  /** If a listener tells you that somebody calls us,
   * and the listener passes the VideoConfMeeting object,
   * you can accept the call with this method.
   *
   * The function will return once the conference room is established. */
  async answer() {
    await this.start();
  }

  /** Leave this conference. */
  async hangup() {
    this.state = MeetingState.Ended;
    this.ended = new Date();
    appGlobal.meetings.remove(this);
  }

  get selfVideo(): SelfVideo | null {
    return this.videos.find(v => v instanceof SelfVideo) ?? null;
  }

  /** You still need to `.start()` the conference */
  static async createAdhoc(opts?: any): Promise<VideoConfMeeting> {
    let meet = new VideoConfMeeting();
    return meet;
  }
}

export enum MeetingState {
  Init = "init",
  OutgoingCallPrepare = "outgoing-prepare",
  OutgoingCall = "outgoing",
  IncomingCall = "incoming",
  Ongoing = "ongoing",
  Ended = "ended",
}
