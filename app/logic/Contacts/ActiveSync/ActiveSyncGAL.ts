import { Addressbook } from "../Addressbook";
import { ActiveSyncPerson } from "./ActiveSyncPerson";
import type { ActiveSyncAccount } from "../../Mail/ActiveSync/ActiveSyncAccount";
import { ActiveSyncError } from "../../Mail/ActiveSync/ActiveSyncError";
import { ensureArray, NotReached } from "../../util/util";
import { ArrayColl, type Collection } from "svelte-collections";

export class ActiveSyncGAL extends Addressbook {
  readonly protocol: string = "gal-activesync";
  account: ActiveSyncAccount;

  constructor(account: ActiveSyncAccount) {
    super();
    this.account = account;
  }

  newPerson(): ActiveSyncPerson {
    return new ActiveSyncPerson(this);
  }
  newGroup(): never {
    throw new NotReached();
  }

  listContacts(): never {
    throw new NotReached();
  }

  quickSearch(searchTerm: string): Collection<ActiveSyncPerson> {
    let results = new ArrayColl<ActiveSyncPerson>();
    this.quickSearchAsync(searchTerm, results).catch(this.account.errorCallback);
    return results;
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
      properties.BusinessPhoneNuimber = result.Properties.Phone;
      properties.HomePhoneNumber = result.Properties.HomePhone;
      properties.MobilePhoneNuimber = result.Properties.MobilePhone;
      properties.CompanyName = properties.Company;
      let person = this.newPerson();
      person.fromWBXML(properties);
      results.add(person);
    }
  }
}

interface EWSAddressEntry {
  Name: string;
  RoutingType :string;
  Value: string;
}

interface EWSMailbox {
  Name: string;
  EmailAddress: string;
  RoutingType: string;
}

function convertEmailAddresses(addresses: EWSAddressEntry[], mailbox?: EWSMailbox): EWSAddressEntry[] {
  for (let address of addresses) {
    // For some reason, GAL results don't separate out the routing type.
    if (/^(\w+):/.test(address.Value)) {
      address.RoutingType = RegExp.$1;
      address.Value = RegExp.rightContext;
    }
    if (mailbox && address.RoutingType == mailbox.RoutingType && address.Value == mailbox.EmailAddress) {
      mailbox = undefined;
    }
  }
  if (mailbox) {
    addresses.unshift({ Name: mailbox.Name, RoutingType: mailbox.RoutingType, Value: mailbox.EmailAddress });
  }
  return addresses;
}

