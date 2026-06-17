/** A Signal chat message. Mirrors `XMPPChatMessage`: it is the `ChatMessage` the
 * UI renders, plus Signal-specific identity (the sender-timestamp that Signal uses
 * to reference messages for reactions/edits/deletes/receipts). */
import { ChatMessage } from "../Message";
import type { ChatRoom } from "../ChatRoom";

export class SignalChatMessage extends ChatMessage {
  /** True once a remote-delete (DataMessage.delete) tombstoned this message. */
  deleted = false;
  /** True once an EditMessage replaced this message's content. */
  edited = false;
  /** Whether this message was delivered sealed-sender (no server-visible sender). */
  sealedSender = false;

  constructor(room: ChatRoom) {
    super(room);
  }

  /** Signal references messages by their sender's send timestamp (ms) — the
   * `timestamp` in DataMessage and the target of reactions/edits/deletes/receipts.
   * It is also the message `id` (which the DB persists/restores), so derive it from
   * `id` rather than a separate field the SQL layer would not restore. */
  get sentTimestamp(): number {
    return Number(this.id);
  }
  set sentTimestamp(timestamp: number) {
    this.id = String(timestamp);
  }

  /** Sets `sentTimestamp` and uses it as the message `id` (Signal's message key). */
  setSentTimestamp(timestamp: number): void {
    this.id = String(timestamp);
  }

  override toExtraJSON(): any {
    return { deleted: this.deleted, edited: this.edited, sealedSender: this.sealedSender };
  }
  override fromExtraJSON(json: any): void {
    this.deleted = !!json?.deleted;
    this.edited = !!json?.edited;
    this.sealedSender = !!json?.sealedSender;
  }
}
