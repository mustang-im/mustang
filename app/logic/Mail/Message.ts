import { Message } from "../Abstract/Message";
import type { Person } from "../Abstract/Person";
import { notifyChangedProperty } from "../util/Observable";
import { MapColl } from "svelte-collections";

export class EMail extends Message {
  @notifyChangedProperty
  authorEmailAddress: string;
  @notifyChangedProperty
  subject: string;
  readonly to = new MapColl<string, Person>(); /** email address -> Person (not necessarily in address book) */
  readonly cc = new MapColl<string, Person>(); /** format like `to` */
  readonly bcc = new MapColl<string, Person>(); /** format like `to` */
  @notifyChangedProperty
  contentType: string;
  @notifyChangedProperty
  _bodyPlaintext: string;

  async deleteMessage() {
    console.log("Delete Email", this.subject);
  }
}
