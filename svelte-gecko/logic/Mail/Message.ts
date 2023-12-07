import { Message } from "../Abstract/Message";
import type { Person } from "../Abstract/Person";
import { MapColl } from "svelte-collections";

export class EMail extends Message {
  authorEmailAddress: string;
  subject: string;
  to = new MapColl<string, Person>(); /** email address -> Person (not necessarily in address book) */
  cc = new MapColl<string, Person>(); /** format like `to` */
  bcc = new MapColl<string, Person>(); /** format like `to` */
  contentType: string;
  _bodyPlaintext: string;
}
