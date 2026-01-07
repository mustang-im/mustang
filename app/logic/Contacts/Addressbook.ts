import { Account } from "../Abstract/Account";
import { Person } from "../Abstract/Person";
import { Group } from "../Abstract/Group";
import type { Contact } from "../Abstract/Contact";
import { SQLGroup } from "./SQL/SQLGroup";
import { appGlobal } from "../app";
import { gt } from "../../l10n/l10n";
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
    if (!this.dbID) {
      await this.save();
    }
    if (this.persons.isEmpty && this.groups.isEmpty) {
      SQLGroup.readAll(this); // also reads persons
    }
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

export enum AddressbookShareCombinedPermissions {
  /** Can see all contacts details, but not modify */
  Read = "read",
  /** Can see and modify all details of all contacts, and add and delete contacts */
  Modify = "modify",
}
export const addressbookShareCombinedPermissionsLabels: Record<string, string> = {
  [AddressbookShareCombinedPermissions.Read]: gt`See all contact details`,
  [AddressbookShareCombinedPermissions.Modify]: gt`Modify, add and delete contacts`,
};
