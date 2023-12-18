import { Message } from "../Abstract/Message";
import { notifyChangedProperty } from "../util/Observable";
import type { Chat } from "./Chat";

export class ChatMessage extends Message {
  @notifyChangedProperty
  to: Chat;
  @notifyChangedProperty
  deliveryStatus = DeliveryStatus.Unknown;
}

/**
 * A human-language message from a human to other humans.
 */
export class UserChatMessage extends ChatMessage {
}

export enum DeliveryStatus {
  Unknown = "unknown",
  Sending = "sending",
  Server = "server",
  User = "user",
  Seen = "seen",
}
