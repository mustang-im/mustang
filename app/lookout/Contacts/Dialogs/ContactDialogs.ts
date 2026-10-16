import type { Addressbook } from "../../../logic/Contacts/Addressbook";
import { writable } from "svelte/store";

export type ContactDialog =
  { kind: "addressbook-properties", addressbook: Addressbook } |
  { kind: "rename-addressbook", addressbook: Addressbook };

export class ContactDialogs {
  static readonly current = writable<ContactDialog | null>(null);

  static open(dialog: ContactDialog) {
    ContactDialogs.current.set(dialog);
  }

  static close() {
    ContactDialogs.current.set(null);
  }
}
