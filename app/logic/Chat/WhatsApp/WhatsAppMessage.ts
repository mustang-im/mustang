import { ChatMessage } from "../ChatMessage";
import type { PersonUID } from "../../Abstract/PersonUID";
import type { Person } from "../../Abstract/Person";
import type { Group } from "../../Abstract/Group";
import { Attachment, ContentDisposition } from "../../Abstract/Attachment";
import { fileExtensionForMIMEType } from "../../Files/FileType/MIMETypes";
import { MediaType } from "./Crypto/mediaCrypto";
import { mediaDescriptorFor, downloadMedia, type MediaDescriptor } from "./WhatsAppMedia";
import type { WhatsAppChatRoom } from "./WhatsAppChatRoom";
import type { WANode } from "./Binary/WANode";
import { ProtocolMessageType, type WAMessage, type MessageKey } from "./Proto/schema";
import { JID } from "./Binary/JID";
import { WhatsAppContact } from "./WhatsAppContact";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";

/**
 * A message in a WhatsApp chat, written by a human.
 *
 * Knows how to interpret a decrypted WhatsApp message payload: plain and rich
 * text, replies, and media (images, videos, voice notes, documents, GIFs and
 * stickers — the last two flagged to render inline). Reactions, edits and
 * deletions are *operations on* an existing message, so the chat room applies
 * those (see WhatsAppChatRoom); this class only represents the message itself. */
export class WhatsAppMessage extends ChatMessage {
  declare to: WhatsAppChatRoom;

  /** Resolves once the background media download (if any) has finished, settled
   * or failed. Lets callers/tests await the attachment bytes; never rejects. */
  mediaDownload: Promise<void> = Promise.resolve();

  constructor(chatRoom: WhatsAppChatRoom) {
    super(chatRoom);
  }
  get chatRoom(): WhatsAppChatRoom {
    return this.to as WhatsAppChatRoom;
  }

  /** Populates this message from a received message stanza and its decrypted payload
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

  override get canEdit(): boolean {
    return this.outgoing;
  }
  override get canDeleteForOthers(): boolean {
    return this.outgoing || this.to.isAdmin;
  }
  override canReact = true;

  /** Delete this message for everyone: a ProtocolMessage(REVOKE) with this
   * message's key (the send counterpart of {@link WhatsAppChatRoom.deleteMessageByID}). */
  protected override async sendRetractionToOthers(): Promise<void> {
    await this.chatRoom.account.sender.sendMessage(JID.parse(this.chatRoom.id), {
      protocolMessage: {
        key: this.messageKey(),
        type: ProtocolMessageType.Revoke,
      },
    });
  }

  /** Add or remove our own emoji reaction to this message
   * Empty text removes it.
   * Sends a ReactionMessage.
   * The send counterpart of {@link WhatsAppChatRoom.reactionToMessage} */
  override async setMyReaction(emoji: string | null): Promise<void> {
    await this.chatRoom.account.sender.sendMessage(JID.parse(this.chatRoom.id), {
      reactionMessage: {
        key: this.messageKey(),
        text: emoji ?? "",
        senderTimestampMS: Date.now(),
      },
    });

    // Locally
    let me = await this.chatRoom.account.getOwnContact();
    if (emoji) {
      this.reactions.set(me, emoji);
    } else {
      this.reactions.delete(me);
    }
    await this.save();
  }

  /** This message's WhatsApp key, to target it in a revoke or reaction: the chat,
   * whether we sent it, and its id. `participant` names the original sender for
   * someone else's message (e.g. a group admin revoke). */
  protected messageKey(): MessageKey {
    let participant = !this.outgoing && this.contact instanceof WhatsAppContact
      ? this.contact.jid.toString() : undefined;
    return { remoteJID: this.chatRoom.id, fromMe: this.outgoing, id: this.id, participant };
  }

  /** Edits a message we already sent
   * A ProtocolMessage MESSAGE_EDIT carrying the new content and the original's key,
   * then update the original in place.
   * The send counterpart of {@link editMessage} */
  async sendEdit(): Promise<void> {
    assert(this.isEdit, "Not an edited message");
    let room = this.to;
    let account = this.to.account;
    let original = room.messages.find(msg => msg.id == this.isEdit) as WhatsAppMessage;
    assert(original, gt`Cannot find the message to edit`);
    await account.sender.sendMessage(JID.parse(room.id), {
      protocolMessage: {
        key: {
          remoteJID: room.id,
          fromMe: true,
          id: this.isEdit,
        },
        type: ProtocolMessageType.MessageEdit,
        editedMessage: {
          conversation: this.text,
        },
        timestampMS: Date.now(),
      },
    });
    original.text = this.text;
    await original.save();
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
    let attachment = this.newAttachment();
    attachment.filename = sanitize.filename(media.fileName, `${type}.${fileExtensionForMIMEType(media.mimetype)}`);
    attachment.mimeType = media.mimetype ?? "application/octet-stream";
    attachment.size = toNumber(media.fileLength);
    attachment.disposition = inline ? ContentDisposition.inline : ContentDisposition.attachment;
    attachment.related = inline; // inline media (stickers, GIFs) render in the message body
    this.attachments.add(attachment);
    if (caption) {
      this.text = caption;
    }
    this.setReplyTo(media.contextInfo?.stanzaID);
    // The bytes live on the CDN; fetch and decrypt them in the background so a
    // failed or slow download never blocks showing the message.
    let descriptor = mediaDescriptorFor(media, type);
    if (descriptor) {
      this.mediaDownload = this.downloadAttachment(attachment, descriptor)
        .catch(ex => console.error("WhatsApp: media download failed:", ex));
    }
    return true;
  }

  /** Downloads and decrypts an attachment's bytes and fills them in. Called from
   * {@link addMedia} (both live and history-import paths); errors are the
   * caller's to log, since a missing file must not break the message. */
  protected async downloadAttachment(attachment: Attachment, descriptor: MediaDescriptor): Promise<void> {
    let connection = (this.room as WhatsAppChatRoom)?.account?.connection ?? null;
    let bytes = await downloadMedia(connection, descriptor);
    attachment.content = new File([bytes as BufferSource], attachment.filename, { type: attachment.mimeType });
    attachment.size = bytes.length;
    await attachment.save();
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

function toNumber(value: any): number {
  if (value == null) {
    return 0;
  }
  return typeof value == "object" && typeof value.toNumber == "function" ? value.toNumber() : Number(value);
}
