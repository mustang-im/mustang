// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { newTestEMail, setUpAccount, type TestMailAccount } from "./TestMailAccount";
import { MailIdentity } from "../../../logic/Mail/MailIdentity";
import { MailBody } from "../../../logic/Mail/MailBody";
import { ComposeSignature } from "../../../logic/Mail/ComposeActions";
import { SpecialFolder } from "../../../logic/Mail/Folder";
import { PersonUID } from "../../../logic/Abstract/PersonUID";
import type { EMail } from "../../../logic/Mail/EMail";
import { convertHTMLToText, sanitizeHTML } from "../../../logic/util/convertHTML";
import { CreateMIME } from "../../../logic/Mail/SMTP/CreateMIME";
import { gLicense } from "../../../logic/util/License";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

/* DOMPurify fails in happy-dom with `WHOLE_DOCUMENT`, and then `Message.html`
 * silently returns "". So `sanitizeHTML()` passes the HTML through, unless a test
 * replaces it, to check that the sanitized HTML is used. */
vi.mock("dompurify", () => ({ default: { sanitize: (html: string) => html, addHook: () => {} } }));
vi.mock("../../../logic/util/convertHTML", async importOriginal => {
  let original = await importOriginal<typeof import("../../../logic/util/convertHTML")>();
  return { ...original, sanitizeHTML: vi.fn((html: string) => html) };
});

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
  vi.mocked(sanitizeHTML).mockImplementation((html: string) => html);
});

function doc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/** The tag names on the top level of the body, e.g. "P", "FOOTER", "BLOCKQUOTE" */
function topLevel(html: string): string[] {
  return Array.from(doc(html).body.children).map(e => e.tagName);
}

function ownSignatureText(html: string): string | null {
  return doc(html).body.querySelector(":scope > footer.signature[data-own-signature]")?.textContent ?? null;
}

function putOwnSignature(html: string, signatureHTML: string | null): string {
  let body = new MailBody(html);
  body.putOwnSignature(signatureHTML);
  return body.html;
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
  let html = mail.compose.addSignature(personal, "<p></p>");
  expect(topLevel(html)).toEqual(["P", "FOOTER"]);
  expect(ownSignatureText(html)).toBe("Fred MillerExample Inc.");
  expect(mail.composeSignature).toBe(ComposeSignature.Added);
  // Only once
  expect(mail.compose.addSignature(personal, html)).toBeNull();
});

test("Reply with quote below: The signature goes between the reply and the quote", () => {
  let reply = receivedMail("<p>Lunch at 12?</p>").compose.replyToAuthor();
  let html = reply.compose.addSignature(personal, reply.html);
  expect(topLevel(html)).toEqual(["P", "P", "FOOTER", "P", "BLOCKQUOTE"]);
  expect(doc(html).querySelector("footer + p.quote-header")).not.toBeNull();
});

test("Reply with quote above: The signature goes at the end", () => {
  localStorage.setItem("mail.send.quote", JSON.stringify("above"));
  let reply = receivedMail("<p>Lunch at 12?</p>").compose.replyToAuthor();
  let tags = topLevel(reply.compose.addSignature(personal, reply.html));
  expect(tags.at(-1)).toBe("FOOTER");
  expect(tags.indexOf("BLOCKQUOTE")).toBeLessThan(tags.indexOf("FOOTER"));
});

test("Forward: Our signature goes above the forwarded mail, which keeps its own signature", async () => {
  let original = receivedMail(`<p>Menu attached</p><footer class="signature"><p>Anna</p></footer>`);
  let forward = await original.compose.forwardInline();
  let html = forward.compose.addSignature(personal, forward.html);
  let footers = Array.from(doc(html).body.querySelectorAll("footer"));
  expect(footers.map(f => f.textContent)).toEqual(["Fred MillerExample Inc.", "Anna"]);
  expect(footers[0].nextElementSibling.tagName).toBe("HR");
});

test("The editor drops the class of the quote header, but the signature still goes above it", () => {
  let mail = account.newEMailFrom();
  let html = mail.compose.addSignature(personal, "<p>Hi Anna</p><p></p><p>Anna wrote:</p><blockquote><p>Lunch?</p></blockquote>");
  expect(topLevel(html)).toEqual(["P", "P", "FOOTER", "P", "BLOCKQUOTE"]);
});

