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
  id: string,
  displayName: string,
  parentFolderId: string,
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
  id: string,
  parentFolderId?: string,
  conversationId?: string,
  conversationIndex?: string,
  subject: string,
  createdDateTime?: string,
  sentDateTime?: string,
  receivedDateTime?: string,
  lastModifiedDateTime?: string,
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
    startDateTime: string,
    dueDateTime: string,
    completedDateTime: string,
  },
  attachments?: TGraphAttachment[];
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

export interface TGraphAttachment {
  id: string;
  /** file name */
  name: string,
  /** MIME type */
  contentType: string,
  isInline: boolean,
  /** in bytes */
  size: number,
  lastModifiedDateTime?: string,
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
