import type { EMail } from "../../../logic/Mail/EMail";
import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { EncryptionSystem } from "../../../logic/Mail/Encryption/enums";
import { getEncryptionSystem, importPublicKey } from "../../../logic/Mail/Encryption/KeyUtils";
import { queryPGPKeyServersForUID } from "../../../logic/Mail/Encryption/PGP/KeyServer";
import { appGlobal } from "../../../logic/app";
import type { Collection } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export class RecipientKeys {
  static hasKeyServers(mail: EMail): boolean {
    return getEncryptionSystem(mail) == EncryptionSystem.PGP;
  }

  static encryptionError(mail: EMail, recipientsWithoutKeys: Collection<PersonUID>): string | null {
    // <copied from="../../../frontend/Mail/Composer/EncryptionDetails.svelte">
    return mail.shouldEncrypt && recipientsWithoutKeys.hasItems ?
      gt`Some recipients are missing certificates for encryption.\nEither add certificates for them, remove them, or disable encryption.` : null;
    // </copied>
  }

  // <copied from="../../../frontend/Mail/Composer/EncryptionDetails.svelte">
  /** The address book search leaves the keys out, to stay fast */
  static async fetchAddressbookKeys(recipients: Collection<PersonUID>) {
    await Promise.all(recipients.contents.map(recipient =>
      recipient.findPerson()?.fetchEncryptionKeys()));
  }

  static async queryKeyServers(recipients: Collection<PersonUID>, onlyNew = false) {
    let toQuery = onlyNew ? recipients.filterOnce(recipient => !(recipient as any)._queriedKeyserver) : recipients;
    if (toQuery.isEmpty) {
      return;
    }
    toQuery.forEach(recipient => (recipient as any)._queriedKeyserver = true);
    await Promise.all(toQuery.contents.map(recipient =>
      queryPGPKeyServersForUID(recipient)));
  }

  static removeRecipients(mail: EMail, recipients: Iterable<PersonUID>) {
    let list = [...recipients];
    mail.to.removeAll(list);
    mail.cc.removeAll(list);
    mail.bcc.removeAll(list);
  }
  // </copied>

  static async importKeyFile(recipient: PersonUID, file: File) {
    // <copied from="../../../frontend/Contacts/PersonPage/EncryptionImport.svelte" onImportFile()>
    let person = recipient.createPerson(appGlobal.collectedAddressbook);
    let fileContent = await file.text();
    let key = await importPublicKey(fileContent);
    person.addEncryptionPublicKey(key);
    await person.save();
    // </copied>
  }
}
