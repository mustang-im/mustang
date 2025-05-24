import { Person, ContactEntry } from '../../Abstract/Person';
import type { CardDAVAddressbook } from './CardDAVAddressbook';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray, assert } from "../../util/util";

export class CardDAVPerson extends Person {
  declare addressbook: CardDAVAddressbook | null;

  get itemID() {
    return this.id;
  }
  set itemID(val) {
    this.id = val;
  }

  fromVCard(vCard: string) {
  }

  async saveToServer() {
  }

  async deleteFromServer() {
  }
}
