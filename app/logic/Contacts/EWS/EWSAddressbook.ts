import { Addressbook } from "../Addressbook";
import { EWSPerson } from "./EWSPerson";
import { EWSGroup } from "./EWSGroup";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";

export class EWSAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-ews";
  account: EWSAccount;

  newPerson(): EWSPerson {
    return new EWSPerson(this);
  }
  newGroup(): EWSGroup {
    return new EWSGroup(this);
  }
}