test("Changing From swaps only our signature, in the same place", async () => {
  let original = receivedMail(`<p>Menu attached</p><footer class="signature"><p>Anna</p></footer>`);
  let forward = await original.compose.forwardInline();
  let html = forward.compose.addSignature(personal, forward.html);
  let swapped = forward.compose.changeSignature(work, html);
  expect(ownSignatureText(swapped)).toBe("Fred Miller, CTO");
  expect(Array.from(doc(swapped).body.querySelectorAll("footer")).map(f => f.textContent))
    .toEqual(["Fred Miller, CTO", "Anna"]);

  // An identity without signature removes ours, but not Anna's
  let none = new MailIdentity(account);
  let removed = forward.compose.changeSignature(none, swapped);
  expect(new MailBody(removed).ownSignature).toBeNull();
  expect(doc(removed).body.querySelector("footer").textContent).toBe("Anna");

  // ... and back to an identity with signature puts it above the forwarded mail again
  let back = forward.compose.changeSignature(personal, removed);
  expect(doc(back).querySelector("footer + hr")).not.toBeNull();
});

test("Changing From from an identity without signature adds the new signature", () => {
  personal.signatureHTML = null;
  let mail = account.newEMailFrom();
  expect(mail.compose.addSignature(personal, "<p></p>")).toBeNull();
  expect(ownSignatureText(mail.compose.changeSignature(work, "<p></p>"))).toBe("Fred Miller, CTO");
});

test("Changing From keeps text that the user typed", () => {
  let mail = account.newEMailFrom();
  let html = mail.compose.addSignature(personal, "<p></p>");
  html = html.replace("<p></p>", "<p>See you!</p>");
  html = mail.compose.changeSignature(work, html);
  expect(doc(html).body.textContent).toBe("See you!Fred Miller, CTO");
});

test("Changing From before the composer added the signature waits for it", () => {
  let mail = account.newEMailFrom();
  expect(mail.compose.changeSignature(work, "<p></p>")).toBeNull();
  expect(ownSignatureText(mail.compose.addSignature(work, "<p></p>"))).toBe("Fred Miller, CTO");
});

test("Redirect and Edit as New don't get a signature", async () => {
  let original = receivedMail("<p>Lunch at 12?</p>");
  let redirect = await original.compose.redirect();
  expect(redirect.compose.addSignature(personal, redirect.html)).toBeNull();
  expect(redirect.compose.changeSignature(work, redirect.html)).toBeNull();
  let clone = await original.compose.editAsNew();
  expect(clone.compose.addSignature(personal, clone.html)).toBeNull();
});

test("A sent mail that we edit as new keeps its signature on From change", async () => {
  let sent = receivedMail(`<p>Hi</p><footer class="signature"><p>Fred Miller</p></footer>`);
  let clone = await sent.compose.editAsNew();
  expect(clone.compose.changeSignature(work, clone.html)).toBeNull();
});

test("A reopened draft swaps its signature only if it has ours", () => {
  let draft = account.getSpecialFolder(SpecialFolder.Drafts).newEMail();
  draft.isDraft = true;
  draft.html = `<p>Hi</p><footer class="signature" data-own-signature=""><p>Fred Miller</p></footer>`;
  expect(draft.compose.addSignature(personal, draft.html)).toBeNull();
  expect(ownSignatureText(draft.compose.changeSignature(work, draft.html))).toBe("Fred Miller, CTO");

  let draftWithout = account.getSpecialFolder(SpecialFolder.Drafts).newEMail();
  draftWithout.html = `<p>Hi</p>`;
  expect(draftWithout.compose.changeSignature(work, draftWithout.html)).toBeNull();
});

test("Picking a signature explicitly also works on a redirect", async () => {
  let redirect = await receivedMail("<p>Lunch at 12?</p>").compose.redirect();
  expect(ownSignatureText(redirect.compose.putSignature(work, redirect.html))).toBe("Fred Miller, CTO");
});

// Replying

test("Reply removes the signatures from the quote", () => {
  let original = receivedMail(`<p>Lunch at 12?</p>
    <footer class="signature"><p>Anna</p></footer>
    <blockquote><p>Older</p><div class="moz-signature">-- <br>Bert</div></blockquote>
    <div class="gmail_signature">Carla</div>`);
  let reply = original.compose.replyToAuthor();
  let quote = doc(reply.rawHTMLDangerous).querySelector("blockquote");
  expect(quote.textContent).toContain("Lunch at 12?");
  expect(quote.textContent).toContain("Older");
  expect(quote.textContent).not.toContain("Anna");
  expect(quote.textContent).not.toContain("Bert");
  expect(quote.textContent).not.toContain("Carla");
});

