/** Attachment upload/download for Signal. Encrypts with the verified
 * `AttachmentCipher` (AES-CBC + HMAC, SHA-256 digest) and moves the blobs through
 * the CDN. Mirrors `XMPPMedia` (raw `fetch` against the CDN host). The wire is
 * byte-verified against Signal-Server `AttachmentControllerV4` +
 * Signal-Android `PushServiceSocket` (getResumableUploadUrl / uploadToCdn2 /
 * uploadToCdn3 / retrieveAttachment). See Docs/05-profiles-attachments-cdn. */
import { Attachment } from "../../Abstract/Attachment";
import type { SignalAccount } from "./SignalAccount";
import type { SignalChatMessage } from "./SignalChatMessage";
import { encryptAttachment, decryptAttachment, newAttachmentKey } from "./Encryption/AttachmentCipher";
import { cdnHost } from "./Connection/SignalApi";
import type { AttachmentPointer, DataMessage } from "./Proto/signalService";
import type { FilePointer } from "./Proto/backup";
import { base64Encode } from "./Crypto/primitives";

/** `GET /v4/attachments/form/upload` response — the server's `AttachmentDescriptorV3`
 * record (`entities/AttachmentDescriptorV3.java`). `cdn` is 2 (GCS resumable) or 3
 * (TUS); `key` is the URL-safe base64 cdnKey to put in the AttachmentPointer;
 * `headers` are time-limited upload credentials that MUST be replayed on every
 * upload request; `signedUploadLocation` is where to start the resumable upload. */
