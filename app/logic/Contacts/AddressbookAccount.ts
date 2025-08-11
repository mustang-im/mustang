import { Account } from "../Abstract/Account";
import type { Addressbook } from "./Addressbook";
import type { Person } from "../Abstract/Person";
import type { Group } from "../Abstract/Group";
import { appGlobal } from "../app";
import { ArrayColl } from "svelte-collections";

export abstract class AddressbookAccount extends Account {
  readonly protocol: string = "addressbook-account";
  storage: AddressbookStorage | null = null;
  readonly addressbooks = new ArrayColl<Addressbook>();

  abstract listAddressbooks(): Promise<void>;

  /**
   * @param duplicates Include those that are already known locally
   */
  abstract listAddressbooksOnServer(duplicates: boolean): Promise<ArrayColl<Addressbook>>;

  async save(): Promise<void> {
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteAccount(this);
    appGlobal.addressbookAccounts.remove(this);
  }
}

export interface AddressbookStorage {
  savePerson(person: Person): Promise<void>;
  deletePerson(person: Person): Promise<void>;
  saveGroup(group: Group): Promise<void>;
  deleteGroup(group: Group): Promise<void>;
  saveAddressbook(addressbook: Addressbook): Promise<void>;
  deleteAddressbook(addressbook: Addressbook): Promise<void>;
  saveAccount(account: AddressbookAccount): Promise<void>;
  deleteAccount(account: AddressbookAccount): Promise<void>;
}
