import { SearchOnlyAddressbook } from "../Addressbook";
import { OWAPerson } from "./OWAPerson";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";
import { owaFindGALPersonsRequest } from "./Request/OWAPersonRequests";
import { NotReached } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class OWAGAL extends SearchOnlyAddressbook {
  readonly protocol: string = "gal-owa";
  account: OWAAccount;

  constructor(account: OWAAccount) {
    super();
    this.account = account;
    this.errorCallback = account.errorCallback;
  }

  newPerson(): OWAPerson {
    return new OWAPerson();
  }
  newGroup(): never {
    throw new NotReached();
  }

  async quickSearchAsync(searchTerm: string, results: ArrayColl<OWAPerson>) {
    let response = await this.account.callOWA(owaFindGALPersonsRequest(searchTerm));
    for (let result of response.ResultSet) {
      let person = this.newPerson();
      person.fromJSON(result);
      results.add(person);
    }
  }
}
