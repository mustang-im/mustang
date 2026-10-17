import type { MailAccount } from "../../../../logic/Mail/MailAccount";
import type { MailIdentity } from "../../../../logic/Mail/MailIdentity";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../../l10n/l10n";

export class IdentityDraft {
  readonly identity: MailIdentity | null;
  realname: string;
  emailAddress: string;
  replyTo: string;
  organisation: string;

  constructor(identity: MailIdentity | null, realname = "") {
    this.identity = identity;
    this.realname = identity?.realname ?? realname;
    this.emailAddress = identity?.emailAddress ?? "";
    this.replyTo = identity?.replyTo ?? "";
    this.organisation = identity?.organisation ?? "";
  }

  get isCatchAll(): boolean {
    return this.emailAddress.includes("*");
  }

  get isEMailAddressValid(): boolean {
    return !!sanitize.emailAddress(this.emailAddress.trim().replace("*", "any"), null);
  }

  get canRemove(): boolean {
    return this.identity?.canDelete ?? true;
  }

  values(): object {
    return {
      identity: this.identity?.id ?? null,
      realname: this.realname,
      emailAddress: this.emailAddress,
      replyTo: this.replyTo,
      organisation: this.organisation,
    };
  }

  applyTo(identity: MailIdentity) {
    identity.realname = this.realname.trim();
    identity.emailAddress = this.emailAddress.trim();
    identity.replyTo = this.replyTo.trim() || null;
    identity.organisation = this.organisation.trim() || null;
  }
}

export class IdentitiesDraft {
  readonly account: MailAccount;
  identities: IdentityDraft[];
  protected readonly removed: MailIdentity[] = [];
  protected readonly initialValues: string;

  constructor(account: MailAccount) {
    this.account = account;
    this.identities = account.identities.contents.map(identity => new IdentityDraft(identity));
    this.initialValues = JSON.stringify(this.values());
  }

  values(): object {
    return {
      identities: this.identities.map(identity => identity.values()),
      removed: this.removed.map(identity => identity.id),
    };
  }

  get isChanged(): boolean {
    return JSON.stringify(this.values()) != this.initialValues;
  }

  add(): IdentityDraft {
    let identity = new IdentityDraft(null, this.account.realname ?? "");
    this.identities.push(identity);
    return identity;
  }

  canRemove(identity: IdentityDraft): boolean {
    return this.identities.length > 1 && identity.canRemove;
  }

  remove(identity: IdentityDraft) {
    if (!this.canRemove(identity)) {
      return;
    }
    this.identities = this.identities.filter(listed => listed != identity);
    if (identity.identity) {
      this.removed.push(identity.identity);
    }
  }

  get missingField(): string | null {
    if (!this.identities.length) {
      return gt`Need at least 1 identity`;
    }
    let invalid = this.identities.find(identity => !identity.isEMailAddressValid);
    return invalid ? gt`The email address ${invalid.emailAddress} is not valid` : null;
  }

  // <copied from="../../../../frontend/Settings/Mail/Account/Identity.svelte">
  async save() {
    let account = this.account;
    for (let identity of this.removed) {
      account.identities.remove(identity);
      await identity.deleteIt();
    }
    for (let draft of this.identities) {
      let identity = draft.identity;
      if (!identity) {
        identity = account.newIdentity();
        account.identities.add(identity);
      }
      draft.applyTo(identity);
    }
    account.emailAddress = account.identities.first.emailAddress;
    account.realname = account.identities.first.realname;
    for (let identity of account.identities) {
      await identity.saveToServer();
    }
    await account.save();
  }
  // </copied>
}
