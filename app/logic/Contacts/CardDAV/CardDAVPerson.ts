import { Person } from '../../Abstract/Person';
import type { CardDAVAddressbook } from './CardDAVAddressbook';
import { personToVCard, convertVCardToPerson, getUpdatedVCard, parseContact } from '../VCard/VCard';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assertHTTPResponseOK } from "../../util/netUtil";
import type { URLString } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import type { DAVObject } from "tsdav";

export class CardDAVPerson extends Person {
  declare addressbook: CardDAVAddressbook | null;
  url: URLString | null = null;
  /** The vCard that we downloaded from the server.
   * Allows updates of only the properties that we know about,
   * leaving unknown properties as-is. */
  originalVCard: string;

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
    this.originalVCard = entry.data;
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
    await this.addressbook.login(false);
    this.id ??= crypto.randomUUID();
    if (this.url) {
      let vCard = getUpdatedVCard(this, parseContact(this.originalVCard));
      // TODO Update doesn't work, if the contact was deleted on the server
      console.log("updating", this.url, "with vCard", vCard);
      let response = await this.addressbook.client.updateVCard({
        vCard: this.getDAVObject(vCard),
      });
      await assertHTTPResponseOK(response, gt`Saving the contact failed`);
    } else {
      let vCard = personToVCard(this);
      console.log("creating with vCard", vCard);
      let filename = this.id + ".vcf";
      let response = await this.addressbook.client.createVCard({
        addressBook: this.addressbook.davAddressbook,
        vCardString: vCard,
        filename,
      });
      await assertHTTPResponseOK(response, gt`Saving the contact failed`);
      this.url = new URL(filename, this.addressbook.addressbookURL).href;
      this.originalVCard = vCard;
    }
    await super.saveToServer();
  }

  async saveTask() {
  }

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.originalVCard = sanitize.string(json.original, null);
    this.url = sanitize.url(json.url, null);
  }
  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.url = this.url;
    json.original = this.originalVCard;
    return json;
  }

  async deleteFromServer() {
    console.log("Delete contact", this.url, {
      calendarObject: this.getDAVObject(),
    });
    if (!this.url) {
      return;
    }
    await this.addressbook.login(false);
    let response = await this.addressbook.client.deleteVCard({
      vCard: this.getDAVObject(),
    });
    if (await response.status != 404) { // 404 = already deleted on the server
      await assertHTTPResponseOK(response, gt`Deleting the contact failed`);
    }
  }
}
