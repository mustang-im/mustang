import { Account } from "../Abstract/Account";
import { Person } from "../Abstract/Person";
import { Group } from "../Abstract/Group";
import type { Contact } from "../Abstract/Contact";
import { appGlobal } from "../app";
import { ArrayColl, Collection, mergeColl } from "svelte-collections";

export class Addressbook extends Account {
  readonly protocol: string = "addressbook-local";
  canSync: boolean = false;
  readonly persons = new ArrayColl<Person>();
  readonly groups = new ArrayColl<Group>();
  readonly contacts: Collection<Contact> = mergeColl(this.persons as Collection<Contact>, this.groups as Collection<Contact>);
  storage: AddressbookStorage | null = null;
  syncState: string | null = null;

  newPerson(): Person {
    return new Person(this);
  }
  newGroup(): Group {
    return new Group(this);
  }

  async listContacts() {
  }

  quickSearch(searchTerm: string, fullSearch: boolean = false): Collection<Person> {
    if (!fullSearch) {
      return this.persons.filterOnce(p =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.emailAddresses.some(e => e.value.toLowerCase().includes(searchTerm)));
    }
    return this.persons.filter(p =>
      p.name?.toLowerCase().includes(searchTerm) ||
      p.emailAddresses.some(e => e.value.toLowerCase().includes(searchTerm)) ||
      p.phoneNumbers.some(e => e.value.toLowerCase().includes(searchTerm)) ||
      p.chatAccounts.some(e => e.value.toLowerCase().includes(searchTerm)) ||
      p.streetAddresses.some(e => e.value.toLowerCase().includes(searchTerm)) ||
      p.notes?.toLowerCase().includes(searchTerm));
  }

  quickSearchAsync(searchTerm: string, results: ArrayColl<Person>) {
    results.addAll(this.quickSearch(searchTerm));
  }

  async save(): Promise<void> {
    await this.storage?.saveAddressbook(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteAddressbook(this);
    appGlobal.addressbooks.remove(this);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.syncState = json.syncState;
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.syncState = this.syncState;
    return json;
  }
}

export interface AddressbookStorage {
  savePerson(person: Person): Promise<void>;
  deletePerson(person: Person): Promise<void>;
  saveGroup(group: Group): Promise<void>;
  deleteGroup(group: Group): Promise<void>;
  saveAddressbook(addressbook: Addressbook): Promise<void>;
  deleteAddressbook(addressbook: Addressbook): Promise<void>;
}
