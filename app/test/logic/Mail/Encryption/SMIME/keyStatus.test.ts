// The key classes use the app singleton. Importing it first breaks the
// import cycle, which would otherwise leave the base classes undefined.
import "../../../../../logic/app";
import { SMIMEPublicKey, KeyStatus } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { TrustLevel } from "../../../../../logic/Mail/Encryption/enums";
import { appGlobal } from "../../../../../logic/app";
import { expect, test, describe } from "vitest";

// `verifySignature()` compares using `indexedDB.cmp()`,
// which the browser has, but Node does not.
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

// Our test CA is the only trusted root. `SMIMEPublicKey` caches this per
// process, so it has to be the same for all tests in this file.
appGlobal.remoteApp ??= {
  async getCACertificates(type: string): Promise<string[]> {
    return type == "bundled" ? [kTestCA] : [];
  },
};

describe("Trust level of a certificate that a CA vouches for", () => {
  test("is raised to the CA level", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kEvaCert);
    expect(await key.keyStatus()).toBe(KeyStatus.Valid);
    expect(key.trustLevel).toBe(TrustLevel.ThirdParty);
    expect(key.caName).toBe("Test CA");
  });

  test("stays distrusted, when the user distrusted it", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kEvaCert);
    key.trustLevel = TrustLevel.Distrusted;
    expect(await key.keyStatus()).toBe(KeyStatus.Valid);
    expect(key.trustLevel).toBe(TrustLevel.Distrusted);
  });
});

/* Our test CA, and a certificate that it issued.
 * openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out ca.key
 * openssl req -x509 -key ca.key -out ca.crt -days 3650 -sha256 \
 *   -subj "/CN=Test CA/2.5.4.97=VATDE-999" \
 *   -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign"
 * openssl req -new -key eva.key -out eva.csr \
 *   -subj "/CN=Eva/2.5.4.97=VATDE-123/emailAddress=eva@example.com"
 * openssl x509 -req -in eva.csr -out eva.crt -CA ca.crt -CAkey ca.key -days 3000 -sha256 \
 *   -set_serial 0x2a -extfile <(printf "basicConstraints=CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=emailProtection\nsubjectAltName=email:eva@example.com\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\n")
 */
const kTestCA = `
-----BEGIN CERTIFICATE-----
MIIDPTCCAiWgAwIBAgIUcJkmmMw4TSqmRlLPccH3/BHmkmIwDQYJKoZIhvcNAQEL
BQAwJjEQMA4GA1UEAwwHVGVzdCBDQTESMBAGA1UEYQwJVkFUREUtOTk5MB4XDTI2
MDkwMzA2Mjg1MFoXDTM2MDgzMTA2Mjg1MFowJjEQMA4GA1UEAwwHVGVzdCBDQTES
MBAGA1UEYQwJVkFUREUtOTk5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEAuVMbuQyUAAVUfLIhYQap5HXOlFzAzNa/JU7zk04qTwL2FwvwQeMQnx2Jk9LL
QEPvHCxtZg3gDDJlyMnmOfSSUibtCDbWjUOSoDsoe//ap0xswt+yt8M4GHu6699Y
kWwhznIcCBAnTgxhzpqpTQltKF5CmSIih4C9fEiajNPNGajlYuJFcqfN6czxOuiH
jX9rf9AlSedAvvzKXmrF08fTad3E2HFQ3gjzOOW5sHoOFy4l4ewDDRUr63LOtIqu
izVxFUMQnFu5FdUB5u8KTk5FzcEVh/Y0RbnoMAzMsuoTXnWUxY5h0D5HCjy4wLyL
dQUzC94Ahp2SZj/Zrdt6PkwXjwIDAQABo2MwYTAdBgNVHQ4EFgQUhvNcd2obmnDc
913nfrD3oVQH0b0wHwYDVR0jBBgwFoAUhvNcd2obmnDc913nfrD3oVQH0b0wDwYD
VR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQELBQADggEB
AK0jtEkEccykLpeITue8KeemRdfC7N3mQfH88FImDgJesbmFmneS7zGf78mEOZla
zy370OoDjC63w7Kp/gYu/Kr6y8Ml3jk20R+qIOGPJP7NgStlgiH818c9tsSyMEWU
xqTx6bzTRtL20wpeoykCRFDpefhcVHpK9W2oth5DHOFTx/VZ4Z9L9caALh0cOWjS
vBnk6cZzsJa8J+S+kXAMECC5qUTPOBAdPGWdSPjaGrDS8t7nkAJGXWA162IGIvq1
mZcEdMA85ClEdR+IPYVEAdYTQBKMSIeoSFi+2jJ+0gh1SgqAePOra6oBtTkHxiLh
pDts0aruPhe9R3k/Xn7AwsU=
-----END CERTIFICATE-----
`;

const kEvaCert = `
-----BEGIN CERTIFICATE-----
MIIDczCCAlugAwIBAgIBKjANBgkqhkiG9w0BAQsFADAmMRAwDgYDVQQDDAdUZXN0
IENBMRIwEAYDVQRhDAlWQVRERS05OTkwHhcNMjYwOTAzMDYyODUwWhcNMzQxMTIw
MDYyODUwWjBCMQwwCgYDVQQDDANFdmExEjAQBgNVBGEMCVZBVERFLTEyMzEeMBwG
CSqGSIb3DQEJARYPZXZhQGV4YW1wbGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEAtHnpvtitvfqLmNxgJ2IX4ZH7rcdW5CbEHwzJJbGFCZ8MzwUU
T7v0QM4Pu3soCmFvDmoqqH/JbP31wz0gkaSj+dUDhSiqCvObn5SQ7QuHvza3j6Vt
qZIx6PSJ+/lKT6iICvIWrEQkL0+/77HA/af/7Yro9hTC50O8ATctgqvC4ngS/a18
OyJSZLJy3yDFbXe6xG/uxAi3MtoWD5srQwmkYonyeEbpkwaSDGPYvhswp9/LZSTz
E490IuUtsoLg7aayDECNjHgOr/NCj97mLPWobgKBM3mXNPvt+3rDJNfRUNOx+cwI
mAPGQkcpgvm9qRl5Xyo5XRt5t5o+eR9nchj4tQIDAQABo4GPMIGMMAkGA1UdEwQC
MAAwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMEMBoGA1UdEQQT
MBGBD2V2YUBleGFtcGxlLmNvbTAdBgNVHQ4EFgQU3Zv6m443avRUCiOHUPPtrKxf
NAEwHwYDVR0jBBgwFoAUhvNcd2obmnDc913nfrD3oVQH0b0wDQYJKoZIhvcNAQEL
BQADggEBAJJbSNEs/Coqm0xiOndUWpSpZE2eXtS7dxcE36bxGS376CPDQhtA1iLF
uFNa68xeX3fFPTDTsYj24Bfs+rI9B5/YKwL/arm46uWQ4/Z4trUtGg1Snd0FbseH
u4Wxmi74h7ASVbGLeARdm5fm8l2hSJJN86dwEj86FRfAU7+AE1U2mjumH86ooJoB
fzqD+ABnuskB7d2RD+5ZhJLFgeKsAbtjPv3MftiGXbzetRbtD5RN7T+U3/rGDTA+
TeuIDYruN/Zz0GN5+/iV/F83nsc8GAu5KfXFTWRCRlNFphkQ/sj38/3/o76ZMliM
vgZwOWdT5Li5Iz5UVO4HZdZVWTp5EDQ=
-----END CERTIFICATE-----
`;
