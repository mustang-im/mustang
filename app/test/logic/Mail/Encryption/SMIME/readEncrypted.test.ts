import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { appGlobal } from "../../../../../logic/app";
import { MailIdentity } from "../../../../../logic/Mail/MailIdentity";
import { SMIMEPrivateKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import type { EMail } from "../../../../../logic/Mail/EMail";
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
 * Reads the message as the user that it is addressed to.
 * @param privateKeys the S/MIME keys of that user, in the order that the
 *   settings hold them
 * @returns the message, and the errors that the user was shown
 */
async function read(mime: string, ...privateKeys: SMIMEPrivateKey[]): Promise<{ email: EMail, errors: string[] }> {
  let { folder } = await setupTestFolder();
  // `findIdentity()` searches all accounts, including those of earlier tests
  appGlobal.emailAccounts.clear();
  let identity = new MailIdentity(folder.account);
  identity.emailAddress = "user@example.com";
  identity.realname = "User";
  identity.encryptionPrivateKeys.addAll(privateKeys);
  folder.account.identities.add(identity);
  appGlobal.emailAccounts.add(folder.account);
  let errors: string[] = [];
  folder.account.errorCallback = ex => errors.push(ex.message);

  let email = folder.newEMail();
  email.mime = new TextEncoder().encode(mime.replace(/\n/g, "\r\n"));
  await email.parseMIME();
  return { email, errors };
}

test("An encrypted message that is not for us tells the user why it stays empty", async () => {
  let { errors } = await read(kEncrypted);

  expect(errors).toEqual(["This message is encrypted, and the key is not available"]);
});

describe("Ciphers that other mail apps encrypt with", () => {
  test("Triple DES, as Apple Mail and Thunderbird send it", async () => {
    let { email, errors } = await read(k3DES, await SMIMEPrivateKey.importPrivateKey(kOurKey));

    expect(errors).toEqual([]);
    expect(email.wasEncrypted).toBe(true);
    expect(email.text.trim()).toBe("Hello, this is encrypted.");
  });

  test("RC2 with 128 bits", async () => {
    let { email, errors } = await read(kRC2, await SMIMEPrivateKey.importPrivateKey(kOurKey));

    expect(errors).toEqual([]);
    expect(email.wasEncrypted).toBe(true);
    expect(email.text.trim()).toBe("Hello, this is encrypted.");
  });

  test("RC2 with the 40 bit export key length", async () => {
    let { email, errors } = await read(kRC2Export, await SMIMEPrivateKey.importPrivateKey(kOurKey));

    expect(errors).toEqual([]);
    expect(email.wasEncrypted).toBe(true);
    expect(email.text.trim()).toBe("Hello, this is encrypted.");
  });
});

test("A message that names our certificate by its subjectKeyIdentifier", async () => {
  let { email, errors } = await read(kKeyIdentifier, await SMIMEPrivateKey.importPrivateKey(kOurKey));

  expect(errors).toEqual([]);
  expect(email.wasEncrypted).toBe(true);
  expect(email.text.trim()).toBe("Hello, this is encrypted.");
});

test("A CMS blob that was delivered as a plain file, as Microsoft sends it", async () => {
  let { email, errors } = await read(kOctetStream, await SMIMEPrivateKey.importPrivateKey(kOurKey));

  expect(errors).toEqual([]);
  expect(email.wasEncrypted).toBe(true);
  expect(email.text.trim()).toBe("Hello, this is encrypted.");
});

describe("Algorithms that we do not implement", () => {
  test("An unsupported cipher is named, instead of leaving the message empty", async () => {
    let { errors } = await read(kCamellia, await SMIMEPrivateKey.importPrivateKey(kOurKey));

    expect(errors).toEqual(["This message is encrypted with 1.2.392.200011.61.1.1.1.2, which is not supported"]);
  });

  test("An unsupported key transport is named, not reported as a missing key", async () => {
    let { errors } = await read(kOAEP, await SMIMEPrivateKey.importPrivateKey(kOurKey));

    expect(errors).toEqual(["The key of this message is encrypted with rsaESOAEP, which is not supported"]);
  });

  test("A message to an EC certificate is not for us, whatever the sender used", async () => {
    let { errors } = await read(kECDH, await SMIMEPrivateKey.importPrivateKey(kOurKey));

    expect(errors).toEqual(["This message is encrypted, and the key is not available"]);
  });

  test("A key without a certificate does not stop the other keys", async () => {
    let { email, errors } = await read(k3DES,
      await SMIMEPrivateKey.createNewPrivateKey("user@example.com"), // as [Create new key] leaves it
      await SMIMEPrivateKey.importPrivateKey(kOurKey));

    expect(errors).toEqual([]);
    expect(email.text.trim()).toBe("Hello, this is encrypted.");
  }, 30000); // generating the 4096 bit key takes a while
});

/** `openssl smime -sign | openssl smime -encrypt`, to a certificate that is not ours */
const kEncrypted = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Signed and encrypted
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <sig-enc@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/x-pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIMHwYJKoZIhvcNAQcDoIIMEDCCDAwCAQAxggFjMIIBXwIBADBHMC8xDDAKBgNV
BAMMA0JvYjEfMB0GCSqGSIb3DQEJARYQdXNlckBleGFtcGxlLmNvbQIUIXWDeXEE
yHa/b/dhwP9XNaNrE78wDQYJKoZIhvcNAQEBBQAEggEAc0xCUfV2ES8su0WNjeEx
nm4kNF4K6U2cDcBuLXoqwc0uWgm4sVYwwmr/Gp5XRGL6qOLqirrtza+jEvGsCegK
J1euFtvIHurtnHoQk/zDbDXddayyGEC6Z8vV1YiesebNisLn3GZ8uQj4pFVJQ9cm
EdMFggkMtME3pI77ukwplg37znF+INAkshBvMcaEoZrTtgIdLteY8MPR3kHHphzu
s3yIEqSpYlpp9eu9R29hPUYHTaTlM/ArtwrLVAmEnqVcjaxVc38iAz1Ho5ceSNcP
jxFLvueK4YltIMTdAAc1CS+A1cCz6WrTv4Eu+GlERCdPzvo1tJxOkX8yWoTZwisI
fDCCCp4GCSqGSIb3DQEHATAdBglghkgBZQMEASoEEE3GaVM3OsJgnhOuBoxQ9B2A
ggpw7pNQ7BXjHRVMjTrPNEG1hVWKN0H6fmRP8RbR84xbqjH2MTBPeEk0m/Sgd252
c782giBOIV98SFOJ3iK524aSTprpoxy9APuTvFwK4O9f3pRhi0ZxoS4unnvDFkRn
JwO/gNEX3TQdpvvN8ByY9+WIcf6ozuxClmoX5t97qZjxqqD1JVU82x1CmJ+c1pLY
lDFKcWK+Sd1L7vlK7HhKvxTfL9mkuC3Kiw4AdQymHFlrgStb48gaPOuEVzX+aW8v
IOrDFCvGWQ7I/235TbhUyjDzUvsusOAGvjeRAnbbgExPf3XrCjDhz6U5qkK++WaB
5j16kAVLv8H0CYXvn00m5JDKoBJA8IWfxhTQHs9y7L5ov5IO6KmPEGsgRARLmBhM
9Q4U9MwXroOL5yL7+SkeVBnLajIF1WsJza06gFrtnbuhwFaK+L6qZowllWDcEJ3n
p9P+K0vhbi2fzcyjOWJYunm+pqS6pg8mE1zRzxLPd0Hmmycc6RnOskSzoI8OxV2U
QxsQpq64CcicOGX66iJEyuf32Y0mBW2YfplvmD9oXzik5mMbQbt8IC2O7vBFKAL3
0O+dsSKH5griUPSSCFGw019SM/D2wo/Chk2NV6d4mF8+1HCvlKOQhvB3DLFDpa9S
M0KIjI7ehDxJvofmJIN8ArPfqJY81C1BQuc53z9ozy2ozO7IUtSrIus/CBvaMSJq
4LoNq3AEkJ8cCCnv91THP/TnGZTi9kpH1LNTl9wqH2XVVjBbQ3gctbnXnucwEREl
qkPf2CcS1dTvuROUH/r0nGM6ffwLa7xOqIfOh75TjsAnkLJQY3b/hgoOuDJZedbX
09V+zVxngaItmZBf0zhp377dTMB6JTN5aVRTPTRhZRmd+ZMycdyh1GM8Qy6YYn8V
RrAOIR6P3nL4C1KylH9simcoyirETRIWuHwB9FYqwOY+3RAu+Gn0F6zZDzS4jmNu
vg3Ty5aU7LJCzAzwbV3tibwZyqOooCBCuYnonKuyvX//t2uFaVxEYwewNTM3Cchn
Ftfu/sIbKQ2xLicu3CfGTTMHfWGH7fbKfFlhFiUH4mWjuvmfv9fJsXg9aK07UGGg
n8YnPo6viHfxUQLrKqdZ9yOUr8ckgm4vJHhhcnbZZdmtUCbU6m2ZHKOU/PKmenTA
P4o4mr3MmEH0QjTzXFMcKxgtkZf+4+oQOsqVeYWGjFhq2xAJkwY+DD2n+1aXCmzp
gIZp90qVEQQmHCdFthWE9iKz7xzYggLlnsGOhstSa5GHS4QXseVZ8ECbjz7LDqar
KWdWhSy+AcCIXer43ucVBPR8qCJ7uq8Gvc3TdKraGb5iGWdDSaU+H5FzrpI9fxuD
o60HYPS+eLrc4E6Bq/ERip0MgI2+Zrl+vYNeMr3TYnrEi66zSkBgz57yDjOtxs1g
xcFh4wlTGsCgpgyV3pNzKZZNglVQeNk3ktjPKtIdiq5ICt0xLw512Pu2URODnCQ/
Ov3DXbwmYQtGnmw730NFQUt2g25Vp3iTUmxwYv/UQiBhCB8uYROwlVEbGgQwqbsv
BUUUs5FElLsRlgPxPcFfy7til1MGrYuw1RN+yNCOYAs+UNM0gP6E2dzIspopNrBG
OD/lBavac9F0VZJ38RJ0JkEqgDVnwtmzx3dY+ayqK/unhocHOK6ZhsDnOr4x7H6f
15Z/0Pks0w++vvES806eigFDM9BpipobcZzguheuSKWK8r9Z/8WjmL3jtJQzDgzg
CfOqDr0vVQZDyGFFc9i+CBitVEoFG0f+oQjFY5uKwDk4CRSMseTqdUSSOHhHxPl3
kqplxjljOF2EMTKOv95CCZ+++AmJ4/FyhC0jWHJNnKdBBKOy7IAhdROFQaOrlZD/
4V80+d5xrpP6ky40oRj9lLZfYlK4kmT9T/RZcDhlPkhnImHN9fUMJUm+NG7ygjM5
WM7cT75u5FD0jEHgp4PbUcNW8VHM896zLsNI5E/aV+rGdhCzcA6afZqzLIA4mz8C
XAiYCtzbbdWo0t+2pf4XkMUnow0x9fOxOpK13/HvrCllgLTTmMReAdskxaKzhXy3
sg420W5/rsE1W3d3WIV5EB+w25mfoul0ciVEM3N5EYzn3dfEi7u8d8ad8aZTMl/b
4+QK3pTfuL5/bt6jK5Rgss1myzjQsVeTzH45JItClGuOtAq6EV/QVveO0T5jCshO
66XDnmzMt+BDpGl3EEjtNAjrrMGK5+w4nSH0t8rFd/FMlUS4nJfPnQwv+O3rlGz5
qWtBJm0j56jwGUhJCaLcfwK/8nXfoMLgKxZYb4HaCPg1MdsPvgivFag3p/WdzO4V
IPijGZvnJN6qcd9yxAIWqVIhGNPRviz4jisX0tOMcCpAW6bKD6NGtbdXlBNXlSXw
UldS1XlDz3LkLCBnPO2PYKR2fDWiy2dwdtTpYPqhNb3BY5BKjx+JVXyLkwU2M3Vf
H/zbRJ9Vy1LUaAgSwAApW3uiRMEslxEYp5DhuauxeyTygG/fSp4JdPv2WuNCNiT+
E5JmFnr1wL41S7EXyfC22S5h7r6VWDL2dCyT9NAWCutx7fcIePicXgx405iYsLqB
AK8cJJiPnZAXYQsNhQ+mU++0oABoQL9hP6+38QK0yw56qg20O0jXPZOP2yCMLQil
IdSYCc2G7Gvtsf3wpnOhxQlkZVEkO7AWmnho4HDzzLIbgKFHr2JhWtOnEtx8Af16
SIsgoM1/e+28JPOu14wfGv+TITA2jBjuKZVzuqQDbsVJcptT5AVkppeRBnBLhVf/
cRQf3/xGPpqWk1XgJxtzFjQCJ6s8zIl6zKgQDysp0+X2lU9/aPxWb+CNZTNzTEW9
L17Ub8z4lUGAM8/BF+fSaJ2JpAVhLi2Q0/+LBcs2bv8r+pLwMj7cfYN97Mme2n6+
BrKi3ic4T8MzTXNrbr75b3wuj63CLG8Nm+zt3B0yLHzKy7WQI/hLzuASwKKfHv3T
GaWurKa7z+b1m2F52VQl5FdSh9nPNZlUyAN/e5EDNRrFpX4NMJcgGCxp9mtketds
XFjqo/4os59IgTn3KQY4GbLvyh9rLjWrjvS3rbHBtYG0cPaH5tyjnkTdeZpiIvXG
sA9zNoLKEx6QxE4pkDkoiOCG+ZdLD3RHawAULHGVstGa6Te9mNXby0ehzH0Jh248
R8/AQXjIyDw4KBjPhnv99Xvl5pMNCIFCKq5ATmGizbUMz8Ibqnsm1bCM/oLNcy3X
dR7RSx0+IPINHV609a3vx/POSS6kchtHFOUPAErasup0pLw2tsS08EbM8FNGGZHw
3y82zrx1WCRAPxIuyNr6aGbk1SdJOiOYVe/H6sAyYrINioOvzeOyvIz2ST5/Ulqm
MDgZGA/MPkWGltz7G4LBN7nMU2rYfyUNJ7ql+zUr1jbYv9qAsDblFMUX6Qx8M2mz
sF4lpN22hBEJeL/Ophn6Bgp84v4WwbCJAZawO9JNhL+d/WBn0yf05KU4yfqKcOH4
7PuydLTcEr70Q/jZ72vn9j9Hag/j5WGgXhS84bQljzWU+rKtn6jxLC3pcMmEygV1
OTI4DTbekCe8ODSpWFo/1MynsRWTDM2B+enLAnX2XLMdVwQ=

`;

/** The S/MIME identity that the messages below are encrypted to.
 * `openssl req -x509 -newkey rsa:2048 -keyout user.key -out user.crt -nodes
 *   -subj "/CN=User/emailAddress=user@example.com"
 *   -addext "subjectAltName=email:user@example.com"
 *   -addext "subjectKeyIdentifier=hash"
 *   -addext "keyUsage=digitalSignature,keyEncipherment"` */
const kOurKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHFL19V/qBg0z4
KcGCo9GIcy/9SyL8g6rTgn0QXdhjoUXdIjMG/uJ/XnSiFWJjps6WSOSY93XcSXrp
30ngrUBa0qRnC/cUe4Jlj1HU1izE1fAi+onlvY1ny3OEiFNpbsVMv3QUsiz8Xh5v
QmNkR97q5GkOipEryuOdoZjuHCmERFjBiG0+JIuCbG0JzgWiREJ9PGI3TjbDx9Pj
YAnwBTIBMeUGbpXCT+o1AKmMJ/Pr/F1WBqe77hVGbfmqNtvkcrYzweUt8bo7VJck
Jix+AUHNcPMEftnuU8xq/fDt+buAQOcHzQOunuJcxVSF8AoF77UMYBY1zWLPIyG8
PBU+4jEPAgMBAAECggEAXcTWldXdH6iNFexxAYwQsvDyXx9HXOHVkedJ6e4R8Kdz
JTupBjgCzhRa4kcpPx+/+Yhe5+/S203e745lGUbxY3YIyqKXn9Wm7xgo5pN0pcfQ
4mDYl9YG5ycsg3XEuAndM4+P6Pmdd8cLFcOS1haGGGQ6WYeJ5jMbr9EAG9M2+N11
Z8Po5pumGEC7tXYeso707r+tqQLYVCl7WuA2H0HqvTsyptmHxz0asZxAwVeMalJT
OcJnfjevISlhRJa9ZfksDBu/L4nfS/5X/6MIym/s/8TvSWrIygFh74u83znIPs6K
kcmZnFOFoBxHowguuFNvmEJ/A2kuxnykFIDo9eS24QKBgQDuV78FLzJ0uTy7YRzN
cgYlmBbTuOUqeRMfGRZcVcC6auhecSsunsdtBM38lD7RXiRdAWBJlahTsvS+upwL
SzhFcCb+YOEjGuV4NY5VmY1gnY4VmD1YNQ3tnsPl34OM4WB0s0ILRVZ6mWHoB1mV
l854CWzndIbtitmN7xZ2FGqqLwKBgQDV1GGfmiwXHDHfC9fzps9S0OoXNeLJLs4J
rDdIowMpedVnmV7/YkoDLjEBdH1BG4LXe0l6Kb7yVEVKS5j1DtrcVVs9fOoNkVl8
62RDq8Q7wHZ+FLDqnUC2X3jKYcY4b1d1tx58vjZ8+NwfIvx2uSQUVN+9srb94DSK
fbGQ/o6PIQKBgQDCRM80QJYVwe6YpL0/T9NmzSK+DBTum6VUUbSCKnte90jTwdZ6
t3zBhYsIdyUEroFhNX/wOoXrQxBubdhG9Fa3coS2Du0zGfc0FiMf7nrn50Qqod5O
iWAC8MeoFJk7OXDPblVEro2gfGjrISKJ5iSqfrQ/rCFWeTh+kgRy1o1ijQKBgFzF
wn1OlKaKMxEEwHMUAot53LapSHXk+ruznmDDaRHLrE1Ae7jt2hK7LcPl2Jow53m6
Ic0A47mb2lw7pGdeRJKn7egllB7C20KZlmzNz1vlSwO00nVYOMVncq7L8QZ3OEj4
ZB/XHyjliAtyUHrqJL81e8WADmjjp6gWlL3F0/BBAoGAWdLZeoxC+jTiT7/QKeh+
gByK2TC7+CbSNMLkDwF/C1vM08ACn6rHaz2L53TmRRlPIhHPbE4t7ENlsM+wca5n
UjMQcdDfg+MMl5xzhc89Wcu7NMuvxWDqD1jjhi9Poik1QyRYu1IJ+2DtsH5Viqf1
d4Lk+gHjiODNex6QqnxkIwc=
-----END PRIVATE KEY-----
-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUNn2UnxH1jnnZYFI4xfGh+UMMu3cwDQYJKoZIhvcNAQEL
BQAwMDENMAsGA1UEAwwEVXNlcjEfMB0GCSqGSIb3DQEJARYQdXNlckBleGFtcGxl
LmNvbTAeFw0yNjA5MDMwNjE4MzdaFw0zNjA4MzEwNjE4MzdaMDAxDTALBgNVBAMM
BFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20wggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQDHFL19V/qBg0z4KcGCo9GIcy/9SyL8g6rT
gn0QXdhjoUXdIjMG/uJ/XnSiFWJjps6WSOSY93XcSXrp30ngrUBa0qRnC/cUe4Jl
j1HU1izE1fAi+onlvY1ny3OEiFNpbsVMv3QUsiz8Xh5vQmNkR97q5GkOipEryuOd
oZjuHCmERFjBiG0+JIuCbG0JzgWiREJ9PGI3TjbDx9PjYAnwBTIBMeUGbpXCT+o1
AKmMJ/Pr/F1WBqe77hVGbfmqNtvkcrYzweUt8bo7VJckJix+AUHNcPMEftnuU8xq
/fDt+buAQOcHzQOunuJcxVSF8AoF77UMYBY1zWLPIyG8PBU+4jEPAgMBAAGjfTB7
MB8GA1UdIwQYMBaAFEMlUw+zyn92kfdBY9waadqEGIeXMA8GA1UdEwEB/wQFMAMB
Af8wGwYDVR0RBBQwEoEQdXNlckBleGFtcGxlLmNvbTAdBgNVHQ4EFgQUQyVTD7PK
f3aR90Fj3Bpp2oQYh5cwCwYDVR0PBAQDAgWgMA0GCSqGSIb3DQEBCwUAA4IBAQDF
VeJlLzy0dK1c78kqQIqWrPTWtRFgypW0Kvz6mnG9649gqm0HmHe/PLbUm4oZrdFD
7C3xBYwVL7JSSjsdU2tOiS5eAtv26y/kThfxjgp9I7uBpiJ28tUylicB3wD+G6bN
WUzH0zg4B2GInfrutwziwFQ1gheKyf8Q4Q9xgW+HgP7EiX6NaMCCNdPeolIw1LkI
WV0rzv81Q5Ad3uta5BG4cy9kptUIYvLPrUkqhbXkrOo4KyAfljVw90B6DSjZrU4n
5n/ySiiSVlEY9VygZJdPDuDE73MiI9VrZvEN2PA5xZldHcohvQW3XaXw/17RHmKq
1ewAnoWSUmfPbKCQgmtF
-----END CERTIFICATE-----`;

/** `openssl cms -encrypt -des3 -in body.txt -outform SMIME -recip user.crt`,
 * where `body.txt` is the MIME entity that the message decrypts to */
const k3DES = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted with 3DES
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-des3@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIB6wYJKoZIhvcNAQcDoIIB3DCCAdgCAQAxggFkMIIBYAIBADBIMDAxDTALBgNV
BAMMBFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20CFDZ9lJ8R
9Y552WBSOMXxoflDDLt3MA0GCSqGSIb3DQEBAQUABIIBALvgpagNSko+cHvDIw9D
S2khFMKv2hPEtlJHdBBJ6bAuqu20DJUgMq3zlXLM5IzWFKRYR/2Nwmk35lVxLCny
9KXj4+RtJC4RQlFWToElr57/z63sUbPMLYh6EvDv2URdag3Pb5KXJ+x1BXgcm4e+
nP1MgmlFgOxc9FXS9iCXXiUf6/NBS0BGtDWA1oY6UzFg9Z33NDjHuzJuv9U0XzKw
9wN4yK/dy9juYWQ7QFpTHL3c/2x0y6MAnCB/a9WfA7uQNBTHa7sMkBi4+++fwohM
QLXTuOTmGCc303IW7vwbVJfnrNXiMRONC+FxWYSSq1pSDcS6RL0iUBPccKpqIw9k
4gEwawYJKoZIhvcNAQcBMBQGCCqGSIb3DQMHBAjQon5SqXREV4BIwkEbCZV79TBG
SUEJfF087NTIp84e6tiNuFzXJDIFXlcQqwoY5BIvyvZ+vZ9gfCrseB/O4tX1YNvq
/w9PYPmjQsZ08TyBa0QB`;

/** `openssl cms -encrypt -rc2-128 -provider legacy -provider default
 *   -in body.txt -outform SMIME -recip user.crt`.
 * RC2 lives in the legacy provider of OpenSSL 3. */
const kRC2 = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted with RC2
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-rc2@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIB8AYJKoZIhvcNAQcDoIIB4TCCAd0CAQAxggFkMIIBYAIBADBIMDAxDTALBgNV
BAMMBFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20CFDZ9lJ8R
9Y552WBSOMXxoflDDLt3MA0GCSqGSIb3DQEBAQUABIIBAFwAwL+jAyj56j1HUfCv
7GPHHtyNGmKyAd4ZVljWWkSeyY5Ggt9MqzN1mb5mLX5qZ3/f3fewHFqLQuNOOmde
SHSsj9LkSOryoHdaz5HcfB7fcc6J7N7ZydSZ6kxOc4JyYn7vOHDfLEkuC4xSeJQV
ICA1DtLFCIflkkie+FR+bJnwnZTY271NQaowmtTaVkT+Ewv4Oe0+uyyNzVwOyZVs
18ty9c3XSW12yvK3Tiz8K+aiNlq04APPMFnE+sSWNagdcJjAeo7KuxRfn4HHjQPS
DDvhe0GrrnkN0f5QepxEVDgGlvZzs1AEanixKA+m0celuK95gxm2eSeRQATX1dgI
KvcwcAYJKoZIhvcNAQcBMBkGCCqGSIb3DQMCMA0CAToECFu0so91oorLgEg3jcBR
2P2Gh+U0oulXNEgiKt5lUWdvIZpcDX08kHjZmObAPJBIN9LTitsJUDGqGPri4qv1
3iM1LDR56tCa3qKnXz/PMxKisHQ=`;

/** As `kRC2`, but with `-rc2-40` */
const kRC2Export = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted with RC2-40
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-rc240@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIB8QYJKoZIhvcNAQcDoIIB4jCCAd4CAQAxggFkMIIBYAIBADBIMDAxDTALBgNV
BAMMBFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20CFDZ9lJ8R
9Y552WBSOMXxoflDDLt3MA0GCSqGSIb3DQEBAQUABIIBAFj92uLMItuLnZWN6FhH
UJ2nH73j8oz6dZmQiRgSUJDJxVY3umLVBT4l+yC3/B9Wl5S18E0yQ3lZaSLiDqsk
QQ16OBRsQCz/gC1SYWA9RNJ40W2QEQ4L95cKQWE0wWOGgXhDcZJEvzhEiUCqntPv
WPtOCBLj3/i3HlpZqoaXJuSt32V7uJP6d7E+yB7rHTuIRB7m4YbWsJ6mKM9RyoZt
9CN9d7dZaRqgLa/f0tp+/PO8k7NmzYgUC5pau5ddsu3DFUZOnN0aDO85JfK4iY/f
U2g8BfQFpt80fgIWrFVw8Kh8zwhcl0tifFzGgVhy94wJhg0AW4U8Fy6NIPfTdUTd
0uswcQYJKoZIhvcNAQcBMBoGCCqGSIb3DQMCMA4CAgCgBAgSZnhpIyC3u4BIYyJy
FX/G+LwiLT2k641mQH1sAaQXDv9LK/ULoZZHyQAFzMFpiEBE7WD4CdOG59a8+PMZ
UMYGFLFYP9MPSj13EdiN7JbrOZVJ`;

/** `openssl cms -encrypt -camellia128 ...`: a cipher that we do not implement */
const kCamellia = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted with Camellia
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-camellia@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIB/gYJKoZIhvcNAQcDoIIB7zCCAesCAQAxggFkMIIBYAIBADBIMDAxDTALBgNV
BAMMBFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20CFDZ9lJ8R
9Y552WBSOMXxoflDDLt3MA0GCSqGSIb3DQEBAQUABIIBAC9DhweaUbqf4w89Bj2P
EyJAFVPUXTnlwEkY5zlYTi6iXwMunRobvoI8DoXf/lN5vBxuUBA3cQwg1+c2L/Xr
BTsrbFGSZT8iKxb1TiVpsA0Gphtr3Tn+vslvaI8b0dRPvf6kBsTvNVTXCFQ0wjGh
AZkdz7WiemeILXbW17nVq4l1aRBVYDlcLRqzxJ0LSdGF9M2fazdXmYakilMwofWs
E9+e7seMMM+xuLNr1wGogviVJEzMFLOsqLiBxNkDwDNqCGVMDfaK5MM6vjg/IY2z
xyRd7PvaXgStA6rRpBEkJpI5fX1aQM4bqPNXjrZzufytLLR5/4Qyj8BbgELRcfE+
hN0wfgYJKoZIhvcNAQcBMB8GCyqDCIyaSz0BAQECBBAIRM331zx1v66IGd/vNXTI
gFDGGMQO5T77gbbSkB6bK7wuVfwKTGVJNsQEVAkW+fb8dxA9YfWJavtiUaWxUUB4
fwOvE+nAm22cF7W8FTPUaqGiMyBXStfBfbudN7yYSTruhQ==`;

/** `openssl cms -encrypt -aes256 -keyopt rsa_padding_mode:oaep ...`:
 * the content key is encrypted with RSA-OAEP instead of PKCS#1 v1.5 */
const kOAEP = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted with RSA-OAEP
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-oaep@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIB/AYJKoZIhvcNAQcDoIIB7TCCAekCAQAxggFkMIIBYAIBADBIMDAxDTALBgNV
BAMMBFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20CFDZ9lJ8R
9Y552WBSOMXxoflDDLt3MA0GCSqGSIb3DQEBBzAABIIBAEAa1wWQ61WqVJl2Z87B
WN/IwnnV1RrO7p9odFZ4aLe+EmEPLlys9qnP/Jx7bsFN1fMOY13VFZz+xg6xw5TG
VbvQOuf5cpFmytoNak9LXQJA5tw/jxP0SlJhb+ARX8hmZ2NxVUNPBVgxgzKzNX16
6y5BmOMnHoTPPxlcVjRt1/6rf/9l8fNt+3vrRbzlXJO1mwTGN2DNaEFxP+c652gu
0HUTar2vrf3dca4YRj1iz2Qua4cUKd8xMTvlNf9GWsfWpD59dQLbH2usfAulo3H0
6IbKwlnbBx0+cMRtjI0ow/+jn8WgkAKY3ZZz63LKz7khJSLSmXSfX7jw6zejNYji
z0owfAYJKoZIhvcNAQcBMB0GCWCGSAFlAwQBKgQQHpzfNJOdR+9vexUeW0BEboBQ
aBrnnQ9HhHGEcMqjqjlS87kikTbSyy3HR479tEzVMHHfv8FQQp9el2DKypN8qIww
DSoahJ89vm89/M6HMB2X2Rlx7UAXFmjvwJgIBDx/480=`;

/** `openssl cms -encrypt -aes256 ... -recip ec.crt`, where `ec.crt` is an
 * EC certificate: the sender then uses key agreement, not key transport.
 * `openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256` */
const kECDH = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted to an EC key
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-ecdh@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIBggYJKoZIhvcNAQcDoIIBczCCAW8CAQIxgeuhgegCAQOgUaFPMAkGByqGSM49
AgEDQgAEDvN8iS2lkk5NBffdBBA2TFOh4oOyFrmPZuBsKHHWysczNW6Vkf47GFEz
8x8TV5EKLo2qfeJO5gqvIv/8l1HE8zAYBgkrgQUQhkg/AAIwCwYJYIZIAWUDBAEt
MHYwdDBIMDAxDTALBgNVBAMMBFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhh
bXBsZS5jb20CFCrDSc8tdxKCmYU+ZU6DjBEiOTOzBCiKYMhaZ7u88Esj5yN7IMD2
RzdNM/j29ibMdc79c1Iwtm5UbTXt6uo1MHwGCSqGSIb3DQEHATAdBglghkgBZQME
ASoEELZRNmez5JQ3FWy++6q9JTKAUJuCIk93Mea2ePGVnVePWa744VxpkfzX9Oja
wSRTDC7T1ij8Z94jF0Lueip0XOYXKwxD0IY0fnYcPNZgnNiAF9bhj17QmADGf49g
f5OAMaBd`;

/** `openssl cms -encrypt -keyid -aes256 ...`: the recipient is named by the
 * subjectKeyIdentifier of the certificate, not by issuer and serial number */
const kKeyIdentifier = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted by key identifier
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-keyid@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIByAYJKoZIhvcNAQcDoIIBuTCCAbUCAQIxggEwMIIBLAIBAoAUQyVTD7PKf3aR
90Fj3Bpp2oQYh5cwDQYJKoZIhvcNAQEBBQAEggEAm3dcHXGfuSs7AJY6V3DllJmG
c2bNY75AahsSXsmIG3G7b6Ll0SrJL+/0mKv7YxMA02F/H0e/pjiz2e+smxbyyzhl
XxQUsAIjz8ZmxyjjwmA3udRZmkRwV8JNNADCxJlVSQUI2+OWIX7JlM19sTrzG6Iu
Jr6UFoSmrcmQ9UYyb9Lu7891jkBvbyTdcvLkVoOR3whRJ1sC3L+yTwXIrum3Dh3a
ZP8k4I/hYiSsHmcNpwduN+KVNlR7lFex69xhTeF2eAVBTTWJ3I9ceXkwLJ/urHhY
xEUsq+M6twfxGBGHhmCR+rz2pqd8CrL1JLJEvd5Mkk+ngFL6PbuXpVsUhhmCjDB8
BgkqhkiG9w0BBwEwHQYJYIZIAWUDBAEqBBAxdIlTvEfnQrSKea7ihQxzgFDk3W25
fGVVagXm1xTBCsl4oCNjrKPK93GMEiBDztEktg3oIAuRn8WMJQ+tKOPTwAPoveL9
HLxHAcbqU8yiKZB81KFOji2jLU6WIqdorSqPmQ==`;

/** `openssl cms -encrypt -aes256 -in body.txt -outform SMIME -recip user.crt`,
 * with the Content-Type replaced by the generic file type that Microsoft
 * uses and that gateways rewrite to. MS-OXOSMIME section 2.2.1 */
const kOctetStream = `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Encrypted, delivered as a file
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <enc-octet@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/octet-stream; name="smime.p7m"
Content-Transfer-Encoding: base64

MIIB/AYJKoZIhvcNAQcDoIIB7TCCAekCAQAxggFkMIIBYAIBADBIMDAxDTALBgNV
BAMMBFVzZXIxHzAdBgkqhkiG9w0BCQEWEHVzZXJAZXhhbXBsZS5jb20CFDZ9lJ8R
9Y552WBSOMXxoflDDLt3MA0GCSqGSIb3DQEBAQUABIIBABA2+2E7Tdf+TWzwzy6i
K3DOG35PkFxaLLOLWiXX0P/CcQis+pDNg5Ga2hb5O4orCGzg0D/XFsIYfDOGzUyg
KMJPNLnQ2tnO3ObkWJ2DMHCuJkfLwA9i9pNTi6DSWsq0RhqqlTs01GlIq8gBfoj3
d8wHwdvVURDpP2f9e5X3Ht8FOzA5N1LTNpjqq3TX9nQjU5VIFcSlEACtBz80FFnW
50nTI8YgFqcmZ2Gl9tDDhcSJZVQt0TewqtpRsDNGc0IBPFnFvpdF3rHyrZelvaSW
DNdHAPJQuCZuybECCZUKMaABQzGiwKhPvQTvpe2CfpiQPXi0wBf9IeaMXMxnN0bO
REUwfAYJKoZIhvcNAQcBMB0GCWCGSAFlAwQBKgQQLhZ9MZr1QUFEQ7ufBZWtN4BQ
85DMorulmVpREDsUAoQyZqPsjQMs0aaAincZRr3Dwu4L0E3PX20k5wLaNmOG4XK3
5Gllpx+qCxwIIr7h99iaHTy8LfqFSpdYbWcLbYYkUz4=`;
