import { ExchangeGAL } from "../EWS/ExchangeGAL";
import { ActiveSyncPerson } from "./ActiveSyncPerson";
import type { ActiveSyncAccount } from "../../Mail/ActiveSync/ActiveSyncAccount";
import { ActiveSyncError } from "../../Mail/ActiveSync/ActiveSyncError";
import { ensureArray, NotReached } from "../../util/util";

export class ActiveSyncGAL extends ExchangeGAL {
  readonly protocol: string = "gal-activesync";
  account: ActiveSyncAccount;

  constructor(account: ActiveSyncAccount) {
    super();
    this.mainAccount = this.account = account;
    this.errorCallback = account.errorCallback;
  }

  newPerson(): ActiveSyncPerson {
    return new ActiveSyncPerson(this);
  }
  newGroup(): never {
    throw new NotReached();
  }

  protected async searchGAL(searchTerm: string): Promise<ActiveSyncPerson[]> {
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
    let persons: ActiveSyncPerson[] = [];
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
      persons.push(person);
    }
    return persons;
  }
}
