// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { newTestEMail, setUpAccount, type TestMailAccount } from "./TestMailAccount";
import { MailIdentity } from "../../../logic/Mail/MailIdentity";
import { SpecialFolder } from "../../../logic/Mail/Folder";
import { PersonUID } from "../../../logic/Abstract/PersonUID";
import type { EMail } from "../../../logic/Mail/EMail";
import { ComposeSignature, hasOwnSignature, kStripSignaturesSetting, putOwnSignature, removeSignatures, signatureForSending, splitPlaintextSignature } from "../../../logic/Mail/Signature";
import { convertHTMLToText } from "../../../logic/util/convertHTML";
import { CreateMIME } from "../../../logic/Mail/SMTP/CreateMIME";
import { gLicense } from "../../../logic/util/License";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

/* DOMPurify fails in happy-dom with `WHOLE_DOCUMENT`, and then `Message.html`
 * silently returns "". Sanitizing is not what these tests are about. */
vi.mock("dompurify", () => ({ default: { sanitize: (html: string) => html, addHook: () => {} } }));

const kFred = "<p>Fred Miller</p><p>Example Inc.</p>";
const kWork = "<p>Fred Miller, CTO</p>";

let account: TestMailAccount;
let personal: MailIdentity;
let work: MailIdentity;

beforeEach(() => {
  gLicense.license = { valid: true }; // No "Sent by" line, unless the test wants it
  localStorage.clear();
  appGlobal.emailAccounts.clear();
  account = setUpAccount();
  appGlobal.emailAccounts.add(account);
  personal = account.identities.first;
  personal.signatureHTML = kFred;
  work = new MailIdentity(account);
  work.emailAddress = "fred@work.example.com";
  work.realname = "Fred Miller";
  work.signatureHTML = kWork;
  account.identities.add(work);
});
afterEach(() => {
  appGlobal.emailAccounts.clear();
});

function doc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/** The tag names on the top level of the body, e.g. "P", "FOOTER", "BLOCKQUOTE" */
function topLevel(html: string): string[] {
  return Array.from(doc(html).body.children).map(e => e.tagName);
}

function ownSignatureText(html: string): string | null {
  return doc(html).body.querySelector(":scope > footer[type=signature][data-own-signature]")?.textContent ?? null;
}

function receivedMail(html: string | null, text: string | null = null): EMail {
  let mail = account.getSpecialFolder(SpecialFolder.Inbox).newEMail();
  mail.from = new PersonUID("anna@example.com", "Anna");
  mail.to.add(personal.asPersonUID());
  mail.subject = "Lunch";
  mail.messageID = "lunch@example.com";
  mail.sent = mail.received = new Date();
  if (html) {
    mail.html = html;
  } else {
    mail.text = text;
  }
  return mail;
}

async function send(mail: EMail) {
  let sent = mail.compose.send();
  await account.atServer;
  account.serverAccepts();
  await sent;
}

// Composing

test("A new mail gets the signature at the end, below an empty line to type in", () => {
  let mail = account.newEMailFrom();
  mail.identity = personal;
  let html = mail.compose.addSignature();
  expect(topLevel(html)).toEqual(["P", "FOOTER"]);
  expect(ownSignatureText(html)).toBe("Fred MillerExample Inc.");
  expect(mail.composeSignature).toBe(ComposeSignature.Added);
  // Only once
  mail.html = html;
  expect(mail.compose.addSignature()).toBeNull();
});

test("Reply with quote below: The signature goes between the reply and the quote", () => {
  let reply = receivedMail("<p>Lunch at 12?</p>").compose.replyToAuthor();
  let html = reply.compose.addSignature(personal);
  expect(topLevel(html)).toEqual(["P", "P", "FOOTER", "P", "BLOCKQUOTE"]);
  expect(doc(html).querySelector("footer + p.quote-header")).not.toBeNull();
});

test("Reply with quote above: The signature goes at the end", () => {
  localStorage.setItem("mail.send.quote", JSON.stringify("above"));
  let reply = receivedMail("<p>Lunch at 12?</p>").compose.replyToAuthor();
  let html = reply.compose.addSignature(personal);
  let tags = topLevel(html);
  expect(tags.at(-1)).toBe("FOOTER");
  expect(tags.indexOf("BLOCKQUOTE")).toBeLessThan(tags.indexOf("FOOTER"));
});

test("Forward: Our signature goes above the forwarded mail, which keeps its own signature", async () => {
  let original = receivedMail(`<p>Menu attached</p><footer type="signature"><p>Anna</p></footer>`);
  let forward = await original.compose.forwardInline();
  let html = forward.compose.addSignature(personal);
  let d = doc(html);
  let footers = Array.from(d.body.querySelectorAll("footer"));
  expect(footers.map(f => f.textContent)).toEqual(["Fred MillerExample Inc.", "Anna"]);
  expect(footers[0].nextElementSibling.tagName).toBe("HR");
});

