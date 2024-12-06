export type iCalMethod = "CANCEL" | "REQUEST" | "REPLY";

/**
 * For an inbox item that represents a scheduling message, the type of message:
 * invitations, responses or cancellations.
 * XXX values are chosen for compatibility with existing messages.
 */
export enum Scheduling {
  NONE = 0,
  REQUEST = 4,
  REPLY = 6,
  CANCEL = 5,
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
