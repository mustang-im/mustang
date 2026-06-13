import { UserChatMessage } from "../Message";
import { ChatRoomEvent } from "../RoomEvent";
import type { PersonUID } from "../../Abstract/PersonUID";
import type { Person } from "../../Abstract/Person";
import type { Group } from "../../Abstract/Group";
import { Attachment, ContentDisposition } from "../../Abstract/Attachment";
import { MediaType } from "./Crypto/mediaCrypto";
import type { WANode } from "./Binary/WANode";
import type { WAMessage } from "./Proto/schema";

/** A message in a WhatsApp chat, written by a human.
 *
 * Knows how to interpret a decrypted WhatsApp message payload: plain and rich
 * text, replies, and media (images, videos, voice notes, documents, GIFs and
 * stickers — the last two flagged to render inline). Reactions, edits and
 * deletions are *operations on* an existing message, so the chat room applies
 * those (see WhatsAppChatRoom); this class only represents the message itself. */
export class WhatsAppMessage extends UserChatMessage {
  /** Populates this message from a received message stanza and its decrypted
   * payload, mirroring JMAPEMail.fromJMAP() / IMAPEMail.fromFlow().
   * @param from the resolved sender (the room knows its members)
   * @returns false if the payload has nothing we can display. */
  fromWAMessage(stanza: WANode, payload: WAMessage, from: PersonUID | Person | Group, outgoing = false): boolean {
    this.id = stanza.attrs.id;
    this.sent = new Date(Number(stanza.attrs.t ?? Date.now() / 1000) * 1000);
    this.received = new Date();
    this.outgoing = outgoing;
    this.contact = from;
    return this.readContent(payload);
  }

  /** Reads the message body (text, reply reference, media) from the payload.
   * Also used when a later edit replaces the content. */
  readContent(payload: WAMessage): boolean {
    if (payload.conversation) {
      this.text = payload.conversation;
      return true;
    }
    if (payload.extendedTextMessage) {
      this.text = payload.extendedTextMessage.text ?? "";
      this.setReplyTo(payload.extendedTextMessage.contextInfo?.stanzaID);
      return true;
    }
    return this.readMedia(payload);
  }

  protected readMedia(payload: WAMessage): boolean {
    if (payload.imageMessage) {
      return this.addMedia(payload.imageMessage, MediaType.Image, payload.imageMessage.caption);
    }
    if (payload.videoMessage) {
      // A GIF is a short looping video; show it inline like an image.
      return this.addMedia(payload.videoMessage, MediaType.Video, payload.videoMessage.caption, payload.videoMessage.gifPlayback);
    }
    if (payload.audioMessage) {
      return this.addMedia(payload.audioMessage, MediaType.Audio); // voice notes included
    }
    if (payload.documentMessage) {
      return this.addMedia(payload.documentMessage, MediaType.Document, payload.documentMessage.caption);
    }
    if (payload.stickerMessage) {
      return this.addMedia(payload.stickerMessage, MediaType.Sticker, undefined, true);
    }
    return false;
  }

  protected addMedia(media: any, type: MediaType, caption?: string, inline = false): boolean {
    let attachment = new Attachment();
    attachment.filename = media.fileName || `${type}.${extensionFor(media.mimetype)}`;
    attachment.mimeType = media.mimetype ?? "application/octet-stream";
    attachment.size = toNumber(media.fileLength);
    attachment.disposition = inline ? ContentDisposition.inline : ContentDisposition.attachment;
    attachment.related = inline; // inline media (stickers, GIFs) render in the message body
    this.attachments.add(attachment);
    if (caption) {
      this.text = caption;
    }
    this.setReplyTo(media.contextInfo?.stanzaID);
    return true;
  }

  protected setReplyTo(stanzaID: string | undefined) {
    if (stanzaID) {
      this.inReplyTo = stanzaID;
    }
  }

  /** Peels the device-sent, ephemeral and view-once wrappers to the real message. */
  static unwrap(payload: WAMessage): WAMessage {
    if (payload?.deviceSentMessage?.message) {
      return WhatsAppMessage.unwrap(payload.deviceSentMessage.message);
    }
    if (payload?.ephemeralMessage?.message) {
      return WhatsAppMessage.unwrap(payload.ephemeralMessage.message);
    }
    if (payload?.viewOnceMessageV2?.message) {
      return WhatsAppMessage.unwrap(payload.viewOnceMessageV2.message);
    }
    return payload;
  }
}

/** A non-human event in a WhatsApp chat: a deleted-message placeholder, or a
 * group system event (member added/left, subject changed, …). */
export class WhatsAppSystemMessage extends ChatRoomEvent {
}

function toNumber(value: any): number {
  if (value == null) {
    return 0;
  }
  return typeof value == "object" && typeof value.toNumber == "function" ? value.toNumber() : Number(value);
}

function extensionFor(mimetype: string | undefined): string {
  return (mimetype ?? "").split("/")[1]?.split(";")[0] || "bin";
}
