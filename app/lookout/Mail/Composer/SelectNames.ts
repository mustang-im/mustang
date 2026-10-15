import type { EMail } from "../../../logic/Mail/EMail";
import type { Person, ContactEntry } from "../../../logic/Abstract/Person";
import type { Addressbook } from "../../../logic/Contacts/Addressbook";
import { PersonUID } from "../../../logic/Abstract/PersonUID";
import { ArrayColl, mergeColls, type Collection } from "svelte-collections";

export enum RecipientField {
  To = "to",
  Cc = "cc",
  Bcc = "bcc",
}

export type Recipients = Pick<EMail, "to" | "cc" | "bcc">;

export class SelectNames {
  readonly picks: Record<RecipientField, ArrayColl<PersonUID>>;

  constructor(recipients: Recipients) {
    this.picks = {
      [RecipientField.To]: new ArrayColl(recipients.to.contents),
      [RecipientField.Cc]: new ArrayColl(recipients.cc.contents),
      [RecipientField.Bcc]: new ArrayColl(recipients.bcc.contents),
    };
  }

  static persons(addressbooks: Iterable<Addressbook>, searchTerm: string): Collection<Person> {
    let term = searchTerm.trim().toLowerCase();
    let results = new ArrayColl<Collection<Person>>();
    for (let addressbook of addressbooks) {
      results.add(term ? addressbook.quickSearch(term) : addressbook.persons);
    }
    return mergeColls(results)
      .filterObservable(person => person.emailAddresses.hasItems)
      .sortBy(person => person.name?.toLowerCase() ?? "");
  }

  static preferredEMail(person: Person): ContactEntry | null {
    return person.emailAddresses.sortBy(entry => entry.preference).first ?? null;
  }

  add(field: RecipientField, persons: Iterable<Person>) {
    let picks = this.picks[field];
    for (let person of persons) {
      let entry = SelectNames.preferredEMail(person);
      if (!entry?.value || picks.some(pick => pick.emailAddress == entry.value)) {
        continue;
      }
      picks.add(PersonUID.fromContactEntry(person, entry));
    }
  }

  remove(field: RecipientField, recipient: PersonUID) {
    this.picks[field].remove(recipient);
  }

  apply(recipients: Recipients) {
    recipients.to.replaceAll(this.picks[RecipientField.To].contents);
    recipients.cc.replaceAll(this.picks[RecipientField.Cc].contents);
    recipients.bcc.replaceAll(this.picks[RecipientField.Bcc].contents);
  }
}
