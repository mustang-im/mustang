import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { appGlobal } from "../../../../../logic/app";
import { MailIdentity } from "../../../../../logic/Mail/MailIdentity";
import { expect, test } from "vitest";

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

test("An encrypted message that is not for us tells the user why it stays empty", async () => {
  let { folder } = await setupTestFolder();
  let identity = new MailIdentity(folder.account);
  identity.emailAddress = "user@example.com";
  identity.realname = "User";
  folder.account.identities.add(identity);
  appGlobal.emailAccounts.add(folder.account);
  let errors: Error[] = [];
  folder.account.errorCallback = (ex) => errors.push(ex);

  let email = folder.newEMail();
  email.mime = new TextEncoder().encode(kEncrypted.replace(/\n/g, "\r\n"));
  await email.parseMIME();

  expect(errors.map(ex => ex.message)).toEqual(["This message is encrypted, and the key is not available"]);
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
