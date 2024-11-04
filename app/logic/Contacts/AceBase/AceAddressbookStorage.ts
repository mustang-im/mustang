import type { Group } from "../../Abstract/Group";
import type { Person } from "../../Abstract/Person";
import type { Addressbook, AddressbookStorage } from "../Addressbook";
import { AceAddressbook } from "./AceAddressbook";
import { AcePerson } from "./AcePerson";

export class AceAddressbookStorage implements AddressbookStorage {
  
  async saveAddressbook(addressbook: Addressbook): Promise<void> {
    await AceAddressbook.save(addressbook);
  }

  async deleteAddressbook(addressbook: Addressbook): Promise<void> {
    await AceAddressbook.deleteIt(addressbook);
  }

  async savePerson(person: Person): Promise<void> {
    await AcePerson.save(person);
  }

  async deletePerson(person: Person): Promise<void> {
    await AcePerson.deleteIt(person);
  }

  async saveGroup(group: Group): Promise<void> {
    // Implement saveGroup for Ace
  }

  async deleteGroup(group: Group): Promise<void> {
    // Implement deleteGroup for Ace
  }
}