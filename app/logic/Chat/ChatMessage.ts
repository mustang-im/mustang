import { Message } from "../Abstract/Message";
import { Attachment } from "../Abstract/Attachment";
import { notifyChangedProperty } from "../util/Observable";
import type { ChatPersonUID } from "./ChatPersonUID";
import type { ChatRoom } from "./ChatRoom";
import type { ChatRoomEvent } from "./RoomEvent";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { NotImplemented, assert } from "../util/util";
import { gt } from "../../l10n/l10n";
import { ArrayColl, type MapColl } from "svelte-collections";

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

  /**
   * If a string is set, then this message is an edit of another
   * message. The string is the ID of the other message.
   * The original message is deleted on send/receive.
   * If null, then this message was not edited. */
  isEdit: string | null = null;

  /** If you want to edit a message after sending, call this function,
   * modify the returned message, and send that.
   * It will supercedes this message. This one will be deleted or hidden and the
   * new one be rendered instead, at the same time point in the timeline
   * The new message will have `isEdit` set. */
  async createEdit(): Promise<ChatMessage> {
    assert(this.outgoing, gt`You can only edit your own messages`);
    throw new NotImplemented(gt`This provider does not support editing messages that have already been sent`)
  }

  /**
   * Tell other parties that you want this message to be deleted.
   * This sends a message to everybody, and their client will then
   * delete the original message.
   * This returns when the retraction message has been sent.
   * It will also delete this message for yourself.
   *
   * If you only want to delete the message for yourself only,
   * including on your other devices, then call `deleteMessage()`.
   * That will also delete the message on the server and your other
   * devices.
   *
   * This function here does something else: It also tells others
   * that you want the message deleted.
   *
   * This can be called on your own messages, and if you are a group
   * adminstrator, also on other people's messages in that group.
   */
  async deleteForOthers(): Promise<void> {
    assert(this.outgoing || this.to.isAdmin, gt`You can only edit your own messages, or in group chat rooms where you are admin`);
    throw new NotImplemented(gt`This provider does not support editing messages that have already been sent`)
  }

  async save() {
    await this.to.account.storage.saveMessage(this);
  }

  /** Deletes this message locally and on the server and your other devices */
  async deleteMessage() {
    await this.deleteMessageLocally();
    await this.deleteMessageOnServer();
  }
  async deleteMessageLocally() {
    this.to.messages.remove(this);
    await this.to.account.storage.deleteMessage(this);
  }
  /** Deletes this message on the server and your other devices */
  async deleteMessageOnServer() {
  }

  toExtraJSON(): any {
    return {
      isEdited: this.isEdit,
    };
  }
  fromExtraJSON(json: any): void {
    this.isEdit = sanitize.boolean(json.isEdited);
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
