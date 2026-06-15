import { ChatMessage } from "../Message";
import { type Attachment, ContentDisposition } from "../../Abstract/Attachment";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { MatrixRoom } from "./MatrixRoom";
import { base64Decode } from "../Signal/Crypto/primitives";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";
import type { MatrixClient } from "matrix-js-sdk";

const kMediaMsgTypes = ["m.image", "m.video", "m.audio", "m.file"];

export class MatrixChatMessage extends ChatMessage {
  constructor(chatRoom: MatrixRoom) {
    super(chatRoom);
  }
  get chatRoom(): MatrixRoom {
    return this.to as MatrixRoom;
  }

  /** Whether an `m.room.message` content is a media (file) message. */
  static isMedia(content: any): boolean {
    return kMediaMsgTypes.includes(content?.msgtype);
  }

  /** Turns an `m.image`/`m.video`/`m.audio`/`m.file` msg content into an attachment and
   * downloads and decrypts the content in the background, and stores them.
   * Compare `WhatsAppMessage.addMedia()` and `XMPPChatMessage.addMediaFromURL()` */
  async addMedia(content: any): Promise<void> {
    let isImage = content.msgtype == "m.image";
    let attachment = this.newAttachment();
    attachment.filename = sanitize.filename(content.body, "file");
    attachment.mimeType = sanitize.string(content.info?.mimetype, "application/octet-stream");
    attachment.size = sanitize.integer(content.info?.size, null);
    attachment.disposition = isImage ? ContentDisposition.inline : ContentDisposition.attachment;
    this.attachments.add(attachment);
    await this.downloadAttachment(attachment, content);
  }

  /** Downloads and decrypts an attachment's bytes, fills them in, and persists them
   * to disk via the storage provider. Errors are the caller's to log. */
  protected async downloadAttachment(attachment: Attachment, content: any): Promise<void> {
    let bytes = await MatrixChatMessage.downloadMedia(content, this.chatRoom.account.client);
    attachment.content = new File([bytes as BufferSource], attachment.filename, { type: attachment.mimeType });
    attachment.size = bytes.length;
    await attachment.save();
  }

  /** Fetches an attachment's bytes from the Matrix media repo, decrypting them when
   * the message carries an `EncryptedFile` (`content.file`, i.e. an encrypted room). */
  protected static async downloadMedia(content: any, client: MatrixClient): Promise<Uint8Array> {
    let encrypted = content.file; // EncryptedFile, present in encrypted rooms
    let mxcURL = encrypted?.url ?? content.url;
    assert(mxcURL, "Matrix media message has no URL");
    let httpURL = client.mxcUrlToHttp(mxcURL, undefined, undefined, undefined, false, true, true);
    assert(httpURL, "Cannot resolve Matrix media URL " + mxcURL);
    let ky = await appGlobal.remoteApp.kyCreate({
      headers: {
        Authorization: `Bearer ${client.getAccessToken()}`,
      },
    });
    let bytes = new Uint8Array(await ky.get(httpURL, { result: "arrayBuffer" }));
    return encrypted ? await MatrixChatMessage.decryptFile(encrypted, bytes) : bytes;
  }

  /** Decrypts a Matrix encrypted attachment: AES-CTR-256 keyed by the JWK in the
   * message's `EncryptedFile`, with the IV as the initial counter block. */
  protected static async decryptFile(file: any, cipherBlob: Uint8Array): Promise<Uint8Array> {
    assert(file.key?.k && file.iv, "Matrix encrypted file is missing its key or IV");
    let keyBytes = matrixBase64(file.key.k);
    let counter = matrixBase64(file.iv);
    let key = await crypto.subtle.importKey("raw", keyBytes as BufferSource, { name: "AES-CTR" }, false, ["decrypt"]);
    let plaintext = await crypto.subtle.decrypt({ name: "AES-CTR", counter: counter as BufferSource, length: 64 }, key, cipherBlob as BufferSource);
    return new Uint8Array(plaintext);
  }
}

/** Matrix encodes attachment keys/IVs as URL-safe, often unpadded base64. */
function matrixBase64(b64: string): Uint8Array {
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) {
    b64 += "=";
  }
  return base64Decode(b64);
}
