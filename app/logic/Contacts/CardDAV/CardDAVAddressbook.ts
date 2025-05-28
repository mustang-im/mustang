import { Addressbook } from "../Addressbook";
import { CardDAVPerson } from "./CardDAVPerson";
import { CardDAVGroup } from "./CardDAVGroup";
import { convertVCardToPerson } from "../VCard/VCard";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotReached, assert, type URLString } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection } from "svelte-collections";
import type { DAVClient, DAVAddressBook } from "tsdav";

export class CardDAVAddressbook extends Addressbook {
  readonly protocol: string = "carddav";
  declare readonly persons: ArrayColl<CardDAVPerson>;
  declare readonly groups: ArrayColl<CardDAVGroup>;
  /** URL of the specific addressbook - a CalDAV account can contain multiple addressbooks. */
  addressbookURL: URLString;
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

    let addressbooks = await this.listAddressbooks();
    assert(addressbooks.hasItems, "No CardDAV addressbooks found");
    console.log("Found CardDAV address books", addressbooks.contents);
    let addressbook = addressbooks.find(ab => ab.url == this.addressbookURL);
    assert(addressbook, "Selected CardDAV addressbook URL not found");
    console.log("Found CalDAV calendars", addressbooks.contents, "picked", addressbook.displayName);

    this.persons.clear();
    this.groups.clear();
    let entries = await this.client.fetchVCards({ addressBook: addressbook });
    for (let entry of entries) {
      let person = this.newPerson();
      try {
        convertVCardToPerson(entry.data, person);
      } catch (ex) {
        console.warn(ex);
        continue;
      }
      person.syncState = entry.etag;
      this.persons.add(person);
    }

    await this.save();
  }

  protected getPersonByItemID(id: string): CardDAVPerson | void {
    return this.persons.find(p => p.itemID == id);
  }

  protected getGroupByItemID(id: string): CardDAVGroup | void {
    return this.groups.find(p => p.itemID == id);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.addressbookURL = sanitize.url(json.addressbookURL);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.addressbookURL = this.addressbookURL;
    return json;
  }
}
