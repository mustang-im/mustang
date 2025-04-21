import { getDatabase, deleteDatabase } from "./SQLDatabase";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import type { MailAccount } from "../MailAccount";
import { SQLMailStorage } from "./SQLMailStorage";
import { appGlobal } from "../../app";
import { deletePassword, getPassword } from "../../Auth/passwordLocalStorage";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import sql from "../../../../lib/rs-sqlite/index";

export async function migrateToAccountsDB(): Promise<void> {
  let rows: any[];
  try {
    rows = await (await getDatabase()).all(sql`
      SELECT
        id, idStr, name, protocol, emailAddress,
        username,
        hostname, port, tls, authMethod, url,
        outgoingAccountID,
        userRealname, workspace, configJSON
      FROM emailAccount
      `) as any[];
  } catch (ex) {
    if (ex?.message?.startsWith("no such column")) {
      return;
    } else {
      throw ex;
    }
  }
  if (!rows?.length) {
    return;
  }
  rows = rows.filter(row => row.hostname || row.url);
  if (!rows.length) {
    return;
  }
  let accounts = rows.map(migrateAccount);

  await deleteDatabase();
  await getDatabase();
  console.log("Mail DB re-created", accounts);

  let smtpAccounts = accounts.filter(acc => acc.protocol == "smtp");
  let incomingAccounts = accounts.filter(acc => acc.protocol != "smtp");
  for (let incoming of incomingAccounts) {
    let dbID = (incoming as any)._outgoingDBID;
    let smtp = smtpAccounts.find(acc => (acc as any)._dbID == dbID);
    if (smtp) {
      incoming.outgoing = smtp;
    }
  }

  for (let account of accounts) {
    account.password = await getPassword("mail." + account.id);
    await deletePassword("mail." + account.id);
    account.storage = new SQLMailStorage();
    await account.save();
  }

  appGlobal.emailAccounts.addAll(incomingAccounts);
}

function migrateAccount(row: any): MailAccount {
  let account = newAccountForProtocol(row.protocol);
  let json = sanitize.json(row.configJSON, {}) as any;
  Object.assign(json, row);
  json.id = row.idStr;
  json.realname = json.userRealname;
  if (Array.isArray(json.identities)) {
    for (let identity of json.identities) {
      identity.realname = identity.userRealname;
    }
  }
  account.fromConfigJSON(json);
  (account as any)._outgoingDBID = row.outgoingAccountID;
  (account as any)._dbID = row.id;
  return account;
}
