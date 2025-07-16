import { AddressbookAccount } from "../AddressbookAccount";
import { CardDAVAddressbook } from "./CardDAVAddressbook";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { NotReached, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";
import type { DAVClient } from "tsdav";

export class CardDAVAccount extends AddressbookAccount {
  readonly protocol: string = "carddav";
  declare readonly addressbooks: ArrayColl<CardDAVAddressbook>;
  client: DAVClient;

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

  async listAddressbooks(): Promise<void> {
    if (this.addressbooks.hasItems) {
      return;
    }
    // TODO Read from DB

    // Add new calendars from server
    this.addressbooks.addAll(await this.listAddressbooksOnServer(false));
  }

  async listAddressbooksOnServer(duplicates: boolean): Promise<ArrayColl<CardDAVAddressbook>> {
    let calendars = new ArrayColl<CardDAVAddressbook>();
    let davAddressbooks = await this.client.fetchAddressBooks();
    assert(davAddressbooks.length, "No CardDAV addressbooks found");
    for (let davAddressbook of davAddressbooks) {
      if (!duplicates && this.addressbooks.some(ab => ab.url == davAddressbook.url)) {
        continue;
      }
      console.log("Found CardDAV addressbook", davAddressbook.displayName);
      let cal = new CardDAVAddressbook();
      cal.name = (typeof (davAddressbook.displayName == "string") ? davAddressbook.displayName as string : null) || gt`Calendar`;
      cal.url = davAddressbook.url;
      calendars.add(cal);
    }
    return calendars;
  }
}
