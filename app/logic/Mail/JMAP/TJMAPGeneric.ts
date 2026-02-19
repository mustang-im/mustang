import type { URLString } from "../../util/util";

/**
 * String of 1-255 octets containing only URL and Filename Safe base64url
 * alphabet characters (A-Za-z0-9, hyphen, underscore), excluding padding
 */
export type TID = string;

/**
 * TUnsignedInt: Integer in the range 0 to 2^53-1
 */
export type TInteger = number;

/**
 * String in RFC3339 "date-time" format with uppercase letters
 * and "Z" time offset. Fractional seconds must not have trailing zeros.
 * Example: "2010-10-10T10:10:10.003Z"
 */
export type TUTCDateTime = string;

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-2> */
export interface TJMAPSession {
  capabilities: Record<string, Record<string, any>>;
  accounts: {
    /** A user-friendly string to show when presenting content from
     * this account, e.g., the email address representing the owner of
     * the account. */
    name: string;
    /** Our user is the primary owner of this account */
    isPersonal: boolean;
    isReadOnly: boolean;
    accountCapabilities: Record<string, any>;
  }[];
  /** capability URL -> accountID */
  primaryAccounts: Record<string, string>;
  username: string;
  /** URL to use for JMAP API requests */
  apiUrl: URLString;
  /** URL to use when downloading files, in URI Template format, e.g. https://foo/{var}/ */
  downloadUrl: URLString;
  /** URL to use when uploading files, in URI Template format, e.g. https://foo/{var}/ */
  uploadUrl: URLString;
  /** URL to connect to for push events, in URI Template format, e.g. https://foo/{var}/ */
  eventSourceUrl: URLString;
  state: string;
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-3.3> */
export interface TJMAPAPIRequest {
  using: string[];
  methodCalls: TJMAPMethodCall[];
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-3.4> */
export interface TJMAPAPIResponse {
  methodResponses: TJMAPMethodResponse[];
  sessionState: string;
}

/** <https://www.rfc-editor.org/rfc/rfc8620#section-5.1> */
export interface TJMAPGetResponse<T> {
  accountId: string;
  state: string;
  list: T[];
  notFound: string[];
  total: number;
}

/** <https://www.rfc-editor.org/rfc/rfc8620#section-5.5> */
export interface TJMAPQueryResponse {
  accountId: string;
  queryState: string;
  ids: string[];
  position: number;
  limit?: number;
  total?: number;
  canCalculateChanges: boolean;
}

/** <https://www.rfc-editor.org/rfc/rfc8620#section-5.2> */
export interface TJMAPChangeResponse<T> {
  accountId: string;
  oldState?: string;
  newState: string;
  hasMoreChanges: boolean;
  created?: Record<string, T>,
  updated?: Record<string, T | null>;
  destroyed?: string[];
  notCreated?: Record<string, TJMAPSetError>,
  notUpdated?: Record<string, TJMAPSetError>;
  notDestroyed?: Record<string, TJMAPSetError>;
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-3.6.1> */
export interface TJMAPAPIErrorResponse {
  type: string;
  status: number;
  detail: string;
  limit?: number;
}

export interface TJMAPError {
  type: string;
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-3.6.2> */
export interface TJMAPAPICallError extends TJMAPError {
  status: number;
  detail: string;
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-5.3> */
export interface TJMAPSetError extends TJMAPError {
  description?: string;
  properties: string[];
}

/** Contents: method name, arguments, call number */
export type TJMAPMethodCall = [string, Record<string, any>, string];
/** Contents: method name, arguments, call number */
export type TJMAPMethodResponse = [string, Record<string, any>, string];
export type TJMAPObjectType = "Mailbox" | "Email" | "EmailSubmission" | "Thread" | "AddressBook" | "ContactCard" | "Calendar" | "CalendarEvent" | "CalendarEventNotification" | "ParticipantIdentity";
export const TJMAPObjectTypes = ["Mailbox", "Email", "EmailSubmission", "Thread", "AddressBook", "ContactCard", "Calendar", "CalendarEvent", "CalendarEventNotification", "ParticipantIdentity" ];


/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-6.1> */
export interface TJMAPUpload {
  accountId: string,
  blobId: string,
  type: string,
  size: number,
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-7.1> */
export interface TJMAPStateChange {
  "@type": string,
  changed: Record<string, Record<TJMAPObjectType, string>>,
}
