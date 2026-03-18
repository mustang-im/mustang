import { SearchOnlyAddressbook } from "../Addressbook";
import { ActiveSyncPerson } from "./ActiveSyncPerson";
import type { ActiveSyncAccount } from "../../Mail/ActiveSync/ActiveSyncAccount";
import { ActiveSyncError } from "../../Mail/ActiveSync/ActiveSyncError";
import { ensureArray, NotReached } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class ActiveSyncGAL extends SearchOnlyAddressbook {
  readonly protocol: string = "gal-activesync";
  account: ActiveSyncAccount;

  constructor(account: ActiveSyncAccount) {
    super();
    this.account = account;
    this.errorCallback = account.errorCallback;
  }

  newPerson(): ActiveSyncPerson {
    return new ActiveSyncPerson(this);
  }
  newGroup(): never {
    throw new NotReached();
  }

  async quickSearchAsync(searchTerm: string, results: ArrayColl<ActiveSyncPerson>) {
    let query = {
      Store: {
        Name: "GAL",
        Query: searchTerm,
      },
    };
    let response = await this.account.callEAS("Search", query);
    if (response.Response.Store.Status != "1") {
      throw new ActiveSyncError("Search", response.Response.Store.Status, this.account);
    }
    for (let result of ensureArray(response.Response.Store.Result)) {
      let properties = result.Properties;
      // Convert from GAL format to contact format
      properties.Email1Address = properties.EmailAddress;
      properties.BusinessPhoneNumber = result.Properties.Phone;
      properties.HomePhoneNumber = result.Properties.HomePhone;
      properties.MobilePhoneNumber = result.Properties.MobilePhone;
      properties.CompanyName = properties.Company;
      let person = this.newPerson();
      person.fromWBXML(properties);
      results.add(person);
    }
  }
}
