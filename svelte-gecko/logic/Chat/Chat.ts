import type { Contact } from "../Abstract/Contact";
import { ChatMessage, DeliveryStatus, UserChatMessage } from "./Message";
import { ArrayColl } from 'svelte-collections';

export class Chat {
  id: string; // Protocol-specific
  contact: Contact;
  messages = new ArrayColl<ChatMessage>();
  lastMessage = null; // Calculating this would be very slow
  /** Message that our user is currently composing, to this chat room */
  draftMessage: string;

  get name(): string {
    return this.contact.name;
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.push(message);
    throw new Error("not implemented for this protocol");
  }
}
