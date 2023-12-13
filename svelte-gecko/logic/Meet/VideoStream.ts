import type { MeetingParticipant } from "./Participant";

/** One incoming or outgoing video in a video conference */
export class VideoStream {
  stream: MediaStream;
  constructor(stream: MediaStream) {
    this.stream = stream;
  }
  get id(): string {
    return this.stream.id;
  }
}

export class ParticipantVideo extends VideoStream {
  participant: MeetingParticipant;

  constructor(stream: MediaStream, participant: MeetingParticipant) {
    super(stream);
    this.participant = participant;
  }
}

export class SelfVideo extends VideoStream {
}

export class ScreenShare extends VideoStream {
  /** Origin of the screen, the user who is sharing it.
   * Not set, if our user is sharing the screen. */
  participant?: MeetingParticipant;

  constructor(stream: MediaStream, participant: MeetingParticipant) {
    super(stream);
    this.participant = participant;
  }
}
