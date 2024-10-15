import { ContactBase } from './Contact';
import type { Person } from './Person';
import { notifyChangedProperty } from '../util/Observable';
import { SetColl } from 'svelte-collections';
import { AbstractFunction } from '../util/util';

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
    throw new AbstractFunction();
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

  async deleteFromServer() {
    throw new AbstractFunction();
  }
}
