import { Addressbook } from "../Addressbook";
import { OWAPerson } from "./OWAPerson";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";
import { owaFindGALPersonsRequest } from "./Request/OWAPersonRequests";
import { NotReached } from "../../util/util";
import { ArrayColl, type Collection } from "svelte-collections";

export class OWAGAL extends Addressbook {
  readonly protocol: string = "gal-owa";
  account: OWAAccount;

  constructor(account: OWAAccount) {
    super();
    this.account = account;
  }

  newPerson(): OWAPerson {
    return new OWAPerson();
  }
  newGroup(): never {
    throw new NotReached();
  }

  listContacts(): never {
    throw new NotReached();
  }

  quickSearch(searchTerm: string): Collection<OWAPerson> {
    let results = new ArrayColl<OWAPerson>();
    this.quickSearchAsync(searchTerm, results).catch(this.account.errorCallback);
    return results;
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
