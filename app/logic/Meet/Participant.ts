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
  /** This person is currently speaking.
   * Multiple participants can be speaking at the same time */
  @notifyChangedProperty
  isSpeaking = false;

  peerConnection: RTCPeerConnection;  // prevent garbage collection
  screenPeerConnection: RTCPeerConnection; // ditto
}

export enum ParticipantRole {
  Moderator = "moderator",
  User = "user",
  Guest = "guest",
  Agent = "agent",
}
