import { Addressbook } from "../Addressbook";
import type { CardDAVAccount } from "./CardDAVAccount";
import { CardDAVPerson } from "./CardDAVPerson";
import { CardDAVGroup } from "./CardDAVGroup";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Lock } from "../../util/Lock";
import type { URLString } from "../../util/util";
import type { ArrayColl } from "svelte-collections";
import type { DAVAddressBook, DAVObject } from "tsdav";

export class CardDAVAddressbook extends Addressbook {
  readonly protocol: string = "carddav";
  declare account: CardDAVAccount;
  canSync: boolean = true;
  declare readonly persons: ArrayColl<CardDAVPerson>;
  declare readonly groups: ArrayColl<CardDAVGroup>;
  /** URL of the specific addressbook - a CalDAV account can contain multiple addressbooks. */
  url: URLString;
  davAddressbook: DAVAddressBook;
  ctag: string | null = null;
  protected readonly syncLock = new Lock();

  newPerson(): CardDAVPerson {
    return new CardDAVPerson(this);
  }
  newGroup(): CardDAVGroup {
    return new CardDAVGroup(this);
  }

  get isLoggedIn(): boolean {
    return this.account.isLoggedIn;
  }

  async listContacts() {
    if (!this.dbID) {
      await this.save();
    }
    await this.sync();
    await this.save();
  }

  protected async fetchAll() {
    let lock = await this.syncLock.lock();
    try {
      this.persons.clear();
      this.groups.clear();
      let vCardEntries = await this.account.client.fetchVCards({ addressBook: this.davAddressbook });
      for (let vCardEntry of vCardEntries) {
        await this.addPerson(vCardEntry);
      }
    } finally {
      lock.release();
    }
  }

  protected async sync() {
    let lock = await this.syncLock.lock();
    try {
      let localObjects = this.persons.contents.map(e => ({
        url: e.url,
        etag: e.etag,
        data: undefined, // unused by function, and expensive to calculate
        id: undefined, // unused by function, and not passed by iCalEntry
      }));
      let syncResponse = await this.account.client.smartCollectionSync({
        collection: {
          url: this.url,
          ctag: this.ctag,
          syncToken: this.syncState,
          objects: localObjects,
          objectMultiGet: (...args) => this.account.client.addressBookMultiGet(...args),
        },
        method: 'webdav',
        detailedResult: true,
      });
      let { created, updated, deleted } = syncResponse.objects;
      for (let vCardEntry of created) {
        await this.addPerson(vCardEntry);
      }
      for (let vCardEntry of updated) {
        let existing = this.getPersonByURL(vCardEntry.url);
        if (existing) {
          existing.fromDAVObject(vCardEntry);
          await existing.saveLocally();
        } else {
          await this.addPerson(vCardEntry);
        }
      }
      for (let vCardEntry of deleted) {
        let existing = this.getPersonByURL(vCardEntry.url);
        if (existing) {
          await existing.deleteIt();
        }
      }

      this.ctag = syncResponse.ctag;
      this.syncState = syncResponse.syncToken;
    } finally {
      lock.release();
    }
  }

  protected async addPerson(vCardEntry: DAVObject) {
    try {
      let person = this.newPerson();
      person.fromDAVObject(vCardEntry);
      this.persons.add(person);
      await person.saveLocally();
    } catch (ex) {
      console.warn(ex);
    }
  }

  getPersonByURL(relativeURL: URLString): CardDAVPerson | void {
    let url = new URL(relativeURL, this.url).href;
    return this.persons.find(p => p.url == url);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.url = sanitize.url(json.addressbookURL);
    this.ctag = sanitize.string(json.ctag, null);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.addressbookURL = this.url;
    json.ctag = this.ctag;
    return json;
  }
}
