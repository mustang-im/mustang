// The key classes use the app singleton. Importing it first breaks the
// import cycle, which would otherwise leave the base classes undefined.
import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { SMIMEPrivateKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { SMIMEPublicKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { SMIMESend } from "../../../../../logic/Mail/Encryption/SMIME/SMIMESend";
import { MailIdentity } from "../../../../../logic/Mail/MailIdentity";
import { findOrCreatePersonUID } from "../../../../../logic/Abstract/PersonUID";
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

/* Our own key and certificate:
 * openssl req -x509 -newkey rsa:2048 -keyout alice.key -out alice.crt \
 *   -days 3650 -nodes -sha256 -subj "/CN=Alice/emailAddress=alice@example.com" \
 *   -addext "subjectAltName=email:alice@example.com" */
const kMyKeyAndCertificate = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDoW74WldRvCIU9
rMq5izDq/PNwHrAmqHY+w2GCLyoMjcbwT+c6w+0oXF6IFwSermY0aW3SmC0TfpEJ
+lTDYY/JMKVmeYcnEZTObSHfvy9u/4nFN0PbeJL/9fCnvRG5W/gqFJDNqstI0ubK
C1t/M58J2wPBwMF32YKZiFcJITY5oAAYwP2cvH820oKsamJGfPXNbAY0wHo6T6v1
K+lZeDOOoOdZDhsNwonlsrAnzRNj4nWShF5G7BO/FCA9nxeKHtVtv5YhVwYojlyg
61sv5Jr95MQSUxHZXVlN6bG13MmlFc4Fp2xlvfhEOhPaud1pN6yjJcZ+ifieox93
R9kLyWlLAgMBAAECggEANWvOTswAzMxVMeJVs4XsZ8JjR75OenzVvsVV2EP2s28v
M1XzkB+2mUZvV3OPVNo81kT9AmOJTYeWWghrT4ZRNAzSojZDm/hfUXxmwtXmVms6
5hQ4Li/RADcvrqj597dM3YPf7OEdHq+abw5gaWTZZj8r5HJoKKFh9OGTPR6dJG8U
H/KcNTUrs/X7Fz3jCDX5Z4mqpjUsqhGeX7v9yjAXg7GaKqKyLMj/Tlsu+OtQ9pye
/3ConHfKzrTpmFThtaDPROOH+vnNvqciCvbzD5FseGytEu1zy0YOASNfYnAd/611
vt0ZuH8yGFEmdmZJylRPoEeObfm5mvioRGGlCjPidQKBgQD1xz9X/0BOKJyrwdft
AN8FolKwhftpxKfkVjtMFwx0tDI3gp4NT6LNiWUPb+cXjRkLWSGqwv+sfma0c68G
w8otErTSCoYWm/8MHCtnJS9B3iaJ93AftjOdUhbip+QGRbPlTcCVU72VDmj7CaJ8
eh4ZQHg4dp2kZD8Uwmw50feylQKBgQDyBZ2cNKhXmqPIRFcbTHJoQ3HZu5VZdl9n
BogQiyHrbBZkIA8CQfK1zgkvhx+Bj8qv9Z4QbJSeZPb7yQMejbo8QIYTHEg8vH/x
jNQr1DIQar5uTkGGzm1KiWnZ9P7/6YWmNpMpchl9MCNMoKgOOUCARRp3jWd0qLiD
WnIsbyCUXwKBgDHAHVBguNGZYu1Zla3B6WMoknhtBpFIX3vXALXMTJcrCqc152xm
XFwinbRcQHkB9LnZVvlL85klFQEeEaXa6Afrq3KA8teMyDnZUefVHRXGNCLlVWr1
5MjJnxxOQ9gJL/sQnBUeGFgdzJ5UOvHbflA6PpufVxW5vRMkr+ecWvlpAoGBAKP/
jCqCQCSExED7li8IYWoncamCBBUIMmOEuITFUunNZ2rXknQMLiRmBjFvlbjcsBMG
E+K7QQYIEpjRQEze6vjTHEcs3gJSFTygGlHMy1P2kS3710k67jIY5WJtMrJFEmxs
BNKL35vGF9Vf9CEXSI7ixKmIZzdU8RsJGd7kOqZvAoGAVMWLU1Ha79nukSJZpYQW
qTfkhwtPf/HqF59WvxEd90cW31qd26j1lMcLtJJc2guQuClDyPGIEGDlAcePds1i
LRBe8MPxL0BP90+3Pjgmli+B5yxdNwFlkxgPSH6x/y3CKejFKbUtbD4eCzgJGldh
dv9kwvEGDoHjj/L7wZXzhIw=
-----END PRIVATE KEY-----
-----BEGIN CERTIFICATE-----
MIIDYzCCAkugAwIBAgIUJgpLRS4T2zhqWOyAiMxINIKOqAYwDQYJKoZIhvcNAQEL
BQAwMjEOMAwGA1UEAwwFQWxpY2UxIDAeBgkqhkiG9w0BCQEWEWFsaWNlQGV4YW1w
bGUuY29tMB4XDTI2MDkwMzA2MzkzNFoXDTM2MDgzMTA2MzkzNFowMjEOMAwGA1UE
AwwFQWxpY2UxIDAeBgkqhkiG9w0BCQEWEWFsaWNlQGV4YW1wbGUuY29tMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6Fu+FpXUbwiFPazKuYsw6vzzcB6w
Jqh2PsNhgi8qDI3G8E/nOsPtKFxeiBcEnq5mNGlt0pgtE36RCfpUw2GPyTClZnmH
JxGUzm0h378vbv+JxTdD23iS//Xwp70RuVv4KhSQzarLSNLmygtbfzOfCdsDwcDB
d9mCmYhXCSE2OaAAGMD9nLx/NtKCrGpiRnz1zWwGNMB6Ok+r9SvpWXgzjqDnWQ4b
DcKJ5bKwJ80TY+J1koReRuwTvxQgPZ8Xih7Vbb+WIVcGKI5coOtbL+Sa/eTEElMR
2V1ZTemxtdzJpRXOBadsZb34RDoT2rndaTesoyXGfon4nqMfd0fZC8lpSwIDAQAB
o3EwbzAdBgNVHQ4EFgQUFi5fHJ4Ay52QpawzpIVkuoRag5IwHwYDVR0jBBgwFoAU
Fi5fHJ4Ay52QpawzpIVkuoRag5IwDwYDVR0TAQH/BAUwAwEB/zAcBgNVHREEFTAT
gRFhbGljZUBleGFtcGxlLmNvbTANBgkqhkiG9w0BAQsFAAOCAQEAL0ZppnhHoBqO
dR19wa/E4OjvfSbZGG/r1JXClwJf727qT1thkcRvM79gwVsseSciDcEZ6N4AHBxS
XnxDEM7zS6wkAUTrGmPglg33sHr/NcfJCw4ZARJQHfdfZ1MEe2paxqNsEbsMEGDj
vh9Ypc583+UE1Aijd3P/ZawPc3W9DxZFc4JYskrfIc6oWmwkJDDESB2LjS3Nej6r
PBzPep1HNvVAfxsAw+7Lhq+YFWHSBL1CdaK19D7U9+C9UGKshd3Zif1h7svA8o4o
4Ifb8xdtde2X4bgZNymZ1exSel39a6sKheZ6zNk2wS0AyHRXyfgK7NRWg1cSQi3D
sk6K0qOkEw==
-----END CERTIFICATE-----`;

/* The certificate of a correspondent who has an EC key. See signedMessages.ts */
const kECCertificate = `-----BEGIN CERTIFICATE-----
MIIB3TCCAYOgAwIBAgIUSt5QlwOZ5QNWuBcfFnoUzDIVBP4wCgYIKoZIzj0EAwIw
NTERMA8GA1UEAwwIRUMgQWxpY2UxIDAeBgkqhkiG9w0BCQEWEWVjMjU2QGV4YW1w
bGUuY29tMB4XDTI2MDkwMzA2MjcwNloXDTM2MDgzMTA2MjcwNlowNTERMA8GA1UE
AwwIRUMgQWxpY2UxIDAeBgkqhkiG9w0BCQEWEWVjMjU2QGV4YW1wbGUuY29tMFkw
EwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEOnaFMyGVQuhyzmE/5VGaj4LudsPFMY/R
y2Y0n0d/9C3PniHLV+29ZIpl8a8DODBVP61w6O0Fgkta4TaLOFWlXaNxMG8wHQYD
VR0OBBYEFG4bUTxKhpOlazlgeZ1CVDvW0byEMB8GA1UdIwQYMBaAFG4bUTxKhpOl
azlgeZ1CVDvW0byEMA8GA1UdEwEB/wQFMAMBAf8wHAYDVR0RBBUwE4ERZWMyNTZA
ZXhhbXBsZS5jb20wCgYIKoZIzj0EAwIDSAAwRQIhAILDqsn0T7n39WToJAxgbFo+
lqKWt5faiS8BUJTxvnWyAiAq/SUgd10eYrzPGOuzQQRa/V4jYGPOAGQ8NnhZbA/F
Vg==
-----END CERTIFICATE-----`;

describe("Encrypting to a recipient", () => {
  test("says so, when their certificate is not RSA", async () => {
    // nodemailer lives in the backend, so the tests cannot reach it
    let { folder } = await setupTestFolder({
      getMIMENodemailer: async () =>
        new TextEncoder().encode("Content-Type: text/plain\r\n\r\nHello\r\n"),
    });
    let identity = new MailIdentity(folder.account);
    identity.emailAddress = "alice@example.com";
    identity.encryptionPrivateKeys.add(await SMIMEPrivateKey.importPrivateKey(kMyKeyAndCertificate, ""));
    folder.account.identities.add(identity);

    let mail = folder.newEMail();
    mail.identity = identity;
    mail.from = findOrCreatePersonUID("alice@example.com", "Alice");
    let recipient = findOrCreatePersonUID("ec256@example.com", "EC Alice");
    recipient.encryptionPublicKey = await SMIMEPublicKey.importPublicKey(kECCertificate);
    mail.to.add(recipient);
    mail.text = "Hello";
    mail.shouldEncrypt = true;

    await expect(SMIMESend.encryptAndSign(mail)).rejects.toThrow("ec256@example.com");
  });
});
