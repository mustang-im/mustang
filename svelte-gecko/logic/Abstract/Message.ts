import type { Contact } from "./Contact";

export class Message {
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

  /** Plaintext version of the message */
  text: string;
  /** HTML version of the message */
  html: string;
}
