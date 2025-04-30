import { ScreenShare, SelfVideo, type VideoStream } from "./VideoStream";
import type { MeetAccount } from "./MeetAccount";
import type { MeetingParticipant as Participant } from "./Participant";
import type { MediaDeviceStreams } from "./MediaDeviceStreams";
import type { Event } from "../Calendar/Event";
import { appGlobal } from "../app";
import { SetColl } from 'svelte-collections';
import { Observable, notifyChangedProperty } from "../util/Observable";
import { assert, type URLString, AbstractFunction, NotSupported } from "../util/util";
import { gt } from "../../l10n/l10n";

export class VideoConfMeeting extends Observable {
  id: string;
  account: MeetAccount;
  @notifyChangedProperty
  event: Event;
  @notifyChangedProperty
  state: MeetingState = MeetingState.Init;
  @notifyChangedProperty
  started: Date;
  @notifyChangedProperty
  ended: Date;
  @notifyChangedProperty
  title: string;
  readonly participants = new SetColl<Participant>();
  readonly videos = new SetColl<VideoStream>();
  /** myParticipant.role: If I'm a moderator, I can manage other users */
  @notifyChangedProperty
  myParticipant: Participant;
  /** Who is currently speaking at the moment */
  speaker: Participant | null = null;
  /**
   * Where to get cam, mic and screenshare of the user from.
   * The UI uses this class to turn on/off cam, mic etc., and
   * to specifc which hardware devices to use.
   *
   * Set in constructor by implementation subclass, and call
   * `listenStreamChanges()` after.
   * Usually `LocalMediaDeviceStreams` or a protocol-specific impl. */
  mediaDeviceStreams: MediaDeviceStreams;

  /** Subclass constructor must set `this.mediaDeviceStreams` and then call this function. */
  protected listenStreamChanges() {
    this.mediaDeviceStreams.subscribe((_obj, propName: string, oldValue: any) => this.streamsChanged(propName, oldValue));
  }

  errorCallback = (ex: Error) => {
    console.error(ex);
  };
  endCallback = () => {
    console.log("Call ended");
  };

  async createNewConference() {
    throw new AbstractFunction();
  }

  /** Creates a URL that leads to a webpage that allows people
   * outside the organization to join this meeting using only
   * a webbrowser.
   * Mustang should normally recognize this kind of URL
   * (in certain situations, e.g. in an event as onlineMeetingURL)
   * and allow to join within Mustnag using the Meet feature.
   * Only works if `account.canCreateURL`. */
  createInvitationURL(): Promise<URLString> {
    throw new NotSupported(gt`Cannot invite others using a link to this kind of meeting`);
  }

  /**
   * The user received invitation URL out-of-band (using other communication methods)
   * from the conference organizer.
   * The URL should contain both the room and the ticket to permit joining.
   *
   * You need to call `start()` after.
   * TODO: Rename the function: It only prepares the joining.
   */
  async join(url: URLString): Promise<void> {
    throw new AbstractFunction();
  }

  async start() {
    this.state = MeetingState.Ongoing;
    this.started = new Date();
  }
  protected async streamsChanged(propName: string, oldValue: MediaStream) {
    console.log("Stream changed", propName, "from", oldValue, "to", this.mediaDeviceStreams[propName]);
    if (propName == "cameraMicStream") {
      let stream = this.mediaDeviceStreams.cameraMicStream;
      if (stream) {
        await this.startCameraMic(stream, oldValue);
      } else {
        await this.stopCameraMic(oldValue);
      }
    }
    if (propName == "screenStream") {
      let stream = this.mediaDeviceStreams.screenStream;
      if (stream) {
        await this.startScreenShare(stream, oldValue);
      } else {
        await this.stopScreenShare(oldValue);
      }
    }
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
   */
  async startCameraMic(mediaStream: MediaStream, oldStream?: MediaStream) {
    if (oldStream) {
      await this.stopCameraMic(oldStream);
    }
    this.videos.add(new SelfVideo(mediaStream));
  }

  async stopCameraMic(oldStream?: MediaStream) {
    assert(oldStream, "want old stream to remove");
    this.videos.remove(this.videos.find(v => v instanceof SelfVideo &&
      (v.stream == oldStream || !oldStream)));
  }

  async startScreenShare(mediaStream: MediaStream, oldStream?: MediaStream) {
    if (oldStream) {
      await this.stopScreenShare(oldStream);
    }
    this.videos.add(new ScreenShare(mediaStream, this.myParticipant));
  }

  async stopScreenShare(oldStream?: MediaStream) {
    assert(oldStream, "want old stream to remove");
    this.videos.remove(this.videos.find(v => v instanceof ScreenShare &&
      (oldStream ? v.stream == oldStream : v.participant == this.myParticipant)));
  }

  readonly canHandUp: boolean = false;

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
}

export enum MeetingState {
  /** Initial state, before setting up. */
  Init = "init",
  /** We're about to join a conference room, with a flexible number of attendants, but we didn't connect to the conference server yet. */
  JoinConference = "join-conference",
  /** User is about to call 1 or more people directly, but didn't start ringing yet. */
  OutgoingCallPrepare = "outgoing-prepare",
  /** We are calling others, and ringing them on their end. */
  OutgoingCall = "outgoing",
  /** Others are calling us. It's ringing on our end. */
  IncomingCall = "incoming",
  /** Parties are connected or connecting. */
  Ongoing = "ongoing",
  /** Call is over. */
  Ended = "ended",
}
