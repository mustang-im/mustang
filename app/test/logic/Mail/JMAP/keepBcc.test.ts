import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { JMAPFolder } from "../../../../logic/Mail/JMAP/JMAPFolder";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import { CreateMIME } from "../../../../logic/Mail/SMTP/CreateMIME";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import type { TJMAPMethodResponse, TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

/** Records whether the backend was asked to keep the Bcc header */
let keepBccCalls: boolean[] = [];
const kMIME = new TextEncoder().encode("From: mail-alice@example.com\r\nBcc: secret@example.com\r\n\r\nHi\r\n");
appGlobal.remoteApp = {
  kyCreate: () => { throw new Error("The test should not talk to a real server") },
  getMIMENodemailer: async (mail: any, keepBcc: boolean) => {
    keepBccCalls.push(keepBcc);
    return kMIME;
  },
} as any;

function newDraft() {
  let account = new JMAPAccount();
  account.accountID = "e";
  account.emailAddress = "mail-alice@example.com";
  account.session = { capabilities: {}, accounts: {}, primaryAccounts: {} } as any as TJMAPSession;
  account.uploadBlob = async () => ({ accountId: "e", blobId: "blob1", type: "message/rfc822", size: kMIME.length });
  // Recorded from Stalwart
  account.makeCalls = async (requests: [string, Record<string, any>, string?][]) => [
    ["Email/import", { accountId: "e", oldState: "spi", newState: "spm", created: { addMessage: { id: "eaaaaab", blobId: "blob1", threadId: "b", size: kMIME.length } } }, requests[0][2]],
  ] as TJMAPMethodResponse[];
  let drafts = account.newFolder() as JMAPFolder;
  drafts.id = "d";
  drafts.specialFolder = SpecialFolder.Drafts;
  (drafts as any).listChangedMessages = async () => new ArrayColl();
  account.rootFolders.add(drafts);
  let email = account.newEMailFrom();
  email.to.add(new PersonUID("mail-bob@example.com", "Bob"));
  email.bcc.add(new PersonUID("secret@example.com", "Secret"));
  email.text = "Hi";
  return { drafts, email };
}

test("A saved draft keeps its Bcc recipients", async () => {
  keepBccCalls = [];
  let { drafts, email } = newDraft();

  await drafts.addMessage(email);

  expect(keepBccCalls).toEqual([true]);
});

test("The MIME that is sent or encrypted has no Bcc header", async () => {
  keepBccCalls = [];
  let { email } = newDraft();

  await CreateMIME.getMIME(email);

  expect(keepBccCalls).toEqual([false]);
});
