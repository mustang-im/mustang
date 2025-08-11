import type { Account } from "../../../logic/Abstract/Account";

export class PasswordFill {
  account: Account;
  // your cross-page state here

  constructor(account: Account) {
    this.account = account;
  }

  onPageChange(doc: Document) {
    // do password fill
  }
}
