/** A Signal chat message. Mirrors `XMPPChatMessage`: it is the `ChatMessage` the
 * UI renders, plus Signal-specific identity (the sender-timestamp that Signal uses
 * to reference messages for reactions/edits/deletes/receipts). */
import { ChatMessage } from "../Message";
import type { ChatRoom } from "../ChatRoom";

export class SignalChatMessage extends ChatMessage {
  /** Signal references messages by their sender's send timestamp (ms). This is the
   * `timestamp` in DataMessage and the target of reactions/edits/deletes/receipts. */
  sentTimestamp: number;
  /** True once a remote-delete (DataMessage.delete) tombstoned this message. */
  deleted = false;
  /** True once an EditMessage replaced this message's content. */
  edited = false;
  /** Whether this message was delivered sealed-sender (no server-visible sender). */
  sealedSender = false;

  constructor(room: ChatRoom) {
    super(room);
  }

  /** Sets `sentTimestamp` and uses it as the message `id` (Signal's message key). */
  setSentTimestamp(timestamp: number): void {
    this.sentTimestamp = timestamp;
    this.id = String(timestamp);
  }
}
