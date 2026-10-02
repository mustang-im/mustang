import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { expect, test } from "vitest";

test("A message that claims to be S/MIME, but is not, still shows its content", async () => {
  let { folder } = await setupTestFolder();
  let errors: Error[] = [];
  folder.account.errorCallback = (ex) => errors.push(ex);

  let email = folder.newEMail();
  email.mime = new TextEncoder().encode(kNotCMS.replace(/\n/g, "\r\n"));
  await email.parseMIME();

  expect(errors).toEqual([]);
  expect(await email.attachments.first.content.text()).toBe(kContent);
});

test("Plain text that starts like a header line is not read as MIME", async () => {
  let { folder } = await setupTestFolder();
  let errors: Error[] = [];
  folder.account.errorCallback = (ex) => errors.push(ex);

  let email = folder.newEMail();
  email.mime = new TextEncoder().encode(notCMS(kNote).replace(/\n/g, "\r\n"));
  await email.parseMIME();

  expect(errors).toEqual([]);
  expect(await email.attachments.first.content.text()).toBe(kNote);
});

test("A MIME entity in place of the CMS blob is read as MIME", async () => {
  let { folder } = await setupTestFolder();
  let errors: Error[] = [];
  folder.account.errorCallback = (ex) => errors.push(ex);

  let email = folder.newEMail();
  email.mime = new TextEncoder().encode(notCMS(kMIMEEntity).replace(/\n/g, "\r\n"));
  await email.parseMIME();

  expect(errors).toEqual([]);
  expect(email.text.trim()).toBe("Hello, this was decrypted by the archiver.");
});

/** Long enough that its 2nd byte passes as an ASN.1 length,
 * so that the decoder gets as far as the tag, as in the error report */
const kContent = "This message was removed by the virus scanner. " +
  "The S/MIME part that it replaced is no longer available here.";

const kNote = "Note: This message was removed by the virus scanner.\r\n" +
  "http://example.com/quarantine has the details.";

const kMIMEEntity = "Content-Type: text/plain; charset=utf-8\r\n" +
  "\r\n" +
  "Hello, this was decrypted by the archiver.\r\n";

const kNotCMS = notCMS(kContent);

/** Declares `application/pkcs7-mime`, but the content is not CMS */
function notCMS(content: string) {
  return `From: Alice <alice@example.com>
To: User <user@example.com>
Subject: Not S/MIME after all
Date: Tue, 14 Jul 2026 10:00:00 +0000
Message-ID: <not-cms@example.com>
MIME-Version: 1.0
Content-Disposition: attachment; filename="smime.p7m"
Content-Type: application/pkcs7-mime; smime-type=signed-data; name="smime.p7m"
Content-Transfer-Encoding: base64

${btoa(content)}
`;
}
