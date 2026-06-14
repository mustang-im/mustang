import { Message } from "../Abstract/Message";
import { notifyChangedProperty } from "../util/Observable";
import type { ChatPersonUID } from "./ChatPersonUID";
import type { ChatRoom } from "./ChatRoom";
import type { ChatRoomEvent } from "./RoomEvent";

/**
 * A message between humans.
 *
 * Either a text or HTML message, or a SML control sent by a human.
 *
 * Handled by `ChatRoomEvent` and out of scope here are:
 * somebody joining, an incoming call, a deleted message etc.
 */
export class ChatMessage extends Message {
  @notifyChangedProperty
  to: ChatRoom;
  @notifyChangedProperty
  deliveryStatus = DeliveryStatus.Unknown;
  @notifyChangedProperty
  declare from: ChatPersonUID;

  constructor(room: ChatRoom) {
    super();
    this.to = room;
    this.contact = room?.contact;
  }

  get room(): ChatRoom {
    return this.to;
  }
  set room(val: ChatRoom) {
    this.to = val;
  }
}

/** Everything that can appear in the timeline of a chat room */
export type RoomMessage = ChatMessage | ChatRoomEvent;

export enum DeliveryStatus {
  Unknown = "unknown",
  Sending = "sending",
  Server = "server",
  User = "user",
  Seen = "seen",
}
