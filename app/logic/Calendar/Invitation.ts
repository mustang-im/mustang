// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

/**
 * For an inbox item that represents a scheduling message, the type of message:
 * Accepted/Tentative/Declined responses, invitations, or cancellations.
 * Note that Accepted, Tentative and Declined have values 1, 2 and 3
 * because these are the values used by ActiveSync for responses.
 */
export enum Scheduling {
  None = 0,
  Accepted = 1,
  Tentative = 2,
  Declined = 3,
  Request = 4,
  Cancellation = 5,
}

/** Just the values used by meeting responses. */
export type Responses = Scheduling.Accepted | Scheduling.Tentative | Scheduling.Declined;

/* Note: These are EWS/OWA names and ActiveSync values. */
export enum ResponseType {
  Unknown = 0,
  Organizer = 1,
  Tentative = 2,
  Accept = 3,
  Decline = 4,
  NoResponseReceived = 5,
}
