export type iCalMethod = "CANCEL" | "REQUEST" | "REPLY";

/**
 * For an inbox item that represents a scheduling message, the type of message.
 */
export enum InvitationMessage {
  None = 0,
  Invitation = 4, // METHOD:REQUEST, an incoming invitation
  CancelledEvent = 5, // METHOD:CANCEL, a follow-up cancellation
  ParticipantReply = 6, // METHOD:REPLY, a reply to your outgoing invitation
}

/**
 * For meetings only, these values indicate the status of either:
 * - For any given participant, their participation in an event
 * - The user's own participation in an event
 *   In particular, this identifies whether the user organised this meeting.
 *
 * Note: These are EWS/OWA names and ActiveSync values.
 */
export enum InvitationResponse {
  Unknown = 0,
  Organizer = 1,
  Tentative = 2,
  Accept = 3,
  Decline = 4,
  NoResponseReceived = 5,
}

/** Just the values that can appear in iTip messages */
export type InvitationResponseInMessage = InvitationResponse.Accept | InvitationResponse.Tentative | InvitationResponse.Decline;

/** Map from iCal PARTSTAT to InvitationResponseInMessage */
export enum ParticipationStatus {
  TENTATIVE = InvitationResponse.Tentative,
  ACCEPTED = InvitationResponse.Accept,
  DECLINED = InvitationResponse.Decline,
}
