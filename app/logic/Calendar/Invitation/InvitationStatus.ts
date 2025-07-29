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
  /** In Event: This is not a meeting, neither incoming nor outgoing.
   *  In Participant entry of event: The meeting is in the process of being created. */
  Unknown = 0,
  /** In Event: This is an meeting where you are the organizer.
   *  In participant entry of event or outgoing invitation:
   *    This participant is the organiser of this meeting.
   *    If you're the organizer, one of the participants will be you with this status.
   *    If you're not the organizer, this shows who is the organizer.
   *  Other participant of outgoing invitation: N/A
   *  Other participant of incoming invitation: This participant is the organiser of this incoming invitation.
   */
  Organizer = 1,
  /** This participant is unsure whether he will attend or not.
   * This response may appear in the same places as Accept. */
  Tentative = 2,
  /** The participant plans to join the meeting.
   *  May appear in:
   *  - Event created from an incoming invitation (your own status),
   *  - Participant entry of meeting (esp. if you're the organiser of the meeting),
   *  - your response to an incoming invitation, or
   *  - a participant's response to your outgoing invitation. */
  Accept = 3,
  /** The participant will not attend the meeting.
   *  This response may appear in the same places as Accept. */
  Decline = 4,
  /** Event/User participant entry: Not used.
   *  Other participant of outgoing invitation: The participant has not yet answered your outgoing invitation. */
  NoResponseReceived = 5,
}

export const kInviteeResponses = [InvitationResponse.Accept, InvitationResponse.Decline,
  InvitationResponse.Tentative, InvitationResponse.NoResponseReceived];

/** Just the values that can appear in iTip messages */
export type InvitationResponseInMessage = InvitationResponse.Accept | InvitationResponse.Tentative | InvitationResponse.Decline;

/** Map from iCal PARTSTAT to InvitationResponseInMessage */
export enum ParticipationStatus {
  TENTATIVE = InvitationResponse.Tentative,
  ACCEPTED = InvitationResponse.Accept,
  DECLINED = InvitationResponse.Decline,
}
