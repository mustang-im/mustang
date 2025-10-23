import type { URLString } from "../../util/util";

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
}

/** <https://www.rfc-editor.org/rfc/rfc8620#section-5.2> */
export interface TJMAPChangeResponse {
  accountId: string;
  oldState: string;
  newState: string;
  hasMoreChanges: boolean;
  created: string[];
  updated: string[];
  destroyed: string[];
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-3.6.1> */
export interface TJMAPAPIErrorResponse {
  type: string;
  status: number;
  detail: string;
  limit?: number;
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-3.6.2> */
export interface TJMAPAPICallError {
  type: string;
  status: number;
  detail: string;
}

/** Contents: method name, arguments, call number */
export type TJMAPMethodCall = [string, Record<string, any>, string];
/** Contents: method name, arguments, call number */
export type TJMAPMethodResponse = [string, Record<string, any>, string];
export type TJMAPObjectType = "Mailbox" | "Email" | "EmailSubmission" | "Thread";
export const TJMAPObjectTypes = [ "Mailbox", "Email", "EmailSubmission", "Thread" ];


/** <https://www.rfc-editor.org/rfc/rfc8621.html#section-2.6> */
export interface TJMAPFolder {
  id: string,
  name: string,
  parentId: string,
  role: string,
  isSubscribed: boolean,
  sortOrder: number,
  totalEmails: number,
  unreadEmails: number,
  totalThreads: number,
  unreadThreads: number,
  myRights: TJMAPFolderRights,
}

export interface TJMAPFolderRights {
  mayAddItems: boolean,
  mayRename: boolean,
  maySubmit: boolean,
  mayDelete: boolean,
  maySetKeywords: boolean,
  mayRemoveItems: boolean,
  mayCreateChild: boolean,
  maySetSeen: boolean,
  mayReadItems: boolean,
}

/** <https://www.rfc-editor.org/rfc/rfc8621.html#section-4.2.1> */
export interface TJMAPEMailHeaders {
  id: string,
  messageId: string,
  blobId: string,
  mailboxIds: Record<string, boolean>,
  subject: string,
  inReplyTo: string,
  threadId: string,

  sender: string,
  from: TJMAPPerson[],
  to: TJMAPPerson[],
  cc: TJMAPPerson[],
  bcc: TJMAPPerson[],
  replyTo: string,

  receivedAt: string,
  sentAt: string,
  hasAttachment: boolean,
  size: number,
  keywords: Record<string, boolean>,
  preview: string,
}

export interface TJMAPPerson {
  name: string | null,
  email: string,
}

/** <https://www.rfc-editor.org/rfc/rfc8621.html#section-6> */
export interface TJMAPIdentity {
  id: string,
  name: string,
  email: string,
  replyTo: string[],
  bcc: string[],
  textSignature: string,
  htmlSignature: string,
  mayDelete: boolean,
}

/** <https://www.rfc-editor.org/rfc/rfc8620.html#section-6.1> */
export interface TJMAPUpload {
  accountId: string,
  blobId: string,
  type: string,
  size: number,
}

/** <https://www.rfc-editor.org/rfc/rfc8621.html#section-4.1.4> */
export interface TJMAPEmailBodyPart {
  partId?: string;
  blobId: string;
  size: number;
  name?: string | null;
  type: string;
  charset?: string | null;
  disposition?: string | null;
  cid?: string | null;
  headers?: TJMAPEmailHeader[];
  language?: string[] | null;
  location?: string | null;
  subParts?: TJMAPEmailBodyPart[] | null;
  bodyStructure?: TJMAPEmailBodyPart;
  bodyValues?: { [key: string]: TJMAPEmailBodyPart };
  textBody?: TJMAPEmailBodyPart[];
  htmlBody?: TJMAPEmailBodyPart[];
  attachments?: TJMAPEmailBodyPart[];
  hasAttachment?: boolean;
  preview?: string;
}

export interface TJMAPEmailHeader {
  name: string,
  value: string,
}

export interface TJMAPEmailAddress {
  name: string,
  email: string,
}
