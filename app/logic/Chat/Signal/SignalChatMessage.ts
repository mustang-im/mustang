/** A Signal chat message. Mirrors `XMPPChatMessage`: it is the `ChatMessage` the
 * UI renders, plus Signal-specific identity (the sender-timestamp that Signal uses
 * to reference messages for reactions/edits/deletes/receipts). */
import { ChatMessage, DeliveryStatus } from "../Message";
import type { SignalChatRoom } from "./SignalChatRoom";
import type { SignalContact } from "./SignalContact";
import type { DataMessage } from "./Proto/signalService";

export class SignalChatMessage extends ChatMessage {
  declare to: SignalChatRoom;

  /** True once a remote-delete (DataMessage.delete) tombstoned this message. */
  deleted = false;
  /** True once an EditMessage replaced this message's content. */
  edited = false;
  /** Whether this message was delivered sealed-sender (no server-visible sender). */
  sealedSender = false;

  constructor(room: SignalChatRoom) {
    super(room);
  }

  fromSignal(data: DataMessage, sender: SignalContact, isOutgoing: boolean) {
    let account = this.to.account;
    this.setSentTimestamp(data.timestamp ?? Date.now());
    this.outgoing = isOutgoing;
    this.from = isOutgoing ? account.getOwnContact() : sender;
    this.contact = this.contact;
    this.text = data.body ?? "";
    this.sent = new Date(data.timestamp ?? Date.now());
    this.received = new Date();
    this.deliveryStatus = isOutgoing ? DeliveryStatus.Server : DeliveryStatus.User;

    for (let attachment of data.attachments ?? []) {
      account.media.downloadOne(this, attachment)
        // download + decrypt in the background
        .catch(ex => account.errorCallback(ex));
    }
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
