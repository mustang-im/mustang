import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { JMAPFolder } from "../../../../logic/Mail/JMAP/JMAPFolder";
import type { JMAPEMail } from "../../../../logic/Mail/JMAP/JMAPEMail";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import { DeleteStrategy } from "../../../../logic/Mail/MailAccount";
import type { TJMAPMethodResponse, TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

appGlobal.remoteApp ??= { kyCreate: () => null } as any;

/** A server with one email, answering like Stalwart
 * @param mailboxIDsOnServer what the server has for the email, or null if the email is gone */
function newAccount(mailboxIDsOnServer: Record<string, boolean> | null) {
  let account = new JMAPAccount();
  account.accountID = "e";
  account.session = { capabilities: {}, accounts: {}, primaryAccounts: {} } as any as TJMAPSession;
  let server = { mailboxIds: mailboxIDsOnServer ? { ...mailboxIDsOnServer } : null };
  account.makeCalls = async (requests: [string, Record<string, any>, string?][]) => requests.map(([method, args, callID]) => {
    let result: Record<string, any>;
    if (method == "Email/get") {
      result = {
        accountId: "e", state: "spi",
        list: server.mailboxIds ? [{ mailboxIds: server.mailboxIds, id: "eaaaaab" }] : [],
        notFound: server.mailboxIds ? [] : ["eaaaaab"],
      };
    } else if (!server.mailboxIds) {
      let notFound = { eaaaaab: { type: "notFound" } };
      result = { accountId: "e", oldState: "spi", newState: "spi", ...(args.destroy ? { notDestroyed: notFound } : { notUpdated: notFound }) };
    } else if (args.destroy) {
      server.mailboxIds = null;
      result = { accountId: "e", oldState: "spi", newState: "spm", destroyed: ["eaaaaab"] };
    } else {
      for (let [path, value] of Object.entries(args.update.eaaaaab as Record<string, any>)) {
        if (path == "mailboxIds") {
          server.mailboxIds = { ...value };
        } else if (path.startsWith("mailboxIds/") && value) {
          server.mailboxIds[path.substring(11)] = true;
        } else if (path.startsWith("mailboxIds/")) {
          delete server.mailboxIds[path.substring(11)];
        }
      }
      result = { accountId: "e", oldState: "spi", newState: "spm", updated: { eaaaaab: null } };
    }
    return [method, result, callID ?? "c1"] as TJMAPMethodResponse;
  });
  let inbox = newFolder(account, "a", SpecialFolder.Inbox);
  let trash = newFolder(account, "d", SpecialFolder.Trash);
  return { account, server, inbox, trash };
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

test("Deleting an email from Trash keeps it in its other folder", async () => {
  let { server, trash } = newAccount({ a: true, d: true });

  await newEMail(trash).deleteMessageOnServer();

  expect(server.mailboxIds).toEqual({ a: true });
});

test("Deleting an email from Trash destroys it when it is in no other folder", async () => {
  let { server, trash } = newAccount({ d: true });

  await newEMail(trash).deleteMessageOnServer();

  expect(server.mailboxIds).toBeNull();
});

test("Deleting immediately keeps the email in its other folder", async () => {
  let { server, inbox } = newAccount({ a: true, x: true });

  await newEMail(inbox).deleteMessageOnServer(DeleteStrategy.DeleteImmediately);

  expect(server.mailboxIds).toEqual({ x: true });
});

test("Deleting an email that is already gone on the server succeeds", async () => {
  let { server, trash } = newAccount(null);

  await newEMail(trash).deleteMessageOnServer();

  expect(server.mailboxIds).toBeNull();
});
