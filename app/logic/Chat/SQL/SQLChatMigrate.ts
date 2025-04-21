import { getDatabase, deleteDatabase } from "./SQLDatabase";
import { newChatAccountForProtocol } from "../AccountsList/ChatAccounts";
import type { ChatAccount } from "../ChatAccount";
import { SQLChatStorage } from "./SQLChatStorage";
import { appGlobal } from "../../app";
import { deletePassword, getPassword } from "../../Auth/passwordLocalStorage";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import sql from "../../../../lib/rs-sqlite/index";

export async function migrateToAccountsDB(): Promise<void> {
  let rows: any[];
  try {
    rows = await (await getDatabase()).all(sql`
      SELECT
        id, idStr, name, protocol,
        hostname, port, tls,
        username, authMethod, url,
        userRealname, workspace, configJSON
      FROM chatAccount
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
  console.log("Chat DB re-created", accounts);

  for (let account of accounts) {
    account.password = await getPassword("chat." + account.id);
    await deletePassword("chat." + account.id);
    account.storage = new SQLChatStorage();
    await account.save();
  }

  appGlobal.chatAccounts.addAll(accounts);
}

function migrateAccount(row: any): ChatAccount {
  let account = newChatAccountForProtocol(row.protocol);
  let json = sanitize.json(row.configJSON, {}) as any;
  Object.assign(json, row);
  json.id = row.idStr;
  json.realname = json.userRealname;
  account.fromConfigJSON(json);
  return account;
}
