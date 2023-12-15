import { Person } from "../Abstract/Person";

export class MeetingParticipant extends Person {
  role: ParticipantRole;
  handUp = false;
  micOn = true;
  cameraOn = true;
  screenSharing = false;
}

export enum ParticipantRole {
  Moderator = "moderator",
  User = "user",
  Guest = "guest",
}
