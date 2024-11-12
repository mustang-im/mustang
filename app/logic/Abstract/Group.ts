import { ContactBase } from './Contact';
import type { Person } from './Person';
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
}
