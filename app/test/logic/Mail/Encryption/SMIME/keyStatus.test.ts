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

describe("Certificate chain", () => {
  test("through a CA that may issue this certificate is valid", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kErinCert + kIntermediate);
    expect(await key.keyStatus()).toBe(KeyStatus.Valid);
  });

  test("through an issuer that is not a CA is invalid", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kBobCert + kNotACA);
    expect(await key.keyStatus()).toBe(KeyStatus.ChainInvalid);
  });

  test("through an issuer that may not sign certificates is invalid", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kCarolCert + kCANotSigningCertificates);
    expect(await key.keyStatus()).toBe(KeyStatus.ChainInvalid);
  });

  test("deeper than the CA allows is invalid", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kDaveCert + kSubCA + kIntermediate);
    expect(await key.keyStatus()).toBe(KeyStatus.ChainInvalid);
  });

  test("for an address that the CA may not issue is invalid", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kFrankCert + kIntermediate);
    expect(await key.keyStatus()).toBe(KeyStatus.ChainInvalid);
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

/* The chains below, all from the same test CA. Their keys are only 1024 bits,
 * to keep them short: these tests are about the extensions, not the strength.
 * `issue` is the command above, with `-CA` and these extensions:
 * intermediate: basicConstraints=critical,CA:TRUE,pathlen:0
 *   keyUsage=critical,keyCertSign,cRLSign
 *   nameConstraints=critical,permitted;email:example.com
 * sub CA, under the intermediate: basicConstraints=critical,CA:TRUE
 *   keyUsage=critical,keyCertSign,cRLSign
 * not a CA: basicConstraints=critical,CA:FALSE
 *   keyUsage=critical,keyCertSign,digitalSignature
 * CA that may not sign certificates: basicConstraints=critical,CA:TRUE
 *   keyUsage=critical,digitalSignature,cRLSign
 * The leaves are as `kEvaCert`, under: Erin the intermediate, Frank the
 * intermediate, Dave the sub CA, Bob "not a CA", Carol the CA that may not
 * sign certificates.
 * openssl verify -CAfile ca.crt -untrusted <chain> -purpose smimesign <leaf>
 * agrees with each of the tests above.
 */
const kIntermediate = `
-----BEGIN CERTIFICATE-----
MIICyDCCAbCgAwIBAgIJAOl6ahjU9kcsMA0GCSqGSIb3DQEBCwUAMCYxEDAOBgNV
BAMMB1Rlc3QgQ0ExEjAQBgNVBGEMCVZBVERFLTk5OTAeFw0yNjA5MDMwNjQ0MDJa
Fw0zNDExMjAwNjQ0MDJaMBwxGjAYBgNVBAMMEVRlc3QgSW50ZXJtZWRpYXRlMIGf
MA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCXJ9yiAd2SXrBzmVEEV0vvb6XndE5L
CyXyzVLq5Z+hLD3DgcNNIdz6HfRVZY55NjrGowj+ZoGAwAnzdgiBSpkp/XJR9qd9
BjcK6ci2Uc/QrpsbmpoCg8jvd7cL0aIiEiWOakbbXcU/5ZtaM26GZzJ0OuUrwlwp
iX/zejX7jhbiyQIDAQABo4GGMIGDMBIGA1UdEwEB/wQIMAYBAf8CAQAwDgYDVR0P
AQH/BAQDAgEGMB0GA1UdHgEB/wQTMBGgDzANgQtleGFtcGxlLmNvbTAdBgNVHQ4E
FgQUhIAYyfXriosKkG99cRO/o/uDztkwHwYDVR0jBBgwFoAUhvNcd2obmnDc913n
frD3oVQH0b0wDQYJKoZIhvcNAQELBQADggEBAAmwSxJs7evkZ/AUDRMh0QXeFdaV
0xJYepOkUUBmXIds5s9PRc2V7qlC5pseC3Uumvbpdk6H5iujrDNefcXwMEpxhw+z
5BLlled3D9RaWOxFQ3PPqyzg+dzJKzrP9G9xDdcBNcluEKvZltCwLTHgfkoOHsmk
555zPZosW6P3PoiOsy1HQmkPAxN859dCgDQIoZwG6h4FtBBhHm60MbkYgHFcaZ4m
6BLSCrgnTzr4dBcATXzHaIbNT8864oQlP10y/DCQX3ffEeCIzTTo+mR0YMxpBbgo
tckohUmHeJXvLLfP8lg9K5cDTp1zWkX1wNNcdcULscFDWwBcd0bGXbkEcYg=
-----END CERTIFICATE-----
`;

