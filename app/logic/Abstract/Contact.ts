// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { Group } from './Group';
import type { Person } from './Person';
import type { Addressbook } from '../Contacts/Addressbook';
import { appGlobal } from '../app';
import { Observable, notifyChangedProperty } from '../util/Observable';
import type { URLString } from '../util/util';

export type Contact = Person | Group;

export class ContactBase extends Observable {
  id: string;
  dbID: number;
  addressbook: Addressbook | null;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  picture: URLString | null; /** URL */

  constructor(addressbook: Addressbook | null = null) {
    super();
    this.addressbook = addressbook;
  }

  async save() {
    if (!this.addressbook) {
      this.addressbook = appGlobal.collectedAddressbook; // personal address book?
    }
  }
}
