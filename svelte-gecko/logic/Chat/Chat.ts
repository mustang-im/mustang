import type { Contact } from "../Abstract/Contact";
import type { ChatMessage } from "./Message";
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
}