const kSubCA = `
-----BEGIN CERTIFICATE-----
MIICEjCCAXugAwIBAgIIL71ClPV7HY4wDQYJKoZIhvcNAQELBQAwHDEaMBgGA1UE
AwwRVGVzdCBJbnRlcm1lZGlhdGUwHhcNMjYwOTAzMDY0NDAyWhcNMzQxMTIwMDY0
NDAyWjAWMRQwEgYDVQQDDAtUZXN0IFN1YiBDQTCBnzANBgkqhkiG9w0BAQEFAAOB
jQAwgYkCgYEArmieXW2eplFD1X38EmULwSdpdp0CrXF7Qk6relgKKcZJI6ts+RO/
6DlYPAneJmgCtQ5VyYwS0P5eF1ZPQkQepi6g/DGbpjjNPbHbGD10kqFkQbId1eHn
DC8Yrb9Ig4Xq8UMk4TYg5UYZO8dKr7DP7EZH1KvcKiCW/T4ayJpCE0sCAwEAAaNj
MGEwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFBYx
OfWPzOXuBNY5avVMBv8PVvivMB8GA1UdIwQYMBaAFISAGMn164qLCpBvfXETv6P7
g87ZMA0GCSqGSIb3DQEBCwUAA4GBAFGQ57NLUEPq99IFtl4eGlWo9Q73GzaYxsz8
xEg5mIYZP2h0Nd7yJjzqLerM9BT72qkF4n/ub9eBzlfEF7XgNde23tFz/PwuYM/B
v0ifDvjfM8G0kcqM50/wx3QBtxaxwNq+FDMypw4Yir8txeYKxs88zQX66M/bLt/e
kOSnPHR2
-----END CERTIFICATE-----
`;

const kNotACA = `
-----BEGIN CERTIFICATE-----
MIICmDCCAYCgAwIBAgIJAJpI7O1rZ2xNMA0GCSqGSIb3DQEBCwUAMCYxEDAOBgNV
BAMMB1Rlc3QgQ0ExEjAQBgNVBGEMCVZBVERFLTk5OTAeFw0yNjA5MDMwNjQ0MDJa
Fw0zNDExMjAwNjQ0MDJaMBMxETAPBgNVBAMMCE5vdCBBIENBMIGfMA0GCSqGSIb3
DQEBAQUAA4GNADCBiQKBgQDeaU0MHcMagSzuwP7Y0uEpJ5JYmE4VmAvDLnRxUQvZ
v4TXkorXnphJkjlXDJZBJpNeWj54p9EXHBVxTbgSdIwb1+PP0VvX/0S9fUHWRzaC
xYh3ddNoMseH827YV1KaUsCSO2AYFN8Rt64ZDAEVlgnvv28eZuhbhP9sEJNQPncK
dQIDAQABo2AwXjAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIChDAdBgNVHQ4E
FgQUAjCdSDk5NGFvLF6yCKQ3pR5RYiQwHwYDVR0jBBgwFoAUhvNcd2obmnDc913n
frD3oVQH0b0wDQYJKoZIhvcNAQELBQADggEBABZuGCnlcGR/HPM1SDj/pf1AHQMb
7LRcymKK5BihLS0fVhz6fPnACzh5eRWo2vkyASFVkFkwb8+KFPZIDT3HUqLmIgjs
frFfSSDJgLKvBtJenKHCNKptEDmLzxe7b4R96DnK4gUq7NCmERF1Qjyhqkwlzoqt
U0jkjHAcDxTzjqdkn417yiVohgGDbNH13XjIqF4ekn+T/IcEhmVFvMaJMI/Hk9v1
NFWZ98zv7VF4kPJYYbJvq9Sxftwt4xSvYxIiSDysrqjeI1aaSgyenog1qadj1FWy
Fa3us/OzKTD9Lbj8VjL5Kt4ATfENEcYRTk3DEeqrHfGvj1eD1f5F4P05VdY=
-----END CERTIFICATE-----
`;

