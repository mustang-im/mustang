import type { VideoStream } from "./VideoStream";
import type { MeetingParticipant, ParticipantRole } from "./Participant";
import type { Event } from "../Calendar/Event";
import { SetColl } from 'svelte-collections';

export class VideoConfMeeting {
  event: Event;
  ongoing = false;
  started: Date;
  ended: Date;
  participants = new SetColl<MeetingParticipant>();
  videos = new SetColl<VideoStream>();
  /** If I'm a moderator, I can manage other users */
  myRole: ParticipantRole;

  errorCallback = (ex) => {
    console.error(ex);
  };
  endCallback = () => {
    console.log("Call ended");
  };

  protected async start() {
    this.ongoing = true;
    this.started = new Date();
  }

  /**
   * After opening our user's camera and microphone
   * using `getUserMedia()`, pass the stream here.
   *
   * You should preferably do that before `start()`ing the conference,
   * but you can do it at any time.
   *
   * @param MediaStream from getUserMedia()
   *   If null, the current stream will be removed.
   */
  async setCamera(mediaStream: MediaStream | null) {
    throw new Error("not implemented");
  }

  /** If a listener tells you that somebody calls us,
   * and the listener passes the VideoConfMeeting object,
   * you can accept the call with this method.
   *
   * The function will return once the conference room is established. */
  async answer() {
    this.start();
  }

  /** Leave this conference. */
  async hangup() {
    this.ongoing = false;
    this.ended = new Date();
  }

  static async createAdhoc(opts?: any): Promise<VideoConfMeeting> {
    let meet = new VideoConfMeeting();
    meet.start();
    return meet;
  }
}
