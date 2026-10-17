import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { importPublicKey } from "../../../logic/Mail/Encryption/KeyUtils";
import { queryPGPKeyServersForUID } from "../../../logic/Mail/Encryption/PGP/KeyServer";
import { appGlobal } from "../../../logic/app";
import type { Collection } from "svelte-collections";

export class RecipientKeys {
  // <copied from="../../../frontend/Mail/Composer/EncryptionDetails.svelte">
  static async queryKeyServers(recipients: Collection<PersonUID>, onlyNew = false) {
    let toQuery = onlyNew ? recipients.filterOnce(recipient => !(recipient as any)._queriedKeyserver) : recipients;
    if (toQuery.isEmpty) {
      return;
    }
    toQuery.forEach(recipient => (recipient as any)._queriedKeyserver = true);
    await Promise.all(toQuery.contents.map(recipient =>
      queryPGPKeyServersForUID(recipient)));
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
