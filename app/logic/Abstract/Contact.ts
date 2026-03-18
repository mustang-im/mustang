import type { Group } from './Group';
import type { Person } from './Person';
import type { Addressbook } from '../Contacts/Addressbook';
import { appGlobal } from '../app';
import { Observable, notifyChangedProperty } from '../util/Observable';
import { Lock } from '../util/flow/Lock';
import { assert, randomID, type URLString } from '../util/util';

export type Contact = Person | Group;

export class ContactBase extends Observable {
  id: string;
  dbID: number;
  addressbook: Addressbook | null;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  picture: URLString | null; /** URL */
  @notifyChangedProperty
  syncState: number | string | undefined;
  readonly storageLock = new Lock();

  constructor(addressbook: Addressbook | null = null) {
    super();
    this.id = randomID();
    this.addressbook = addressbook;
  }

  async save() {
    if (!this.addressbook) {
      this.addressbook = appGlobal.collectedAddressbook; // personal address book?
    }
  }

  fromExtraJSON(json: any) {
    assert(typeof (json) == "object", "Must be a JSON object");
    this.syncState = json.syncState;
  }
  toExtraJSON(): any {
    let json: any = {};
    json.syncState = this.syncState;
    return json;
  }
}
