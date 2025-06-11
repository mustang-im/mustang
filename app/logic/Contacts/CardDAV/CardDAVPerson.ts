import { Person } from '../../Abstract/Person';
import type { CardDAVAddressbook } from './CardDAVAddressbook';
import { convertPersonToVCard, convertVCardToPerson } from '../VCard/VCard';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { URLString } from "../../util/util";
import type { DAVObject } from "tsdav";

export class CardDAVPerson extends Person {
  declare addressbook: CardDAVAddressbook | null;
  url: URLString | null = null;

  get itemID(): string | null {
    return this.id;
  }
  set itemID(val: string | null) {
    this.id = val;
  }
  get etag(): string | null {
    return this.syncState as string;
  }
  set etag(val: string | null) {
    this.syncState = val;
  }

  fromDAVObject(entry: DAVObject) {
    convertVCardToPerson(entry.data, this);
    this.url = new URL(entry.url, this.addressbook.addressbookURL).href;
    this.syncState = entry.etag;
  }

  getDAVObject(vCard?: string): DAVObject {
    return {
      url: this.url,
      etag: this.syncState as string,
      data: vCard,
    };
  }

  async saveToServer() {
    this.id ??= crypto.randomUUID();
    let vCard = convertPersonToVCard(this);
    if (this.url) {
      // TODO Update doesn't work, if the contact was deleted on the server
      console.log("updating", this.url, "with vCard", vCard);
      await this.addressbook.client.updateVCard({
        vCard: this.getDAVObject(vCard),
      });
    } else {
      console.log("creating with vCard", vCard);
      let filename = this.id + ".vcf";
      await this.addressbook.client.createVCard({
        addressBook: this.addressbook.davAddressbook,
        vCardString: vCard,
        filename,
      });
      this.url = new URL(filename, this.addressbook.addressbookURL).href;
    }
    await super.saveToServer();
  }

  async saveTask() {
  }

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.url = sanitize.url(json.url, null);
  }
  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.url = this.url;
    return json;
  }

  async deleteFromServer() {
    console.log("Delete contact", this.url, {
      calendarObject: this.getDAVObject(),
    });
    if (!this.url) {
      return;
    }
    await this.addressbook.client.deleteVCard({
      vCard: this.getDAVObject(),
    });
  }
}
