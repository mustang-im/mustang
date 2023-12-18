import { Person } from "../Abstract/Person";
import { notifyChangedProperty } from "../util/Observable";

export class MeetingParticipant extends Person {
  @notifyChangedProperty
  role: ParticipantRole;
  @notifyChangedProperty
  handUp = false;
  @notifyChangedProperty
  micOn = true;
  @notifyChangedProperty
  cameraOn = true;
  @notifyChangedProperty
  screenSharing = false;
}

export enum ParticipantRole {
  Moderator = "moderator",
  User = "user",
  Guest = "guest",
}
