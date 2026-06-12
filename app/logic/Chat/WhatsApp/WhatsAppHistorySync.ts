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
import { JID, kServerUser } from "./Binary/JID";
import { WANode } from "./Binary/WANode";
import { decryptMedia, MediaType } from "./Crypto/mediaCrypto";
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
    let blob = await this.download(notification);
    await this.importHistory(decodeHistorySync(blob));
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
    if (!conversation.id) {
      return -1;
    }
    let chat = JID.parse(conversation.id);
    if (chat.server != kServerUser && !chat.isGroup) {
      return -1; // skip status@broadcast, newsletters, etc.
    }
    let room = await this.account.getOrCreateRoom(chat, this.nameFor(conversation, chat));
    let added = 0;
    for (let stored of conversation.messages ?? []) {
      if (stored.message && await room.addHistoryMessage(stored.message)) {
        added++;
      }
    }
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
    let encrypted = await this.httpGet(await this.mediaURL(notification.directPath!));
    let decrypted = await decryptMedia(encrypted, notification.mediaKey!, MediaType.History, notification.fileEncSHA256);
    return await gunzip(decrypted);
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

async function gunzip(data: Uint8Array): Promise<Uint8Array> {
  let stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
