import { Group } from '../../Abstract/Group';
import { Person, ContactEntry } from '../../Abstract/Person';
import { findPerson } from '../../Abstract/PersonUID';
import type { CardDAVAddressbook } from './CardDAVAddressbook';
import { appGlobal } from "../../app";
import { ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class CardDAVGroup extends Group {
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
