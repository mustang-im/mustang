import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { chatDatabaseSchema } from "./createDatabase";
import { migrateToAccountsDB } from "./SQLChatMigrate";

// <copied from="Mail/SQL/Account/SQLDatabase.ts">

let chatDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (chatDatabase) {
    return chatDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  chatDatabase = await getDatabase("chat.db");
  await chatDatabase.migrate(chatDatabaseSchema);
  await migrateToAccountsDB();
  await chatDatabase.pragma('foreign_keys = true');
  await chatDatabase.pragma('journal_mode = DELETE');
  return chatDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<Database> {
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  chatDatabase = await getDatabase("test-chat.db");
  await deleteDatabase();
  await chatDatabase.migrate(chatDatabaseSchema);
  await chatDatabase.pragma('foreign_keys = true');
  return chatDatabase;
}

export async function deleteDatabase(): Promise<void> {
  let tables = await chatDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    if (table?.startsWith("sqlite_")) {
      continue;
    }
    await chatDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await chatDatabase.pragma('user_version = 0');
  (chatDatabase as any).close();
  chatDatabase = null;
}
