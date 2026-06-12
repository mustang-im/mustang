import { ChatRoom } from "../ChatRoom";
import { getBareJID, type XMPPAccount } from "./XMPPAccount";
import { XMPPChatMessage } from "./XMPPChatMessage";
import { XMPPRoomEvent } from "./XMPPRoomEvent";
import { type ChatRoomEvent, RoomEventKind } from "../RoomEvent";
import { ChatMessage, DeliveryStatus, type RoomMessage } from "../Message";
import { SQLChatMessage } from "../SQL/SQLChatMessage";
import { Lock } from "../../util/flow/Lock";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";
import type { Message, Forward, MAMResult, MAMFin, Paging } from "stanza/protocol";

const kBatchSize = 200;

export class XMPPChat extends ChatRoom {
  declare account: XMPPAccount;
  protected readonly syncLock = new Lock();
  /** XMPP wire type of the messages in this chat */
  protected messageType: "chat" | "groupchat" = "chat";

  /** Adds the message to this chat, unless it's already known
   * (e.g. from our DB) or it's not a user message.
   * @param wrapper The MAM/carbon envelope, if from the archive
   * @param archiveID The MAM archive ID, if from the archive */
  addMessage(json: Message, wrapper?: Forward, archiveID?: string): XMPPChatMessage | null {
    if (!json?.body && !json?.html?.body) {
      // TODO process system messages like typing notification, read receipt etc.
      return null;
    }
    let id = sanitize.nonemptystring(json.id, null) ?? sanitize.nonemptystring(archiveID, null);
    if (id && this.messages.some(msg => msg.id == id)) {
      return null;
    }
    let msg = this.newMessage();
    msg.fromStanzaJS(json, wrapper, archiveID);
    this.messages.add(msg);
    return msg;
  }

  /** Sets the sender (`contact`) and `outgoing` on the message.
   * In a 1:1 chat, `contact` is always the chat partner, set by the ctor. */
  fillSender(msg: XMPPChatMessage, from: string): void {
    let bare = getBareJID(from);
    msg.outgoing = !!bare && bare == this.account.jid;
    if (!msg.outgoing && bare && bare != this.id) {
      msg.contact = this.account.getExistingPerson(bare) ?? msg.contact;
    }
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: ChatMessage): Promise<void> {
    assert(this.account.isLoggedIn, "Chat account is not logged in");
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.add(message);
    message.id = this.account.client.sendMessage({
      to: this.id,
      type: this.messageType,
      body: message.text,
      // stanza accepts a string here, wraps it in <body xmlns="http://www.w3.org/1999/xhtml">, and sanitizes it
      html: message.hasHTML ? { body: message.html as any } : undefined,
    });
    message.sent = new Date();
    message.received = new Date();
    message.deliveryStatus = DeliveryStatus.Server;
    this.lastMessage = message;
    await this.saveNewMessages([message]);
  }

  /** Saves new messages to our DB */
  async saveNewMessages(messages: RoomMessage[]): Promise<void> {
    if (!this.account.storage) {
      return;
    }
    if (!this.dbID) {
      await this.save();
    }
    for (let msg of messages) {
      try {
        await this.account.storage.saveMessage(msg);
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }

  /** Shows the messages from our DB, then gets new messages from the
   * server archive (XEP-0313), skipping those already in our DB. */
  async listMessages(): Promise<void> {
    let lock = await this.syncLock.lock();
    try {
      await this.readMessagesFromDB();
      if (!this.account.isLoggedIn || !this.account.hasMAM) {
        return;
      }
      if (this.syncState) {
        await this.listNewMessages();
      } else {
        await this.listAllMessages();
      }
    } finally {
      lock.release();
    }
  }

  protected async readMessagesFromDB(): Promise<void> {
    if (this.messages.hasItems || !this.dbID) {
      return;
    }
    await SQLChatMessage.readAll(this);
    this.lastMessage = this.messages.contents
      .filter((msg): msg is ChatMessage => msg instanceof ChatMessage)
      .reduce((last, msg) => !last || msg.sent > last.sent ? msg : last, null);
  }

  /** First sync: Gets all messages of this chat from the server archive,
   * oldest first, in batches. */
  protected async listAllMessages(): Promise<void> {
    await this.listMessagesAfter(null);
  }

  /** Gets only the messages that are newer than the newest one in our DB.
   * The server skips everything older, so this is fast and cheap. */
  protected async listNewMessages(): Promise<void> {
    await this.listMessagesAfter(this.syncState);
  }

  /** Pages forward through the server archive, in batches:
   * after the given archive ID, or from the start of the archive.
   * Saves each batch, and updates `syncState` at the end. */
  protected async listMessagesAfter(after: string | null): Promise<void> {
    while (true) {
      let result = await this.searchArchive({ max: kBatchSize, after: after || undefined });
      if (!result) { // `after` is too old: the server forgot that message
        if (!after) {
          break;
        }
        this.syncState = null;
        after = null; // restart from the beginning; dedup skips what we have
        continue;
      }
      let newMessages = this.parseMessages(result.results);
      await this.saveNewMessages(newMessages.contents);
      after = sanitize.nonemptystring(result.paging?.last, null) ?? after;
      if (sanitize.boolean(result.complete, false) || !result.results?.length) {
        break;
      }
    }
    if (after && after != this.syncState) {
      this.syncState = after;
      await this.save();
    }
  }

  /** Asks the server archive about this 1:1 chat.
   * Group chats ask the room instead. */
  protected async queryArchive(paging: Paging): Promise<MAMFin> {
    return await this.account.client.searchHistory({
      with: this.id,
      paging: paging,
    });
  }

  /** @returns null, if the paging window is gone on the server */
  protected async searchArchive(paging: Paging): Promise<MAMFin | null> {
    try {
      return await this.queryArchive(paging);
    } catch (errIQ) {
      let condition = sanitize.alphanumdash(errIQ?.error?.condition, "");
      if (condition == "item-not-found") {
        return null;
      }
      if (condition == "service-unavailable" || condition == "feature-not-implemented") {
        this.account.hasMAM = false;
      }
      if (errIQ instanceof Error) {
        throw errIQ;
      }
      throw new Error(gt`Failed to get the chat history of ${this.name}: ${condition || JSON.stringify(errIQ)}`);
    }
  }

  protected parseMessages(results: MAMResult[] = []): ArrayColl<XMPPChatMessage> {
    let newMessages = new ArrayColl<XMPPChatMessage>();
    for (let result of results) {
      try {
        let msg = this.addMessage(result.item?.message, result.item, result.id);
        if (msg) {
          newMessages.add(msg);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
    // results within a MAM page are in chronological order
    let newest = newMessages.last;
    if (newest && (!this.lastMessage || newest.sent >= this.lastMessage.sent)) {
      this.lastMessage = newest;
    }
    return newMessages;
  }

  newMessage(): XMPPChatMessage {
    return new XMPPChatMessage(this);
  }

  newRoomEvent(kind?: RoomEventKind): ChatRoomEvent {
    if (kind && kind != RoomEventKind.Generic) {
      return super.newRoomEvent(kind);
    }
    return new XMPPRoomEvent(this);
  }
}
