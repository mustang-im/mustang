/** Downloading and decrypting WhatsApp media (images, video, voice/audio,
 * documents, stickers).
 *
 * Media bytes don't travel inside the message — the message only carries a
 * pointer (`directPath`) plus the per-file `mediaKey` and hashes. To get the
 * file we resolve a CDN host via a `media_conn` IQ, download the encrypted blob
 * from `https://<host><directPath>&auth=<auth>`, then `decryptMedia()` it with
 * the media type's HKDF keys (see Crypto/mediaCrypto). The same path serves both
 * the history-sync blob and ordinary message attachments, so it lives here.
 *
 * The host/URL part can only be validated against the live servers, so it is
 * kept small and isolated, mirroring WhatsAppHistorySync. */
import type { WhatsAppConnection } from "./WhatsAppConnection";
import { kServerUser } from "./Binary/JID";
import { WANode } from "./Binary/WANode";
import { decryptMedia, encryptMedia, MediaType, type EncryptedMedia } from "./Crypto/mediaCrypto";
import { bytesEqual, sha256, randomBytes, base64Encode } from "../Signal/Crypto/primitives";
import { kWaHttpUserAgent } from "./clientInfo";
import type { ImageMessage, VideoMessage, AudioMessage, DocumentMessage, StickerMessage, WAMessage } from "./Proto/schema";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";

/** Everything needed to fetch and decrypt one media file, distilled from the
 * media protobuf so the downloader doesn't depend on the message shape. */
export interface MediaDescriptor {
  type: MediaType;
  directPath: string;
  /** Full CDN URL, if the message gave one. Preferred over `directPath`. */
  url?: string;
  mediaKey: Uint8Array;
  fileEncSHA256?: Uint8Array;
  /** Plaintext hash, to verify the decrypted bytes when present. */
  fileSHA256?: Uint8Array;
  fileLength?: number;
}

type MediaMessage = ImageMessage | VideoMessage | AudioMessage | DocumentMessage | StickerMessage;

/** Builds a download descriptor from a parsed media message, or null if it lacks
 * the key/location we'd need to fetch it. */
export function mediaDescriptorFor(media: MediaMessage, type: MediaType): MediaDescriptor | null {
  if (!media?.mediaKey?.length || (!media.directPath && !media.URL)) {
    return null;
  }
  return {
    type,
    directPath: media.directPath ?? "",
    url: media.URL || undefined,
    mediaKey: media.mediaKey,
    fileEncSHA256: media.fileEncSHA256,
    fileSHA256: media.fileSHA256,
    fileLength: toNumber(media.fileLength),
  };
}

/** WhatsApp serves all media and avatars from hosts under `whatsapp.net`
 * Block localhost and other domains to avoid SSRF.
 * @throws */
const kAllowedMediaHosts = ["whatsapp.net", "example.net"];

/** Validates a media/avatar URL against the host allowlist, throwing if it is not
 * an https URL on an allowed host. Returns the URL unchanged, so callers fetching
 * a server- or sender-supplied URL can wrap it inline. */
export function checkMediaURL(url: string): string {
   url = sanitize.url(url, null, ["https"]);
  assert(url, `Need https: URL for WhatsApp media download, but got ${url}`);
  let host = sanitize.hostname(new URL(url).hostname, null);
  assert(host && kAllowedMediaHosts.some(domain => host == domain || host.endsWith("." + domain)),
    `Refusing to fetch WhatsApp media from untrusted URL: ${url}`);
  return url;
}

/** Downloads the encrypted blob a descriptor points at and decrypts it to the
 * plaintext file bytes. Needs the live connection (for the media host). */
