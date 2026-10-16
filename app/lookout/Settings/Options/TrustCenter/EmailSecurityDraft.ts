import type { MailIdentity } from "../../../../logic/Mail/MailIdentity";
import type { Account } from "../../../../logic/Abstract/Account";
import { getMyPrivateKey } from "../../../../logic/Mail/Encryption/KeyUtils";
import { DigitalIDs, type DigitalID } from "./DigitalIDs";
import { appGlobal } from "../../../../logic/app";

export class IdentitySecurity {
  readonly identity: MailIdentity;
  key: DigitalID | null = null;
  encrypt = false;
  sign = false;
  protected original = { key: null as DigitalID | null, encrypt: false, sign: false };

  constructor(identity: MailIdentity) {
    this.identity = identity;
    this.reload();
  }

  reload() {
    let key = getMyPrivateKey(this.identity) as DigitalID | null;
    this.key = key;
    this.encrypt = !!key?.encryptByDefault;
    this.sign = !!key?.useToSign || this.encrypt;
    this.original = { key: this.key, encrypt: this.encrypt, sign: this.sign };
  }

  get keys(): DigitalID[] {
    return DigitalIDs.usable(this.identity);
  }

  get choosableKeys(): DigitalID[] {
    return [ ...this.keys, ...DigitalIDs.awaitingCertificate(this.identity).filter(key => !this.keys.includes(key)) ];
  }

  get isChanged(): boolean {
    return this.key != this.original.key || this.encrypt != this.original.encrypt || this.sign != this.original.sign;
  }

  setEncrypt(encrypt: boolean) {
    this.encrypt = encrypt;
    if (encrypt) {
      this.sign = true;
    }
  }

  setSign(sign: boolean) {
    this.sign = sign || this.encrypt;
  }

  setKey(key: DigitalID) {
    this.key = key;
  }

  keysChanged() {
    if (!this.isChanged) {
      this.reload();
    } else if (!this.keys.includes(this.key)) {
      this.key = getMyPrivateKey(this.identity) as DigitalID | null;
    }
  }

  applyToKeys() {
    let key = this.key;
    if (!key) {
      return;
    }
    let keys = this.identity.encryptionPrivateKeys;
    for (let otherKey of keys) {
      if (otherKey != key) {
        otherKey.encryptByDefault = false;
        otherKey.useToSign = false;
      }
    }
    key.encryptByDefault = this.encrypt;
    key.useToSign = this.sign;
    // `getMyPrivateKey()` falls back to the first key, when no key is used to sign
    if (keys.first != key) {
      keys.replaceAll([key, ...keys.contents.filter(listed => listed != key)]);
    }
    this.original = { key, encrypt: this.encrypt, sign: this.sign };
  }
}

export class EmailSecurityDraft {
  readonly settings: IdentitySecurity[];

  constructor(identities: MailIdentity[] = EmailSecurityDraft.allIdentities()) {
    this.settings = identities.map(identity => new IdentitySecurity(identity));
  }

  static allIdentities(): MailIdentity[] {
    return appGlobal.emailAccounts.contents
      .flatMap(account => account.identities.contents)
      .filter(identity => !identity.isCatchAll);
  }

  settingFor(identity: MailIdentity | null): IdentitySecurity | null {
    return this.settings.find(setting => setting.identity == identity) ?? this.settings[0] ?? null;
  }

  async apply() {
    let accounts = new Set<Account>();
    for (let setting of this.settings) {
      if (setting.isChanged) {
        setting.applyToKeys();
        accounts.add(setting.identity.account);
      }
    }
    for (let account of accounts) {
      await account.save();
    }
  }
}
