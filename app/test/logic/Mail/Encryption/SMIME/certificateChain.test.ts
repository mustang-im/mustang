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

/* A root CA that signs with RSASSA-PSS instead of the older PKCS#1 v1.5
 * padding, and a certificate that it issued:
 * openssl req -x509 -newkey rsa:2048 -keyout pssca.key -out pssca.crt \
 *   -days 3650 -nodes -sha256 -sigopt rsa_padding_mode:pss \
 *   -sigopt rsa_pss_saltlen:-1 -subj "/O=Parula Test/CN=PSS Test Root CA" \
 *   -addext "basicConstraints=critical,CA:TRUE" \
 *   -addext "keyUsage=critical,keyCertSign,cRLSign"
 * openssl x509 -req -in pssleaf.csr -out pssleaf.crt -set_serial 0x2b \
 *   -CA pssca.crt -CAkey pssca.key -days 3650 -sha256 \
 *   -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:-1 -extfile <(printf \
 *   "basicConstraints=CA:FALSE\nextendedKeyUsage=emailProtection\n") */
const kPSSRootCA = `-----BEGIN CERTIFICATE-----
MIIDuzCCAm+gAwIBAgIUQDvP5TTqbKnzk1WRSE+QPPR1jOgwQQYJKoZIhvcNAQEK
MDSgDzANBglghkgBZQMEAgEFAKEcMBoGCSqGSIb3DQEBCDANBglghkgBZQMEAgEF
AKIDAgEgMDExFDASBgNVBAoMC1BhcnVsYSBUZXN0MRkwFwYDVQQDDBBQU1MgVGVz
dCBSb290IENBMB4XDTI2MDkwMzA2NDUwMloXDTM2MDgzMTA2NDUwMlowMTEUMBIG
A1UECgwLUGFydWxhIFRlc3QxGTAXBgNVBAMMEFBTUyBUZXN0IFJvb3QgQ0EwggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDtii3VDit7KCCYTKJZDrjLZUU/
bfXwtNyI+zCXOKhKnsAFJtFiWBq7yLXW7bAbr0h1tTFrIVyxxehWJcZBAV/d4RLM
rpHh3kw71VaQ2AqrQJvrhaPlt6OqhlLBZr1F/Vw5EdWwcJn8RCHLl/VkcjQtswbG
Am3ZZbF4ZL6pMi3xfjuRe4FB2qd8K7fqgzK8q6WHZyhK7UXBdFBwA1bsIGV2FOZy
VBysZr50BBxQSAtucGI8oSKXbAuPKKnP1hD5oOslzhCXYyWOeej0W9o/Y1Jp2Yvk
jRjGh4BcdUW7T1cNXd/pyfxPhMH8zD+rTb9ZC5uWzCiAb6gwHqEQHH9WLqH3AgMB
AAGjYzBhMB0GA1UdDgQWBBSBU7CiO+fudQcADudjBj3/rRzMfTAfBgNVHSMEGDAW
gBSBU7CiO+fudQcADudjBj3/rRzMfTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB
/wQEAwIBBjBBBgkqhkiG9w0BAQowNKAPMA0GCWCGSAFlAwQCAQUAoRwwGgYJKoZI
hvcNAQEIMA0GCWCGSAFlAwQCAQUAogMCASADggEBADkF3vo6fGvy1A7gHhgOJSo+
dNYT2TaHqW1zwn+kTCD+U1JnM9LTfJQk43g5WvexIjRDyfVw54AUTAYzCny8tRoS
SgPImMVqFZJsVvT8ShAiH1VFHftMAN6CDQqGGmbxNmkpMeWCXz4acs2pRfYLsSjd
2AzdQbqNfyloRhgCo4zPKLikUXhbkAyfR0gROgOeVU9dFfLDxN/rUhm0h1LafSwz
U+I+pp4Fgd/aQSyuW/q7nBxAK4KISsBRb/gMiA3jqaoNhfEHpnXpKurGzy4mA0Vx
wU0JSLA7zZP1yuME0PZQSFOKIlN+uDWU6mSMXqsTM896f7jway61fH4etF4MoM4=
-----END CERTIFICATE-----`;

