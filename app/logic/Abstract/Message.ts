import type { Contact } from "./Contact";
import type { Person } from "./Person";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { MapColl } from "svelte-collections";

export class Message extends Observable {
  /** protocol-specific ID for this message.
   * Allows for reactions, corrections etc. */
  id: string;
  outgoing = false;
  /**
   * Who this message was exchanged with.
   * if outgoing = true, this is the recipient, otherwise the sender
   */
  @notifyChangedProperty
  contact: Contact;
  /** When the message was sent */
  @notifyChangedProperty
  sent: Date;
  /** When the message was received */
  @notifyChangedProperty
  received: Date;
  @notifyChangedProperty
  read = false;
  @notifyChangedProperty
  starred = false;

  /** Plaintext version of the message */
  @notifyChangedProperty
  text: string;
  /** HTML version of the message */
  @notifyChangedProperty
  html: string;

  readonly reactions = new MapColl<Person, string>();
}
