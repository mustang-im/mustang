import { ExchangeGAL } from "../EWS/ExchangeGAL";
import { OWAPerson } from "./OWAPerson";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";
import { owaFindGALPersonsRequest } from "./Request/OWAPersonRequests";
import { NotReached } from "../../util/util";

export class OWAGAL extends ExchangeGAL {
  readonly protocol: string = "gal-owa";
  account: OWAAccount;

  constructor(account: OWAAccount) {
    super();
    this.mainAccount = this.account = account;
    this.errorCallback = account.errorCallback;
  }

  newPerson(): OWAPerson {
    return new OWAPerson(this);
  }
  newGroup(): never {
    throw new NotReached();
  }

  protected async searchGAL(searchTerm: string): Promise<OWAPerson[]> {
    let response = await this.account.callOWA(owaFindGALPersonsRequest(searchTerm));
    let persons: OWAPerson[] = [];
    for (let result of response.ResultSet) {
      let person = this.newPerson();
      person.fromJSON(result);
      persons.push(person);
    }
    return persons;
  }
}
