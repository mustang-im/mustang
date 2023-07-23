import type { Contact } from "../Abstract/Contact";
import type { ChatMessage } from "./Message";
import { ArrayColl } from 'svelte-collections';

export class Chat {
  contact: Contact;
  messages = new ArrayColl<ChatMessage>();
}