const kPSSLeaf = `-----BEGIN CERTIFICATE-----
MIIDyzCCAn+gAwIBAgIBKzBBBgkqhkiG9w0BAQowNKAPMA0GCWCGSAFlAwQCAQUA
oRwwGgYJKoZIhvcNAQEIMA0GCWCGSAFlAwQCAQUAogMCASAwMTEUMBIGA1UECgwL
UGFydWxhIFRlc3QxGTAXBgNVBAMMEFBTUyBUZXN0IFJvb3QgQ0EwHhcNMjYwOTAz
MDY0NTAyWhcNMzYwODMxMDY0NTAyWjA1MRAwDgYDVQQDDAdQU1MgQm9iMSEwHwYJ
KoZIhvcNAQkBFhJwc3Nib2JAZXhhbXBsZS5jb20wggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQCRQRTe7tAgMUnaW10RWJlM/TYpJEg3hu2tJFTDEvJaZraJ
omdF78RSgt0Qheu8dm98CvRYYZvxp1hrLdj0Ks95hO4L1V2XLNXFv4Mn9kVC5F+M
Q+HvjphFQZ2BcFix9gGxa6I9DsTXihs3WyszxOXIMIxw7PRyusX709OvTTZnj0Ss
/PLQAbhMJQxLfcYs3bDRqHNdR9KtPq8mf4kc+SEz4WEKv6nJ+AVSwXz5P1FQ+OQR
nv9yfJij5TbLF8HInVnzyiyZyMHKHWufs9cOYHmKMiOOAPfD5091gj8dXvSCH8Bq
nWcjAz9joTJM2BkN0a2WsSffLXMe9O1IMBvD063JAgMBAAGjgYEwfzAJBgNVHRME
AjAAMBMGA1UdJQQMMAoGCCsGAQUFBwMEMB0GA1UdEQQWMBSBEnBzc2JvYkBleGFt
cGxlLmNvbTAdBgNVHQ4EFgQUgSert8xjX7wyoLqsxcue1mQfQ4owHwYDVR0jBBgw
FoAUgVOwojvn7nUHAA7nYwY9/60czH0wQQYJKoZIhvcNAQEKMDSgDzANBglghkgB
ZQMEAgEFAKEcMBoGCSqGSIb3DQEBCDANBglghkgBZQMEAgEFAKIDAgEgA4IBAQDD
w75zlbIOwr/NNWHnJ8MyTDIave0XG9iYoKoOMAuRUylaXccSQHNHBWobVJcU0gHV
WqzYUHwEkLucONhZzPOUqG9na6slNcDq9sGGQIlG83ENpNH6KjoAAv9RfwxmC12m
smc+ZxLvaO9MS5eA6J78tWg3QOzXBo/ATbRRvPfRlI5eLYPRsTb30x4tcuUYdYqm
UQ/i8YVxk3MJwhovF+x0KBLFSCj6RH0oPLvoqRJYty6SWKaZSs1jvOd8VAjko6YE
QpQYGLQWDbm8H4tjgltSrneaiKh+jMQJqk/CCcKSzcpyV3rnRHuq6toN301MwYhH
GaL7trvUPa5x6YdUJd7b
-----END CERTIFICATE-----`;

appGlobal.remoteApp ??= {
  async getCACertificates(type: string): Promise<string[]> {
    return type == "extra" ? [kECRootCA, kPSSRootCA] : [];
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

describe("Certificate signed with RSA-PSS", () => {
  test("is valid, and names the CA that signed it", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kPSSLeaf);
    expect(await key.keyStatus()).toBe(KeyStatus.Valid);
    expect(key.caName).toBe("PSS Test Root CA");
  });
});
