/** File transfer for XMPP: HTTP File Upload (XEP-0363) for sending, plus OMEMO
 * media sharing (the de-facto `aesgcm://` scheme) for end-to-end-encrypted files.
 *
 * For a normal file we upload it and share the https URL (in the body and as
 * OOB, XEP-0066). For an encrypted file we AES-256-GCM-encrypt it, upload the
 * ciphertext, and share an `aesgcm://host/path#<iv><key>` URL whose fragment
 * carries the key — the URL itself travels inside the OMEMO-encrypted body, so
 * only the recipients can read the key and fetch the file. */
import type { XMPPAccount } from "./XMPPAccount";
import { aesGCMEncrypt, aesGCMDecrypt, randomBytes } from "../WhatsApp/Crypto/primitives";
import { bytesToHex, hexToBytes } from "@noble/curves/utils.js";
import { gt } from "../../../l10n/l10n";

export class XMPPMedia {
  readonly account: XMPPAccount;
  /** The server's upload service JID; undefined = not looked up, null = none */
  protected uploadJID: string | null | undefined;

  constructor(account: XMPPAccount) {
    this.account = account;
  }

  protected get client() {
    return this.account.client;
  }

  /** Finds the server's HTTP-upload service (XEP-0363), once. */
  protected async uploadService(): Promise<string | null> {
    if (this.uploadJID === undefined) {
      try {
        let service = await this.client.getUploadService(this.account.jid.split("@")[1]);
        this.uploadJID = service?.jid ?? null;
      } catch (ex) {
        this.uploadJID = null;
      }
    }
    return this.uploadJID;
  }

  /** Uploads a file and returns its public https URL (XEP-0363). */
  async upload(filename: string, data: Uint8Array, mimeType: string): Promise<string> {
    let jid = await this.uploadService();
    if (!jid) {
      throw new Error(gt`This server has no file upload service`);
    }
    let slot = await this.client.getUploadSlot(jid, { name: filename, size: data.length, mediaType: mimeType });
    let headers: Record<string, string> = { "Content-Type": mimeType };
    for (let header of slot.upload.headers ?? []) {
      headers[header.name] = header.value;
    }
    let response = await fetch(slot.upload.url, { method: "PUT", body: data as any, headers });
    if (!response.ok) {
      throw new Error(gt`File upload failed`);
    }
    return slot.download;
  }

  /** Encrypts a file (AES-256-GCM) and uploads it, returning an `aesgcm://` URL
   * whose fragment carries the IV and key (OMEMO media sharing). */
  async uploadEncrypted(filename: string, data: Uint8Array, mimeType: string): Promise<string> {
    let key = randomBytes(32);
    let iv = randomBytes(12);
    let ciphertext = await aesGCMEncrypt(key, iv, data); // ciphertext with the tag appended
    // `aesgcm:` is not a "special" URL scheme, so URL.protocol won't switch to it
    let url = await this.upload(filename, ciphertext, "application/octet-stream");
    return url.replace(/^https?:/, "aesgcm:") + "#" + bytesToHex(iv) + bytesToHex(key);
  }

  /** Downloads a shared file, decrypting it if it's an `aesgcm://` URL. */
  async download(url: string): Promise<Uint8Array> {
    if (url.startsWith("aesgcm:")) {
      return this.downloadEncrypted(url);
    }
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(gt`File download failed`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  protected async downloadEncrypted(url: string): Promise<Uint8Array> {
    let [base, fragment = ""] = url.split("#");
    // Fragment is hex(IV ‖ key); a 32-byte key is the last 64 hex chars, leaving
    // the IV (24 hex for 12 bytes, or 32 for the older 16-byte IV).
    let key = hexToBytes(fragment.slice(-64));
    let iv = hexToBytes(fragment.slice(0, fragment.length - 64));
    let response = await fetch(base.replace(/^aesgcm:/, "https:"));
    if (!response.ok) {
      throw new Error(gt`File download failed`);
    }
    let ciphertext = new Uint8Array(await response.arrayBuffer());
    return new Uint8Array(await aesGCMDecrypt(key, iv, ciphertext));
  }
}

/** Whether `text` is a single shared-file URL (and nothing else). */
export function isFileURL(text: string): boolean {
  let trimmed = text.trim();
  return /^(https?|aesgcm):\/\/\S+$/.test(trimmed) && !/\s/.test(trimmed);
}
