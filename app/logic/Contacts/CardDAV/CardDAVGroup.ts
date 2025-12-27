import { Group } from '../../Abstract/Group';
import type { CardDAVAddressbook } from './CardDAVAddressbook';

export class CardDAVGroup extends Group {
  declare addressbook: CardDAVAddressbook | null;

  get itemID() {
    return this.pID;
  }
  set itemID(val) {
    this.pID = val;
  }

  async saveToServer() {
  }

  async deleteFromServer() {
  }
}
