import { Addressbook } from "../Addressbook";
import { CardDAVPerson } from "./CardDAVPerson";
import { CardDAVGroup } from "./CardDAVGroup";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotReached, assert, type URLString } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection } from "svelte-collections";
import type { DAVClient, DAVAddressBook, DAVObject } from "tsdav";

export class CardDAVAddressbook extends Addressbook {
  readonly protocol: string = "carddav";
  declare readonly persons: ArrayColl<CardDAVPerson>;
  declare readonly groups: ArrayColl<CardDAVGroup>;
  /** URL of the specific addressbook - a CalDAV account can contain multiple addressbooks. */
  addressbookURL: URLString;
  davAddressbook: DAVAddressBook;
  ctag: string | null = null;
  client: DAVClient;

  newPerson(): CardDAVPerson {
    return new CardDAVPerson(this);
  }
  newGroup(): CardDAVGroup {
    return new CardDAVGroup(this);
  }

  async login(interactive: true) {
    let useOAuth2 = this.authMethod == AuthMethod.OAuth2;
    let usePassword = this.authMethod == AuthMethod.Password;
    if (useOAuth2) {
      assert(this.oAuth2, gt`Need OAuth2 configuration`);
      if (!this.oAuth2.isLoggedIn) {
        await this.oAuth2.login(interactive);
      }
    }
    assert(usePassword || useOAuth2, gt`Unknown authentication method`);
    let options = {
      serverUrl: this.url,
      authType: useOAuth2 ? "Oauth" : "Basic",
      credentials: useOAuth2 ? {
        access_token: this.oAuth2.accessToken,
      } : {
        username: this.username,
        password: usePassword ? this.password : undefined,
      },
      defaultAccountType: "carddav",
    };
    this.client = await appGlobal.remoteApp.createWebDAVClient(options);
    await this.client.login();
  }

  get isLoggedIn(): boolean {
    if (this.authMethod == AuthMethod.OAuth2) {
      return this.oAuth2.isLoggedIn;
    } else if (this.authMethod == AuthMethod.Password) {
      return !!this.password;
    } else {
      throw new NotReached(gt`Unknown authentication method`);
    }
  }

  async listAddressbooks(): Promise<Collection<DAVAddressBook>> {
    return new ArrayColl(await this.client.fetchAddressBooks());
  }

  async listContacts() {
    if (!this.dbID) {
      await this.save();
    }

    if (!this.davAddressbook) {
      let addressbooks = await this.listAddressbooks();
      assert(addressbooks.hasItems, "No CardDAV addressbooks found");
      // console.log("Found CardDAV address books", addressbooks.contents);
      this.davAddressbook = addressbooks.find(ab => ab.url == this.addressbookURL);
      assert(this.davAddressbook, "Selected CardDAV addressbook URL not found");
    }

    await this.sync();

    await this.save();
  }

  protected async fetchAll() {
    this.persons.clear();
    this.groups.clear();
    let vCardEntries = await this.client.fetchVCards({ addressBook: this.davAddressbook });
    for (let vCardEntry of vCardEntries) {
      this.addPerson(vCardEntry);
    }
  }

  protected async sync() {
    let localObjects = this.persons.contents.map(e => ({
      url: e.url,
      etag: e.etag,
      data: undefined, // unused by function, and expensive to calculate
      id: undefined, // unused by function, and not passed by iCalEntry
    }));
    let syncResponse = await this.client.smartCollectionSync({
      collection: {
        url: this.addressbookURL,
        ctag: this.ctag,
        syncToken: this.syncState,
        objects: localObjects,
        objectMultiGet: (...args) => this.client.addressBookMultiGet(...args),
      },
      method: 'webdav',
      detailedResult: true,
    });
    let { created, updated, deleted } = syncResponse.objects;
    for (let vCardEntry of created) {
      this.addPerson(vCardEntry);
    }
    for (let vCardEntry of updated) {
      let existing = this.getPersonByURL(vCardEntry.url);
      if (existing) {
        existing.fromDAVObject(vCardEntry);
        await existing.save();
      } else {
        this.addPerson(vCardEntry);
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
  }

  protected addPerson(vCardEntry: DAVObject) {
    try {
      let person = this.newPerson();
      person.fromDAVObject(vCardEntry);
      this.persons.add(person);
    } catch (ex) {
      console.warn(ex);
    }
  }

  getPersonByURL(url: URLString): CardDAVPerson | void {
    return this.persons.find(p => p.url == url);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.addressbookURL = sanitize.url(json.addressbookURL);
    this.ctag = sanitize.string(json.ctag, null);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.addressbookURL = this.addressbookURL;
    json.ctag = this.ctag;
    return json;
  }
}
