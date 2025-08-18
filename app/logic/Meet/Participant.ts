import { PersonUID } from "../Abstract/PersonUID";
import { notifyChangedProperty } from "../util/Observable";

export class MeetingParticipant extends PersonUID {
  id: string = crypto.randomUUID();
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

  peerConnection: RTCPeerConnection;  // prevent garbage collection
  screenPeerConnection: RTCPeerConnection; // ditto
}

export enum ParticipantRole {
  Moderator = "moderator",
  User = "user",
  Guest = "guest",
  Agent = "agent",
  /** User is in waiting room. He cannot listen nor publish. */
  Waiting = "waiting",
  Invited = "invited",
}
