import type { Contact } from "../../../logic/Abstract/Contact";
import type { ArrayColl } from "svelte-collections";

export class ContactSelection {
  static click(event: MouseEvent, contact: Contact, selected: ArrayColl<Contact>) {
    if (event.ctrlKey || event.metaKey) {
      if (selected.contains(contact)) {
        selected.remove(contact);
      } else {
        selected.add(contact);
      }
      return;
    }
    selected.replaceAll([contact]);
  }
}
