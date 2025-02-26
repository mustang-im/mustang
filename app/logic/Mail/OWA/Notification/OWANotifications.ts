import type { OWAAccount } from "../OWAAccount";
import { AbstractFunction } from "../../../util/util";

export class OWANotifications {
  account: OWAAccount;
  constructor(account: OWAAccount) {
    this.account = account;
  }
  async start(): Promise<never> {
    throw new AbstractFunction();
  }
}
