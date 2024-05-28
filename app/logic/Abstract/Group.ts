import { ContactBase } from './Contact';
import type { PersonUID } from './PersonUID';
import { notifyChangedProperty } from '../util/Observable';
import { SetColl } from 'svelte-collections';

export class Group extends ContactBase {
  @notifyChangedProperty
  description = "";
  readonly participants = new SetColl<Person>();

  async save() {
    await super.save();
    await this.addressbook.storage.saveGroup(this);
  }
}
