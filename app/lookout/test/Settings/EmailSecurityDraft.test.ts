// @vitest-environment happy-dom
import "../../../logic/app"; // first, to resolve the import cycle around Abstract/Account.ts
import { MailAccount } from "../../../logic/Mail/MailAccount";
import { MailIdentity } from "../../../logic/Mail/MailIdentity";
import { PGPPrivateKey } from "../../../logic/Mail/Encryption/PGP/PGPPrivateKey";
import { SMIMEPrivateKey } from "../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { getMyPrivateKey } from "../../../logic/Mail/Encryption/KeyUtils";
import { EmailSecurityDraft } from "../../Settings/Options/TrustCenter/EmailSecurityDraft";
import { DigitalIDs } from "../../Settings/Options/TrustCenter/DigitalIDs";
import { expect, test, vi } from "vitest";

function makeIdentity(emailAddress = "fred@example.com") {
  let account = new MailAccount();
  account.save = vi.fn(async () => {});
  let identity = new MailIdentity(account);
  identity.emailAddress = emailAddress;
  identity.realname = "Fred";
  account.identities.add(identity);
  return { account, identity };
}

function makeKey<T extends PGPPrivateKey | SMIMEPrivateKey>(key: T, id: string): T {
  key.id = id;
  key.name = id;
  key.obsolete = false; // S/MIME keys are obsolete until they have a valid certificate
  return key;
}

test("The draft shows the key, encryption and signing that the composer would use", () => {
  let { identity } = makeIdentity();
  let pgp = makeKey(new PGPPrivateKey(), "pgp");
  let smime = makeKey(new SMIMEPrivateKey(), "smime");
  smime.useToSign = true;
  identity.encryptionPrivateKeys.addAll([pgp, smime]);
  let setting = new EmailSecurityDraft([identity]).settingFor(identity);
  expect(setting.key).toBe(smime);
  expect(setting.sign).toBe(true);
  expect(setting.encrypt).toBe(false);
  expect(setting.isChanged).toBe(false);
});

test("Nothing changes before OK; OK saves the account once", async () => {
  let { account, identity } = makeIdentity();
  let pgp = makeKey(new PGPPrivateKey(), "pgp");
  identity.encryptionPrivateKeys.add(pgp);
  let draft = new EmailSecurityDraft([identity]);
  let setting = draft.settingFor(identity);
  setting.setSign(true);
  expect(pgp.useToSign).toBe(false);
  await draft.apply();
  expect(pgp.useToSign).toBe(true);
  expect(account.save).toHaveBeenCalledOnce();
  await draft.apply();
  expect(account.save).toHaveBeenCalledOnce();
});

test("Encryption always signs", () => {
  let { identity } = makeIdentity();
  identity.encryptionPrivateKeys.add(makeKey(new PGPPrivateKey(), "pgp"));
  let setting = new EmailSecurityDraft([identity]).settingFor(identity);
  setting.setEncrypt(true);
  expect(setting.sign).toBe(true);
  setting.setSign(false);
  expect(setting.sign).toBe(true);
  setting.setEncrypt(false);
  setting.setSign(false);
  expect(setting.sign).toBe(false);
});

test("Another signing certificate becomes the composer's key, also without signing by default", async () => {
  let { identity } = makeIdentity();
  let pgp = makeKey(new PGPPrivateKey(), "pgp");
  let smime = makeKey(new SMIMEPrivateKey(), "smime");
  pgp.useToSign = true;
  pgp.encryptByDefault = true;
  identity.encryptionPrivateKeys.addAll([pgp, smime]);
  let draft = new EmailSecurityDraft([identity]);
  let setting = draft.settingFor(identity);
  setting.setKey(smime);
  await draft.apply();
  expect(getMyPrivateKey(identity)).toBe(smime);
  expect(smime.encryptByDefault).toBe(true);
  expect(pgp.useToSign).toBe(false);
  expect(pgp.encryptByDefault).toBe(false);

  setting.setEncrypt(false);
  setting.setSign(false);
  await draft.apply();
  expect(getMyPrivateKey(identity)).toBe(smime);
  expect(identity.encryptionPrivateKeys.first).toBe(smime);
});

test("A new Digital ID becomes the setting of an identity that had none", () => {
  let { identity } = makeIdentity();
  let draft = new EmailSecurityDraft([identity]);
  let setting = draft.settingFor(identity);
  expect(setting.key).toBe(null);
  let pgp = makeKey(new PGPPrivateKey(), "pgp");
  identity.encryptionPrivateKeys.add(pgp);
  setting.keysChanged();
  expect(setting.key).toBe(pgp);
  expect(setting.isChanged).toBe(false);
});

test("A deleted Digital ID is replaced by the next one, and keeps the changed checkboxes", () => {
  let { identity } = makeIdentity();
  let pgp = makeKey(new PGPPrivateKey(), "pgp");
  let smime = makeKey(new SMIMEPrivateKey(), "smime");
  identity.encryptionPrivateKeys.addAll([pgp, smime]);
  let setting = new EmailSecurityDraft([identity]).settingFor(identity);
  setting.setEncrypt(true);
  identity.encryptionPrivateKeys.remove(pgp);
  setting.keysChanged();
  expect(setting.key).toBe(smime);
  expect(setting.encrypt).toBe(true);
});

test("Obsolete keys are not offered, and an unknown identity falls back to the first one", () => {
  let first = makeIdentity("anna@example.com").identity;
  let second = makeIdentity("bert@example.com").identity;
  let expired = makeKey(new PGPPrivateKey(), "expired");
  expired.obsolete = true;
  second.encryptionPrivateKeys.add(expired);
  let draft = new EmailSecurityDraft([first, second]);
  expect(draft.settingFor(second).keys).toEqual([]);
  expect(draft.settingFor(null).identity).toBe(first);
});

test("Get a Digital ID creates an OpenPGP key, which Import/Export can export and import again, without duplicates", async () => {
  let { account, identity } = makeIdentity();
  let key = await DigitalIDs.createOpenPGP(identity);
  expect(identity.encryptionPrivateKeys.contents).toEqual([key]);
  expect(account.save).toHaveBeenCalledOnce();

  let laptop = makeIdentity().identity;
  let file = key.privateKeyAsFile();
  let imported = await DigitalIDs.importFile(laptop, file, key.passphrase, " Fred's key ");
  expect(imported.id).toBe(key.id);
  expect(imported.name).toBe("Fred's key");
  await DigitalIDs.importFile(laptop, file, key.passphrase, "");
  expect(laptop.encryptionPrivateKeys.contents).toEqual([imported]);
  expect(imported.name).toBe("Fred's key");
}, 30000);