const kCANotSigningCertificates = `
-----BEGIN CERTIFICATE-----
MIICsDCCAZigAwIBAgIJAMOJ8MNoAuF1MA0GCSqGSIb3DQEBCwUAMCYxEDAOBgNV
BAMMB1Rlc3QgQ0ExEjAQBgNVBGEMCVZBVERFLTk5OTAeFw0yNjA5MDMwNjQ0MDJa
Fw0zNDExMjAwNjQ0MDJaMCgxJjAkBgNVBAMMHVRlc3QgQ0EgV2l0aG91dCBLZXkg
Q2VydCBTaWduMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+F4Yf66BoEnRy
cUyuamWimVb1OftHEEIRX5pQIoc+a5yKo6qtoBDLBRC23C0mkuZenJpaQj9f3DQd
xy6D0cgfkyRywbPvtH+CfDygu2KJHCLc6nTv2hB97qa4yggSPXnVtfi1oB3U7N+Z
aWFWpC0QxdedKudbd/TkcamVuB/olQIDAQABo2MwYTAPBgNVHRMBAf8EBTADAQH/
MA4GA1UdDwEB/wQEAwIBgjAdBgNVHQ4EFgQUg5KrgV635eprcjrteFtPlLhy4MIw
HwYDVR0jBBgwFoAUhvNcd2obmnDc913nfrD3oVQH0b0wDQYJKoZIhvcNAQELBQAD
ggEBADcVE+/FCBFxgXrQin1qN0XgoBdlEWci1r47LvZnUMpturOapaWK/LV2uizM
a5iSGyYuAlX/Of1p1Nca6jYHC0u1JGGWasp/MfMi3w3xC4nfdOW674JS82VWC9oL
0Yiex6JtMxtmfW/CTDPyteRlGAkF1vL1lbvINACS3ch/90xjSfHRkqk1UPBRTdQa
ZzFludGc5nEvjN+THEjUyNcVQGTTFHYvimU4O1CYwf2P2ZfRcgJr7R6SNFIhDibg
TjTtwGPIMgsT7Ji7Nle6v6q2l/OhGQ/orfO654/jSALqRbvQR8OtVniDindGZDnn
Df+OEGWM5pubJY0ffRlHgC6rzbw=
-----END CERTIFICATE-----
`;

const kErinCert = `
-----BEGIN CERTIFICATE-----
MIICWzCCAcSgAwIBAgIJAPY1j8+VoFexMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV
BAMMEVRlc3QgSW50ZXJtZWRpYXRlMB4XDTI2MDkwMzA2NDQwMloXDTM0MTEyMDA2
NDQwMlowMDENMAsGA1UEAwwERXJpbjEfMB0GCSqGSIb3DQEJARYQZXJpbkBleGFt
cGxlLmNvbTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEA3CMOIHOYJ4o09XvR
dJfZQ53m5I3dEYVx/tb5zcEZ4TORaTDHQZ28RpaKGLWkyBTZwuUOCK3oCal4XRe6
1UES8gAFVOKVtfcw/UqOaz4iGnKAskFnwfiJ0UirHKY1AWlyKy3Tu48IxTHJ3QTs
uI0RTQ5S6pszGIAuefrT/R4BDNcCAwEAAaOBkDCBjTAJBgNVHRMEAjAAMA4GA1Ud
DwEB/wQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcDBDAbBgNVHREEFDASgRBlcmlu
QGV4YW1wbGUuY29tMB0GA1UdDgQWBBQ7u+auDbDy2LzJCuag5mv3zjDhQDAfBgNV
HSMEGDAWgBSEgBjJ9euKiwqQb31xE7+j+4PO2TANBgkqhkiG9w0BAQsFAAOBgQAW
Tl3f0O2PqTgFZoOHHJ6qu0B8NRjktusvd96nHD42F8f9T+Y94Sum7muKQNuzKQBt
mjTmAyYs4NsIWAoRSA8rCDN7BZMEvzz0ZRq90XuJmzu4ubvIJyD/8hAivs0TPdSr
AzLaAHl5d1TtCPYlAeJ+OjSAuorNfQXadXB8kBFCiw==
-----END CERTIFICATE-----
`;

