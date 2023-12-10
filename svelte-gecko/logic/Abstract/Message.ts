import { MapColl } from "svelte-collections";
import type { Contact } from "./Contact";
import type { Person } from "./Person";

export class Message {
  /** protocol-specific ID for this message.
   * Allows for reactions, corrections etc. */
  id: string;
  outgoing = false;
  /**
   * Who this message was exchanged with.
   * if outgoing = true, this is the recipient, otherwise the sender
   */
  contact: Contact;
  /** When the message was sent */
  sent: Date;
  /** When the message was received */
  received: Date;
  read = false;
  starred = false;

  /** Plaintext version of the message */
  text: string;
  /** HTML version of the message */
  html: string;

  reactions = new MapColl<Person, string>();
}