test("Changing From swaps only our signature, in the same place", async () => {
  let original = receivedMail(`<p>Menu attached</p><footer type="signature"><p>Anna</p></footer>`);
  let forward = await original.compose.forwardInline();
  let html = forward.compose.addSignature(personal);
  let swapped = forward.compose.changeSignature(work, html);
  expect(ownSignatureText(swapped)).toBe("Fred Miller, CTO");
  expect(Array.from(doc(swapped).body.querySelectorAll("footer")).map(f => f.textContent))
    .toEqual(["Fred Miller, CTO", "Anna"]);

  // An identity without signature removes ours, but not Anna's
  let none = new MailIdentity(account);
  let removed = forward.compose.changeSignature(none, swapped);
  expect(hasOwnSignature(removed)).toBe(false);
  expect(doc(removed).body.querySelector("footer").textContent).toBe("Anna");

  // ... and back to an identity with signature puts it above the forwarded mail again
  let back = forward.compose.changeSignature(personal, removed);
  expect(doc(back).querySelector("footer + hr")).not.toBeNull();
});

test("Changing From from an identity without signature adds the new signature", () => {
  personal.signatureHTML = null;
  let mail = account.newEMailFrom();
  let html = mail.compose.addSignature(personal) ?? "";
  expect(html).toBe("");
  html = mail.compose.changeSignature(work, html);
  expect(ownSignatureText(html)).toBe("Fred Miller, CTO");
});

test("Changing From keeps text that the user typed", () => {
  let mail = account.newEMailFrom();
  let html = mail.compose.addSignature(personal);
  html = html.replace("<p></p>", "<p>See you!</p>");
  html = mail.compose.changeSignature(work, html);
  expect(doc(html).body.textContent).toBe("See you!Fred Miller, CTO");
});

test("Redirect and Edit as New don't get a signature", async () => {
  let original = receivedMail("<p>Lunch at 12?</p>");
  let redirect = await original.compose.redirect();
  expect(redirect.compose.addSignature(personal)).toBeNull();
  expect(redirect.compose.changeSignature(work)).toBeNull();
  let clone = await original.compose.editAsNew();
  expect(clone.compose.addSignature(personal)).toBeNull();
});

test("A reopened draft swaps its signature only if it has ours", () => {
  let draft = account.getSpecialFolder(SpecialFolder.Drafts).newEMail();
  draft.isDraft = true;
  draft.html = `<p>Hi</p><footer type="signature" data-own-signature=""><p>Fred Miller</p></footer>`;
  expect(draft.compose.addSignature(personal)).toBeNull();
  expect(ownSignatureText(draft.compose.changeSignature(work))).toBe("Fred Miller, CTO");

  let draftWithout = account.getSpecialFolder(SpecialFolder.Drafts).newEMail();
  draftWithout.html = `<p>Hi</p>`;
  expect(draftWithout.compose.changeSignature(work)).toBeNull();
});

test("Picking a signature explicitly also works on a redirect", async () => {
  let redirect = await receivedMail("<p>Lunch at 12?</p>").compose.redirect();
  expect(ownSignatureText(redirect.compose.putSignature(work))).toBe("Fred Miller, CTO");
});

// Replying

test("Reply removes the signatures from the quote", () => {
  let original = receivedMail(`<p>Lunch at 12?</p>
    <footer type="signature"><p>Anna</p></footer>
    <blockquote><p>Older</p><div class="moz-signature">-- <br>Bert</div></blockquote>
    <footer class="signature"><p>Sent by an old version</p></footer>`);
  let reply = original.compose.replyToAuthor();
  let quote = doc(reply.rawHTMLDangerous).querySelector("blockquote");
  expect(quote.textContent).toContain("Lunch at 12?");
  expect(quote.textContent).toContain("Older");
  expect(quote.textContent).not.toContain("Anna");
  expect(quote.textContent).not.toContain("Bert");
  expect(quote.textContent).not.toContain("old version");
});

test("Reply keeps the signatures, if the user turned that off", () => {
  localStorage.setItem(kStripSignaturesSetting, JSON.stringify(false));
  let original = receivedMail(`<p>Lunch at 12?</p><footer type="signature"><p>Anna</p></footer>`);
  let reply = original.compose.replyToAuthor();
  expect(doc(reply.rawHTMLDangerous).querySelector("blockquote").textContent).toContain("Anna");
});

test("Reply removes the signature of a plaintext mail", () => {
  let original = receivedMail(null, "Lunch at 12?\n\n-- \nAnna\nExample Inc.");
  let reply = original.compose.replyToAuthor();
  let quote = doc(reply.rawHTMLDangerous).querySelector("blockquote");
  expect(quote.textContent).toContain("Lunch at 12?");
  expect(quote.textContent).not.toContain("Anna");
});

// Display

test("A plaintext mail shows its signature as signature", () => {
  let mail = receivedMail(null, "Lunch at 12?\n\n-- \nAnna\nExample Inc.");
  let footer = doc(mail.html).querySelector(`footer[type="signature"]`);
  expect(footer.textContent).toContain("Anna");
  expect(footer.textContent).toContain("Example Inc.");
  expect(doc(mail.html).body.textContent).toContain("Lunch at 12?");
});

