import type { Addressbook, AddressbookStorage } from "../Addressbook";
import type { Person } from "../../Abstract/Person";
import type { Group } from "../../Abstract/Group";
import { ArrayColl, type Collection } from "svelte-collections";

export class DummyAddressbookStorage implements AddressbookStorage {
  async deleteAddressbook(addressbook: Addressbook): Promise<void> {
  }
  async saveAddressbook(addressbook: Addressbook): Promise<void> {
  }
  async savePerson(person: Person): Promise<void> {
  }
  async deletePerson(person: Person): Promise<void> {
  }
  async saveGroup(group: Group): Promise<void> {
  }
  async deleteGroup(group: Group): Promise<void> {
  }
  static async readAddressbooks(): Promise<Collection<Addressbook>> {
    return new ArrayColl<Addressbook>();
  }
}
