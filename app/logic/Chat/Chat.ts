import type { Contact } from "../Abstract/Contact";
import { ChatMessage, DeliveryStatus, UserChatMessage } from "./Message";
import { ArrayColl } from 'svelte-collections';
import { Observable, notifyChangedProperty } from "../util/Observable";

export class Chat extends Observable {
  /** Protocol-specific ID. For Matrix, it's the event_id */
  id: string;
  @notifyChangedProperty
  contact: Contact;
  readonly messages = new ArrayColl<ChatMessage>();
  @notifyChangedProperty
  lastMessage: ChatMessage = null; // Calculating this would be very slow
  /** Message that our user is currently composing, to this chat room */
  @notifyChangedProperty
  draftMessage: string;

  get name(): string {
    return this.contact.name;
  }
  get picture(): string {
    return this.contact.picture;
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.push(message);
    throw new Error("not implemented for this protocol");
  }
}
