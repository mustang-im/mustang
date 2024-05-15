import { Addressbook } from "../Addressbook";
import { ActiveSyncPerson } from "./ActiveSyncPerson";
import { ActiveSyncGroup } from "./ActiveSyncGroup";
import type { ActiveSyncAccount } from "../../Mail/ActiveSync/ActiveSyncAccount";

export class ActiveSyncAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-activesync";
  account: ActiveSyncAccount;

  newPerson(): ActiveSyncPerson {
    return new ActiveSyncPerson(this);
  }
  newGroup(): ActiveSyncGroup {
    return new ActiveSyncGroup(this);
  }
}
