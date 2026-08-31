// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { MailAccount } from "../../../logic/Mail/MailAccount";
import { MailIdentity } from "../../../logic/Mail/MailIdentity";
import { SpecialFolder, type Folder } from "../../../logic/Mail/Folder";
import { DummyMailStorage } from "../../../logic/Mail/Store/DummyMailStorage";
import type { EMail } from "../../../logic/Mail/EMail";
import { PersonUID } from "../../../logic/Abstract/PersonUID";
import { gLicense } from "../../../logic/util/License";
import { beforeAll, expect, test } from "vitest";

/* The test mails have no HTML body: `send()` runs the body through
 * `convertHTMLToText()`, and DOMPurify with `WHOLE_DOCUMENT` throws
 * "Only one element on document allowed" on happy-dom, for any input.
 * For the same reason, we pretend to be licensed, so that `send()` does not
 * add the Parula footer to the body. */
beforeAll(() => gLicense.license = { valid: true });

test("Composer can close while the mail is still being sent", async () => {
  let account = setUpAccount();
  let mail = newTestEMail(account);
  let sentFolder = account.getSpecialFolder(SpecialFolder.Sent);

  let composerClosed = false;
  let sent = mail.compose.send(() => composerClosed = true);
  await account.atServer;

  expect(composerClosed).toBe(true);
  expect(mail.isSending).toBe(true);
  expect(sentFolder.messages.contents).toContain(mail);
  expect(mail.outgoing).toBe(true);
  expect(mail.isDraft).toBe(false);

  account.serverAccepts();
  await sent;

  expect(mail.isSending).toBe(false);
  // The real sent mail comes back from the server with the next sync
  expect(sentFolder.messages.contents).not.toContain(mail);
});

test("Mail that the server refused disappears from the Sent folder again", async () => {
  let account = setUpAccount();
  let mail = newTestEMail(account);
  let sentFolder = account.getSpecialFolder(SpecialFolder.Sent);

  let sent = mail.compose.send();
  await account.atServer;
  account.serverRefuses(new Error("Mailbox full"));

  await expect(sent).rejects.toThrow("Mailbox full");
  expect(mail.isSending).toBe(false);
  expect(sentFolder.messages.contents).not.toContain(mail);
});

test("Errors that the user must fix are thrown before the composer closes", async () => {
  let account = setUpAccount();
  let mail = newTestEMail(account);
  mail.identity.emailAddress = "*@example.com"; // catch-all
  mail.from.emailAddress = "*@example.com";

  let composerClosed = false;
  await expect(mail.compose.send(() => composerClosed = true))
    .rejects.toThrow(/catch-all/);
  expect(composerClosed).toBe(false);
  expect(mail.isSending).toBe(false);
  expect(account.getSpecialFolder(SpecialFolder.Sent).messages.contents).not.toContain(mail);
});

/** Stands in for the protocol implementations, and lets the test decide
 * when the server takes the mail. */
class TestMailAccount extends MailAccount {
  /** Resolves once `send()` reached the server */
  readonly atServer: Promise<void>;
  protected reachedServer: () => void;
  protected serverResponds: (ex?: Error) => void;

  constructor() {
    super();
    this.atServer = new Promise(resolve => this.reachedServer = resolve);
  }

  async send(email: EMail): Promise<void> {
    this.reachedServer();
    await new Promise<void>((resolve, reject) =>
      this.serverResponds = ex => ex ? reject(ex) : resolve());
  }

  serverAccepts() {
    this.serverResponds();
  }
  serverRefuses(ex: Error) {
    this.serverResponds(ex);
  }
}

function setUpAccount(): TestMailAccount {
  let account = new TestMailAccount();
  account.name = "Test";
  account.emailAddress = "me@example.com";
  account.realname = "Me";
  account.storage = new DummyMailStorage();
  let identity = new MailIdentity(account);
  identity.emailAddress = account.emailAddress;
  identity.realname = account.realname;
  account.identities.add(identity);
  addFolder(account, SpecialFolder.Inbox, "Inbox");
  addFolder(account, SpecialFolder.Sent, "Sent");
  addFolder(account, SpecialFolder.Drafts, "Drafts");
  return account;
}

function addFolder(account: MailAccount, specialFolder: SpecialFolder, name: string): Folder {
  let folder = account.newFolder();
  folder.name = name;
  folder.specialFolder = specialFolder;
  account.rootFolders.add(folder);
  return folder;
}

function newTestEMail(account: MailAccount): EMail {
  let mail = account.newEMailFrom();
  mail.identity = account.identities.first;
  mail.to.add(new PersonUID("you@example.com", "You"));
  mail.subject = "Hi";
  return mail;
}
