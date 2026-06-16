/** Base class for Signal chat rooms (1:1 and group). Mirrors `XMPPChat`: it
 * interprets a decrypted `Content` (a new message, or a reaction / edit / remote
 * delete / receipt / typing for an existing one), sends outgoing messages and
 * their side-channels, and loads history from the DB then the server. The wire
 * encryption + transport live on `SignalAccount`; the room is protocol-shaped but
 * crypto-free. */
import { ChatRoom } from "../ChatRoom";
import { ChatMessage, DeliveryStatus, type RoomMessage } from "../Message";
import { SignalChatMessage } from "./SignalChatMessage";
import { SignalContact } from "./SignalContact";
import type { SignalAccount } from "./SignalAccount";
import type { ServiceId } from "./ServiceId";
import { SQLChatMessage } from "../SQL/SQLChatMessage";
import { Lock } from "../../util/flow/Lock";
import { gt } from "../../../l10n/l10n";
import type { Content, DataMessage } from "./Proto/signalService";
import { ReceiptType, TypingAction } from "./Proto/signalService";
import { ArrayColl } from "svelte-collections";

export class SignalChatRoom extends ChatRoom {
  declare account: SignalAccount;
  declare readonly members: ArrayColl<SignalContact>;

  /** The other side is currently typing (TypingMessage). */
  contactIsTyping = false;
  /** Disappearing-message timer in seconds (0 = off), and its version. */
  expireTimer = 0;
  expireTimerVersion = 1;
  /** Serializes DB-load and server history sync. */
  protected readonly syncLock = new Lock();

  /** The recipients a message to this room must be sent to (their ServiceIds).
   * 1:1 → the partner; group → every member. Subclasses implement. */
  recipients(): ServiceId[] {
    throw new Error("abstract");
  }

  newMessage(): SignalChatMessage {
    return new SignalChatMessage(this);
  }

  // --- receiving (called by SignalAccount after decrypting an Envelope) ---

  /** Interpret a decrypted Content from `sender` at `serverTimestamp`. Applies a
   * side-channel (reaction/edit/delete/receipt/typing) to an existing message, or
   * returns a new message for the account to store. */
  async handleContent(content: Content, sender: SignalContact, outgoing: boolean): Promise<SignalChatMessage | null> {
    if (content.receiptMessage) {
      this.applyReceipt(content.receiptMessage, sender);
      return null;
    }
    if (content.typingMessage) {
      this.contactIsTyping = content.typingMessage.action == TypingAction.Started;
      return null;
    }
    if (content.editMessage?.dataMessage) {
      this.applyEdit(content.editMessage.targetSentTimestamp!, content.editMessage.dataMessage);
      return null;
    }
    let data = content.dataMessage;
    if (!data) {
      return null;
    }
    if (data.reaction) {
      this.applyReaction(data.reaction, sender);
      return null;
    }
    if (data.delete) {
      this.applyDelete(data.delete.targetSentTimestamp!);
      return null;
    }
    if (data.flags && (data.flags & 2)) { // EXPIRATION_TIMER_UPDATE
      this.expireTimer = data.expireTimer ?? 0;
      this.expireTimerVersion = data.expireTimerVersion ?? this.expireTimerVersion;
      return null;
    }
    if (!data.body && !data.attachments?.length) {
      return null; // nothing to show (e.g. a profile-key update)
    }
    return this.buildMessage(data, sender, outgoing);
  }

  protected buildMessage(data: DataMessage, sender: SignalContact, outgoing: boolean): SignalChatMessage {
    let msg = this.newMessage();
    msg.setSentTimestamp(data.timestamp ?? Date.now());
    msg.outgoing = outgoing;
    msg.from = outgoing ? this.account.getOwnContact() : sender;
    msg.contact = this.contact;
    msg.text = data.body ?? "";
    msg.sent = new Date(data.timestamp ?? Date.now());
    msg.received = new Date();
    msg.deliveryStatus = outgoing ? DeliveryStatus.Server : DeliveryStatus.User;
    this.account.media.addAttachments(msg, data); // download + decrypt in the background
    this.messages.add(msg);
    return msg;
  }

  protected findBySentTimestamp(timestamp: number): SignalChatMessage | undefined {
    return this.messages.contents.find(
      (m): m is SignalChatMessage => m instanceof SignalChatMessage && m.sentTimestamp == timestamp);
  }

  protected applyReaction(reaction: NonNullable<DataMessage["reaction"]>, sender: SignalContact): void {
    let target = this.findBySentTimestamp(reaction.targetSentTimestamp!);
    if (!target) {
      return;
    }
    if (reaction.remove) {
      target.reactions.delete(sender);
    } else if (reaction.emoji) {
      target.reactions.set(sender, reaction.emoji);
    }
    this.account.storage?.saveMessage(target).catch(this.account.errorCallback);
  }

  protected applyDelete(targetSentTimestamp: number): void {
    let target = this.findBySentTimestamp(targetSentTimestamp);
    if (!target) {
      return;
    }
    target.deleted = true;
    target.text = gt`This message was deleted`;
    this.account.storage?.saveMessage(target).catch(this.account.errorCallback);
  }

  protected applyEdit(targetSentTimestamp: number, data: DataMessage): void {
    let target = this.findBySentTimestamp(targetSentTimestamp);
    if (!target) {
      return;
    }
    target.text = data.body ?? "";
    target.edited = true;
    this.account.storage?.saveMessage(target).catch(this.account.errorCallback);
  }

