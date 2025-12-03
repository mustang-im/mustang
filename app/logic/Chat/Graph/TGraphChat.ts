import type { DateTimeString, IDString, UUID, MIMEType } from "../../Mail/Graph/TGraphGeneric";
import type { TGraphPersonUID } from "../../Mail/Graph/TGraphMail";
import type { URLString } from "../../util/util";

/** <https://learn.microsoft.com/en-us/graph/api/resources/chat> */
export interface TGraphChat {
  id: IDString,
  /** Optional. Only for group chats. */
  topic: string,
  createdDateTime: DateTimeString,
  lastUpdatedDateTime: DateTimeString,
  chatType: TGraphChatType,
  webUrl: URLString,
  tenantId: UUID,
  isHiddenForAllMembers: false,
  onlineMeetingInfo: null,
  createdBy: {
    application: null,
    device: null,
    user: TGraphChatPerson,
  },
  viewpoint: {
    isHidden: boolean,
    lastMessageReadDateTime: DateTimeString,
  },
}

export type TGraphChatType =
  /** 1:1 chat.
   * Limitations: Members cannot be removed/added. */
  "oneOnOne" |
  /** 2 or more people.
   * Members can be removed/added. */
  "group" |
  /** Created as part of an online meeting. */
  "meeting";

export interface TGraphChatMember {
  id: IDString,
  roles?: string[],
  displayName: string,
  visibleHistoryStartDateTime?: DateTimeString,
  userId?: UUID,
  email?: string,
  tenantId: UUID,
}

/** teamworkUserIdentity */
export interface TGraphChatPerson {
  id: IDString,
  displayName: string,
  tenantId: UUID,
  userIdentityType: "aadUser",
}

/** TODO move to meet */
export interface TGraphOnlineMeetingInfo {
  calendarEventId: IDString,
  joinWebUrl: URLString,
  organizer: TGraphPersonUID,
}

/** <https://learn.microsoft.com/en-us/graph/api/resources/chatmessage> */
export interface TGraphChatMessage {
  id: IDString,
  /** version number of the message */
  etag?: string,
  chatId: IDString,
  from?: {
    user: TGraphChatMember,
    device: null,
    application: null,
  },
  replyToId?: null,
  messageType: TGraphChatMessageType,
  subject: string,
  summary?: string,
  body?: {
    contentType: "html" | "text",
    content: string,
  },
  createdDateTime?: DateTimeString,
  lastModifiedDateTime?: DateTimeString,
  lastEditedDateTime?: DateTimeString,
  deletedDateTime?: DateTimeString | null,
  importance?: "normal" | "low" | "high",
  locale?: string, // e.g. "en-us"
  webUrl?: URLString,
  channelIdentity?: null,
  onBehalfOf?: null,
  policyViolation?: null,
  attachments: TGraphChatAttachment[],
  mentions: [],
  reactions: TGraphChatReaction[],
  eventDetail: {
    members: TGraphChatPerson[],
    initiator: {
      user: TGraphChatPerson,
      device: null,
      application: null,
    },
  },
}

export type TGraphChatMessageType = "message" | "chatEvent" | "typing" | "systemEventMessage" | "include-unknown-enum-members";

/** <https://learn.microsoft.com/en-us/graph/api/resources/chatmessageattachment> */
export interface TGraphChatAttachment {
  id: IDString,
  name: string,
  contentType: MIMEType,
  /** Either this or `contentUrl`
   * Already decoded. */
  content: string,
  /** Either this or `content` */
  contentUrl: URLString,
  thumbnailUrl: URLString,
  teamsAppId: UUID,
}

/** Emoji sent by another user as simple response to this message
 * <https://learn.microsoft.com/en-us/graph/api/resources/chatmessagereaction> */
export interface TGraphChatReaction {
  /** Who sent the reaction */
  user: TGraphChatMember,
  createdDateTime: DateTimeString,
  /** The emoji (Unicode char), or a string enum */
  reactionType: string | "custom" | "like" | "angry" | "sad" | "laugh" | "heart" | "surprised",
  /** Either this or `content` */
  reactionContentUrl: URLString,
  displayName: string,
}
