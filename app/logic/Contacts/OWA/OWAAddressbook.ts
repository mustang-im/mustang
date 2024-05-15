import { Addressbook } from "../Addressbook";
import { OWAPerson } from "./OWAPerson";
import { OWAGroup } from "./OWAGroup";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";

export class OWAAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-owa";
  account: OWAAccount;

  newPerson(): OWAPerson {
    return new OWAPerson(this);
  }
  newGroup(): OWAGroup {
    return new OWAGroup(this);
  }
}
