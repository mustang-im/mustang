export type iCalMethod = "CANCEL" | "REQUEST" | "REPLY";

/**
 * For an inbox item that represents a scheduling message, the type of message.
 */
export enum InvitationMessage {
  None = 0,
  /** Creates an incoming invitation.
   * Corresponds to an iCal method of REQUEST */
  Invitation = 4,
  /** In incoming invitation is being nullified.
   * Only valid for incoming invitations.
   * Corresponds to an iCal method of CANCEL */
  CancelledEvent = 5,
  /** A reply to your outgoing invitation.
   * Only valid for outgoing invitations.
   * Corresponds to an iCal method of REPLY */
  ParticipantReply = 6,
}

/**
 * Indicates the status of participants in invitations.
 * For convenience, the user's status also appears directly on the event.
 * This readily identifies whether the user organised this invitation.
 *
 * Note: These are EWS/OWA names and ActiveSync values.
 */
export enum InvitationResponse {
  /** Event: This is not an invitation, neither incoming nor outgoing.
   *  User participant entry: You are still creating the invitation.
   *  Other participant of outgoing invitation: You are adding the participant to the invitation. */
  Unknown = 0,
  /** Event: This is an outgoing invitation.
   *  User participant entry: You are the organiser of this outgoing invitation.
   *  Other participant of incoming invitation: This participant is the organiser of this incoming invitation. */
  Organizer = 1,
  /** Event/User participant entry: This is an incoming invitation which you are unsure whether you will attend or not.
   *  Other participant of outgoing invitation: The participant has notified us that he is unsure whether he will attend or not. */
  Tentative = 2,
  /** Event/User participant entry: This is an incoming invitation which you are sure you will attend.
   *  Other participant of outgoing invitation: The participant has notified us that he is sure that he will attend. */
  Accept = 3,
  /** Event/User participant entry: This is an incoming invitation that you will not attend.
   *  Other participant of outgoing invitation: The participant has notified us that he will not attend. */
  Decline = 4,
  /** Event/User participant entry: Not used.
   *  Other participant of outgoing invitation: The participant has not yet answered your outgoing invitation. */
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
