import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { JMAPFolder } from "../../../../logic/Mail/JMAP/JMAPFolder";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import type { EMail } from "../../../../logic/Mail/EMail";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import type { TJMAPMethodResponse, TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

appGlobal.remoteApp ??= { kyCreate: () => null } as any;

/** The result of the implicit `Email/set` that the server runs after the `EmailSubmission/set` */
type TMoveResult = Record<string, any>;

/** Stalwart's folder IDs */
const kFolderIDs = {
  [SpecialFolder.Inbox]: "a",
  [SpecialFolder.Drafts]: "d",
  [SpecialFolder.Sent]: "e",
};

/** Responses recorded from Stalwart */
function newAccount(moveResult: TMoveResult, folders: SpecialFolder[]) {
  let account = new JMAPAccount();
  account.accountID = "e";
  account.emailAddress = "john@example.com";
  account.session = { capabilities: {}, accounts: {}, primaryAccounts: {} } as any as TJMAPSession;
  let errors: Error[] = [];
  account.errorCallback = ex => errors.push(ex);
  let calls: [string, Record<string, any>, string?][] = [];
  account.makeCalls = async (requests: [string, Record<string, any>, string?][]) => {
    calls.push(...requests);
    return [
      ["EmailSubmission/set", {
        accountId: "e", newState: "sqeaq",
        created: { sendMessage: { id: "f", sendAt: "2026-10-17T15:59:02Z", undoStatus: "pending" } },
      }, "c1"],
      ["Email/set", { accountId: "e", oldState: "sqaaq", newState: "sqiaq", ...moveResult }, "c1"],
    ] as TJMAPMethodResponse[];
  };
  for (let specialFolder of folders) {
    let folder = account.newFolder();
    folder.id = kFolderIDs[specialFolder];
    folder.specialFolder = specialFolder;
    folder.addMessage = async (email: EMail) => {
      email.pID = "gmaaaabt";
    };
    account.rootFolders.add(folder);
  }
  let identity = account.newIdentity();
  identity.emailAddress = account.emailAddress;
  identity.pID = "i1";
  account.identities.add(identity);
  return { account, calls, errors };
}

function newEMail(account: JMAPAccount): EMail {
  let email = account.newEMailFrom();
  email.identity = account.identities.first;
  email.to.add(new PersonUID("jane@example.com", "Jane"));
  return email;
}

function onSuccessUpdateEmail(calls: [string, Record<string, any>, string?][]): Record<string, any> {
  return calls.find(call => call[0] == "EmailSubmission/set")[1].onSuccessUpdateEmail["#sendMessage"];
}

test("After sending, the email is moved from Drafts to Sent with a patch", async () => {
  let { account, calls, errors } = newAccount({ updated: { gmaaaabt: null } },
    [SpecialFolder.Inbox, SpecialFolder.Drafts, SpecialFolder.Sent]);
  let email = newEMail(account);
  email.folder = account.getSpecialFolder(SpecialFolder.Sent) as JMAPFolder;

  await account.send(email);

  let update = onSuccessUpdateEmail(calls);
  // RFC 8621 section 4.1.1: All values in `mailboxIds` MUST be `true`, so remove folders with a patch
  expect(update.mailboxIds).toBeUndefined();
  expect(update["mailboxIds/e"]).toBe(true);
  expect(update["keywords/$draft"]).toBe(null);
  expect(Object.values(update).filter(value => value === true)).toEqual([true]);
  expect(errors).toEqual([]);
});

test("When the email can't be moved to Sent, the user hears about it, but sending succeeds", async () => {
  let { account, errors } = newAccount({
    notUpdated: { gmaaaabt: { type: "invalidProperties", description: "mailboxId zzzz does not exist.", properties: ["mailboxIds"] } },
  }, [SpecialFolder.Inbox, SpecialFolder.Drafts, SpecialFolder.Sent]);
  let email = newEMail(account);
  email.folder = account.getSpecialFolder(SpecialFolder.Sent) as JMAPFolder;

  await account.send(email);

  expect(errors.length).toBe(1);
  expect(errors[0].message).toContain("mailboxIds");
});
