import { ContactSlots } from "../../Contacts/Form/ContactSlots";
import { ContactEntry } from "../../../logic/Abstract/Person";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

function phones(): ArrayColl<ContactEntry> {
  return new ArrayColl<ContactEntry>([
    new ContactEntry("111", "work", "tel"),
    new ContactEntry("222", "home", null),
    new ContactEntry("333", "work", "fax"),
    new ContactEntry("444", "work", "tel"),
    new ContactEntry("555", "mobile", "tel"),
  ]);
}

test("Phone slots find the n-th number of their purpose, faxes separately", () => {
  let entries = phones();
  expect(ContactSlots.phoneSlot("business").valueIn(entries)).toBe("111");
  expect(ContactSlots.phoneSlot("business2").valueIn(entries)).toBe("444");
  expect(ContactSlots.phoneSlot("business-fax").valueIn(entries)).toBe("333");
  expect(ContactSlots.phoneSlot("home").valueIn(entries)).toBe("222");
  expect(ContactSlots.phoneSlot("mobile").valueIn(entries)).toBe("555");
  expect(ContactSlots.phoneSlot("home-fax").valueIn(entries)).toBe("");
});

test("Typing into an empty slot adds an entry with the slot's purpose", () => {
  let entries = phones();
  let slot = ContactSlots.phoneSlot("home-fax").setValueIn(entries, " 666 ", ContactSlots.phoneSlots);
  expect(slot.id).toBe("home-fax");
  let added = entries.last;
  expect(added.value).toBe("666");
  expect(added.purpose).toBe("home");
  expect(added.protocol).toBe("fax");
});

test("A second number without a first one moves to the first slot", () => {
  let entries = new ArrayColl<ContactEntry>();
  let slot = ContactSlots.phoneSlot("business2").setValueIn(entries, "777", ContactSlots.phoneSlots);
  expect(slot.id).toBe("business");
  expect(entries.length).toBe(1);
});

test("Clearing a slot removes its entry, changing it keeps the entry", () => {
  let entries = phones();
  let business = entries.first;
  ContactSlots.phoneSlot("business").setValueIn(entries, "999", ContactSlots.phoneSlots);
  expect(business.value).toBe("999");
  ContactSlots.phoneSlot("business").setValueIn(entries, "", ContactSlots.phoneSlots);
  expect(entries.contains(business)).toBe(false);
  expect(ContactSlots.phoneSlot("business").valueIn(entries)).toBe("444");
});

test("E-mail slots take the addresses in their order, whatever their purpose", () => {
  let entries = new ArrayColl<ContactEntry>([
    new ContactEntry("a@example.com", "home"),
    new ContactEntry("b@example.com", "work"),
  ]);
  expect(ContactSlots.emailSlots[0].valueIn(entries)).toBe("a@example.com");
  expect(ContactSlots.emailSlots[1].valueIn(entries)).toBe("b@example.com");
  let slot = ContactSlots.emailSlots[2].setValueIn(entries, "c@example.com", ContactSlots.emailSlots);
  expect(slot.id).toBe("email3");
  expect(ContactSlots.slotOf(entries.last, entries, ContactSlots.emailSlots).id).toBe("email3");
});

test("Entries beyond the slots have no slot", () => {
  let entries = phones();
  entries.add(new ContactEntry("888", "work", "tel"));
  expect(ContactSlots.slotOf(entries.last, entries, ContactSlots.phoneSlots)).toBe(null);
  expect(ContactSlots.slotOf(entries.first, entries, ContactSlots.phoneSlots).id).toBe("business");
});
