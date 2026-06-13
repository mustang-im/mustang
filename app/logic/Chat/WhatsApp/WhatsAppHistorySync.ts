/** History sync — the chat list and old messages the user's phone sends to a
 * freshly linked companion.
 *
 * After login (and on demand for older messages) the phone posts
 * `<message>`s whose payload is a `protocolMessage.historySyncNotification`:
 * a pointer to an encrypted, gzipped `HistorySync` blob on the media servers.
 * We download it, decrypt it (media crypto, "WhatsApp History Keys"), unzip it,
 * and turn its conversations + messages into our rooms + messages.
 *
 * The parsing (importHistory) is the substantive part and is unit-tested. The
 * download path (media_conn host + URL) can only be validated against the live
 * servers, so it is kept small and isolated here. */
import type { WhatsAppAccount } from "./WhatsAppAccount";
import { JID, kServerUser, kServerLid } from "./Binary/JID";
import { WANode } from "./Binary/WANode";
import { decryptMedia, MediaType } from "./Crypto/mediaCrypto";
import { concatBytes } from "./Crypto/primitives";
import { waDebug, hexPreview } from "./debug";
import { kWaHttpUserAgent } from "./clientInfo";
import {
  decodeHistorySync, type HistorySync, type HistorySyncNotification, type Conversation,
} from "./Proto/schema";
import { appGlobal } from "../../app";

export class WhatsAppHistorySync {
  constructor(protected account: WhatsAppAccount) {
  }

  /** Downloads the blob a notification points at, decrypts it, and imports the
   * chats and messages it contains. */
  async handleNotification(notification: HistorySyncNotification): Promise<void> {
    waDebug("history: notification syncType", notification.syncType, "fileLength", notification.fileLength,
      "mediaKey", notification.mediaKey?.length, "B fileEncSHA256", notification.fileEncSHA256?.length, "B");
    try {
      let blob = await this.download(notification);
      let history = decodeHistorySync(blob);
      waDebug("history: HistorySync syncType", history.syncType, "conversations", history.conversations?.length ?? 0);
      let result = await this.importHistory(history);
      waDebug("history: imported", result.chats, "chats,", result.messages, "messages");
    } catch (ex) {
      // One bad blob shouldn't break the message stream; log and move on.
      waDebug("history: FAILED —", (ex as any)?.message ?? ex);
    }
  }

  /** Creates rooms and back-fills messages from a decoded HistorySync. This is
   * what fills the chat list and the old messages in each chat.
   * @returns how many chats and messages were added. */
  async importHistory(history: HistorySync): Promise<{ chats: number, messages: number }> {
    let chats = 0;
    let messages = 0;
    for (let conversation of history.conversations ?? []) {
      try {
        let added = await this.importConversation(conversation);
        if (added >= 0) {
          chats++;
          messages += added;
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
    return { chats, messages };
  }

  protected async importConversation(conversation: Conversation): Promise<number> {
    let chat = conversation.id ? JID.parse(conversation.id) : null;
    let importable = !!chat && (chat.server == kServerUser || chat.server == kServerLid || chat.isGroup);
    waDebug("history: conversation id", JSON.stringify(conversation.id), "name", JSON.stringify(conversation.name),
      "messages", conversation.messages?.length ?? 0, importable ? "" : "(SKIPPED: server=" + chat?.server + ")");
    if (!chat || !importable) {
      return -1; // status@broadcast, newsletters, malformed, …
    }
    let room = await this.account.getOrCreateRoom(chat, this.nameFor(conversation, chat));
    let added = 0;
    for (let stored of conversation.messages ?? []) {
      if (stored.message && await room.addHistoryMessage(stored.message)) {
        added++;
      }
    }
    waDebug("history: conversation", conversation.id, "→ room", room.id, "added", added, "of",
      conversation.messages?.length ?? 0, "messages");
    return added;
  }

  /** A display name for the chat: a group's subject, or a 1:1 partner's push
   * name taken from one of their messages. */
  protected nameFor(conversation: Conversation, chat: JID): string | undefined {
    if (chat.isGroup) {
      return conversation.name || undefined;
    }
    let incoming = (conversation.messages ?? []).find(stored => stored.message && !stored.message.key?.fromMe);
    return incoming?.message?.pushName || undefined;
  }

  /** Downloads and decrypts the gzipped HistorySync blob. Needs the live
   * connection (for the media host) and HTTP backend. */
  protected async download(notification: HistorySyncNotification): Promise<Uint8Array> {
    let url = await this.mediaURL(notification.directPath!);
    waDebug("history: GET", url.slice(0, 96) + "…");
    let encrypted = await this.httpGet(url);
    waDebug("history: downloaded", encrypted.length, "bytes, head", hexPreview(encrypted));
    let decrypted = await decryptMedia(encrypted, notification.mediaKey!, MediaType.History, notification.fileEncSHA256);
    waDebug("history: decrypted", decrypted.length, "bytes, head", hexPreview(decrypted), "(gzip starts 1f 8b)");
    let decompressed = await inflate(decrypted);
    waDebug("history: decompressed", decompressed.length, "bytes");
    return decompressed;
  }

  /** Resolves the media host via a `media_conn` IQ and builds the download URL. */
  protected async mediaURL(directPath: string): Promise<string> {
    let connection = this.account.connection;
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

  protected async httpGet(url: string): Promise<Uint8Array> {
    let ky = await appGlobal.remoteApp.kyCreate({ headers: { "User-Agent": kWaHttpUserAgent } });
    return new Uint8Array(await ky.get(url, { result: "arrayBuffer" }));
  }
}

/** Decompresses a HistorySync blob. WhatsApp gzips it, but we fall back to raw
 * deflate just in case, and read the stream directly so a bad-data error is
 * reported as such (consuming it via Response surfaces as a vague "Failed to
 * fetch"). */
/** Decompresses the history blob. Prefers the backend's Node zlib (reliable);
 * falls back to the renderer's DecompressionStream if the backend doesn't
 * expose it (e.g. web build). */
async function inflate(data: Uint8Array): Promise<Uint8Array> {
  let backendGunzip = (appGlobal.remoteApp as any)?.gunzip;
  if (backendGunzip) {
    try {
      return new Uint8Array(await backendGunzip(data));
    } catch (ex) {
      waDebug("history: backend gunzip failed:", (ex as any)?.message ?? ex);
    }
  }
  return await inflateMaybeGzip(data);
}

async function inflateMaybeGzip(data: Uint8Array): Promise<Uint8Array> {
  let formats: CompressionFormat[] = ["gzip", "deflate", "deflate-raw"];
  for (let format of formats) {
    try {
      return await decompress(data, format);
    } catch (ex) {
      waDebug("history:", format, "decompress failed:", (ex as any)?.message ?? ex);
    }
  }
  throw new Error("history: blob is not gzip/deflate (decrypt may be wrong)");
}

async function decompress(data: Uint8Array, format: CompressionFormat): Promise<Uint8Array> {
  let stream = new DecompressionStream(format);
  let writer = stream.writable.getWriter();
  void writer.write(data as BufferSource);
  void writer.close();
  let reader = stream.readable.getReader();
  let chunks: Uint8Array[] = [];
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    chunks.push(chunk.value);
  }
  return concatBytes(...chunks);
}
