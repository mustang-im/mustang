import type { VideoStream } from "./VideoStream";
import type { Person } from "../Abstract/Person";
import { SetColl } from 'svelte-collections';

export class VideoConfMeeting {
  ongoing = false;
  started: Date;
  ended: Date;
  participants = new SetColl<Person>();
  videos = new SetColl<VideoStream>();

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

  static async createAdhoc(opts: any): Promise<VideoConfMeeting> {
    let meet = new VideoConfMeeting();
    meet.start();
    return meet;
  }
}
