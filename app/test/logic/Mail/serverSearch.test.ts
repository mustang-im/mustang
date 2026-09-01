// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { MailAccount } from "../../../logic/Mail/MailAccount";
import { SpecialFolder, type Folder } from "../../../logic/Mail/Folder";
import type { EMail } from "../../../logic/Mail/EMail";
import { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
import { CombinedSearchEMail } from "../../../logic/Mail/Store/CombinedSearchEMail";
import { QuickSearchEMail } from "../../../logic/Mail/Store/QuickSearchEMail";
import { IMAPSearchEMail } from "../../../logic/Mail/IMAP/IMAPSearchEMail";
import { JMAPSearchEMail } from "../../../logic/Mail/JMAP/JMAPSearchEMail";
import { ExchangeSearchEMail } from "../../../logic/Mail/EWS/ExchangeSearchEMail";
import { EWSAccount } from "../../../logic/Mail/EWS/EWSAccount";
import { SQLEMail } from "../../../logic/Mail/SQL/SQLEMail";
import { getDatabase } from "../../../logic/Mail/SQL/SQLDatabase";
import { DummyMailStorage } from "../../../logic/Mail/Store/DummyMailStorage";
import { Person, ContactEntry } from "../../../logic/Abstract/Person";
import { getTagByName } from "../../../logic/Abstract/Tag";
import { findOrCreatePersonUID } from "../../../logic/Abstract/PersonUID";
import { InProcessSQLiteDatabase } from "../util/inProcessSQLite";
import { ArrayColl } from "svelte-collections";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sql from "../../../../lib/rs-sqlite";
import { beforeEach, expect, test } from "vitest";

/** Stands in for e.g. `IMAPSearchEMail`, and returns what the server "found" */
class TestServerSearch extends SearchEMail {
  declare account: TestMailAccount;

  async startSearch(limit?: number): Promise<ArrayColl<EMail>> {
    if (this.account.serverError) {
      throw this.account.serverError;
    }
    return this.account.serverResults;
  }
}

class TestMailAccount extends MailAccount {
  readonly serverResults = new ArrayColl<EMail>();
  serverError: Error | null = null;

  newSearch(): TestServerSearch {
    return new TestServerSearch();
  }
}

test("The combined search merges the local database and the server results", async () => {
  let account = await setupAccount();
  let inbox = account.inbox;
  await SQLEMail.save(newTestEMail(inbox, "old", "Budget report", "2026-01-01"));
  await SQLEMail.save(newTestEMail(inbox, "both", "Budget meeting", "2026-02-01"));
  // The server finds the same email again, plus one that we never downloaded
  account.serverResults.add(newTestEMail(inbox, "both", "Budget meeting", "2026-02-01"));
  account.serverResults.add(newTestEMail(inbox, "new", "Budget draft", "2026-03-01"));

  let search = new CombinedSearchEMail();
  search.bodyText = "budget";
  let results = await search.startSearch();
  await search.finished;

  expect(results.contents.map(email => email.subject)).toEqual([
    "Budget draft", "Budget meeting", "Budget report"]);
});

test("The server results are filtered again, because the server ignores what it cannot express", async () => {
  let account = await setupAccount();
  let inbox = account.inbox;
  await SQLEMail.save(newTestEMail(inbox, "old", "Budget report", "2026-01-01"));
  account.serverResults.add(newTestEMail(inbox, "new", "Budget draft", "2026-03-01"));
  let alreadyRead = newTestEMail(inbox, "read", "Budget meeting", "2026-04-01");
  alreadyRead.isRead = true;
  account.serverResults.add(alreadyRead);

  let search = new CombinedSearchEMail();
  search.bodyText = "budget";
  search.isRead = false;
  let results = await search.startSearch();
  await search.finished;

  expect(results.contents.map(email => email.subject)).toEqual([
    "Budget draft", "Budget report"]);
});

test("A server result matches, even if we do not have the body that the server searched", async () => {
  let account = await setupAccount();
  // The subject does not contain the search term
  account.serverResults.add(newTestEMail(account.inbox, "new", "Lunch", "2026-03-01"));

  let search = new CombinedSearchEMail();
  search.bodyText = "budget";
  let results = await search.startSearch();
  await search.finished;

  expect(results.contents.map(email => email.subject)).toEqual(["Lunch"]);
});

test("The quick search ignores the case of the search term", async () => {
  let account = await setupAccount();
  account.inbox.messages.add(newTestEMail(account.inbox, "one", "Budget report", "2026-01-01"));
  account.inbox.messages.add(newTestEMail(account.inbox, "two", "Lunch", "2026-02-01"));

  let search = new QuickSearchEMail();
  search.folder = account.inbox;
  search.bodyText = "Budget";

  let results = await search.startSearch();

  expect(results.contents.map(email => email.subject)).toEqual(["Budget report"]);
});

test("The limit applies to the combined results", async () => {
  let account = await setupAccount();
  let inbox = account.inbox;
  await SQLEMail.save(newTestEMail(inbox, "old", "Budget report", "2026-01-01"));
  account.serverResults.add(newTestEMail(inbox, "new", "Budget draft", "2026-03-01"));

  let search = new CombinedSearchEMail();
  search.bodyText = "budget";
  let results = await search.startSearch(1);
  await search.finished;

  expect(results.contents.map(email => email.subject)).toEqual(["Budget draft"]);
});

test("A server search that fails still returns the database results", async () => {
  let account = await setupAccount();
  await SQLEMail.save(newTestEMail(account.inbox, "old", "Budget report", "2026-01-01"));
  account.serverError = new Error("Server is down");

  let search = new CombinedSearchEMail();
  search.bodyText = "budget";
  let results = await search.startSearch();
  await search.finished;

  expect(results.contents.map(email => email.subject)).toEqual(["Budget report"]);
});

test("A search leaves its own criteria alone", async () => {
  // Otherwise the search pane sees a change, searches again, and never stops
  let account = await setupAccount();
  await SQLEMail.save(newTestEMail(account.inbox, "old", "Budget report", "2026-01-01"));
  let search = new CombinedSearchEMail();
  search.bodyText = "budget";
  search.hasAttachmentMIMETypes.add("application/pdf"); // implies `hasAttachment`
  let criteria = JSON.stringify(search.toJSON());

  await search.startSearch();
  await search.finished;

  expect(JSON.stringify(search.toJSON())).toBe(criteria);
});

test("IMAP: The `or` groups nest, because each search key is allowed only once", () => {
  let search = new IMAPSearchEMail();
  search.bodyText = "budget";
  search.isRead = false;
  search.includesPerson = testPerson("alice@example.com");

  expect((search as any).imapQuery()).toEqual({
    seen: false,
    or: [{ subject: "budget" }, { body: "budget" }],
    not: {
      not: {
        or: [
          { from: "alice@example.com" },
          { to: "alice@example.com" },
          { cc: "alice@example.com" },
          { bcc: "alice@example.com" },
        ],
      },
    },
  });
});

test("JMAP: The criteria become filter conditions", () => {
  let search = new JMAPSearchEMail();
  search.bodyText = "budget";
  search.isRead = false;
  search.hasAttachment = true;
  search.tags.add(getTagByName("Work"));

  expect((search as any).filterConditions()).toEqual([
    { operator: "OR", conditions: [{ subject: "budget" }, { body: "budget" }] },
    { notKeyword: "$seen" },
    { hasKeyword: "Work" },
    { hasAttachment: true },
  ]);
});

test("EWS: All folders are searched in a single request", async () => {
  let account = newTestEWSAccount();

  await startEWSSearch(account);

  expect(account.requests.length).toBe(1);
  expect(searchedFolderIDs(account)).toEqual(["Inbox", "Sent"]);
});

test("EWS: The criteria become a restriction", async () => {
  let account = newTestEWSAccount();
  let search = account.newSearch();
  search.account = account;
  search.bodyText = "budget";
  search.isRead = false;

  await search.startSearch(10);

  expect(account.requests[0].m$FindItem.m$Restriction).toEqual({
    t$And: {
      t$Or: {
        t$Contains: [{
          ContainmentMode: "Substring",
          ContainmentComparison: "IgnoreCase",
          t$FieldURI: { FieldURI: "item:Subject" },
          t$Constant: { Value: "budget" },
        }, {
          ContainmentMode: "Substring",
          ContainmentComparison: "IgnoreCase",
          t$FieldURI: { FieldURI: "item:Body" },
          t$Constant: { Value: "budget" },
        }],
      },
      t$IsEqualTo: {
        t$FieldURI: { FieldURI: "message:IsRead" },
        t$FieldURIOrConstant: { t$Constant: { Value: false } },
      },
    },
  });
});

test("Exchange: Criteria that a restriction cannot express are flagged", () => {
  let search = new ExchangeSearchEMail();
  search.bodyText = "budget";
  search.isReplied = true; // Exchange has no property for it

  let conditions = (search as any).conditions();

  expect(search.unsupportedFilters).toBe(true);
  expect(conditions.length).toBe(1);
});

let inbox: Folder;

beforeEach(async () => {
  // `getDatabase()` keeps the first database, so clean it instead
  if (inbox) {
    await (await getDatabase()).run(sql`DELETE FROM email`);
  }
});

async function setupAccount(): Promise<TestMailAccount> {
  let account = new TestMailAccount();
  account.name = "Test";
  account.emailAddress = "user@example.com";
  account.storage = new DummyMailStorage();
  appGlobal.emailAccounts.replaceAll([account]);

  if (!inbox) {
    let tempDir = mkdtempSync(path.join(tmpdir(), "server-search-test-"));
    appGlobal.remoteApp = {
      getSQLiteDatabase: (filename: string) =>
        new InProcessSQLiteDatabase(path.join(tempDir, filename)),
    };
    let db = await getDatabase();
    let accountRow = await db.run(sql`
      INSERT INTO emailAccount (idStr, protocol) VALUES (${account.id}, ${"imap"})`);
    let folderRow = await db.run(sql`
      INSERT INTO folder (accountID, name, path)
      VALUES (${accountRow.lastInsertRowid}, ${"Inbox"}, ${"INBOX"})`);
    inbox = account.newFolder();
    inbox.name = "Inbox";
    inbox.id = "INBOX";
    inbox.specialFolder = SpecialFolder.Inbox;
    inbox.dbID = folderRow.lastInsertRowid;
  }
  inbox.account = account;
  inbox.messages.clear();
  account.rootFolders.add(inbox);
  return account;
}

function newTestEMail(folder: Folder, pID: string, subject: string, sentDate: string): EMail {
  let email = folder.newEMail();
  email.id = pID + "@example.com";
  email.pID = pID;
  email.subject = subject;
  email.sent = new Date(sentDate + "T10:00:00Z");
  email.received = email.sent;
  email.from = findOrCreatePersonUID("alice@example.com", "Alice");
  email.contact = email.from;
  return email;
}

/** Records the `FindItem` requests, and finds nothing */
class TestEWSAccount extends EWSAccount {
  readonly requests: any[] = [];

  async callEWS(request: any): Promise<any> {
    this.requests.push(request);
    return { RootFolder: { Items: {} } };
  }
}

function newTestEWSAccount(): TestEWSAccount {
  let account = new TestEWSAccount();
  account.name = "Test";
  account.emailAddress = "user@example.com";
  account.storage = new DummyMailStorage();
  for (let name of ["Inbox", "Sent"]) {
    let folder = account.newFolder();
    folder.name = folder.id = name;
    account.rootFolders.add(folder);
  }
  return account;
}

async function startEWSSearch(account: TestEWSAccount) {
  let search = account.newSearch();
  search.account = account;
  search.bodyText = "budget";
  await search.startSearch(10);
}

function searchedFolderIDs(account: TestEWSAccount): string[] {
  return account.requests[0].m$FindItem.m$ParentFolderIds.t$FolderId
    .map(folder => folder.Id);
}

function testPerson(emailAddress: string): Person {
  let person = new Person();
  person.emailAddresses.add(new ContactEntry(emailAddress, "work"));
  return person;
}
