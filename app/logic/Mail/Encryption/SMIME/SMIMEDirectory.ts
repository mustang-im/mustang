import { SMIMEPublicKey } from "./SMIMEPublicKey";
import { Certificate, SignedData } from "./SMIMEASN1";
import type { Person } from "../../../Abstract/Person";
import { assert } from "../../../util/util";

/**
 * Adds the S/MIME certificates that a directory, e.g. the Exchange GAL,
 * published for this person.
 *
 * RFC 2798 defines both attributes and states: "If available, this attribute
 * [`userSMIMECertificate`] is preferred over the `userCertificate` attribute
 * for S/MIME applications", because it also carries the certificate chain.
 *
 * @param smimeCertificates `userSMIMECertificate`: PKCS#7 SignedData, each base64-encoded
 * @param certificates `userCertificate`: DER-encoded X.509 certificates, each base64-encoded
 */
export async function addDirectoryCertificatesToPerson(person: Person, smimeCertificates: string[], certificates: string[]) {
  // The EWS GAL search results are not part of an address book, so they have no error callback
  const errorCallback = (ex: Error) => person.addressbook ? person.addressbook.errorCallback(ex) : console.error(ex);
  let foundPreferred = false;
  for (let blob of smimeCertificates) {
    try {
      person.addEncryptionPublicKey(await smimeCertificateToKey(blob));
      foundPreferred = true;
    } catch (ex) {
      errorCallback(ex);
    }
  }
  if (foundPreferred) {
    return;
  }
  await addCertificatesToPerson(person, certificates);
}

/**
 * Adds the S/MIME certificates that a directory published for this person,
 * e.g. the `userCertificate` attribute in the Exchange GAL.
 * @param certificates DER-encoded X.509 certificates, each base64-encoded
 */
export async function addCertificatesToPerson(person: Person, certificates: string[]) {
  const errorCallback = (ex: Error) => person.addressbook ? person.addressbook.errorCallback(ex) : console.error(ex);
  for (let certificate of certificates) {
    try {
      // Decoding it here rejects blobs that aren't certificates, e.g. PKCS#7.
      let pem = Certificate.encodePEM(Certificate.decodeFromBase64(certificate), { label: "CERTIFICATE" });
      person.addEncryptionPublicKey(await SMIMEPublicKey.importPublicKey(pem));
    } catch (ex) {
      errorCallback(ex);
    }
  }
}

/**
 * Reads one `userSMIMECertificate` value: a PKCS#7 SignedData whose signature
 * and content RFC 2798 tells us to ignore, and which holds the certificate of
 * the person together with the CA certificates that issued it.
 * @param blob base64-encoded PKCS#7 SignedData
 */
async function smimeCertificateToKey(blob: string): Promise<SMIMEPublicKey> {
  let certificates = SignedData.decodeFromBase64(blob, { berToDER: true }).content.certificates;
  assert(certificates?.length, "No certificate in the PKCS#7 blob");
  // The certificate of the person comes first and the rest of the chain follows,
  // which is exactly how `importPublicKey()` reads a PEM file with a chain.
  return await SMIMEPublicKey.importPublicKey(certificates
    .map(certificate => Certificate.encodePEM(certificate, { label: "CERTIFICATE" }))
    .join("\n"));
}
