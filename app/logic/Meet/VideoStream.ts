import { NotReached } from "../util/util";
import type { MeetingParticipant } from "./Participant";

/** One incoming or outgoing video in a video conference */
export class VideoStream {
  readonly stream: MediaStream;
  hasVideo = false;
  isScreenShare = false;
  isMe = false;
  readonly participant: MeetingParticipant | null = null;

  constructor(stream: MediaStream, participant?: MeetingParticipant) {
    this.stream = stream;
    this.participant = participant ?? null;
  }
  get id(): string {
    return this.stream.id;
  }
}

export function videoStreamClassName(video: VideoStream): string {
  if (video.isMe) {
    return "self";
  } else if (video.isScreenShare) {
    return "screen";
  } else if (video.participant) {
    return "participant";
  } else {
    throw new NotReached();
  }
}
