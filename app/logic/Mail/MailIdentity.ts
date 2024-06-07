import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { assert } from "../util/util";
import type { MailAccount } from "./MailAccount";

export class MailIdentity extends Observable {
  id = crypto.randomUUID();
  account: MailAccount;
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

  get name(): string {
    return this.emailAddress;
  }

  isEMailAddress(emailAddress: string): boolean {
    return this.emailAddress == emailAddress;
  }

  /** @param config JSON object which contains the data for
   * this specific identity only, i.e. a subtree of the `MailAccount.config`. */
  static fromConfigJSON(config: any, account: MailAccount): MailIdentity {
    assert(typeof (config) == "object", "Config must be a JSON object");
    let thiss = new MailIdentity();
    thiss.account = account;
    thiss.id = sanitize.nonemptystring(config.id);
    thiss.userRealname = sanitize.label(config.userRealname);
    thiss.emailAddress = sanitize.emailAddress(config.emailAddress);
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
