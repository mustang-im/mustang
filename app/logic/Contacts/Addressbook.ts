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

  /** Person class needs to match account class, so need to clone.
   * @returns the new Person object */
  async movePersonHere(person: Person): Promise<Person> {
    let newPerson = this.newPerson();
    if (Object.getPrototypeOf(person) == Object.getPrototypeOf(newPerson)) {
      person.addressbook?.persons.remove(person);
      person.addressbook = this;
      this.persons.add(person);
      await person.save();
      return person;
    }
    newPerson.copyFrom(person);
    newPerson.addressbook = this;
    person.addressbook?.persons.remove(person);
    this.persons.add(newPerson);
    await person.deleteIt();
    await newPerson.save();
    return newPerson;
  }
  /** Group class needs to match account class, so need to clone.
   * @returns the new Group object */
  async moveGroupHere(group: Group): Promise<Group> {
    let newGroup = this.newGroup();
    if (Object.getPrototypeOf(group) == Object.getPrototypeOf(newGroup)) {
      group.addressbook?.groups.remove(group);
      group.addressbook = this;
      this.groups.add(group);
      return group;
    }
    Object.assign(newGroup, group);
    newGroup.addressbook = this;
    group.addressbook?.groups.remove(group);
    this.groups.add(newGroup);
    await group.deleteIt();
    await newGroup.save();
    return newGroup;
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
