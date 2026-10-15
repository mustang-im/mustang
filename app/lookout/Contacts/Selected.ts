import type { Addressbook } from "../../logic/Contacts/Addressbook";
import type { Contact } from "../../logic/Abstract/Contact";
import { writable } from "svelte/store";

export const selectedAddressbook = writable<Addressbook | null>(null);
export const selectedContact = writable<Contact | null>(null);
