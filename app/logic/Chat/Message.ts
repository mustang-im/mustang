import { Message } from "../Abstract/Message";
import { Attachment } from "../Abstract/Attachment";
import { notifyChangedProperty } from "../util/Observable";
import type { ChatPersonUID } from "./ChatPersonUID";
import type { ChatRoom } from "./ChatRoom";
import type { ChatRoomEvent } from "./RoomEvent";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { assert } from "../util/util";
import { ArrayColl, type MapColl } from "svelte-collections";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";

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
  declare readonly reactions: MapColl<ChatPersonUID, string>;

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

  isEdited: boolean;

  async save() {
    await this.to.account.storage.saveMessage(this);
  }
  async deleteMessage() {
    await this.to.account.storage.deleteMessage(this);
  }

  toExtraJSON(): any {
    return {
      isEdited: this.isEdited,
    };
  }
  fromExtraJSON(json: any): void {
    this.isEdited = sanitize.boolean(json.isEdited);
  }

  newAttachment(): Attachment {
    let att = new Attachment();
    att.message = this;
    assert(this.room.account.storage.supportsAttachments, "Need ChatAccountStorage that supports attachments");
    att.storage = new ArrayColl([this.room.account.storage]);
    return att;
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
