import { Message } from "../Abstract/Message";
import { notifyChangedProperty } from "../util/Observable";
import type { ChatRoom } from "./ChatRoom";

export class ChatMessage extends Message {
  @notifyChangedProperty
  to: ChatRoom;
  @notifyChangedProperty
  deliveryStatus = DeliveryStatus.Unknown;

  constructor(room: ChatRoom) {
    super();
    this.to = room;
    this.contact = room.contact;
  }

  get room(): ChatRoom {
    return this.to;
  }
  set room(val: ChatRoom) {
    this.to = val;
  }
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
