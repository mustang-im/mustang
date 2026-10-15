import type { EMail } from "../../../logic/Mail/EMail";
import type { Person, ContactEntry } from "../../../logic/Abstract/Person";
import type { Addressbook } from "../../../logic/Contacts/Addressbook";
import { PersonUID } from "../../../logic/Abstract/PersonUID";
import { ArrayColl, mergeColls, type Collection } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export enum RecipientField {
  To = "to",
  Cc = "cc",
  Bcc = "bcc",
}

export type Recipients = Pick<EMail, "to" | "cc" | "bcc">;

export class SelectNamesField {
  readonly picks: ArrayColl<PersonUID>;

  constructor(readonly label: string, initial: PersonUID[] = [], readonly single = false) {
    this.picks = new ArrayColl(initial);
  }

  add(persons: Iterable<Person>) {
    for (let person of persons) {
      let entry = SelectNames.preferredEMail(person);
      if (!entry?.value || this.picks.some(pick => pick.emailAddress == entry.value)) {
        continue;
      }
      let pick = PersonUID.fromContactEntry(person, entry);
      if (this.single) {
        this.picks.replaceAll([pick]);
        return;
      }
      this.picks.add(pick);
    }
  }

  remove(recipient: PersonUID) {
    this.picks.remove(recipient);
  }
}

export class SelectNames {
  protected readonly fieldOf: Record<RecipientField, SelectNamesField>;

  constructor(recipients: Recipients) {
    this.fieldOf = {
      [RecipientField.To]: new SelectNamesField(gt`To`, recipients.to.contents),
      [RecipientField.Cc]: new SelectNamesField(gt`Cc`, recipients.cc.contents),
      [RecipientField.Bcc]: new SelectNamesField(gt`Bcc`, recipients.bcc.contents),
    };
  }

  get fields(): SelectNamesField[] {
    return Object.values(this.fieldOf);
  }

  field(kind: RecipientField): SelectNamesField {
    return this.fieldOf[kind];
  }

  static persons(addressbooks: Iterable<Addressbook>, searchTerm: string, nameOnly = false): Collection<Person> {
    let term = searchTerm.trim().toLowerCase();
    let results = new ArrayColl<Collection<Person>>();
    for (let addressbook of addressbooks) {
      results.add(term ? addressbook.quickSearch(term, !nameOnly) : addressbook.persons);
    }
    return mergeColls(results)
      .filterObservable(person => person.emailAddresses.hasItems &&
        (!nameOnly || !term || !!person.name?.toLowerCase().includes(term)))
      .sortBy(person => person.name?.toLowerCase() ?? "");
  }

  static preferredEMail(person: Person): ContactEntry | null {
    return person.emailAddresses.sortBy(entry => entry.preference).first ?? null;
  }

  static businessPhone(person: Person): string {
    let phones = person.phoneNumbers.sortBy(entry => entry.preference);
    return (phones.find(entry => entry.purpose == "work") ?? phones.first)?.value ?? "";
  }

  apply(recipients: Recipients) {
    recipients.to.replaceAll(this.fieldOf[RecipientField.To].picks.contents);
    recipients.cc.replaceAll(this.fieldOf[RecipientField.Cc].picks.contents);
    recipients.bcc.replaceAll(this.fieldOf[RecipientField.Bcc].picks.contents);
  }
}
