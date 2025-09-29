import { Addressbook } from "../Addressbook";
import { EWSPerson } from "./EWSPerson";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { ensureArray, NotReached } from "../../util/util";
import { ArrayColl, type Collection } from "svelte-collections";

export class EWSGAL extends Addressbook {
  readonly protocol: string = "gal-ews";
  account: EWSAccount;

  constructor(account: EWSAccount) {
    super();
    this.account = account;
  }

  newPerson(): EWSPerson {
    return new EWSPerson();
  }
  newGroup(): never {
    throw new NotReached();
  }

  listContacts(): never {
    throw new NotReached();
  }

  quickSearch(searchTerm: string): Collection<EWSPerson> {
    let results = new ArrayColl<EWSPerson>();
    this.quickSearchAsync(searchTerm, results).catch(this.account.errorCallback);
    return results;
  }

  async quickSearchAsync(searchTerm: string, results: ArrayColl<EWSPerson>) {
    let query = {
      m$ResolveNames: {
        m$UnresolvedEntry: 'smtp:' + searchTerm,
        ReturnFullContactData: true,
      },
    };
    try {
      let response = await this.account.callEWS(query);
      for (let resolution of ensureArray(response.ResolutionSet.Resolution)) {
        if (!resolution.Contact) {
          continue;
        }
        resolution.Contact.EmailAddresses = { Entry: convertEmailAddresses(ensureArray(resolution.Contact.EmailAddresses?.Entry), resolution.Mailbox) };
        let person = this.newPerson();
        person.fromXML(resolution.Contact);
        results.add(person);
      }
    } catch (ex) {
      // This error is expected.
      if (ex.type != "ErrorNameResolutionNoResults") {
        throw ex;
      }
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
