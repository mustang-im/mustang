/** Attachment upload/download for Signal. Encrypts with the verified
 * `AttachmentCipher` (AES-CBC + HMAC, SHA-256 digest) and moves the blobs through
 * the CDN. Mirrors `XMPPMedia`. See Docs/05-profiles-attachments-cdn. */
import { Attachment } from "../../Abstract/Attachment";
import type { SignalAccount } from "./SignalAccount";
import type { SignalChatMessage } from "./SignalChatMessage";
import { encryptAttachment, decryptAttachment, newAttachmentKey } from "./Encryption/AttachmentCipher";
import { cdnHost, SignalApi } from "./Connection/SignalApi";
import type { AttachmentPointer, DataMessage } from "./Proto/signalService";
import { base64Encode } from "./Crypto/primitives";

export class SignalMedia {
  constructor(readonly account: SignalAccount) {}

  /** Encrypt + upload each attachment, returning AttachmentPointers for the
   * outgoing DataMessage. */
  async uploadAll(attachments: Attachment[]): Promise<AttachmentPointer[]> {
    let pointers: AttachmentPointer[] = [];
    for (let att of attachments) {
      if (!att.content) {
        continue;
      }
      let plaintext = new Uint8Array(await att.content.arrayBuffer());
      let key = newAttachmentKey();
      let enc = await encryptAttachment(key, plaintext);
      let { cdnKey, cdnNumber } = await this.upload(enc.data);
      pointers.push({
        cdnKey, cdnNumber, cdnId: 0n,
        key, digest: enc.digest, size: enc.size,
        contentType: att.mimeType || "application/octet-stream",
        fileName: att.filename || undefined,
      });
    }
    return pointers;
  }

  /** Upload an encrypted blob to the attachments CDN (v4 resumable form).
   * @returns the cdnKey + cdnNumber to put in the AttachmentPointer. */
  protected async upload(data: Uint8Array): Promise<{ cdnKey: string, cdnNumber: number }> {
    // GET an upload form, then PUT the bytes to the returned location. The exact
    // resumable (tus/cdn3) handshake is per Docs/05; this is the request shape.
    let form = await this.account.api().json<any>("GET", "/v4/attachments/form/upload", undefined, this.account.authCredentials());
    let location: string = form.signedUploadLocation;
    let api = new SignalApi(new URL(location).origin);
    await api.bytes("PUT", new URL(location).pathname + new URL(location).search, data, "application/octet-stream");
    return { cdnKey: form.key, cdnNumber: form.cdn ?? 3 };
  }

  /** Turn each AttachmentPointer in a received DataMessage into an Attachment,
   * downloading + decrypting in the background (best-effort). */
  addAttachments(message: SignalChatMessage, data: DataMessage): void {
    for (let pointer of data.attachments ?? []) {
      this.downloadOne(message, pointer).catch(ex => console.error("Signal: attachment download failed", ex));
    }
  }

  protected async downloadOne(message: SignalChatMessage, pointer: AttachmentPointer): Promise<void> {
    if (!pointer.key) {
      return;
    }
    let path = pointer.cdnKey
      ? `/attachments/${pointer.cdnKey}`
      : `/attachments/${pointer.cdnId}`;
    let api = new SignalApi(cdnHost(pointer.cdnNumber ?? 0));
    let blobBytes = await api.getBytes(path, this.account.authCredentials());
    let plaintext = await decryptAttachment(pointer.key, blobBytes, pointer.digest);
    let att = message.newAttachment();
    att.mimeType = pointer.contentType || "application/octet-stream";
    att.filename = pointer.fileName || `attachment-${base64Encode(pointer.key).slice(0, 8)}`;
    att.content = new File([plaintext as unknown as BlobPart], att.filename, { type: att.mimeType });
    att.size = plaintext.length;
    message.attachments.add(att);
  }
}
