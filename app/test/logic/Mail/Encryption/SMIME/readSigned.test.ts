import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { getPublicKeyByKeyID } from "../../../../../logic/Mail/Encryption/KeyUtils";
import { TrustLevel } from "../../../../../logic/Mail/Encryption/enums";
import type { EMail } from "../../../../../logic/Mail/EMail";
import { kClearSigned, kClearSignedLF, kClearSignedOctetStream, kOpaqueSigned, kECClearSigned256, kECClearSigned384, kECClearSigned521 } from "./signedMessages";
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

/**
 * Reads the message, with an account that has no private key at all,
 * and the sender not in the addressbook. The signer certificate travels
 * with the message, so the signature must verify nonetheless.
 *
 * `getCACertificates` throws, as on mobile and webmail, whose backends do
 * not implement it. Only the trust level depends on it, so the signature
 * must survive. `SMIMEPublicKey` caches the CA certificates per process,
 * so this has to be the same for all tests in this file.
 */
async function readMessage(mime: string): Promise<EMail> {
  let { folder } = await setupTestFolder({
    getCACertificates: async () => {
      throw new Error("getCACertificates is not a function");
    },
  });
  let email = folder.newEMail();
  email.mime = new TextEncoder().encode(mime);
  await email.parseMIME();
  return email;
}

function toCRLF(mime: string): string {
  return mime.replace(/\n/g, "\r\n");
}

/** What the message reader shows the signature for */
async function signedWithKeyName(email: EMail): Promise<string | null> {
  let key = await getPublicKeyByKeyID(email.signedByKeyID, email);
  if (!key || key.trustLevel == TrustLevel.Distrusted) {
    return null;
  }
  return key.name;
}

describe("Signature of a received message, without an own private key", () => {
  test("clear-signed message", async () => {
    let email = await readMessage(toCRLF(kClearSigned));
    expect(email.text.trim()).toBe("Hello, this is signed.");
    expect(await signedWithKeyName(email)).toBe("F9D7");
  });

  test("opaque-signed message, as Outlook sends it", async () => {
    let email = await readMessage(toCRLF(kOpaqueSigned));
    expect(email.text.trim()).toBe("Hello, this is signed.");
    expect(await signedWithKeyName(email)).toBe("F9D7");
  });

  test("a message with bare LF line endings, as NSS writes them", async () => {
    let email = await readMessage(kClearSignedLF);
    expect(email.text.trim()).toBe("Hello, this is signed.");
    expect(await signedWithKeyName(email)).toBe("B687");
  });

  test("a signature that was delivered as a plain file, as Microsoft sends it", async () => {
    let email = await readMessage(toCRLF(kClearSignedOctetStream));
    expect(email.text.trim()).toBe("Hello, this is signed.");
    expect(await signedWithKeyName(email)).toBe("B687");
    expect(email.attachments.last.hidden).toBe(true);
  });

  test("an unknown CA leaves the trust level to the user", async () => {
    let email = await readMessage(toCRLF(kClearSigned));
    let key = await getPublicKeyByKeyID(email.signedByKeyID, email);
    expect(key.trustLevel).toBe(TrustLevel.Sender);
  });

  test("a certificate for another address does not sign for the sender", async () => {
    let email = await readMessage(toCRLF(kClearSigned.replace("Alice <alice@", "Bob <bob@")));
    expect(email.text.trim()).toBe("Hello, this is signed.");
    expect(email.signedByKeyID).toBe(null);
    expect(email.from.encryptionPublicKey).toBeFalsy();
  });

  test("the sender address is compared case-insensitively", async () => {
    let email = await readMessage(toCRLF(kClearSigned.replace("alice@example.com", "Alice@Example.COM")));
    expect(await signedWithKeyName(email)).toBe("F9D7");
  });

  test("a signature from hours before the message was sent does not count", async () => {
    // The signature was made at 20:20:12 on the day before
    let sentLater = "Date: Tue, 01 Sep 2026 05:20:12 +0000";
    let clearSigned = await readMessage(toCRLF(kClearSigned.replace(/Date: .*/, sentLater)));
    expect(clearSigned.text.trim()).toBe("Hello, this is signed.");
    expect(clearSigned.signedByKeyID).toBe(null);
    let opaqueSigned = await readMessage(toCRLF(kOpaqueSigned.replace(/Date: .*/, sentLater)));
    expect(opaqueSigned.text.trim()).toBe("Hello, this is signed.");
    expect(opaqueSigned.signedByKeyID).toBe(null);
  });
});

describe("Signature made with an elliptic curve key", () => {
  test.each([
    ["P-256", 256, kECClearSigned256],
    ["P-384", 384, kECClearSigned384],
    ["P-521", 521, kECClearSigned521],
  ])("%s verifies", async (curve, keyLengthInBits, mime: string) => {
    let email = await readMessage(toCRLF(mime));
    expect(email.text.trim()).toBe("Hello, this is signed.");
    let key = await getPublicKeyByKeyID(email.signedByKeyID, email);
    expect(key.cipher).toBe("ECDSA/" + curve);
    expect(key.keyLengthInBits).toBe(keyLengthInBits);
  });

  test("a changed message does not verify", async () => {
    let email = await readMessage(toCRLF(kECClearSigned256.replace("this is signed", "this was changed")));
    expect(email.text.trim()).toBe("Hello, this was changed.");
    expect(email.signedByKeyID).toBe(null);
  });
});
