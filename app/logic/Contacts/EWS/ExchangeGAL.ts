import { SearchOnlyAddressbook } from "../Addressbook";
import { ContactEntry, type Person } from "../../Abstract/Person";
import type { PersonUID } from "../../Abstract/PersonUID";
import type { MailAccount } from "../../Mail/MailAccount";
import { getPublicKeyForPerson, getPublicKeyForPersonUID, usesCrypto } from "../../Mail/Encryption/KeyUtils";
import { SMIMEPrivateKey } from "../../Mail/Encryption/SMIME/SMIMEPrivateKey";
import { SMIMEPublicKey } from "../../Mail/Encryption/SMIME/SMIMEPublicKey";
import { getBaseDomainFromHost, getDomainForEmailAddress } from "../../util/netUtil";
import { AbstractFunction } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

/** The Global Address List (GAL) of an Exchange server */
export class ExchangeGAL extends SearchOnlyAddressbook {
  account: MailAccount;

  /** Exchange matches the start of first name, last name, display name,
   * alias and office, but not reliably the email addresses.
   * With an `smtp:` prefix, it matches the start of all email addresses instead.
   * No Exchange API searches both in one call. */
  async quickSearchAsync(searchTerm: string, results: ArrayColl<Person>) {
    let found = await Promise.all([
      this.searchGAL(searchTerm),
      this.searchGAL("smtp:" + searchTerm),
    ]);
    for (let persons of found) {
      for (let person of persons) {
        // Dedup
        if (results.find(existing => existing.name == person.name &&
            existing.emailAddresses.first?.value == person.emailAddresses.first?.value)) {
          continue;
        }
        results.add(person);
      }
    }
  }

  /** @returns the persons whose fields start with `searchTerm`,
   *   without their S/MIME certificates */
  protected async searchGAL(searchTerm: string): Promise<ArrayColl<Person>> {
    throw new AbstractFunction();
  }

  /** The entries that `fetchCertificate()` asked for, by lowercase email address */
  protected readonly certificateLookups = new Map<string, Person>();

  /** Asks only about a recipient without an S/MIME certificate, who has
   * the same base domain as one of our identities, if that identity has an
   * S/MIME certificate itself. Only then we may find one here, and need it.
   * Costs a server round trip only once per email address. */
  async fetchCertificate(recipient: PersonUID): Promise<void> {
    if (getPublicKeyForPersonUID(recipient, SMIMEPublicKey)) {
      return;
    }
    let domain = getBaseDomainFromHost(getDomainForEmailAddress(recipient.emailAddress));
    if (!this.account.identities.some(
           identity => usesCrypto(identity, SMIMEPrivateKey) &&
           getBaseDomainFromHost(getDomainForEmailAddress(identity.emailAddress)) == domain)) {
      return;
    }
    let emailAddress = recipient.emailAddress.toLowerCase();
    let entry = this.certificateLookups.get(emailAddress);
    if (!entry) {
      entry = this.newPerson();
      entry.emailAddresses.add(new ContactEntry(emailAddress, "work", "mailto"));
      this.certificateLookups.set(emailAddress, entry);
    }
    await entry.fetchEncryptionKeys();
    let key = getPublicKeyForPerson(entry, SMIMEPublicKey);
    if (key) {
      recipient.encryptionPublicKey = key;
    }
  }
}
