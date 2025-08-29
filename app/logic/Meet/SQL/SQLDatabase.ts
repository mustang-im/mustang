import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { meetDatabaseSchema } from "./createDatabase";
import { getSQLiteDatabase } from "../../util/backend-wrapper";

// <copied from="Mail/SQL/Account/SQLDatabase.ts">

let meetDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (meetDatabase) {
    return meetDatabase;
  }
  meetDatabase = await getSQLiteDatabase("meet.db");
  await meetDatabase.migrate(meetDatabaseSchema);
  await meetDatabase.pragma('foreign_keys = true');
  await meetDatabase.pragma('journal_mode = DELETE');
  return meetDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<Database> {
  meetDatabase = await getSQLiteDatabase("test-meet.db");
  await deleteDatabase();
  await meetDatabase.migrate(meetDatabaseSchema);
  await meetDatabase.pragma('foreign_keys = true');
  return meetDatabase;
}

export async function deleteDatabase(): Promise<void> {
  let tables = await meetDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    if (table?.startsWith("sqlite_")) {
      continue;
    }
    await meetDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await meetDatabase.pragma('user_version = 0');
  (meetDatabase as any).close();
  meetDatabase = null;
}