  /** Mark our outgoing message with this sent-timestamp as seen — used by a
   * `SyncMessage.Read` from another linked device (SignalAccount.handleSyncRead). */
  markSentMessageRead(sentTimestamp: number): void {
    let target = this.findBySentTimestamp(sentTimestamp);
    if (target instanceof ChatMessage && target.outgoing) {
      target.deliveryStatus = DeliveryStatus.Seen;
      this.account.storage?.saveMessage(target).catch(this.account.errorCallback);
    }
  }

  protected applyReceipt(receipt: NonNullable<Content["receiptMessage"]>, sender: SignalContact): void {
    let status = receipt.type == ReceiptType.Read || receipt.type == ReceiptType.Viewed
      ? DeliveryStatus.Seen : DeliveryStatus.User;
    for (let ts of receipt.timestamp ?? []) {
      let target = this.findBySentTimestamp(ts);
      if (target instanceof ChatMessage && target.outgoing) {
        target.deliveryStatus = status;
      }
    }
  }

  // --- sending ---

  async sendMessage(message: ChatMessage): Promise<void> {
    let msg = message as SignalChatMessage;
    if (!msg.sentTimestamp) {
      msg.setSentTimestamp(Date.now());
    }
    msg.from ??= this.account.getOwnContact();
    msg.contact = this.contact;
    msg.deliveryStatus = DeliveryStatus.Sending;
    if (!this.messages.contents.includes(msg)) {
      this.messages.add(msg);
    }
    let attachments = await this.account.media.uploadAll(msg.attachments.contents);
    let data: DataMessage = {
      body: msg.text || undefined,
      timestamp: msg.sentTimestamp,
      attachments: attachments.length ? attachments : undefined,
      expireTimer: this.expireTimer || undefined,
      expireTimerVersion: this.expireTimer ? this.expireTimerVersion : undefined,
      groupV2: this.groupContext(),
    };
    await this.account.sendContent(this.recipients(), { dataMessage: data }, msg.sentTimestamp);
    msg.sent = new Date();
    msg.received = new Date();
    msg.deliveryStatus = DeliveryStatus.Server;
    this.lastMessage = msg;
    await this.saveNewMessages([msg]);
  }

  async sendReaction(target: ChatMessage, emoji: string, remove = false): Promise<void> {
    let t = target as SignalChatMessage;
    let data: DataMessage = {
      timestamp: Date.now(),
      groupV2: this.groupContext(),
      reaction: {
        emoji, remove,
        targetAuthorAci: (t.from as SignalContact)?.serviceId?.uuidString(),
        targetSentTimestamp: t.sentTimestamp,
      },
    };
    await this.account.sendContent(this.recipients(), { dataMessage: data }, data.timestamp!);
    let me = this.account.getOwnContact();
    remove ? target.reactions.delete(me) : target.reactions.set(me, emoji);
    await this.account.storage?.saveMessage(target);
  }

  async sendCorrection(target: ChatMessage, newText: string): Promise<void> {
    let t = target as SignalChatMessage;
    let data: DataMessage = { body: newText, timestamp: Date.now(), groupV2: this.groupContext() };
    await this.account.sendContent(this.recipients(),
      { editMessage: { targetSentTimestamp: t.sentTimestamp, dataMessage: data } }, data.timestamp!);
    target.text = newText;
    t.edited = true;
    await this.account.storage?.saveMessage(target);
  }

  async sendRetraction(target: ChatMessage): Promise<void> {
    let t = target as SignalChatMessage;
    let data: DataMessage = {
      timestamp: Date.now(),
      groupV2: this.groupContext(),
      delete: { targetSentTimestamp: t.sentTimestamp },
    };
    await this.account.sendContent(this.recipients(), { dataMessage: data }, data.timestamp!);
    t.deleted = true;
    target.text = gt`This message was deleted`;
    await this.account.storage?.saveMessage(target);
  }

  /** Read receipt for a received message (ReceiptMessage type READ). */
  async sendReadReceipt(message: ChatMessage): Promise<void> {
    let t = message as SignalChatMessage;
    if (t.outgoing) {
      return;
    }
    let from = (t.from as SignalContact)?.serviceId;
    if (from) {
      await this.account.sendContent([from],
        { receiptMessage: { type: ReceiptType.Read, timestamp: [t.sentTimestamp] } }, Date.now());
    }
  }

  sendTyping(started: boolean): void {
    this.account.sendContent(this.recipients(), {
      typingMessage: { timestamp: Date.now(), action: started ? TypingAction.Started : TypingAction.Stopped, groupId: this.typingGroupId() },
    }, Date.now()).catch(() => undefined);
  }

  /** The groupV2 context to attach to outgoing messages (group rooms override). */
  protected groupContext(): DataMessage["groupV2"] {
    return undefined;
  }

  /** The group id for TypingMessage (group rooms override). */
  protected typingGroupId(): Uint8Array | undefined {
    return undefined;
  }

  // --- persistence + history ---

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

  async listMessages(): Promise<void> {
    let lock = await this.syncLock.lock();
    try {
      await this.readMessagesFromDB();
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
      .filter((m): m is ChatMessage => m instanceof ChatMessage)
      .reduce((last, m) => !last || m.sent > last.sent ? m : last, null as ChatMessage | null);
  }
}
