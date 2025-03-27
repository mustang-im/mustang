import type { MailAccount } from "./MailAccount";
import { PersonUID } from "../Abstract/PersonUID";
import { appGlobal } from "../app";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { assert } from "../util/util";
import { ArrayColl } from "svelte-collections";

export class MailIdentity extends Observable {
  id = crypto.randomUUID();
  readonly account: MailAccount;
  pID: string | number;
  @notifyChangedProperty
  userRealname: string;
  @notifyChangedProperty
  emailAddress: string;
  @notifyChangedProperty
  replyTo: string | null = null;
  @notifyChangedProperty
  organisation: string | null = null;
  /** Not including signature markers like `-- ` or `footer`,
   * and not including the Mustang signature */
  @notifyChangedProperty
  signatureHTML: string | null = null;
  /** email addresses that should be CCed on every outgoing email */
  @notifyChangedProperty
  sendCC = new ArrayColl<string>();
  /** email addresses that should be CCed on every outgoing email */
  @notifyChangedProperty
  sendBCC = new ArrayColl<string>();

  constructor(account: MailAccount) {
    super();
    this.account = account;
  }

  get name(): string {
    return this.emailAddress;
  }

  asPersonUID(): PersonUID {
    return new PersonUID(this.emailAddress, this.userRealname);
  }

  get isCatchAll(): boolean {
    return this.emailAddress?.includes("*");
  }

  isEMailAddress(emailAddress: string): boolean {
    emailAddress = emailAddress.toLowerCase();
    if (this.isCatchAll) {
      let sp = this.emailAddress.toLowerCase().split("*");
      // Deliberately supporting only 1 `*` placeholder
      return emailAddress.startsWith(sp[0]) && emailAddress.endsWith(sp[1]);
    } else {
      return this.emailAddress.toLowerCase() == emailAddress;
    }
  }

  /** @param config JSON object which contains the data for
   * this specific identity only, i.e. a subtree of the `MailAccount.config`. */
  static fromConfigJSON(config: any, account: MailAccount): MailIdentity {
    assert(typeof (config) == "object", "Config must be a JSON object");
    let thiss = new MailIdentity(account);
    thiss.id = sanitize.nonemptystring(config.id) as any;
    thiss.userRealname = sanitize.label(config.userRealname);
    sanitize.emailAddress(config.emailAddress.replace("*", ""));
    thiss.emailAddress = config.emailAddress;
    thiss.replyTo = sanitize.emailAddress(config.replyTo, null);
    thiss.organisation = sanitize.label(config.organisation, null);
    thiss.signatureHTML = sanitize.string(config.signatureHTML, null);
    thiss.sendCC.clear();
    thiss.sendBCC.clear();
    thiss.sendCC.addAll(sanitize.array(config.sendCC).filter(e =>
      !!sanitize.emailAddress(e, null)));
    thiss.sendBCC.addAll(sanitize.array(config.sendBCC).filter(e =>
      !!sanitize.emailAddress(e, null)));
    return thiss;
  }
  toConfigJSON(): any {
    return {
      id: this.id,
      userRealname: this.userRealname,
      emailAddress: this.emailAddress,
      replyTo: this.replyTo,
      organisation: this.organisation,
      signatureHTML: this.signatureHTML,
      sendCC: this.sendCC.contents,
      sendBCC: this.sendBCC.contents,
    };
  }
}

export function findIdentityForEMailAddress(emailAddress: string): MailIdentity | null {
  for (let account of appGlobal.emailAccounts) {
    for (let identity of account.identities) {
      if (identity.isEMailAddress(emailAddress)) {
        return identity;
      }
    }
  }
  return null;
}

/**
 * Finds our user's identity which matches one of the the passed-in email addresses
 * @param addresses If any identity matches one of these emailAddresses,
 * select that identity by default.
 * In decreasing order of preference.
 */
export function findIdentityInRecipients(addresses: PersonUID[], defaultAccount: MailAccount): { identity: MailIdentity, personUID: PersonUID } | null {
  for (let candidate of addresses) {
    for (let account of appGlobal.emailAccounts) {
      for (let identity of account.identities) {
        if (identity.isEMailAddress(candidate.emailAddress)) {
          let personUID = new PersonUID(candidate.emailAddress, identity.userRealname);
          return { identity, personUID };
        }
      }
    }
  }
  let identity = defaultAccount.identities.first;
  // console.log("None match, choosing default account", defaultAccount.name, "identity", identity.emailAddress);
  return { identity, personUID: identity.asPersonUID() };
}