const kFrankCert = `
-----BEGIN CERTIFICATE-----
MIICWjCCAcOgAwIBAgIJAPIma4JYvIHkMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV
BAMMEVRlc3QgSW50ZXJtZWRpYXRlMB4XDTI2MDkwMzA2NDQwMloXDTM0MTEyMDA2
NDQwMlowMDEOMAwGA1UEAwwFRnJhbmsxHjAcBgkqhkiG9w0BCQEWD2ZyYW5rQG90
aGVyLm9yZzCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEA2ogd69pS9PhLu0ce
atDurc2quI0r5y3oTevloBsPPrbLc4wNj84dH9GhC7xE1XeNbv61el96WjL8hMXo
r2GOzkjpWTug59KqCd9kqqyZ25dSaHz53ZFOR9crTV2pjEAM4X+r93S+D3hA9vNG
pmEfVPTyo+21nScqTOrOGVAtWQECAwEAAaOBjzCBjDAJBgNVHRMEAjAAMA4GA1Ud
DwEB/wQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcDBDAaBgNVHREEEzARgQ9mcmFu
a0BvdGhlci5vcmcwHQYDVR0OBBYEFBuCVOq3c0Gw4AMb1pN06Px+TqdBMB8GA1Ud
IwQYMBaAFISAGMn164qLCpBvfXETv6P7g87ZMA0GCSqGSIb3DQEBCwUAA4GBAJVB
ISHtSAzsPGpGvZZJNM3XDbKU7PSgoQl97xkOavpIs4GdmIHjxnje2Pp/narFX9xt
VaZQbDP+xQC7lsg+Mdx/ZDy0P2NhIMNks8GurX7pIPP9cppTCDX+z2ipWoypr38B
JUjEUorQ+1VbqrfWGCMH49h10REN2ZW+1iRfhVbI
-----END CERTIFICATE-----
`;

const kDaveCert = `
-----BEGIN CERTIFICATE-----
MIICVDCCAb2gAwIBAgIIfscxvX4sMiwwDQYJKoZIhvcNAQELBQAwFjEUMBIGA1UE
AwwLVGVzdCBTdWIgQ0EwHhcNMjYwOTAzMDY0NDAyWhcNMzQxMTIwMDY0NDAyWjAw
MQ0wCwYDVQQDDAREYXZlMR8wHQYJKoZIhvcNAQkBFhBkYXZlQGV4YW1wbGUuY29t
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5oSCu+yYx9jRsRVVjkEgmSECN
50zAnN0ZSWkQMPCNabZOztmWgZif0t9Suj8+YBe2431SskzEQAFl+NNSg2Cw0rT+
RDpp3wLfCoLbsDChs0/ydM75dVrky+gBQgRwsPdVnfxXDj8JWotD4me8BzlRlduI
8W6BXJWPkrQghu1YxQIDAQABo4GQMIGNMAkGA1UdEwQCMAAwDgYDVR0PAQH/BAQD
AgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMEMBsGA1UdEQQUMBKBEGRhdmVAZXhhbXBs
ZS5jb20wHQYDVR0OBBYEFECb6C1y93DDWEiCiaErBLCQVNu9MB8GA1UdIwQYMBaA
FBYxOfWPzOXuBNY5avVMBv8PVvivMA0GCSqGSIb3DQEBCwUAA4GBAJ/D4ikA0S1U
5u3B6Hm0+IEmSRy+C0/9aB2YkKV3JoJWFFjdK833pg7q1Npn2liPHmqub3Sp+gPs
ITTRg4i9YrFrCjA6L7f8BV0qWXABgqMs4Sujl4LDGPl9kUF+CpvWa21HS7mp7NVk
tYuXmkxoIZboTllWEUhS4vw4pmFJvNns
-----END CERTIFICATE-----
`;

