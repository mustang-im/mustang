import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { mailDatabaseSchema } from "./createDatabase";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { SQLMailAccount } from "./SQLMailAccount";
import type { MailAccount } from "../MailAccount";
import { SQLMailStorage } from "./SQLMailStorage";

let mailDatabase: Database;

// Lib docs:
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
// https://github.com/radically-straightforward/radically-straightforward/tree/main/sqlite
// https://www.sqlite.org/lang.html
// <copied to="Contacts/SQL/SQLDatabase.ts">

export async function getDatabase(): Promise<Database> {
  if (mailDatabase) {
    return mailDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  mailDatabase = await getDatabase("mail.db");
  await mailDatabase.migrate(mailDatabaseSchema);
  await migrateToAccountsDB();
  await mailDatabase.pragma('foreign_keys = true');
  await mailDatabase.pragma('journal_mode = DELETE');
  return mailDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<Database> {
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  mailDatabase = await getDatabase("test-mail.db");
  await deleteDatabase();
  await mailDatabase.migrate(mailDatabaseSchema);
  await mailDatabase.pragma('foreign_keys = true');
  return mailDatabase;
}

async function deleteDatabase(): Promise<void> {
  let tables = await mailDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    await mailDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await mailDatabase.pragma('user_version = 0');
  mailDatabase = null;
}

async function migrateToAccountsDB(): Promise<void> {
  let rows = await mailDatabase.all(sql`
    SELECT
      idStr, name, protocol, emailAddress,
      username,
      hostname, port, tls, authMethod, url,
      outgoingAccountID,
      userRealname, workspace, configJSON
    FROM emailAccount
    `) as any[];
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

  for (let account of accounts) {
    account.storage = new SQLMailStorage();
    await account.save();
  }
}

function migrateAccount(row: any): MailAccount {
  let account = newAccountForProtocol(row.protocol);
  let json = row.configJSON;
  Object.assign(json, row);
  json.id = row.idStr;
  account.fromConfigJSON(json);
  return account;
}
