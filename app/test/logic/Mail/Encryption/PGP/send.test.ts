import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { appGlobal } from "../../../../../logic/app";
import { MailIdentity } from "../../../../../logic/Mail/MailIdentity";
import { findOrCreatePersonUID } from "../../../../../logic/Abstract/PersonUID";
import { PGPSend } from "../../../../../logic/Mail/Encryption/PGP/PGPSend";
import { PGPPrivateKey } from "../../../../../logic/Mail/Encryption/PGP/PGPPrivateKey";
import { PGPPublicKey } from "../../../../../logic/Mail/Encryption/PGP/PGPPublicKey";
import type { EMail } from "../../../../../logic/Mail/EMail";
import type { Folder } from "../../../../../logic/Mail/Folder";
import { expect, test, describe, beforeAll } from "vitest";

let folder: Folder;
let identity: MailIdentity;
let key: PGPPrivateKey;

beforeAll(async () => {
  ({ folder } = await setupTestFolder({
    // Stands in for nodemailer in the backend
    getMIMENodemailer: async () => new TextEncoder().encode(kMIME.replace(/\n/g, "\r\n")),
  }));
  identity = new MailIdentity(folder.account);
  identity.emailAddress = "user@example.com";
  identity.realname = "User Müller";
  folder.account.identities.add(identity);
  appGlobal.emailAccounts.add(folder.account);
  key = await PGPPrivateKey.createNewPrivateKey({ realname: "User Müller", emailAddress: "user@example.com" });
  identity.encryptionPrivateKeys.add(key);
  findOrCreatePersonUID("user@example.com", "User Müller").encryptionPublicKey =
    await PGPPublicKey.importPublicKey(key.publicKeyArmored);
});

/** Signs the message to ourselves, and encrypts it, if requested.
 * @returns the MIME source that goes to the server */
async function send(encrypt: boolean): Promise<string> {
  let mail = folder.newEMail();
  mail.identity = identity;
  mail.from = findOrCreatePersonUID("user@example.com", "User Müller");
  mail.to.add(mail.from);
  mail.subject = kSubject;
  mail.signedByKeyID = key.id;
  mail.shouldEncrypt = encrypt;
  return (await PGPSend.encryptAndSign(mail)).sendRawMIME;
}

/** Reads the message, as the recipient would */
async function receive(mime: string): Promise<EMail> {
  let email = folder.newEMail();
  email.mime = new TextEncoder().encode(mime);
  await email.parseMIME();
  return email;
}

describe("PGP message with non-ASCII sender name and a long subject", () => {
  // EWS and OWA upload the message with `btoa()`, which throws for anything
  // outside of Latin-1, e.g. "–" or "€", and garbles the other non-ASCII characters.
  test("signed: the message is plain ASCII, as Exchange needs it", async () => {
    let mime = await send(false);
    expect(mime).toMatch(/^[\x00-\x7F]*$/);
  });

  test("encrypted: the message is plain ASCII, as Exchange needs it", async () => {
    let mime = await send(true);
    expect(mime).toMatch(/^[\x00-\x7F]*$/);
  });

  test("signed: the recipient sees the subject and sender as written", async () => {
    let email = await receive(await send(false));
    expect(email.subject).toBe(kSubject);
    expect(email.from.name).toBe("User Müller");
    expect(email.signedByKeyID).toBe(key.id);
  });

  test("encrypted: the recipient sees the subject and sender as written", async () => {
    let email = await receive(await send(true));
    expect(email.wasEncrypted).toBe(true);
    expect(email.subject).toBe(kSubject);
    expect(email.from.name).toBe("User Müller");
    expect(email.signedByKeyID).toBe(key.id);
  });
});

/** Longer than a header line may be, so it must be folded, and only between words */
const kSubject = "Grüße aus Köln – ein Betreff, der deutlich länger ist als achtundsiebzig Zeichen";

/** As nodemailer 7 writes the message */
const kMIME = `From: =?UTF-8?Q?User_M=C3=BCller?= <user@example.com>
To: =?UTF-8?Q?User_M=C3=BCller?= <user@example.com>
Subject: =?UTF-8?Q?Gr=C3=BC=C3=9Fe_aus_K=C3=B6ln_=E2=80=93_?=
 =?UTF-8?Q?ein_Betreff=2C_der_deutlich_l=C3=A4nger_?=
 =?UTF-8?Q?ist_als_achtundsiebzig_Zeichen?=
Message-ID: <pgp-headers@example.com>
Date: Tue, 14 Jul 2026 10:00:00 +0000
Content-Transfer-Encoding: quoted-printable
MIME-Version: 1.0
Content-Type: text/plain; charset=utf-8

Gr=C3=BC=C3=9Fe aus K=C3=B6ln!
`;
