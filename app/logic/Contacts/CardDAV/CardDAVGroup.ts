import { Group } from '../../Abstract/Group';
import type { CardDAVAddressbook } from './CardDAVAddressbook';

export class CardDAVGroup extends Group {
  declare addressbook: CardDAVAddressbook | null;

  get itemID() {
    return this.id;
  }
  set itemID(val) {
    this.id = val;
  }

  async saveToServer() {
  }

  async deleteFromServer() {
  }
}
