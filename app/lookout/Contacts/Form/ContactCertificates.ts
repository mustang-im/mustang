import type { Person } from "../../../logic/Abstract/Person";
import type { PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
import { TrustLevel } from "../../../logic/Mail/Encryption/enums";
import { importPublicKey } from "../../../logic/Mail/Encryption/KeyUtils";
import { saveBlobAsFile } from "../../../frontend/Util/util";
import { gt } from "../../../l10n/l10n";

export class ContactCertificates {
  static sorted(keys: Iterable<PublicKey>): PublicKey[] {
    return [...keys].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  static nameOf(key: PublicKey): string {
    return key.name || key.userIDs.first || key.defaultName;
  }

  static statusOf(key: PublicKey): string {
    if (key.trustLevel == TrustLevel.Distrusted) {
      return gt`Not trusted`;
    }
    if (key.obsolete) {
      return key.expires && key.expires.getTime() < Date.now() ? gt`Expired` : gt`Not used`;
    }
    return key.encryptByDefault ? gt`Default` : "";
  }

  static canBeDefault(key: PublicKey): boolean {
    return !key.obsolete && key.trustLevel != TrustLevel.Distrusted;
  }

  static setAsDefault(person: Person, key: PublicKey) {
    for (let existing of person.encryptionPublicKeys) {
      existing.encryptByDefault = existing == key;
    }
  }

  static async importFile(person: Person, file: File) {
    // <copied from="../../../frontend/Contacts/PersonPage/EncryptionImport.svelte" onImportFile()>, saved with the contact form
    let fileContent = await file.text();
    let key = await importPublicKey(fileContent);
    person.addEncryptionPublicKey(key);
    // </copied>
  }

  static async exportKey(key: PublicKey) {
    // <copied from="../../../frontend/Contacts/PersonPage/EncryptionKey.svelte" onExport()>
    await saveBlobAsFile(key.publicKeyAsFile());
    // </copied>
  }

  static remove(person: Person, key: PublicKey) {
    person.encryptionPublicKeys.remove(key);
  }
}
