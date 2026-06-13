import { Message } from "../Abstract/Message";
import { notifyChangedProperty } from "../util/Observable";
import type { PersonUID } from "../Abstract/PersonUID";
import type { Person } from "../Abstract/Person";
import type { Group } from "../Abstract/Group";
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
  /** Who wrote this message.
   * For outgoing messages, that's us, but `contact` shows the other person. */
  @notifyChangedProperty
  from: PersonUID | Person | Group;

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
