// The key classes use the app singleton. Importing it first breaks the
// import cycle, which would otherwise leave the base classes undefined.
import "../../../../../logic/app";
import { appGlobal } from "../../../../../logic/app";
import { SMIMEPublicKey, KeyStatus } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { TrustLevel } from "../../../../../logic/Mail/Encryption/enums";
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

/* A root CA with an EC key, as European CAs increasingly have,
 * and an RSA certificate that it issued:
 * openssl ecparam -name secp384r1 -genkey -noout -out ecca.key
 * openssl req -x509 -key ecca.key -sha384 -days 3650 -out ecca.crt \
 *   -subj "/O=Parula Test/CN=EC Test Root CA" \
 *   -addext "basicConstraints=critical,CA:TRUE" \
 *   -addext "keyUsage=critical,keyCertSign,cRLSign"
 * openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out rsaleaf.key
 * openssl req -new -key rsaleaf.key -out rsaleaf.csr \
 *   -subj "/CN=RSA Bob/emailAddress=bob@example.com"
 * openssl x509 -req -in rsaleaf.csr -out rsaleaf.crt -set_serial 0x2a \
 *   -CA ecca.crt -CAkey ecca.key -days 3650 -sha384 -extfile <(printf \
 *   "basicConstraints=CA:FALSE\nextendedKeyUsage=emailProtection\n") */
const kECRootCA = `-----BEGIN CERTIFICATE-----
MIICAjCCAYigAwIBAgIUUMPZMm11112UBnQLvwtuV4g1yQ4wCgYIKoZIzj0EAwMw
MDEUMBIGA1UECgwLUGFydWxhIFRlc3QxGDAWBgNVBAMMD0VDIFRlc3QgUm9vdCBD
QTAeFw0yNjA5MDMwNjI3MDZaFw0zNjA4MzEwNjI3MDZaMDAxFDASBgNVBAoMC1Bh
cnVsYSBUZXN0MRgwFgYDVQQDDA9FQyBUZXN0IFJvb3QgQ0EwdjAQBgcqhkjOPQIB
BgUrgQQAIgNiAAS5MDOaudETdeCRdblOuRx2eGZ8Pxi0TllbrHAMXMonSh6uWh3H
FAizCTAbUr3aOdkdtkYVWesIji6Ax2LDYP64XTDR7TT6m8xIxDmtd8KkJb3OS0j3
igdo06WFVyceeFOjYzBhMB0GA1UdDgQWBBSm76u6qSaWEIpXiGfJGsMD3DxttDAf
BgNVHSMEGDAWgBSm76u6qSaWEIpXiGfJGsMD3DxttDAPBgNVHRMBAf8EBTADAQH/
MA4GA1UdDwEB/wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjEAh3fSimEO05YZlgro
TRVq1/LgOLT6iVWdka2Pjm5Bn76k4fVdYMu1kxkcq2gEAeHwAjAMtGJ8d7G7YG+n
a0VhAVu6hC9g0azgLvxoKwZNGnNq09dtHpJuYDyJKcBB3eCDAnw=
-----END CERTIFICATE-----`;

const kRSALeaf = `-----BEGIN CERTIFICATE-----
MIICyzCCAlKgAwIBAgIBKjAKBggqhkjOPQQDAzAwMRQwEgYDVQQKDAtQYXJ1bGEg
VGVzdDEYMBYGA1UEAwwPRUMgVGVzdCBSb290IENBMB4XDTI2MDkwMzA2MjcwNloX
DTM2MDgzMTA2MjcwNlowMjEQMA4GA1UEAwwHUlNBIEJvYjEeMBwGCSqGSIb3DQEJ
ARYPYm9iQGV4YW1wbGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEApNf9JaDKNTGvSoPXCM37LxuUe01ElJAI9uUdKKly9crDruXvDgOc5ag/WvFR
FLniv29BLoj6YhavzQVU/LroFrUzh0Hs8L+W7b78qyM1lwyJFcuvzr/xXEfGzs5D
Fye/BcjNFfX616g4HcszXW3Fknso6X5Z0oP+p/cBgCn1BSnrCGmAtWlRj8EPEivU
3muGNUGGCs5yCSeC7P4Ub38qKiPWjesHZjYaAfEoTmcMZoY55l9+9BM+StdHnqVa
ZLBRqv29sz4dsmP0/4uDVvFH8GoQUadbTveGUcrBxENVgqViB1dPRzWdGS98T7U2
ROhLpv4rqwKPtm8QFIureHWB9QIDAQABo4GPMIGMMAkGA1UdEwQCMAAwDgYDVR0P
AQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMEMBoGA1UdEQQTMBGBD2JvYkBl
eGFtcGxlLmNvbTAdBgNVHQ4EFgQUcUlujAGT9BsTQvCvOrbwz4etOVEwHwYDVR0j
BBgwFoAUpu+ruqkmlhCKV4hnyRrDA9w8bbQwCgYIKoZIzj0EAwMDZwAwZAIwIxdR
MsJt4do7Rv0376bfm9Dl+mwGQ1JxTHgWS7kyZd+9GBY50zDzB78wngvmHW/MAjB4
cD0wdFSSGXx0GEFDJDKhPZOkkHk9FfMNh4jYJD/KvwDL+MxnfiChzTi8ztx08/s=
-----END CERTIFICATE-----`;

appGlobal.remoteApp ??= {
  async getCACertificates(type: string): Promise<string[]> {
    return type == "extra" ? [kECRootCA] : [];
  },
};

describe("Certificate issued by an EC certificate authority", () => {
  test("is valid, and as trusted as the CA that we found it in", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kRSALeaf);
    expect(await key.keyStatus()).toBe(KeyStatus.Valid);
    expect(key.trustLevel).toBe(TrustLevel.Personal);
    expect(key.caName).toBe("EC Test Root CA");
  });
});
