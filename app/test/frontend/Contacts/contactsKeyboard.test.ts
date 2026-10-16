// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { ContactsKeyAction, ContactsKeyboard } from "../../../frontend/Contacts/ContactsKeyboard";
import { newPerson, selectedPerson } from "../../../frontend/Contacts/Person/Selected";
import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { get } from "svelte/store";
import { expect, test } from "vitest";

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, cancelable: true, bubbles: true, ...init });
}

test("Ctrl+N new contact, Ctrl+E search", () => {
  expect(ContactsKeyboard.actionFor(press("n", { ctrlKey: true }))).toBe(ContactsKeyAction.NewContact);
  expect(ContactsKeyboard.actionFor(press("N", { metaKey: true }))).toBe(ContactsKeyAction.NewContact);
  expect(ContactsKeyboard.actionFor(press("e", { ctrlKey: true }))).toBe(ContactsKeyAction.Search);
  expect(ContactsKeyboard.actionFor(press("n"))).toBeNull();
  expect(ContactsKeyboard.actionFor(press("N", { ctrlKey: true, shiftKey: true }))).toBeNull();
});

test("Ctrl+N creates a new contact in the shown addressbook", () => {
  let addressbook = new Addressbook();
  addressbook.name = "Test";
  appGlobal.addressbooks.add(addressbook);
  let event = press("n", { ctrlKey: true });
  ContactsKeyboard.onKey(event, addressbook);
  expect(event.defaultPrevented).toBe(true);
  let person = get(newPerson);
  expect(person).toBeTruthy();
  expect(person.addressbook).toBe(addressbook);
  expect(get(selectedPerson)).toBe(person);

  // A second Ctrl+N goes back to the unsaved new contact
  ContactsKeyboard.onKey(press("n", { ctrlKey: true }), addressbook);
  expect(get(newPerson)).toBe(person);
  newPerson.set(null);
  selectedPerson.set(null);
  appGlobal.addressbooks.remove(addressbook);
});

test("Ctrl+N in a text field is left to the field", () => {
  let input = document.createElement("input");
  document.body.append(input);
  let event = press("n", { ctrlKey: true });
  input.addEventListener("keydown", keyEvent => ContactsKeyboard.onKey(keyEvent, null));
  input.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(get(newPerson)).toBeFalsy();
  input.remove();
});
