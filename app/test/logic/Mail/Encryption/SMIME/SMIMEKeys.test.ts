// The key classes use the app singleton. Importing it first breaks the
// import cycle, which would otherwise leave the base classes undefined.
import "../../../../../logic/app";
import { SMIMEPrivateKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { expect, test, describe } from "vitest";

describe("Newly created private key", () => {
  test("is named after its key ID and has the email address of the identity", async () => {
    let key = await SMIMEPrivateKey.createNewPrivateKey("ben@example.com");
    expect(key.name).toBe(key.id.substring(0, 4).toUpperCase());
    expect(key.userIDs.contents).toEqual(["ben@example.com"]);
    let csr = await key.generateCSRFile({ CN: "Ben Bucksch", E: "ben@example.com" });
    expect(csr.name).toBe(`CertificateRequest-ben@example.com-${key.name}.csr`);
  }, 60000); // generating an RSA 4096 key takes a while
});
