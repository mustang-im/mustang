export type iCalMethod = "CANCEL" | "REQUEST" | "REPLY";

/**
 * For an inbox item that represents a scheduling message, the type of message.
 */
export enum InvitationMessage {
  None = 0,
  /** Creates an incoming invitation.
   * iCal METHOD: REQUEST */
  Invitation = 4,
  /** In incoming invitation is being nullified.
   * Only valid for incoming invitations.
   * iCal METHOD: CANCEL */
  CancelledEvent = 5,
  /** A reply to your outgoing invitation.
   * Only valid for outgoing invitations.
   * iCal METHOD: REPLY */
  ParticipantReply = 6,
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
  /** The event is not an invitation, neither incoming nor outgoing. */
  Unknown = 0,
  Organizer = 1,
  /** The participant has notified us that he is unsure whether he will attend or not.
   For incoming invitations only. */
  Tentative = 2,
  Accept = 3,
  Decline = 4,
  /** The participant has not yet answered.
   For incoming invitations only. */
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
