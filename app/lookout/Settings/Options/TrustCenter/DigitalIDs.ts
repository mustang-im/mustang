import type { MailIdentity } from "../../../../logic/Mail/MailIdentity";
import type { PublicKey } from "../../../../logic/Mail/Encryption/PublicKey";
import type { PrivateKey } from "../../../../logic/Mail/Encryption/PrivateKey";
import { PGPPrivateKey } from "../../../../logic/Mail/Encryption/PGP/PGPPrivateKey";
import { SMIMEPrivateKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { KeyStatus } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { importPrivateKey, readKeyFile } from "../../../../logic/Mail/Encryption/KeyUtils";
import { ContactCertificates } from "../../../Contacts/Form/ContactCertificates";
import { saveBlobAsFile } from "../../../../frontend/Util/util";
import { assert } from "../../../../logic/util/util";
import { gt } from "../../../../l10n/l10n";

export type DigitalID = PublicKey & PrivateKey;

export class DigitalIDs {
  static readonly importFileTypes = [ "application/pgp-secret-keys", ".asc", "application/pkcs8", "application/x-pem-file", ".key", "application/x-pkcs12", ".p12", ".pfx", "text/plain" ];
  static readonly certificateFileTypes = [ "application/x-x509-email-cert", "application/x-x509-ca-cert", "application/pkix-cert", ".crt", "application/x-pem-file", ".pem" ];

  static usable(identity: MailIdentity): DigitalID[] {
    return identity.encryptionPrivateKeys.contents.filter(key => !key.obsolete);
  }

  static all(identity: MailIdentity): DigitalID[] {
    return identity.encryptionPrivateKeys.contents;
  }

  static nameOf(key: PublicKey): string {
    return ContactCertificates.nameOf(key);
  }

  static label(key: DigitalID): string {
    return `${DigitalIDs.nameOf(key)} (${key.system})`;
  }

  static identityLabel(identity: MailIdentity): string {
    return identity.realname ? `${identity.realname} (${identity.emailAddress})` : identity.emailAddress;
  }

  static async importFile(identity: MailIdentity, file: File, passphrase: string, name: string): Promise<DigitalID> {
    // <copied from="../../../../frontend/Settings/Mail/Account/EncryptionImport.svelte" onImportFile()>
    let fileContent = await readKeyFile(file, passphrase);
    let key = await importPrivateKey(fileContent, passphrase);
    let existing = identity.encryptionPrivateKeys.find(existing => existing.id == key.id);
    if (!existing) {
      identity.encryptionPrivateKeys.add(key);
    } else if (existing instanceof SMIMEPrivateKey) {
      // Re-import of the same key, possibly with new certificates in the file
      await existing.addCertificates(fileContent);
    }
    // </copied>
    let imported = existing ?? key;
    if (name.trim()) {
      imported.name = name.trim();
    }
    await identity.account.save();
    return imported;
  }

  static async exportFile(identity: MailIdentity, key: DigitalID, withPrivateKey: boolean) {
    if (!withPrivateKey) {
      // <copied from="../../../../frontend/Settings/Mail/Account/EncryptionKey.svelte" onExportPublic()>
      await saveBlobAsFile(key.publicKeyAsFile());
      // </copied>
      return;
    }
    // <copied from="../../../../frontend/Settings/Mail/Account/EncryptionKey.svelte" onExportPrivate(), onExportPrivateDone()>
    await saveBlobAsFile(key.privateKeyAsFile());
    key.didBackup = true;
    await identity.account.save();
    // </copied>
  }

  static async remove(identity: MailIdentity, key: DigitalID) {
    // <copied from="../../../../frontend/Settings/Mail/Account/EncryptionKey.svelte" onDelete()>
    identity.encryptionPrivateKeys.remove(key);
    await identity.account.save();
    // </copied>
  }

  static async createOpenPGP(identity: MailIdentity): Promise<DigitalID> {
    // <copied from="../../../../frontend/Settings/Mail/Account/EncryptionImport.svelte" onCreateNewPGP()>
    assert(!identity.isCatchAll, gt`Cannot create keys for catch-all email addresses. Please create an identity with a specific email address.`);
    let key = await PGPPrivateKey.createNewPrivateKey({
      realname: identity.realname,
      emailAddress: identity.emailAddress,
    });
    identity.encryptionPrivateKeys.add(key);
    await identity.account.save();
    // </copied>
    return key;
  }

  static async addCertificateFile(identity: MailIdentity, key: SMIMEPrivateKey, file: File) {
    // <copied from="../../../../frontend/Settings/Mail/Account/EncryptionKey.svelte" onAddCertificateSMIME()>
    let fileContent = await file.text();
    assert(fileContent.includes("-----BEGIN CERTIFICATE-----") ||
      fileContent.includes("-----BEGIN TRUSTED CERTIFICATE-----"),
      gt`Could not find a certificate in this file. It must be in PEM format.`);
    await key.addCertificates(fileContent);
    await identity.account.save();
    // </copied>
  }

  static statusText(status: KeyStatus | null): string {
    switch (status) {
    case KeyStatus.NoCertificate:
      return gt`This Digital ID has no certificate yet.`;
    case KeyStatus.ChainIncomplete:
      return gt`The certificates of the certificate authority are missing.`;
    case KeyStatus.ChainInvalid:
      return gt`The certificate chain could not be verified.`;
    case KeyStatus.SelfSignedRoot:
      return gt`This Digital ID uses a self-signed root certificate.`;
    case KeyStatus.Valid:
      return gt`This Digital ID has a valid certificate.`;
    }
    return "";
  }

  static needsCertificate(status: KeyStatus | null): boolean {
    return status == KeyStatus.NoCertificate || status == KeyStatus.ChainIncomplete;
  }
}
