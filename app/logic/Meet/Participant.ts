import { Person } from "../Abstract/Person";
import { notifyChangedProperty } from "../util/Observable";

export class MeetingParticipant extends Person {
  @notifyChangedProperty
  role: ParticipantRole;
  @notifyChangedProperty
  handUp = false;
  @notifyChangedProperty
  micOn = false;
  @notifyChangedProperty
  cameraOn = false;
  @notifyChangedProperty
  screenSharing = false;

  peerConnection: RTCPeerConnection;  // prevent garbage collection
}

export enum ParticipantRole {
  Moderator = "moderator",
  User = "user",
  Guest = "guest",
}
