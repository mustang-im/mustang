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

  /**
   * Abstract method to implement saving group to the server.
   * Needs to be implemented for each protocol.
   */
  async saveToServer(): Promise<void> {
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

  /**
   * Abstract method to implement deleting group from the server.
   * Needs to be implemented for each protocol.
   */
  async deleteFromServer() {
  }
}
