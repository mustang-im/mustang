import { SelfVideo, type VideoStream } from "./VideoStream";
import type { MeetAccount } from "./MeetAccount";
import type { MeetingParticipant as Participant } from "./Participant";
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
  @notifyChangedProperty
  _handRaised: boolean = false;

  errorCallback = (ex) => {
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
    throw new AbstractFunction();
  }

  /** Same as `setCamera()`, but for sharing screen */
  async setScreenShare(mediaStream: MediaStream | null) {
    throw new AbstractFunction();
  }

  readonly canRaiseHand: boolean = false;
  /** Signal to other participants that our user wants to say something */
  get handRaised(): boolean {
    return this._handRaised;
  }
  set handRaised(val: boolean) {
    this.setHandRaised(val)
      .catch(this.account.errorCallback);
  }
  /** Signal to other participants that our user wants to say something */
  async setHandRaised(handRaised: boolean) {
    // Do *not* this.handRaised, because it would create an infinite loop
    this._handRaised = handRaised;
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
