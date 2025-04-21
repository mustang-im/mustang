import { getDatabase, deleteDatabase } from "./SQLDatabase";
import { newAddressbookForProtocol } from "../AccountsList/Addressbooks";
import type { Addressbook } from "../Addressbook";
import { SQLAddressbookStorage } from "./SQLAddressbookStorage";
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
        username, authMethod, url,
        userRealname, workspace, configJSON
      FROM addressbook
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
  console.log("Contacts DB re-created", accounts);

  for (let account of accounts) {
    account.password = await getPassword("contacts." + account.id);
    await deletePassword("contacts." + account.id);
    account.storage = new SQLAddressbookStorage();
    await account.save();
  }

  appGlobal.addressbooks.addAll(accounts);
}

function migrateAccount(row: any): Addressbook {
  let account = newAddressbookForProtocol(row.protocol);
  let json = sanitize.json(row.configJSON, {}) as any;
  Object.assign(json, row);
  json.id = row.idStr;
  json.realname = json.userRealname;
  account.fromConfigJSON(json);
  return account;
}