export async function downloadMedia(connection: WhatsAppConnection | null, media: MediaDescriptor): Promise<Uint8Array> {
  let url = media.url ? checkMediaURL(media.url) : await mediaURL(connection, media.directPath);
  let encrypted = await httpGet(url);
  let decrypted = await decryptMedia(encrypted, media.mediaKey, media.type, media.fileEncSHA256);
  if (media.fileSHA256?.length && !bytesEqual(sha256(decrypted), media.fileSHA256)) {
    throw new Error("Decrypted media hash does not match");
  }
  return decrypted;
}

/** Resolves the media host via a `media_conn` IQ and builds the download URL.
 * The host list is per-session and short-lived; we take the first one. */
export async function mediaURL(connection: WhatsAppConnection | null, directPath: string): Promise<string> {
  let conn = await mediaConn(connection);
  let url = checkMediaURL(`https://${conn.hosts[0]}${directPath}`);
  return conn.auth ? `${url}&auth=${encodeURIComponent(conn.auth)}` : url;
}

/** The per-session CDN hosts + auth token for media transfer, from a `media_conn`
 * IQ. Shared by download ({@link mediaURL}) and upload ({@link uploadMedia}). */
interface MediaConn {
  hosts: string[];
  auth: string;
}
async function mediaConn(connection: WhatsAppConnection | null): Promise<MediaConn> {
  if (!connection) {
    throw new Error("Not connected");
  }
  let response = await connection.sendIQ(new WANode("iq",
    { to: kServerUser, type: "set", xmlns: "w:m" }, [new WANode("media_conn")]));
  let node = response.child("media_conn");
  let hosts = (node?.children("host") ?? [])
    .map(host => host.attrs.hostname)
    .filter((hostname): hostname is string => !!hostname);
  if (!hosts.length) {
    hosts = ["mmg.whatsapp.net"];
  }
  return { hosts, auth: node?.attrs.auth ?? "" };
}

// --- Uploading (the symmetric counterpart of downloadMedia) ---

/** Everything an outgoing media message must reference so the recipient can fetch
 * and decrypt the file: where it now lives on the CDN, the per-file key, and the
 * hashes/length. Produced by {@link uploadMedia}; inverse of {@link MediaDescriptor}. */
export interface MediaUpload {
  /** Full CDN URL the server returned. May be empty — then use `directPath`. */
  url: string;
  directPath: string;
  mediaKey: Uint8Array;
  encrypted: EncryptedMedia;
}

/** Encrypts a file with a fresh per-file key and uploads the encrypted blob to the
 * WhatsApp media CDN — the symmetric counterpart of {@link downloadMedia}. Returns
 * the CDN location plus the `mediaKey` and hashes to put in the message. Tries each
 * media host until one accepts the upload. */
export async function uploadMedia(connection: WhatsAppConnection | null, plaintext: Uint8Array, type: MediaType): Promise<MediaUpload> {
  let mediaKey = randomBytes(32);
  let encrypted = await encryptMedia(plaintext, mediaKey, type);
  let conn = await mediaConn(connection);
  let token = base64url(encrypted.fileEncSHA256);
  let query = `?auth=${encodeURIComponent(conn.auth)}&token=${token}`;
  let lastError: unknown;
  for (let host of conn.hosts) {
    try {
      let url = checkMediaURL(`https://${host}/mms/${mmsTypeFor(type)}/${token}`) + query;
      let response = await httpPost(url, encrypted.enc);
      let directPath = sanitize.string(response?.direct_path, "");
      let resultURL = response?.url ? checkMediaURL(sanitize.url(response.url, "", ["https"])) : "";
      assert(directPath || resultURL, "WhatsApp media upload returned no location");
      return { url: resultURL, directPath, mediaKey, encrypted };
    } catch (ex) {
      lastError = ex;
    }
  }
  throw lastError ?? new Error("WhatsApp media upload failed");
}

/** Optional, sender-supplied preview metadata for an outgoing media message.
 * TODO Implement reading media and thumbnail generation */
