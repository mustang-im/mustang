import type { Addressbook, AddressbookStorage } from "../Addressbook";
import { SQLAddressbook } from "./SQLAddressbook";
import type { Person } from "../../Abstract/Person";
import { SQLPerson } from "./SQLPerson";
import type { Group } from "../../Abstract/Group";
import { SQLGroup } from "./SQLGroup";
import type { Collection } from "svelte-collections";

export class SQLAddressbookStorage implements AddressbookStorage {
  async deleteAddressbook(addressbook: Addressbook): Promise<void> {
    await SQLAddressbook.deleteIt(addressbook);
  }
  async saveAddressbook(addressbook: Addressbook): Promise<void> {
    await SQLAddressbook.save(addressbook);
  }
  async savePerson(person: Person): Promise<void> {
    await SQLPerson.save(person);
  }
  async deletePerson(person: Person): Promise<void> {
    await SQLPerson.deleteIt(person);
  }
  async saveGroup(group: Group): Promise<void> {
    await SQLGroup.save(group);
  }
  async deleteGroup(group: Group): Promise<void> {
    await SQLGroup.deleteIt(group);
  }

  static async readAddressbooks(): Promise<Collection<Addressbook>> {
    return await SQLAddressbook.readAll();
  }
}
