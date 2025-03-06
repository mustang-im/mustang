import type { URLString } from "../../util/util";

export interface TGraphAPIErrorResponse {
  type: string;
  status: number;
  detail: string;
  limit?: number;
}

export interface TGraphAPICallError {
  type: string;
  status: number;
  detail: string;
}

/** <https://learn.microsoft.com/en-us/graph/api/resources/mailfolder> */
export interface TGraphFolder {
  id: UUID,
  displayName: string,
  parentFolderId: UUID,
  wellKnownName: string, // only available in beta
  childFolderCount: number,
  unreadItemCount: number,
  totalItemCount: number,
  isHidden: boolean, // by default, only visible folders are returned
}
//export const TGraphFolderProperties = ["id", "displayName", "parentFolderId",
//  "wellKnownName", "childFolderCount", "unreadItemCount", "totalItemCount"];

/** <https://learn.microsoft.com/en-us/graph/api/resources/message> */
export interface TGraphEMail {
  id: IDString,
  parentFolderId?: IDString,
  conversationId?: IDString,
  conversationIndex?: string,
  subject: string,
  createdDateTime?: DateTimeString,
  sentDateTime?: DateTimeString,
  receivedDateTime?: DateTimeString,
  lastModifiedDateTime?: DateTimeString,
  changeKey?: string,
  hasAttachments: boolean,
  isRead: boolean,
  isDraft: boolean,
  sender?: TGraphPersonUID,
  from: TGraphPersonUID,
  toRecipients: TGraphPersonUID[],
  ccRecipients: TGraphPersonUID[],
  bccRecipients: TGraphPersonUID[],
  replyTo?: TGraphPersonUID[],
  internetMessageHeaders?: TGraphEMailHeader[],
  internetMessageId?: string,
  categories: string[],
  importance: "normal" | "low" | "high",
  inferenceClassification?: "focused" | "other",
  bodyPreview?: string,
  body?: {
    contentType: "html" | "text",
    content: string,
  },
  isDeliveryReceiptRequested?: boolean,
  isReadReceiptRequested?: boolean,
  unsubscribeData?: string[],
  unsubscribeEnabled?: false,
  mentionsPreview?: any,
  webLink?: URLString,
  flag?: {
    flagStatus: "notFlagged" | "flagged" | "complete",
    startDateTime: DateTimeString,
    dueDateTime: DateTimeString,
    completedDateTime: DateTimeString,
  },
  attachments?: TGraphMailAttachment[];
}
export const TGraphEMailHeaderProperties = [
  "id",
  "conversationId",
  "subject",
  "createdDateTime",
  "sentDateTime",
  "receivedDateTime",
  "changeKey",
  "hasAttachments",
  "isRead",
  "isDraft",
  "from",
  "toRecipients",
  "ccRecipients",
  "bccRecipients",
  "replyTo",
  "internetMessageId",
  "categories",
  "flag",
];

export interface TGraphMailAttachment {
  id: IDString;
  /** file name */
  name: string,
  /** MIME type */
  contentType: MIMEType,
  isInline: boolean,
  /** in bytes */
  size: number,
  lastModifiedDateTime?: DateTimeString,
  contentId: string,
  contentLocation?: null,
  /** content of the attachment
   * base64 encoded */
  contentBytes?: string,
}

export interface TGraphEMailHeader {
  name: string,
  value: string,
}

/** <https://learn.microsoft.com/en-us/graph/api/resources/recipient> */
export interface TGraphPersonUID {
  emailAddress: {
    name: string,
    address: string,
  }
}

export interface TGraphFolderChanges {
}

/** Information about our own user */
export interface TGraphMe {
  id: UUID,
  displayName: string,
  givenName: string,
  surname: string,
  jobTitle: string,
  /** email address */
  userPrincipalName: string,
  /** email address */
  mail: string,
  businessPhones: string[],
  mobilePhone: string,
  officeLocation: string,
  /** locale, e.g. "en-US" */
  preferredLanguage: string,
}

/** ISO date time string, with "Z" as timezone,
 * e.g. "2023-01-04T11:24:48.999Z" */
export type DateTimeString = string;
/** E.g. "18e9526c-2286-41a1-aeeb-4badee766063" */
export type UUID = string;
/** E.g. "MGItNGEzM2E3OTZiZTMGItNGEzM2E3OTZiZTMGItNGEzM2E3OTZiZT" */
export type IDString = string;
/** E.g. "text/html" or "multipart/related" */
export type MIMEType = string;
