import type { EMail } from "../../../logic/Mail/EMail";
import { SpecialFolder } from "../../../logic/Mail/Folder";
import { personDisplayName } from "../../../logic/Abstract/PersonUID";

export class ListName {
  static showsRecipient(message: EMail): boolean {
    let specialFolder = message.folder?.specialFolder;
    return specialFolder == SpecialFolder.Sent || specialFolder == SpecialFolder.Drafts || specialFolder == SpecialFolder.Outbox;
  }

  static of(message: EMail): string {
    let person = ListName.showsRecipient(message) ? message.contact : message.from;
    return personDisplayName(person) || message.from?.emailAddress || "";
  }
}
