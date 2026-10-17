import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { JMAPFolder } from "../../../../logic/Mail/JMAP/JMAPFolder";
import type { JMAPEMail } from "../../../../logic/Mail/JMAP/JMAPEMail";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import { DeleteStrategy } from "../../../../logic/Mail/MailAccount";
import type { TJMAPMethodResponse, TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

appGlobal.remoteApp ??= { kyCreate: () => null } as any;

/** Responses as Stalwart returns them
 * @param mailboxIDsOnServer what the server has for the email, or null if the email is gone */
function newAccount(mailboxIDsOnServer: Record<string, boolean> | null) {
  let account = new JMAPAccount();
  account.accountID = "e";
  account.session = { capabilities: {}, accounts: {}, primaryAccounts: {} } as any as TJMAPSession;
  let calls: [string, Record<string, any>, string?][] = [];
  account.makeCalls = async (requests: [string, Record<string, any>, string?][]) => {
    calls.push(...requests);
    return requests.map(call => [call[0], call[0] == "Email/get"
      ? {
        accountId: "e", state: "spi",
        list: mailboxIDsOnServer ? [{ mailboxIds: mailboxIDsOnServer, id: "eaaaaab" }] : [],
        notFound: mailboxIDsOnServer ? [] : ["eaaaaab"],
      }
      : call[1].destroy
        ? { accountId: "e", oldState: "spi", newState: "spm", destroyed: ["eaaaaab"] }
        : { accountId: "e", oldState: "spi", newState: "spm", updated: { eaaaaab: null } },
    call[2] ?? "c1"] as TJMAPMethodResponse);
  };
  let inbox = newFolder(account, "a", SpecialFolder.Inbox);
  let trash = newFolder(account, "d", SpecialFolder.Trash);
  return { account, calls, inbox, trash };
}

function newFolder(account: JMAPAccount, id: string, specialFolder: SpecialFolder): JMAPFolder {
  let folder = account.newFolder();
  folder.id = id;
  folder.specialFolder = specialFolder;
  account.rootFolders.add(folder);
  return folder;
}

function newEMail(folder: JMAPFolder): JMAPEMail {
  let email = folder.newEMail();
  email.jmapID = "eaaaaab";
  return email;
}

function emailSet(calls: [string, Record<string, any>, string?][]) {
  return calls.filter(call => call[0] == "Email/set").map(call => call[1]);
}

test("Deleting an email from Trash keeps it in its other folder", async () => {
  let { calls, trash } = newAccount({ a: true, d: true });

  await newEMail(trash).deleteMessageOnServer();

  expect(emailSet(calls)).toEqual([{ accountId: "e", update: { eaaaaab: { "mailboxIds/d": null } } }]);
});

test("Deleting an email from Trash destroys it when it is in no other folder", async () => {
  let { calls, trash } = newAccount({ d: true });

  await newEMail(trash).deleteMessageOnServer();

  expect(emailSet(calls)).toEqual([{ accountId: "e", destroy: ["eaaaaab"] }]);
});

test("Deleting immediately keeps the email in its other folder", async () => {
  let { calls, inbox } = newAccount({ a: true, x: true });

  await newEMail(inbox).deleteMessageOnServer(DeleteStrategy.DeleteImmediately);

  expect(emailSet(calls)).toEqual([{ accountId: "e", update: { eaaaaab: { "mailboxIds/a": null } } }]);
});

test("Deleting an email that is already gone on the server succeeds", async () => {
  let { calls, trash } = newAccount(null);

  await newEMail(trash).deleteMessageOnServer();

  expect(emailSet(calls)).toEqual([]);
});
