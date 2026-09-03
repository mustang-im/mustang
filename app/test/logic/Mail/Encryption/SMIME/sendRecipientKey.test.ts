// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../../logic/app";
import { MailIdentity } from "../../../../../logic/Mail/MailIdentity";
import { SMIMEPrivateKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { SMIMESend } from "../../../../../logic/Mail/Encryption/SMIME/SMIMESend";
import { findOrCreatePersonUID } from "../../../../../logic/Abstract/PersonUID";
import { setupTestFolder } from "../../SQL/setup";
import { expect, test } from "vitest";

globalThis.window ??= globalThis as any; // `setCertificate()` digests with `window.crypto`

test("Encrypting to a recipient whose key we do not have says so", async () => {
  let { folder } = await setupTestFolder({
    getMIMENodemailer: async () => new TextEncoder().encode(kMIME),
  });
  let identity = new MailIdentity(folder.account);
  identity.emailAddress = "alice@example.com";
  identity.realname = "Alice";
  identity.encryptionPrivateKeys.add(await SMIMEPrivateKey.importPrivateKey(kPrivateKey + kCertificate));
  folder.account.identities.add(identity);
  appGlobal.emailAccounts.add(folder.account);

  let mail = folder.newEMail();
  mail.identity = identity;
  mail.from = findOrCreatePersonUID("alice@example.com", "Alice");
  mail.to.add(findOrCreatePersonUID("stranger@example.com", "Stranger")); // we have no key for him
  mail.shouldEncrypt = true;

  await expect(SMIMESend.encryptAndSign(mail)).rejects.toThrow("Cannot encrypt to all recipients using S/MIME");
});

const kMIME =
  "From: Alice <alice@example.com>\r\n" +
  "To: Stranger <stranger@example.com>\r\n" +
  "Subject: Test\r\n" +
  "MIME-Version: 1.0\r\n" +
  "Content-Type: text/plain; charset=utf-8\r\n" +
  "\r\n" +
  "Hello\r\n";

/* Test key, generated with:
 * openssl req -x509 -newkey rsa:2048 -keyout alice.key -out alice.crt -days 7300 -nodes \
 *   -subj "/CN=Alice/emailAddress=alice@example.com" \
 *   -addext "subjectAltName=email:alice@example.com" */
const kPrivateKey = `
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC8GDjZAmfuPgfI
mLXT0U1zY55d4SNgfei2EmDy3aoWirbhdroZJRf6pUgKS4QsWaaiCmBazPL0ZIx3
3Ovwmd8AvHlRJL5qEkZJ5YqZNoaC66DNZyKYOcsHSAMVWLlHs8hmYBwjdXO4yPP1
HiAmCFKlb2iU/YX94OroycvotZtUmn9Is+kiqeDCz6x/HT061dgryzZaFTLkhKiU
LxY9I3h7H6gRM1In6qbIuz29wbc7zaMnpk0PVClF/0PMyACSW+elFK92yRm1/1xt
rbNZuEOVsooe4mS+N9OOGXEiRsFDem8N3U82GLNe2JGSrY30TNVFbU9miRDJiM45
o+AmqjJtAgMBAAECggEAKydzg3Zl2ecpagB/VwWiO2MTpn5M24qHpZ451/67U0io
BLp0n+g+xCa/jH0e6f33mR3AVZTH+QJIqAdrqlvjKgwT2WYQuc1Piwy668PywH7G
+dk7uqknx5fh/TfJ6oV46OQMEKaV0kNolUhAH/mw3HvfBq/T2heMTbResBladeJH
l7Q40MZWFIjr8zKwdW4o/u8nHTQAInL6sygIbNjSUM9L5zUxyFnvJphd0MO8vQ4/
dSP+9FZyW36/dod6fdWg/tqG4eR8FTcgCMOLzKbcXxz0Cc96Zlo1jwR+YLy69zqj
eJJoKjaDT46ZH4wchPwKIBJ1NHYgjfspinc6XlShgQKBgQDm1kpudrxmtHHJINeT
KBC3udaX/97+y2PnnFUINAEVHvcu/bIQY019mP5uGAXL6x/Dxy5qPECmZJGMD9fR
Ai0QzPhJLPsJHPv8jH71PlNSEVO8+gPh4s5Mu1KArahSxRPAJnTn/+O4CaQbvzNi
BndN/jrfej1I5C2DtoJccGUxKQKBgQDQmSp5kKH4RUZiYPOJp3Z+i49Qb63n/DL8
Ysufwvd/Upigdx8JAwBT4NBq+Lm23Ld3ZMSjAZEdpWksLDyl+Ox1YVjYfYGNISo9
fUhFj5npCeXuvW26iMrqb/4UQcLNxVZcTuSK9JP1to9d0TV0TdmhOTnWtY1qQI04
B05hXIbLpQKBgGW7nXQPijqtXdRpT/i/2JZQJb45ezrJwo7pvCPwX2XCjue70UUd
rqIi0kcM+UkEp6wt1UvmoAt1GRwkQ1YO4nOcEfSWCVDb4EZOWQmWXTw2/LO1cA6W
WZtBlzu0zRElX+34RN+WS/Lo9NVxr6CM/vl1iNbC1c2RGmoI/mzk8AP5AoGAK/s/
Y2ZFYE1q6685ahqu9zuBuhnx9unL7j7+Y+79tBC8MYksOAAz/3t1Nji/H3kmDbxn
YV8hM7j+ldu15eC4Kn+d9fdwa0tE1rYlmNUQRHxbyJyUGDJjZk66qZa79hrXfJr9
wPaUg8g8LjHALYeEjWO9eDHLYU2++MNBmXGi0ikCgYBaq27PGPRj6RYEJNLnoeSw
CnYKDB4VzcJVj9bDxKINRiPXS+0E6S+XhgrE126Wqw4owfD+RG8DQh8NxCAy5vRb
OkdM7w7vwV714p8VRLLnv0FQgiFZ37uT86oE5mg5Qs0SaVBpY39An5+Qt5GNsg4P
KQK8lDMUEtGQEuon2mcYaA==
-----END PRIVATE KEY-----
`;

const kCertificate = `
-----BEGIN CERTIFICATE-----
MIIDYzCCAkugAwIBAgIUXyuXUq+uBb5HoD/SwKsNkTrasvAwDQYJKoZIhvcNAQEL
BQAwMjEOMAwGA1UEAwwFQWxpY2UxIDAeBgkqhkiG9w0BCQEWEWFsaWNlQGV4YW1w
bGUuY29tMB4XDTI2MDkwMzA2MjAxNVoXDTQ2MDgyOTA2MjAxNVowMjEOMAwGA1UE
AwwFQWxpY2UxIDAeBgkqhkiG9w0BCQEWEWFsaWNlQGV4YW1wbGUuY29tMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvBg42QJn7j4HyJi109FNc2OeXeEj
YH3othJg8t2qFoq24Xa6GSUX+qVICkuELFmmogpgWszy9GSMd9zr8JnfALx5USS+
ahJGSeWKmTaGguugzWcimDnLB0gDFVi5R7PIZmAcI3VzuMjz9R4gJghSpW9olP2F
/eDq6MnL6LWbVJp/SLPpIqngws+sfx09OtXYK8s2WhUy5ISolC8WPSN4ex+oETNS
J+qmyLs9vcG3O82jJ6ZND1QpRf9DzMgAklvnpRSvdskZtf9cba2zWbhDlbKKHuJk
vjfTjhlxIkbBQ3pvDd1PNhizXtiRkq2N9EzVRW1PZokQyYjOOaPgJqoybQIDAQAB
o3EwbzAdBgNVHQ4EFgQUF0F17SK7ICCjTydpJIr7I/DvBG4wHwYDVR0jBBgwFoAU
F0F17SK7ICCjTydpJIr7I/DvBG4wDwYDVR0TAQH/BAUwAwEB/zAcBgNVHREEFTAT
gRFhbGljZUBleGFtcGxlLmNvbTANBgkqhkiG9w0BAQsFAAOCAQEAWnSpEFF0ULep
QpYTbOb2HcBL22IofcWyMlrN9RP0uPww9Nt6ZARZVWk8nIQrxgmHqD7C+I1RGXix
SR9kQ+0zsCbiO5gGBhnO2T+emaAK58uw4a9mfHBAAACv4XhPX70kBEuDJJmZiE0x
dCXBbvH4u/dvkqQCzCO4co6YKmhyyX2KeU0fzGdiNkTmcuMk7XOTMiTefQHpLkJv
dAXfOIEh+HG8jMkDozoFf18/cHb0YfXsFhkgx16xsFU04iWHkG0KmYgugxu4nSKe
bPcN5G0J3+GPy+ab/uhNFsL/HU6veJhZ/lSomdl47V8VtnrUKZkWi82FDJ1VWKN+
h/EjNKGJQg==
-----END CERTIFICATE-----
`;
