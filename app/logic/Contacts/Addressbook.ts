import { Account } from "../Abstract/Account";
import { Person } from "../Abstract/Person";
import { Group } from "../Abstract/Group";
import type { Contact } from "../Abstract/Contact";
import { appGlobal } from "../app";
import { ArrayColl, Collection, mergeColl } from "svelte-collections";

export class Addressbook extends Account {
  readonly protocol: string = "addressbook-local";
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

  async save(): Promise<void> {
    await this.storage?.saveAddressbook(this);
  }

  async deleteIt(): Promise<void> {
    await this.storage?.deleteAddressbook(this);
    appGlobal.addressbooks.remove(this);
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
