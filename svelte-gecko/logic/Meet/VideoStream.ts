import type { Person } from "../Abstract/Person";

/** One incoming or outgoing video in a video conference */
export class VideoStream {
  stream: MediaStream;
  id: string;
  constructor(stream: MediaStream) {
    this.stream = stream;
    this.id = stream.id;
  }
}

export class ParticipantVideo extends VideoStream {
  participant: Person;
}

export class SelfVideo extends VideoStream {
}

export class ScreenShare extends VideoStream {
  /** Origin of the screen, the user who is sharing it.
   * Not set, if our user is sharing the screen. */
  participant?: Person;
}