const kBobCert = `
-----BEGIN CERTIFICATE-----
MIICTjCCAbegAwIBAgIIWthQVDHCmecwDQYJKoZIhvcNAQELBQAwEzERMA8GA1UE
AwwITm90IEEgQ0EwHhcNMjYwOTAzMDY0NDAyWhcNMzQxMTIwMDY0NDAyWjAuMQww
CgYDVQQDDANCb2IxHjAcBgkqhkiG9w0BCQEWD2JvYkBleGFtcGxlLmNvbTCBnzAN
BgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEArjVq6gWhbSPqPaj03Ynl0KU/Q42G5kRS
lArvsVwO3MSQYV02GchKNZP4Ohd0FkhNyIBmkpZHLH12fhxNnWqxLj4itLBehu2v
sj19YvNSgn2L4+kEEq8XLJtre76jZAlGtJhuCkfVd+40Rccq9JCgyOrQwmfUiTct
WP+sCsa1Jf0CAwEAAaOBjzCBjDAJBgNVHRMEAjAAMA4GA1UdDwEB/wQEAwIFoDAT
BgNVHSUEDDAKBggrBgEFBQcDBDAaBgNVHREEEzARgQ9ib2JAZXhhbXBsZS5jb20w
HQYDVR0OBBYEFJhAeAYgvdfY1TRFHuwEKzVd75yDMB8GA1UdIwQYMBaAFAIwnUg5
OTRhbyxesgikN6UeUWIkMA0GCSqGSIb3DQEBCwUAA4GBAAmouqyCS+tkUf/L4JTW
5KvxdFS8XMRxNG28MB2N4UC89nFmzMzENZUkYdHhTkDkWjFKzM7g5Gew6WcSGD8b
LcYkdzTZqtP1dxrAFzUnPJrZsIvHWjYIukypyUn7dnteRlaMkSyK02FBFI9EbJUc
RmWdRC5NqLQZxL46TU5V0Uxj
-----END CERTIFICATE-----
`;

const kCarolCert = `
-----BEGIN CERTIFICATE-----
MIICajCCAdOgAwIBAgIJAPvN2jndfGzTMA0GCSqGSIb3DQEBCwUAMCgxJjAkBgNV
BAMMHVRlc3QgQ0EgV2l0aG91dCBLZXkgQ2VydCBTaWduMB4XDTI2MDkwMzA2NDQw
MloXDTM0MTEyMDA2NDQwMlowMjEOMAwGA1UEAwwFQ2Fyb2wxIDAeBgkqhkiG9w0B
CQEWEWNhcm9sQGV4YW1wbGUuY29tMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB
gQC+rrw/aliKb0ng3Fwb5+uSO3jt2OznOcEwSf166P3iNGSa4hqslXh5BORSohF1
bMh9e3IeR1JwPhr7xmkdLhETU5bSkmC4GDH8lix2iwKVlOHCYQtQa8VVzOXURt0l
Ds7+LS6+iQe42spcbZ6uYVFStd06KjMkHU32xNMSdErOgwIDAQABo4GRMIGOMAkG
A1UdEwQCMAAwDgYDVR0PAQH/BAQDAgWgMBMGA1UdJQQMMAoGCCsGAQUFBwMEMBwG
A1UdEQQVMBOBEWNhcm9sQGV4YW1wbGUuY29tMB0GA1UdDgQWBBQASgsqY442vUEE
tF3Gcs0pxTB85DAfBgNVHSMEGDAWgBSDkquBXrfl6mtyOu14W0+UuHLgwjANBgkq
hkiG9w0BAQsFAAOBgQCHWMIq0gt0DILj7yJT423e8wgyzIvFg8iNP6NMXTo2g5L8
4IRxTD2N3Ar760hoySFrwAgpLI8Wi+148q6cLdauxpGucPHhrwPiZ5IiqPj9vgkq
Mu1oTHf3vGKuKuAtg2omOSQAda+8Mnr7vvVP5Kmux0qfFmkSLL/c4JrVp+qvYA==
-----END CERTIFICATE-----
`;