test("Plaintext signature: Only `-- ` with space, and only at the end, after quotes", () => {
  expect(splitPlaintextSignature("a\n--\nb")).toBeNull();
  expect(splitPlaintextSignature("a\n-- \nb\n\n> quote")).toBeNull();
  expect(splitPlaintextSignature("> quote\n\na\n-- \nb")).toEqual({ body: "> quote\n\na", signature: "b" });
  expect(splitPlaintextSignature("a\r\n-- \r\nb")).toEqual({ body: "a", signature: "b" });
});

// Sending

test("Sent mail: Standard markers in HTML and plaintext, without the composer marker", async () => {
  let mail = newTestEMail(account);
  mail.identity = personal;
  mail.html = mail.compose.addSignature();
  mail.html = mail.rawHTMLDangerous.replace("<p></p>", "<p>See you at 12</p>");
  await send(mail);

  expect(mail.rawHTMLDangerous).not.toContain("data-own-signature");
  expect(doc(mail.rawHTMLDangerous).querySelector(`footer[type="signature"]`).textContent)
    .toBe("Fred MillerExample Inc.");
  expect(mail.text).toMatch(/^See you at 12\n\n-- \nFred Miller\nExample Inc\.\s*$/);
  let nmMail = await CreateMIME.getNMMail(mail);
  expect(nmMail.text).toContain("\r\n-- \r\n"); // The `-- ` keeps its space on the wire
});

test("Send adds the signature, if the mail bypassed the composer, e.g. a quick reply", async () => {
  let reply = receivedMail("<p>Lunch at 12?</p>").compose.replyToAuthor();
  reply.html = null;
  reply.text = "Sounds good";
  await send(reply);
  expect(reply.text).toMatch(/^Sounds good\n\n-- \nFred Miller/);
});

test("Send does not add the signature again, if the user removed it in the composer", async () => {
  let mail = newTestEMail(account);
  mail.identity = personal;
  mail.compose.addSignature();
  mail.html = "<p>No signature, please</p>";
  await send(mail);
  expect(mail.text).toBe("No signature, please");
});

test("Unlicensed: The Sent by line goes into our signature, and only once", async () => {
  gLicense.license = null;
  let mail = newTestEMail(account);
  mail.identity = personal;
  mail.html = mail.compose.addSignature();
  await send(mail);
  let footers = doc(mail.rawHTMLDangerous).querySelectorAll("footer");
  expect(footers.length).toBe(1);
  expect(footers[0].textContent).toBe("Fred MillerExample Inc.Sent by © Parula");
  expect(mail.text.match(/^-- $/gm)).toHaveLength(1);
  expect(mail.text).toMatch(/^-- \nFred Miller\nExample Inc\.\nSent by © Parula/);

  // Sending again, e.g. after a server error, doesn't add another one
  let again = signatureForSending(mail.rawHTMLDangerous, `<p>Sent by © <a href="https://parula.app">Parula</a></p>`);
  expect(again).toBe(mail.rawHTMLDangerous);
});

test("Unlicensed without own signature: The Sent by line is a signature of its own", async () => {
  gLicense.license = null;
  personal.signatureHTML = null;
  let mail = newTestEMail(account);
  mail.identity = personal;
  mail.html = "<p>Hi</p>";
  await send(mail);
  expect(topLevel(mail.rawHTMLDangerous)).toEqual(["P", "FOOTER"]);
  expect(mail.text).toMatch(/^Hi\n\n-- \nSent by/);
});

// Pure functions

test("putOwnSignature() returns the input unchanged, if there's nothing to do", () => {
  let html = "<p>Hi</p>";
  expect(putOwnSignature(html, null)).toBe(html);
  expect(putOwnSignature(html, "<p></p>")).toBe(html);
  expect(removeSignatures(html)).toBe(html);
  expect(signatureForSending(html)).toBe(html);
});

test("A `-- ` that the user typed into the signature is not doubled", () => {
  for (let signatureHTML of ["<p>-- </p><p>Fred</p>", "<p>-- <br>Fred</p>", "-- <br>Fred", "\n<p>--</p>\n<p>Fred</p>"]) {
    let html = putOwnSignature("", signatureHTML);
    expect(ownSignatureText(html).trim()).toBe("Fred");
    expect(convertHTMLToText(html).match(/^-- ?$/gm)).toHaveLength(1);
  }
  // Only a separator line, not other text starting with dashes
  expect(ownSignatureText(putOwnSignature("", "<p>-- Fred</p>"))).toBe("-- Fred");
});

test("A signature of plain text without paragraph", () => {
  let html = putOwnSignature("", "Fred<br>Miller");
  expect(ownSignatureText(html)).toBe("FredMiller");
  expect(convertHTMLToText(html)).toMatch(/^-- \nFred\nMiller\s*$/);
});
