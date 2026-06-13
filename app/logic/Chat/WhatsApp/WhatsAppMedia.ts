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
import { decryptMedia, MediaType } from "./Crypto/mediaCrypto";
import { bytesEqual, sha256 } from "./Crypto/primitives";
import { kWaHttpUserAgent } from "./clientInfo";
import type { ImageMessage, VideoMessage, AudioMessage, DocumentMessage, StickerMessage } from "./Proto/schema";
import { appGlobal } from "../../app";

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

/** Downloads the encrypted blob a descriptor points at and decrypts it to the
 * plaintext file bytes. Needs the live connection (for the media host). */
export async function downloadMedia(connection: WhatsAppConnection | null, media: MediaDescriptor): Promise<Uint8Array> {
  let url = media.url ?? await mediaURL(connection, media.directPath);
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
  if (!connection) {
    throw new Error("Not connected");
  }
  let response = await connection.sendIQ(new WANode("iq",
    { to: kServerUser, type: "set", xmlns: "w:m" }, [new WANode("media_conn")]));
  let mediaConn = response.child("media_conn");
  let host = mediaConn?.children("host")[0]?.attrs.hostname ?? "mmg.whatsapp.net";
  let auth = mediaConn?.attrs.auth;
  let url = `https://${host}${directPath}`;
  return auth ? `${url}&auth=${encodeURIComponent(auth)}` : url;
}

export async function httpGet(url: string): Promise<Uint8Array> {
  let ky = await appGlobal.remoteApp.kyCreate({ headers: { "User-Agent": kWaHttpUserAgent } });
  return new Uint8Array(await ky.get(url, { result: "arrayBuffer" }));
}

function toNumber(value: any): number | undefined {
  if (value == null) {
    return undefined;
  }
  return typeof value == "object" && typeof value.toNumber == "function" ? value.toNumber() : Number(value);
}
