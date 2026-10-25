import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { getPublicKeyByKeyID } from "../../../../../logic/Mail/Encryption/KeyUtils";
import { SMIMEPublicKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { TrustLevel } from "../../../../../logic/Mail/Encryption/enums";
import { Addressbook } from "../../../../../logic/Contacts/Addressbook";
import { findOrCreatePersonUID, type PersonUID } from "../../../../../logic/Abstract/PersonUID";
import type { EMail } from "../../../../../logic/Mail/EMail";
import { kClearSigned } from "./signedMessages";
import { expect, test, describe } from "vitest";

// The browser has this, but Node does not.
globalThis.indexedDB ??= {
  cmp(a: Uint8Array, b: Uint8Array): number {
    let length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      if (a[i] != b[i]) {
        return a[i] < b[i] ? -1 : 1;
      }
    }
    return Math.sign(a.length - b.length);
  },
} as any;

/** The outer headers are not signed, so anybody can change `From:`
 * of a signed message, and the signature stays valid. */
const kSignedByAliceFromCEO = kClearSigned.replace("From: Alice <alice@example.com>", "From: CEO <ceo@example.com>");

/* openssl req -x509 -newkey rsa:2048 -keyout /dev/null -days 7300 -nodes \
 *   -subj "/CN=Bob/emailAddress=bob@example.com" \
 *   -addext "basicConstraints=critical,CA:FALSE" \
 *   -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
 *   -addext "extendedKeyUsage=emailProtection"
 * No subjectAlternativeName, so the email address is only in the subject. */
const kSubjectOnlyCert = `
-----BEGIN CERTIFICATE-----
MIIDXzCCAkegAwIBAgIUPgSbCiHzPniQcfZJjzKyL+yGIKUwDQYJKoZIhvcNAQEL
BQAwLjEMMAoGA1UEAwwDQm9iMR4wHAYJKoZIhvcNAQkBFg9ib2JAZXhhbXBsZS5j
b20wHhcNMjYxMDIyMTEyNzM4WhcNNDYxMDE3MTEyNzM4WjAuMQwwCgYDVQQDDANC
b2IxHjAcBgkqhkiG9w0BCQEWD2JvYkBleGFtcGxlLmNvbTCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAMA5Z+SMzu+bFAamC+ShrKrTz/3F9j8BCQ/vfScx
3pbzVgBnnZ7P6sNdCsuyQE5vfY9FdPv68YA/VsDgdSVhYSK0mEGlOZI/V8zn6SiC
xBDbDJHa92+2vmQ8apXpwYp1/G/mSlfQrT/3Oayi4AAZqoGe4yH2EhgsBxMpsH/L
hnGrzWWpj1Gs86yspfCO1YOSbbwVvb0cukVFwyt7EplREg7x/6rxpCL1tmdVjjQb
0JRFJfXpWR/NrP8UvCIem3ZfyN7GXnwN/9E9M9Px2I5GsutBW3ytiN/2OwrVkZ/m
AzSJZQTveJY+TeFTVM89GXLEaUcA7RJJdczBWjSYtwPmrCECAwEAAaN1MHMwHQYD
VR0OBBYEFOevCtnOiWhmaAyfjs6stJOWB8pnMB8GA1UdIwQYMBaAFOevCtnOiWhm
aAyfjs6stJOWB8pnMAwGA1UdEwEB/wQCMAAwDgYDVR0PAQH/BAQDAgWgMBMGA1Ud
JQQMMAoGCCsGAQUFBwMEMA0GCSqGSIb3DQEBCwUAA4IBAQA1HDcNF58SNeKM5t3h
9SiWjcvk0DINYrA3XcDuajgq8Y86TvMm1oXjQxPK9LhCj/QFiYlx8Yvd3dzVtLC1
AqvQ9X8UkzBrIjBj+1Q+zVSUBRf4IpHDFcuIkCfB9C4T2JNehh+h1vVzasgEu/h0
oij5RUOakFzVkRWr76NpXn82bpUxvQedCmI0jnKL75FyI8TCsQ4lyc0sKWJwMen7
wmoWWpW7BCGDlvMc8YK/zdGTfyhEgWexZqYuAbZAxiJjuUCVrPrXYeq7bNscZvNL
ThEW1oQEATr0TMrN5YneXsjoLZcLT5sRAb4LHKvhNd5aZUzqCB21H+jHl5YFKUfD
aMJP
-----END CERTIFICATE-----
`;

/** @param from As the server gives it before we have the MIME source */
async function readMessage(mime: string, from?: PersonUID): Promise<EMail> {
  let { folder } = await setupTestFolder({ getCACertificates: async () => [] });
  let email = folder.newEMail();
  if (from) {
    email.from = from;
  }
  email.mime = new TextEncoder().encode(mime.replace(/\n/g, "\r\n"));
  await email.parseMIME();
  return email;
}

describe("Signature with a certificate for another address than From:", () => {
  test("shows a warning with the address of the certificate, not the signature of the sender", async () => {
    let email = await readMessage(kSignedByAliceFromCEO);
    let signingKey = await getPublicKeyByKeyID(email.signedByKeyID, email);
    expect(signingKey).toBeTruthy(); // the signature itself is valid
    expect(email.isSignedBySomeoneElse(signingKey)).toBe(true);
    expect(signingKey.userIDs.contents).toContain("alice@example.com");
  });

  test("is not stored as the key of the sender", async () => {
    let email = await readMessage(kSignedByAliceFromCEO);
    expect(email.from.encryptionPublicKey).toBeFalsy();
    let ceo = email.from.createPerson(new Addressbook());
    expect(ceo.encryptionPublicKeys.isEmpty).toBe(true);
  });
});

describe("Signature with a certificate for the From: address", () => {
  test("in another case is shown as signed by the sender", async () => {
    let email = await readMessage(kClearSigned, findOrCreatePersonUID("Alice@Example.COM", "Alice"));
    let signingKey = await getPublicKeyByKeyID(email.signedByKeyID, email);
    expect(signingKey.trustLevel).not.toBe(TrustLevel.Distrusted);
    expect(email.isSignedBySomeoneElse(signingKey)).toBe(false);
    expect(email.from.encryptionPublicKey).toBe(signingKey);
  });

  test("only in the subject is shown as signed by the sender", async () => {
    let { folder } = await setupTestFolder({ getCACertificates: async () => [] });
    let email = folder.newEMail();
    email.from = findOrCreatePersonUID("bob@example.com", "Bob");
    let signingKey = await SMIMEPublicKey.importPublicKey(kSubjectOnlyCert);
    expect(email.isSignedBySomeoneElse(signingKey)).toBe(false);
  });
});
