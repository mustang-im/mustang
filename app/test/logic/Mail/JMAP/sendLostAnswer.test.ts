import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import type { EMail } from "../../../../logic/Mail/EMail";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

appGlobal.remoteApp ??= { kyCreate: () => { throw new Error("The test should not talk to a real server") } } as any;

/** Answers like Stalwart. The connection can break after a request reached the server, before the answer arrives. */
class FakeServer {
  emails = new Map<string, { mailboxIds: Record<string, boolean>, keywords: Record<string, boolean>, messageId: string[] }>();
  submissions: { id: string, emailId: string }[] = [];
  /** The request breaks off, after (or before) the server processed it */
  breakAfter: "EmailSubmission/set" | null = null;
  breakBefore: "EmailSubmission/set" | null = null;
  counter = 0;

  /** What `JMAPFolder.addMessageFromMIME()` does with `Email/import` */
  import(email: EMail, folderID: string) {
    let id = "m" + (++this.counter);
    this.emails.set(id, { mailboxIds: { [folderID]: true }, keywords: { "$seen": true }, messageId: [email.messageID] });
    email.pID = id;
  }

  answer(request: { methodCalls: [string, Record<string, any>, string][] }) {
    let [method, args, callID] = request.methodCalls[0];
    if (this.breakBefore == method) {
      this.breakBefore = null;
      throw new TypeError("fetch failed");
    }
    let responses: any[];
    if (method == "EmailSubmission/set") {
      let create = args.create.sendMessage;
      let id = "s" + (++this.counter);
      this.submissions.push({ id, emailId: create.emailId });
      this.emails.get(create.emailId).mailboxIds = args.onSuccessUpdateEmail["#sendMessage"].mailboxIds;
      responses = [
        [method, { accountId: "e", newState: "s2aaq", created: { sendMessage: { id, sendAt: "2026-10-18T20:09:39Z", undoStatus: "pending" } } }, callID],
        ["Email/set", { accountId: "e", oldState: "s92aq", newState: "s2eaq", updated: { [create.emailId]: null } }, callID],
      ];
    } else if (method == "EmailSubmission/query") {
      let ids = this.submissions.filter(submission => args.filter.emailIds.includes(submission.emailId)).map(submission => submission.id);
      responses = [[method, { accountId: "e", queryState: "sueba", canCalculateChanges: true, position: 0, ids }, callID]];
    } else if (method == "Email/set") {
      for (let id of args.destroy) {
        this.emails.delete(id);
      }
      responses = [[method, { accountId: "e", oldState: "s0maq", newState: "s0qaq", destroyed: args.destroy }, callID]];
    } else {
      throw new Error("Unexpected " + method);
    }
    if (this.breakAfter == method) {
      this.breakAfter = null;
      throw new TypeError("fetch failed");
    }
    return { methodResponses: responses, sessionState: "s1" };
  }

  inFolder(folderID: string): number {
    return [...this.emails.values()].filter(email => email.mailboxIds[folderID]).length;
  }
}

function setup() {
  let server = new FakeServer();
  let account = new JMAPAccount();
  account.accountID = "e";
  account.emailAddress = "mail-alice@example.com";
  account.session = { apiUrl: "http://jmap.example.com/jmap/", capabilities: {}, accounts: {}, primaryAccounts: {} } as any as TJMAPSession;
  account.errorCallback = ex => { throw ex };
  account.httpPost = async (url: string, request: any) => server.answer(request);
  for (let [id, specialFolder] of [["a", SpecialFolder.Inbox], ["d", SpecialFolder.Drafts], ["e", SpecialFolder.Sent]] as [string, SpecialFolder][]) {
    let folder = account.newFolder();
    folder.id = id;
    folder.specialFolder = specialFolder;
    folder.addMessage = async (email: EMail) => server.import(email, folder.id);
    account.rootFolders.add(folder);
  }
  let identity = account.newIdentity();
  identity.emailAddress = account.emailAddress;
  identity.pID = "b";
  account.identities.add(identity);
  let email = account.newEMailFrom();
  email.identity = identity;
  email.to.add(new PersonUID("mail-bob@example.com", "Bob"));
  email.folder = account.getSpecialFolder(SpecialFolder.Sent);
  return { server, account, email };
}

test("Sending again, after the answer to the send got lost, doesn't send the email twice", async () => {
  let { server, account, email } = setup();
  server.breakAfter = "EmailSubmission/set";
  await expect(account.send(email)).rejects.toThrow("fetch failed");
  expect(server.submissions.length).toBe(1); // The server did send it

  await account.send(email); // The user presses Send again

  expect(server.submissions.length).toBe(1);
  expect(server.inFolder("e")).toBe(1);
  expect(server.emails.size).toBe(1);
});

test("Sending again, when the send didn't reach the server, sends the email once", async () => {
  let { server, account, email } = setup();
  server.breakBefore = "EmailSubmission/set";
  await expect(account.send(email)).rejects.toThrow("fetch failed");
  expect(server.submissions.length).toBe(0);

  await account.send(email);

  expect(server.submissions.length).toBe(1);
  expect(server.inFolder("e")).toBe(1);
  expect(server.emails.size).toBe(1); // The copy of the first try is gone
});

test("A send without trouble asks the server nothing extra", async () => {
  let { server, account, email } = setup();
  let methods: string[] = [];
  let answer = server.answer.bind(server);
  server.answer = (request: any) => {
    methods.push(request.methodCalls[0][0]);
    return answer(request);
  };

  await account.send(email);

  expect(methods).toEqual(["EmailSubmission/set"]);
});
