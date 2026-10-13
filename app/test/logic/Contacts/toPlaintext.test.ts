import { expect, test } from "vitest";
import { appGlobal } from "../../../logic/app.ts"; // defeats circular import
import { ContactEntry, Person } from "../../../logic/Abstract/Person";
import { StreetAddress } from "../../../logic/Contacts/StreetAddress";

test("Contact as plaintext", () => {
  let person = new Person();
  person.name = "Joe Bloggs";
  person.position = "Manager";
  person.department = "Management";
  person.company = "Example";
  person.notes = "Do Re Mi Fa So La Ti Do";
  person.emailAddresses.add(new ContactEntry("joe@example.org", "work"));
  person.emailAddresses.add(new ContactEntry("joe.bloggs@example.com", "home"));
  person.chatAccounts.add(new ContactEntry("@joe:example.org", null, "matrix"));
  person.phoneNumbers.add(new ContactEntry("0123456789", "mobile"));
  let address = new StreetAddress();
  address.street = "Main Street 1";
  address.postalCode = "12345";
  address.city = "Springfield";
  address.state = "IL";
  address.country = "USA";
  person.streetAddresses.add(new ContactEntry(address.toString(), "work"));
  person.urls.add(new ContactEntry("https://example.org/joe.bloggs/", "work"));
  person.groups.add(new ContactEntry("Managers"));

  expect(person.toPlaintext()).toEqual(`Joe Bloggs
Manager
Management
Example

Mail
Work: joe@example.org
Home: joe.bloggs@example.com

Chat
@joe:example.org

Phone numbers
Mobile: 0123456789

Street address
Work:
Main Street 1
12345 Springfield, IL
USA

Website
Work: https://example.org/joe.bloggs/

Groups
Managers
`);
});

test("Contact with only a name as plaintext", () => {
  let person = new Person();
  person.name = "Joe Bloggs";

  expect(person.toPlaintext()).toEqual("Joe Bloggs\n");
});
