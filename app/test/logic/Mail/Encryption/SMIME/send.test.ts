// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../../logic/app";
import { MailIdentity } from "../../../../../logic/Mail/MailIdentity";
import { SMIMEPrivateKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { SMIMEPublicKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { SMIMESend } from "../../../../../logic/Mail/Encryption/SMIME/SMIMESend";
import { findOrCreatePersonUID } from "../../../../../logic/Abstract/PersonUID";
import type { EMail } from "../../../../../logic/Mail/EMail";
import { setupTestFolder } from "../../SQL/setup";
import MailComposer from "../../../../../../desktop/backend/node_modules/nodemailer/lib/mail-composer/index.js";
import { expect, test, describe } from "vitest";

// The browser has these, but Node does not.
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
globalThis.window ??= globalThis as any; // `setCertificate()` digests with `window.crypto`
// `logic/app` installs a localStorage that forgets everything, but the send
// format has to survive, so replace it.
globalThis.localStorage = {
  values: new Map<string, string>(),
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    this.values.set(key, value);
  },
} as any;

/**
 * Composes the mail with the real MIME generator, signs and encrypts it,
 * and reads it back in, the way the recipient app does.
 * Alice sends, and we read the message as the recipient User,
 * so both identities live in the same test account.
 */
async function sendAndRead(sendFormat: "text" | "html", shouldEncrypt: boolean): Promise<{ sent: string, read: EMail }> {
  localStorage.setItem("mail.send.format", JSON.stringify(sendFormat));
  let { folder } = await setupTestFolder({
    // <copied from="desktop/backend/backend.ts">
    getMIMENodemailer: async (mail: any) => new Uint8Array(await new MailComposer(mail).compile().build()),
    getCACertificates: async () => {
      throw new Error("getCACertificates is not a function"); // as on mobile and webmail
    },
  });
  let errors: Error[] = [];
  folder.account.errorCallback = ex => errors.push(ex);
  let senderKey = await SMIMEPrivateKey.importPrivateKey(kAlicePrivateKey + kAliceCertificate);
  let sender = new MailIdentity(folder.account);
  sender.emailAddress = "alice@example.com";
  sender.realname = "Alice";
  sender.encryptionPrivateKeys.add(senderKey);
  let recipient = new MailIdentity(folder.account);
  recipient.emailAddress = "user@example.com";
  recipient.realname = "User";
  recipient.encryptionPrivateKeys.add(await SMIMEPrivateKey.importPrivateKey(kUserPrivateKey + kUserCertificate));
  folder.account.identities.addAll([sender, recipient]);
  appGlobal.emailAccounts.add(folder.account);

  let mail = folder.newEMail();
  mail.identity = sender;
  mail.from = findOrCreatePersonUID("alice@example.com", "Alice");
  let to = findOrCreatePersonUID("user@example.com", "User");
  to.encryptionPublicKey = await SMIMEPublicKey.importPublicKey(kUserCertificate);
  mail.to.add(to);
  mail.subject = "Test";
  mail.text = "Hällo wörld";
  mail.html = "<p>Hällo wörld</p>";
  mail.signedByKeyID = senderKey.id;
  mail.shouldEncrypt = shouldEncrypt;
  let sent = (await SMIMESend.encryptAndSign(mail)).sendRawMIME;

  let read = folder.newEMail();
  read.mime = new TextEncoder().encode(sent);
  await read.parseMIME();
  expect(errors.map(ex => ex.message)).toEqual([]);
  return { sent, read };
}

/** The message headers, i.e. everything before the body */
function headers(mime: string): string {
  return mime.slice(0, mime.indexOf("\r\n\r\n"));
}

/** The first part of a `multipart/signed`, i.e. the entity that is signed */
function signedEntity(mime: string): string {
  let boundary = headers(mime).match(/boundary="(.+?)"/)[1];
  return mime.split(`--${boundary}\r\n`)[1];
}

describe("Signing and encrypting keep the headers of the signed entity", () => {
  test("a text-only message keeps its transfer encoding", async () => {
    let { sent, read } = await sendAndRead("text", false);
    expect(signedEntity(sent)).toContain("Content-Type: text/plain; charset=utf-8");
    expect(signedEntity(sent)).toContain("Content-Transfer-Encoding: quoted-printable");
    expect(headers(sent)).not.toContain("Content-Transfer-Encoding"); // belongs to the signed part
    expect(read.text.trim()).toBe("Hällo wörld");
  });

  test("an encrypted text-only message keeps its transfer encoding", async () => {
    let { sent, read } = await sendAndRead("text", true);
    expect(headers(sent)).toContain("Content-Transfer-Encoding: base64"); // for the CMS blob
    expect(read.wasEncrypted).toBe(true);
    let decrypted = new TextDecoder().decode(read.mime);
    expect(signedEntity(decrypted)).toContain("Content-Transfer-Encoding: quoted-printable");
    expect(read.text.trim()).toBe("Hällo wörld");
  });

  test("a multipart message keeps its folded content type", async () => {
    let { sent, read } = await sendAndRead("html", false);
    expect(signedEntity(sent)).toContain("Content-Type: multipart/alternative;\r\n boundary=");
    expect(read.text.trim()).toBe("Hällo wörld");
    expect(read.html).toContain("Hällo wörld");
  });
});

/* Test keys, generated with:
 * openssl req -x509 -newkey rsa:2048 -keyout alice.key -out alice.crt -days 7300 -nodes \
 *   -subj "/CN=Alice/emailAddress=alice@example.com" \
 *   -addext "subjectAltName=email:alice@example.com"
 * and the same for User <user@example.com>. */
const kAlicePrivateKey = `
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

const kAliceCertificate = `
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

const kUserPrivateKey = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCr1abvdL6s7jfQ
f7uVwm7n8mwHqNO7Yy+YwBbOCswAKfKIz1X6MeYgXSbu6y7RCsjYQgNp5YKH0hlP
Ei0RfysgkcPNO50ZsiNFMn1CJcTgiVrv1Xidt186xXxvQUR3wPxwgKLALXPzfBvy
/ZekCjcuLmaxFDltVm6WFYrMiTHeE7bOBGUfKfrZU9V+oGOytc5Hj0ehLhqKmZ9T
7hUyG0uaKoJ7f7O01KUdqw1376jS7VSZyLCCMw4RP5Lfz9GJdFEyjkLs11o/OYzO
gGO/RLA/WEn9meXJdbQnpvTZSsUjfVfanC0e/caKuBRrNUUt3sCk/CewytJVCj4z
hzxEgi3jAgMBAAECggEAHGCZQ/xMrPReRVGC4hWNCUMQsicgaFbV+mzmlzpTPEex
JQTQlxP8hCW+E0DFp4IXbxdfxvI/Hz0ELvm6daRBtAw+gLsyk5bGmlvfMbhZDhfA
69CeLbWlxWftx9XIf9pgFhg4SHJ5LqG1X+ifTVjeigLhtKa5YSQf+Ssvk92oXZsv
2POTyH1u5DJOXD+ir4so4L7mkEbbIwFm6LA04c7PHsXtMZNLaYRDSODjRNCQhmFA
SNunzOq9dpl46YzUD/3dIBuG+a3DLr4d9N87K5M9o9GlMYL8Czk/Wz0e5G4ES5D7
T3RPMte4YQKAdQy7+HX1GWcCi1bi3ETVaprXECA1yQKBgQDyfz5t6dLONjtAAgwr
IspXKjNFg3BeHT8WQdCy+UQjfgRNVc9S3EY0Z5nUEzmDlCaxd3uNlGVrxvRhSfFc
ePDd/TBFFD6aL1M2Ghzxd796NBtV0DPUR2C/ftrxNNDaHOPOVrrcEn3xR88McnWy
p4QrsYLYdz7p1Rlua1csG5kntQKBgQC1ZyBN00TJZX+CkxLKngVVAkIHk24h/3KR
ucpe4vZniM/BZkxfUBunxdcIlHi1sopmb9ysRTCE/9Wl74VvcHQAa2ZKvPnNmoBO
KoI99nltOcf20qL8ebOh1mm1N/sGQrhQJUCNmQaUsbSOl+g1U3orYLPOMAcXC701
IEpTgGvONwKBgCiGKyCjGp9rYKtprC7pOXcnjjnnpTeVG53UkdPW5BQqUv25gVQP
i4vmZEaUj9/1OiIeHX+jdO916BD6EmOpslbmoNJqd6u8jONVqdCQemcpngfRK1gm
NXzK7juw39YTTd6Fj+SHEpTnsyoZVqHsbKIAoCUciF77Ray2M3MjiYyhAoGBAJls
qGjKSAJiQu8n/xu5fN8CMuB/dAVzLO5Nifio0yiMENMM94khktJaRN2v3UwnvmCX
ObfGKRxD2OooY9316Va1f2W04T5g7yWtVEyd2uNjnFmIm2sYb7JwSyWHPFt2MLcw
WqGoDGXUytZTaoU3njtz5X99JXH7bsKxFcv78LIPAoGAPwMmY1Mj6kQuKBYLVtdg
vPX6oJegxEmqHURsyw976VdT1G02CxZRDY+IGdaO0lcdEjWwvKVkngRzGr+GljKY
iMMR9BCp/iEkjUK/bM6F/grSH+HM2RReb90Ycd+ZBp+ZEXEUvdFNUo+MqaOB+NXr
zl1CNTtT5ikuRkmEVJa7gTE=
-----END PRIVATE KEY-----
`;

const kUserCertificate = `
-----BEGIN CERTIFICATE-----
MIIDXjCCAkagAwIBAgIUDM+iDLbIL9gdahCFEXiESRzD2GkwDQYJKoZIhvcNAQEL
BQAwMDENMAsGA1UEAwwEVXNlcjEfMB0GCSqGSIb3DQEJARYQdXNlckBleGFtcGxl
LmNvbTAeFw0yNjA5MDMwNjIzMThaFw00NjA4MjkwNjIzMThaMDAxDTALBgNVBAMM
BFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20wggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCr1abvdL6s7jfQf7uVwm7n8mwHqNO7Yy+Y
wBbOCswAKfKIz1X6MeYgXSbu6y7RCsjYQgNp5YKH0hlPEi0RfysgkcPNO50ZsiNF
Mn1CJcTgiVrv1Xidt186xXxvQUR3wPxwgKLALXPzfBvy/ZekCjcuLmaxFDltVm6W
FYrMiTHeE7bOBGUfKfrZU9V+oGOytc5Hj0ehLhqKmZ9T7hUyG0uaKoJ7f7O01KUd
qw1376jS7VSZyLCCMw4RP5Lfz9GJdFEyjkLs11o/OYzOgGO/RLA/WEn9meXJdbQn
pvTZSsUjfVfanC0e/caKuBRrNUUt3sCk/CewytJVCj4zhzxEgi3jAgMBAAGjcDBu
MB0GA1UdDgQWBBSC/AGRI+gFMhKI2uvN7CxpRTpBszAfBgNVHSMEGDAWgBSC/AGR
I+gFMhKI2uvN7CxpRTpBszAPBgNVHRMBAf8EBTADAQH/MBsGA1UdEQQUMBKBEHVz
ZXJAZXhhbXBsZS5jb20wDQYJKoZIhvcNAQELBQADggEBAB8ClJaNQZ1ba9jjLQsW
WmYE3UtFNzT5G+VyQW8nnh4qzbe/OZBcliyQQ7mVJ54IrDzGJ3zCywEilLVaXOEY
IZWqgYMBLtiXkJsFRbCrv3ancWdEKL92QlvqfDEnqnird7KMS0gEVRr+uNl8uEJk
dsgc9bhthksyQIELA3iPlv27lXL46gmw8VhItD1qUWBkm6bc8aXuSDWbntMevJ96
NFUhHCO10AGO4NddnJvi9AHykdTWqk20lCrYe+MmJ066uvoRU/stlneaHe/2Ik6Z
8sAGAlsfGNPvXm6p6lGkhLZ+ANk+Qpe3n1bGZH3YqOKKmeAtauqxHqz1vkx/A6Wx
f4Y=
-----END CERTIFICATE-----
`;
