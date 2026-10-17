import type { Addressbook } from "../../../logic/Contacts/Addressbook";
import type { ContactView } from "../Person/ContactColumns";
import { writable } from "svelte/store";

export type ContactDialog =
  { kind: "addressbook-properties", addressbook: Addressbook } |
  { kind: "rename-addressbook", addressbook: Addressbook } |
  { kind: "show-columns", view: ContactView } |
  { kind: "view-settings", view: ContactView };

export class ContactDialogs {
  static readonly current = writable<ContactDialog | null>(null);

  static open(dialog: ContactDialog) {
    ContactDialogs.current.set(dialog);
  }

  static close() {
    ContactDialogs.current.set(null);
  }
}
