export type iCalMethod = "CANCEL" | "REQUEST" | "REPLY";

/**
 * For an inbox item that represents a scheduling message, the type of message:
 * Accepted/Tentative/Declined responses, invitations, or cancellations.
 */
export enum Scheduling {
  None = 0,
  Accepted = 1,
  Tentative = 2,
  Declined = 3,
  Request = 4,
  Cancellation = 5,
}

/* Note: These are EWS/OWA names and ActiveSync values. */
export enum ResponseType {
  Unknown = 0,
  Organizer = 1,
  Tentative = 2,
  Accept = 3,
  Decline = 4,
  NoResponseReceived = 5,
}

/** Just the values used by meeting responses. */
export type Responses = ResponseType.Accept | ResponseType.Tentative | ResponseType.Decline;

/** Map from iCal PARTSTAT to Responses */
export enum ParticipationStatus {
  TENTATIVE = ResponseType.Tentative,
  ACCEPTED = ResponseType.Accept,
  DECLINED = ResponseType.Decline,
}
