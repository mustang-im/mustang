import { appGlobal } from "../../app";
import { mailDatabaseSchema } from "./createDatabase";
import { migrateToAccountsDB } from "./SQLMailMigrate";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";

// <copied from="Mail/SQL/Account/SQLDatabase.ts">

let mailDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (mailDatabase) {
    return mailDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  mailDatabase = await getDatabase("mail.db");
  await mailDatabase.migrate(mailDatabaseSchema);
  console.log("migrate");
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

export async function deleteDatabase(): Promise<void> {
  let tables = await mailDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    if (table?.startsWith("sqlite_")) {
      continue;
    }
    await mailDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await mailDatabase.pragma('user_version = 0');
  (mailDatabase as any).close();
  mailDatabase = null;
}