export interface MediaMeta {
  width?: number;
  height?: number;
  /** Duration in seconds, for audio/video. */
  seconds?: number;
  /** A small JPEG preview, shown before the full file downloads. */
  jpegThumbnail?: Uint8Array;
  /** Audio recorded as a voice note (push-to-talk). */
  ptt?: boolean;
}

/** Builds the outgoing media message protobuf from an {@link uploadMedia} result —
 * the inverse of {@link mediaDescriptorFor}. Picks the sub-message by `type` and
 * fills the CDN pointer, per-file key and hashes the recipient needs. `caption`
 * (image/video/document) and `meta` (dimensions/thumbnail) are optional. */
export function buildMediaMessage(type: MediaType, mimeType: string, filename: string,
    upload: MediaUpload, caption?: string, meta: MediaMeta = {}): WAMessage {
  let common = {
    URL: upload.url || undefined,
    directPath: upload.directPath,
    mediaKey: upload.mediaKey,
    mimetype: mimeType,
    fileSHA256: upload.encrypted.fileSHA256,
    fileEncSHA256: upload.encrypted.fileEncSHA256,
    fileLength: upload.encrypted.fileLength,
    mediaKeyTimestamp: Math.floor(Date.now() / 1000),
  };
  switch (type) {
    case MediaType.Video:
      return { videoMessage: { ...common, caption, width: meta.width, height: meta.height, seconds: meta.seconds, jpegThumbnail: meta.jpegThumbnail } };
    case MediaType.Audio:
      return { audioMessage: { ...common, seconds: meta.seconds, PTT: meta.ptt } };
    case MediaType.Document:
      return { documentMessage: { ...common, fileName: filename, title: filename, caption, jpegThumbnail: meta.jpegThumbnail } };
    case MediaType.Image:
    default:
      return { imageMessage: { ...common, caption, width: meta.width, height: meta.height, jpegThumbnail: meta.jpegThumbnail } };
  }
}

/** Picks the WhatsApp media type for an outgoing file from its MIME type. Anything
 * that isn't an image/video/audio is sent as a document. */
export function mediaTypeForMIME(mimeType: string): MediaType {
  if (mimeType?.startsWith("image/")) {
    return MediaType.Image;
  } else if (mimeType?.startsWith("video/")) {
    return MediaType.Video;
  } else if (mimeType?.startsWith("audio/")) {
    return MediaType.Audio;
  }
  return MediaType.Document;
}

/** The CDN path segment per media type (`/mms/<segment>/<token>`). */
function mmsTypeFor(type: MediaType): string {
  switch (type) {
    case MediaType.Image: return "image";
    case MediaType.Sticker: return "image";
    case MediaType.Video: return "video";
    case MediaType.Audio: return "audio";
    case MediaType.Document: return "document";
    case MediaType.History: return "md-msg-hist";
  }
}

/** Standard base64 → URL-safe and unpadded — the form WhatsApp uses for the media
 * upload token (the file's encrypted-content hash). */
function base64url(bytes: Uint8Array): string {
  return base64Encode(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function httpGet(url: string): Promise<Uint8Array> {
  let ky = await appGlobal.remoteApp.kyCreate({ headers: { "User-Agent": kWaHttpUserAgent } });
  return new Uint8Array(await ky.get(url, { result: "arrayBuffer" }));
}

/** POSTs raw bytes (an encrypted media blob) to the media CDN and returns the JSON
 * reply (`{ url, direct_path }`). The body must be a `Buffer` to survive JPC. */
async function httpPost(url: string, bytes: Uint8Array): Promise<any> {
  let ky = await appGlobal.remoteApp.kyCreate({
    headers: {
      "User-Agent": kWaHttpUserAgent,
      "Content-Type": "application/octet-stream",
    },
    result: "json",
  });
  return await ky.post(url, { body: Buffer.from(bytes) });
}

function toNumber(value: any): number | undefined {
  if (value == null) {
    return undefined;
  }
  return typeof value == "object" && typeof value.toNumber == "function" ? value.toNumber() : Number(value);
}
