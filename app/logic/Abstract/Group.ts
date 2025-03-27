import { ContactBase } from './Contact';
import type { Person } from './Person';
import type { Addressbook } from '../Contacts/Addressbook';
import { notifyChangedProperty } from '../util/Observable';
import { SetColl } from 'svelte-collections';

export class Group extends ContactBase {
  @notifyChangedProperty
  description = "";
  readonly participants = new SetColl<Person>();

  /**
   * Saves group locally to the database.
   */
  async save() {
    await super.save();
    await this.addressbook.storage.saveGroup(this);
  }

  async saveToServer(): Promise<void> {
    // nothing to do for local groups
  }

  /**
   * Deletes the group locally from the database.
   */
  async deleteIt() {
    if (!this.addressbook) {
      return;
    }
    this.addressbook.groups.remove(this);
    await this.addressbook.storage.deleteGroup(this);
  }

  async deleteFromServer(): Promise<void> {
    // nothing to do for local groups
  }

  /** Group class needs to match account class, so need to clone.
   * @returns the new Group object */
  async moveToAddressbook(newAddressbook: Addressbook): Promise<Group> {
    if (this.addressbook == newAddressbook || !newAddressbook) {
      return;
    }
    let newGroup = newAddressbook.newGroup();
    if (Object.getPrototypeOf(this) == Object.getPrototypeOf(newGroup)) {
      this.addressbook?.groups.remove(this);
      this.addressbook = newAddressbook;
      newAddressbook.groups.add(this);
      await this.save();
      return this;
    }
    Object.assign(newGroup, this);
    newGroup.addressbook = newAddressbook;
    this.addressbook?.groups.remove(this);
    newAddressbook.groups.add(newGroup);
    await this.deleteIt();
    await newGroup.save();
    return newGroup;
  }
}
