import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { JMAPFolder } from "../../../../logic/Mail/JMAP/JMAPFolder";
import { DummyMailStorage } from "../../../../logic/Mail/Store/DummyMailStorage";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import type { TJMAPMethodResponse, TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

appGlobal.remoteApp ??= { kyCreate: () => null } as any;

/** An email as Stalwart returns it from `Email/get` without `properties` */
function stalwartEMail(n: number) {
  return {
    id: "e" + n, blobId: "catyxccs031m7s9mogshetv11im3aa3zmdcvfchfzlxhwik7en0w2byaai" + n, threadId: "t" + n,
    mailboxIds: { a: true }, keywords: {}, size: 260,
    receivedAt: new Date(Date.UTC(2026, 9, 17, 15, 52, 44) - n * 60000).toISOString().replace(".000Z", "Z"),
    messageId: [`m-${n}@example.org`], inReplyTo: null, references: null, sender: null,
    from: [{ name: "Outside", email: "outside@example.org" }],
    to: [{ name: null, email: "mail-carol@example.com" }],
    cc: null, bcc: null, replyTo: null, subject: "Email " + n,
    sentAt: "2026-10-17T15:52:44Z", hasAttachment: false, preview: `Hello ${n}\n`,
    bodyValues: {}, textBody: [], htmlBody: [], attachments: [],
  };
}

/** Serves `Email/query` + `Email/get` like Stalwart, for `serverCount` emails in the Inbox */
function newAccount(serverCount: number) {
  let account = new JMAPAccount();
  account.accountID = "h";
  account.session = { capabilities: {}, accounts: {}, primaryAccounts: {} } as any as TJMAPSession;
  account.storage = new DummyMailStorage();
  let queries: Record<string, any>[] = [];
  account.makeCalls = async (requests: [string, Record<string, any>, string?][]) => {
    let query = requests[0][1];
    queries.push(query);
    let all = Array.from({ length: serverCount }, (_, i) => stalwartEMail(i));
    let page = all.slice(query.position, query.position + query.limit);
    return [
      ["Email/query", {
        accountId: "h", queryState: "saq", canCalculateChanges: true, position: query.position,
        ids: page.map(email => email.id), ...(query.calculateTotal ? { total: serverCount } : {}),
      }, "list"],
      ["Email/get", { accountId: "h", state: "saq", list: page, notFound: [] }, "emails"],
    ] as TJMAPMethodResponse[];
  };
  let inbox = account.newFolder();
  inbox.id = "a";
  inbox.specialFolder = SpecialFolder.Inbox;
  account.rootFolders.add(inbox);
  return { account, inbox: inbox as JMAPFolder, queries };
}

test("A folder that was empty at the folder listing shows the emails that arrived since", async () => {
  let { account, inbox } = newAccount(2);
  inbox.countTotal = 0; // `totalEmails` from `Mailbox/get` at startup

  await inbox.listMessages();

  expect(inbox.messages.contents.map(email => email.subject)).toEqual(["Email 0", "Email 1"]);
  expect(inbox.countTotal).toBe(2);
  expect(account.syncState.get("Email")).toBe("saq");
});

test("An empty folder stores the sync state, so that changes can be fetched later", async () => {
  let { account, inbox } = newAccount(0);

  await inbox.listMessages();

  expect(inbox.messages.isEmpty).toBe(true);
  expect(account.syncState.get("Email")).toBe("saq");
});

test("Listing pages by the total of the query, not by the outdated folder count", async () => {
  let { inbox, queries } = newAccount(450);
  inbox.countTotal = 300;

  await inbox.listMessages();

  expect(queries.map(query => query.position)).toEqual([0, 200, 400]);
  expect(inbox.messages.length).toBe(450);
  expect(inbox.countTotal).toBe(450);
});
