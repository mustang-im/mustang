import { ExchangeGAL } from "./ExchangeGAL";
import { EWSPerson } from "./EWSPerson";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { ensureArray, NotReached } from "../../util/util";
import { ArrayColl } from "svelte-collections";

export class EWSGAL extends ExchangeGAL {
  readonly protocol: string = "gal-ews";
  account: EWSAccount;

  constructor(account: EWSAccount) {
    super();
    this.mainAccount = this.account = account;
    this.errorCallback = account.errorCallback;
  }

  newPerson(): EWSPerson {
    return new EWSPerson(this);
  }
  newGroup(): never {
    throw new NotReached();
  }

  protected async searchGAL(searchTerm: string): Promise<ArrayColl<EWSPerson>> {
    let query = {
      m$ResolveNames: {
        m$UnresolvedEntry: searchTerm,
        ReturnFullContactData: true,
      },
    };
    let persons = new ArrayColl<EWSPerson>();
    try {
      let response = await this.account.callEWS(query);
      for (let resolution of ensureArray(response.ResolutionSet?.Resolution)) {
        if (!resolution.Contact) {
          continue;
        }
        resolution.Contact.EmailAddresses = { Entry: convertEmailAddresses(ensureArray(resolution.Contact.EmailAddresses?.Entry), resolution.Mailbox) };
        let person = this.newPerson();
        person.fromXML(resolution.Contact);
        persons.add(person);
      }
    } catch (ex) {
      // This error is expected.
      if (ex.type != "ErrorNameResolutionNoResults") {
        throw ex;
      }
    }
    return persons;
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
