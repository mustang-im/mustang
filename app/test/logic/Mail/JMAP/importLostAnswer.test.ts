import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { JMAPFolder } from "../../../../logic/Mail/JMAP/JMAPFolder";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import type { EMail } from "../../../../logic/Mail/EMail";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

const kMIME = new TextEncoder().encode("From: mail-alice@example.com\r\nSubject: Hi\r\n\r\nHi\r\n");
appGlobal.remoteApp = {
  kyCreate: () => { throw new Error("The test should not talk to a real server") },
  getMIMENodemailer: async () => kMIME,
} as any;

/** Answers like Stalwart. The connection can break after the server stored the email, before the answer arrives. */
class FakeServer {
  emails = new Map<string, { mailboxIds: Record<string, boolean>, keywords: Record<string, boolean>, messageId: string[] }>();
  breakAfterImport = false;
  methods: string[] = [];
  counter = 0;
  /** The Message-ID in the MIME that we upload */
  messageID: string;

  answer(request: { methodCalls: [string, Record<string, any>, string][] }) {
    let [method, args, callID] = request.methodCalls[0];
    this.methods.push(method);
    if (method == "Email/import") {
      let email = args.emails.addMessage;
      let id = "m" + (++this.counter);
      this.emails.set(id, { mailboxIds: email.mailboxIds, keywords: email.keywords, messageId: [this.messageID] });
      if (this.breakAfterImport) {
        this.breakAfterImport = false;
        throw new TypeError("fetch failed");
      }
      return { methodResponses: [[method, { accountId: "e", oldState: "a", newState: "b", created: { addMessage: { id, blobId: "blob" + id, threadId: "t", size: kMIME.length } } }, callID]] };
    }
    if (method == "Email/query") {
      let ids = [...this.emails.entries()].filter(([, email]) => email.mailboxIds[args.filter.inMailbox]).map(([id]) => id);
      let list = ids.map(id => ({ id, messageId: this.emails.get(id).messageId, keywords: this.emails.get(id).keywords }));
      return { methodResponses: [
        [method, { accountId: "e", queryState: "b", canCalculateChanges: true, position: 0, ids }, "list"],
        ["Email/get", { accountId: "e", state: "b", list, notFound: [] }, "emails"],
      ] };
    }
    if (method == "Email/set") {
      for (let id of args.destroy) {
        this.emails.delete(id);
      }
      return { methodResponses: [[method, { accountId: "e", oldState: "b", newState: "c", destroyed: args.destroy }, callID]] };
    }
    throw new Error("Unexpected " + method);
  }
}

function setup(isDraft: boolean) {
  let server = new FakeServer();
  let account = new JMAPAccount();
  account.accountID = "e";
  account.session = { apiUrl: "http://jmap.example.com/jmap/", capabilities: {}, accounts: {}, primaryAccounts: {} } as any as TJMAPSession;
  account.httpPost = async (url: string, request: any) => server.answer(request);
  account.uploadBlob = async () => ({ accountId: "e", blobId: "blob", type: "message/rfc822", size: kMIME.length });
  let drafts = account.newFolder() as JMAPFolder;
  drafts.id = "d";
  drafts.specialFolder = SpecialFolder.Drafts;
  (drafts as any).listChangedMessages = async () => new ArrayColl();
  account.rootFolders.add(drafts);
  let email = account.newEMailFrom();
  email.to.add(new PersonUID("mail-bob@example.com", "Bob"));
  email.text = "Hi";
  email.isDraft = isDraft;
  server.messageID = email.messageID;
  return { server, drafts, email };
}

test("Uploading again, after the answer to the upload got lost, leaves no extra copy", async () => {
  let { server, drafts, email } = setup(false);
  server.breakAfterImport = true;
  await expect(drafts.addMessage(email)).rejects.toThrow("fetch failed");
  expect(server.emails.size).toBe(1); // The server stored it

  email.mime = undefined;
  await drafts.addMessage(email); // e.g. the user presses Send again

  expect([...server.emails.keys()]).toEqual([email.pID]);
});

test("The draft that the app already knows is left to `ComposeActions`", async () => {
  let { server, drafts, email } = setup(true);
  await drafts.addMessage(email); // saved before
  let known = drafts.newEMail();
  known.pID = email.pID;
  drafts.messages.add(known);
  server.breakAfterImport = true;
  await expect(drafts.addMessage(email)).rejects.toThrow("fetch failed");
  expect(server.emails.size).toBe(2);

  await drafts.addMessage(email); // saved again

  expect(server.emails.size).toBe(2);
  expect([...server.emails.keys()]).toContain(known.pID);
  expect([...server.emails.keys()]).toContain(email.pID);
});

test("An upload without trouble asks the server nothing extra", async () => {
  let { server, drafts, email } = setup(false);

  await drafts.addMessage(email);
  email.mime = undefined;
  await drafts.addMessage(email);

  expect(server.methods).toEqual(["Email/import", "Email/import"]);
});
