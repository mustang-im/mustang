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
  myRights: {
    mayAddItems: boolean,
    mayRename: boolean,
    maySubmit: boolean,
    mayDelete: boolean,
    maySetKeywords: boolean,
    mayRemoveItems: boolean,
    mayCreateChild: boolean,
    maySetSeen: boolean,
    mayReadItems: boolean,
  },
}
