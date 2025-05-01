import { PersonUID } from "../Abstract/PersonUID";
import { notifyChangedProperty } from "../util/Observable";

export class MeetingParticipant extends PersonUID {
  id: string;
  @notifyChangedProperty
  role: ParticipantRole;
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
  /** Signal to other participants that this participant wants to say something */
  @notifyChangedProperty
  handUp = false;
  /** true for people who are currently in the meeting
   * false for people who have been invited, but they are not in the meeting */
  @notifyChangedProperty
  joined = true;

  peerConnection: RTCPeerConnection;  // prevent garbage collection
  screenPeerConnection: RTCPeerConnection; // ditto
}

export enum ParticipantRole {
  Moderator = "moderator",
  User = "user",
  Guest = "guest",
  Agent = "agent",
  Invited = "invited",
}