interface AttachmentUploadForm {
  cdn: number;
  key: string;
  headers: Record<string, string>;
  signedUploadLocation: string;
}

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
      // cdnKey and cdnId are a oneof — set only cdnKey for v4 uploads.
      pointers.push({
        cdnKey, cdnNumber,
        key, digest: enc.digest, size: enc.size,
        contentType: att.mimeType || "application/octet-stream",
        fileName: att.filename || undefined,
      });
    }
    return pointers;
  }

  /** Upload an encrypted blob via the v4 resumable form. Two phases, per
   * `PushServiceSocket.getResumableUploadUrl` + `uploadToCdn{2,3}`:
   *   1. `GET /v4/attachments/form/upload` (authenticated) for the form.
   *   2. POST the form's `signedUploadLocation` (with the form `headers`) to obtain
   *      a resumable upload URL from the `Location` response header.
   *   3. CDN2: PUT the bytes with a `Content-Range`; CDN3 (TUS): PATCH the bytes
   *      with `Upload-Offset`/`Upload-Length`/`Tus-Resumable` (+ the form headers).
   * @returns the cdnKey (= form.key) + cdnNumber (= form.cdn) for the pointer. */
  protected async upload(data: Uint8Array): Promise<{ cdnKey: string, cdnNumber: number }> {
    let form = await this.account.api().json<AttachmentUploadForm>(
      "GET", "/v4/attachments/form/upload", undefined, this.account.authCredentials());
    let resumableURL = await this.startResumableUpload(form);
    if (form.cdn == 3) {
      await this.uploadCdn3(resumableURL, form.headers, data);
    } else {
      await this.uploadCdn2(resumableURL, data);
    }
    return { cdnKey: form.key, cdnNumber: form.cdn };
  }

  /** POST the signed upload location to start the resumable upload; the resumable
   * URL comes back in the `Location` header (resolved against the CDN base if
   * relative). CDN2 sends GCS init headers, CDN3 sends the TUS init headers.
   * (`PushServiceSocket.getResumableUploadUrl`.) */
  protected async startResumableUpload(form: AttachmentUploadForm): Promise<string> {
    let headers: Record<string, string> = {};
    for (let [name, value] of Object.entries(form.headers ?? {})) {
      if (name.toLowerCase() != "host") {
        headers[name] = value;
      }
    }
    headers["Content-Length"] = "0";
    if (form.cdn == 2) {
      headers["Content-Type"] = "application/octet-stream";
    } else if (form.cdn == 3) {
      headers["Upload-Defer-Length"] = "1";
      headers["Tus-Resumable"] = "1.0.0";
    } else {
      throw new Error(`Signal: unknown attachment CDN version ${form.cdn}`);
    }
    // Empty body as a BufferSource, NOT a string: a string body makes fetch add
    // `Content-Type: text/plain`, which the CDN3 (TUS) creation endpoint rejects with
    // 415. Signal-Android sends `RequestBody.create(null, "")` — empty, no Content-Type.
    let res = await fetch(form.signedUploadLocation, { method: "POST", headers, body: new Uint8Array(0) });
    if (!res.ok) {
      throw new Error(`Signal: starting resumable upload failed: HTTP ${res.status}`);
    }
    let location = res.headers.get("location");
    if (!location) {
      throw new Error("Signal: resumable upload start returned no Location header");
    }
    return new URL(location, form.signedUploadLocation).toString();
  }

  /** CDN2 (GCS): a single PUT of the whole blob with a `Content-Range`
   * (`PushServiceSocket.uploadToCdn2`, fresh upload → contentStart 0). */
  protected async uploadCdn2(resumableURL: string, data: Uint8Array): Promise<void> {
    let res = await fetch(resumableURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Range": `bytes 0-${data.length - 1}/${data.length}`,
      },
      body: data as unknown as BodyInit,
    });
    if (!res.ok) {
      throw new Error(`Signal: CDN2 attachment upload failed: HTTP ${res.status}`);
    }
  }

  /** CDN3 (TUS): PATCH the whole blob at offset 0 (`PushServiceSocket.uploadToCdn3`,
   * fresh upload). The form `headers` are replayed here too. */
  protected async uploadCdn3(resumableURL: string, formHeaders: Record<string, string>, data: Uint8Array): Promise<void> {
    let headers: Record<string, string> = {
      "Content-Type": "application/offset+octet-stream",
      "Upload-Offset": "0",
      "Upload-Length": String(data.length),
      "Tus-Resumable": "1.0.0",
    };
    for (let [name, value] of Object.entries(formHeaders ?? {})) {
      if (name.toLowerCase() != "host") {
        headers[name] = value;
      }
    }
    let res = await fetch(resumableURL, { method: "PATCH", headers, body: data as unknown as BodyInit });
    if (!res.ok) {
      throw new Error(`Signal: CDN3 attachment upload failed: HTTP ${res.status}`);
    }
  }

  async downloadOne(message: SignalChatMessage, pointer: AttachmentPointer): Promise<void> {
    if (!pointer.key) {
      return;
    }
    // V4 (cdnKey) → `attachments/{urlEncode(cdnKey)}`; legacy V2 (cdnId) →
    // `attachments/{cdnId}` (`PushServiceSocket.retrieveAttachment`). CDN downloads
    // are unauthenticated (no chat Authorization header — see downloadFromCdn).
    let path = pointer.cdnKey
      ? `attachments/${encodeURIComponent(pointer.cdnKey)}`
      : `attachments/${pointer.cdnId}`;
    let url = `${cdnHost(pointer.cdnNumber ?? 0)}/${path}`;
    let res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`Signal: attachment download failed: HTTP ${res.status}`);
    }
    let blobBytes = new Uint8Array(await res.arrayBuffer());
    let plaintext = await decryptAttachment(pointer.key, blobBytes, pointer.digest);
    let att = message.newAttachment();
    att.mimeType = pointer.contentType || "application/octet-stream";
    att.filename = pointer.fileName || `attachment-${base64Encode(pointer.key).slice(0, 8)}`;
    att.content = new File([plaintext as unknown as BlobPart], att.filename, { type: att.mimeType });
    att.size = plaintext.length;
    message.attachments.add(att);
  }

  /** Download a message-backup `FilePointer` (Docs/10) by mapping its transit-CDN
   * locator onto an AttachmentPointer and reusing {@link downloadOne}. Backup-only
   * (media-tier) attachments without a transit locator are skipped (we can't fetch
   * them without the media-tier credentials). @returns false if nothing to download. */
  async downloadFilePointer(message: SignalChatMessage, pointer: FilePointer): Promise<boolean> {
    let loc = pointer.locatorInfo;
    if (!loc?.transitCdnKey || !loc.key?.length) {
      return false; // not on the transit CDN (e.g. media-tier only, or expired)
    }
    await this.downloadOne(message, {
      cdnKey: loc.transitCdnKey,
      cdnNumber: loc.transitCdnNumber ?? 2,
      cdnId: 0n,
      key: loc.key,
      digest: loc.encryptedDigest,
      size: loc.size,
      contentType: pointer.contentType,
      fileName: pointer.fileName,
    });
    return true;
  }
}