test("Reply keeps the signatures, if the user turned that off", () => {
  localStorage.setItem("mail.send.quote.stripSignatures", JSON.stringify(false));
  let original = receivedMail(`<p>Lunch at 12?</p><footer class="signature"><p>Anna</p></footer>`);
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
  let footer = doc(mail.html).querySelector("footer.signature");
  expect(footer.textContent).toContain("Anna");
  expect(footer.textContent).toContain("Example Inc.");
  expect(doc(mail.html).body.textContent).toContain("Lunch at 12?");
});

test("Plaintext signature: Only `-- ` with space, and only if no quote follows it", () => {
  let signature = (text: string) => doc(receivedMail(null, text).html).querySelector("footer.signature")?.textContent.trim() ?? null;
  expect(signature("a\n--\nb")).toBeNull();
  expect(signature("a\n-- \nb\n\n> quote")).toBeNull();
  expect(signature("> quote\n\na\n-- \nb")).toBe("b");
  expect(signature("a\r\n-- \r\nb")).toBe("b");
});

// Sending

test("Sent mail: Markers in HTML and plaintext, without the composer marker", async () => {
  let mail = newTestEMail(account);
  mail.identity = personal;
  mail.html = mail.compose.addSignature(personal, "<p></p>").replace("<p></p>", "<p>See you at 12</p>");
  await send(mail);

  expect(mail.rawHTMLDangerous).not.toContain("data-own-signature");
  expect(doc(mail.rawHTMLDangerous).querySelector("footer.signature").textContent)
    .toBe("Fred MillerExample Inc.");
  expect(mail.text).toMatch(/^See you at 12\n\n-- \nFred Miller\nExample Inc\.\s*$/);
  let nmMail = await CreateMIME.getNMMail(mail);
  expect(nmMail.text).toContain("\r\n-- \r\n"); // The `-- ` keeps its space on the wire
});

test("Send sanitizes the body, so the signature has no remote images", async () => {
  vi.mocked(sanitizeHTML).mockImplementation((html: string) => html.replace(/ src="https:[^"]*"/g, ' src=""'));
  personal.signatureHTML = `<p>Fred Miller</p><img src="https://example.com/logo.png"><img src="data:image/png;base64,AAAA">`;
  let mail = newTestEMail(account);
  mail.identity = personal;
  mail.html = mail.compose.addSignature(personal, "<p>Hi</p>");
  expect(mail.rawHTMLDangerous).toContain("https://example.com/logo.png");
  await send(mail);
  expect(mail.rawHTMLDangerous).not.toContain("https://example.com/logo.png");
  expect(doc(mail.rawHTMLDangerous).querySelectorAll("footer.signature img").length).toBe(2);
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
  mail.compose.addSignature(personal, "<p></p>");
  mail.html = "<p>No signature, please</p>";
  await send(mail);
  expect(mail.text).toBe("No signature, please");
});

test("Unlicensed: The Sent by line goes into our signature", async () => {
  gLicense.license = null;
  let mail = newTestEMail(account);
  mail.identity = personal;
  mail.html = mail.compose.addSignature(personal, "<p></p>");
  await send(mail);
  let footers = doc(mail.rawHTMLDangerous).querySelectorAll("footer");
  expect(footers.length).toBe(1);
  expect(footers[0].textContent).toBe("Fred MillerExample Inc.Sent by © Parula");
  expect(mail.text.match(/^-- $/gm)).toHaveLength(1);
  expect(mail.text).toMatch(/^-- \nFred Miller\nExample Inc\.\nSent by © Parula/);
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

// MailBody

test("putOwnSignature() changes nothing, if there's nothing to do", () => {
  let body = new MailBody("<p>Hi</p>");
  expect(body.putOwnSignature(null)).toBe(false);
  expect(body.putOwnSignature("<p></p>")).toBe(false);
  expect(body.html).toBe("<p>Hi</p>");
});

test("A signature of plain text without paragraph", () => {
  let html = putOwnSignature("", "Fred<br>Miller");
  expect(ownSignatureText(html)).toBe("FredMiller");
  expect(convertHTMLToText(html)).toMatch(/^-- \nFred\nMiller\s*$/);
});

test("Signatures of older versions of this app are recognized", () => {
  let html = `<p>Hi</p><footer class="signature"><p>Fred</p></footer>`;
  expect(convertHTMLToText(html)).toMatch(/^Hi\n\n-- \nFred\s*$/);
  let body = new MailBody(html);
  body.removeSignatures();
  expect(body.html).toBe("<p>Hi</p>");
});
