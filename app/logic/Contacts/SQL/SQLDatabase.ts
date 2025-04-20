import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { contactsDatabaseSchema } from "./createDatabase";

// <copied from="Mail/SQL/Account/SQLDatabase.ts">

let contactsDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (contactsDatabase) {
    return contactsDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  contactsDatabase = await getDatabase("contacts.db");
  await contactsDatabase.migrate(contactsDatabaseSchema);
  await contactsDatabase.pragma('foreign_keys = true');
  await contactsDatabase.pragma('journal_mode = DELETE');
  return contactsDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<Database> {
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  contactsDatabase = await getDatabase("test-contacts.db");
  await deleteDatabase();
  await contactsDatabase.migrate(contactsDatabaseSchema);
  await contactsDatabase.pragma('foreign_keys = true');
  return contactsDatabase;
}

export async function deleteDatabase(): Promise<void> {
  let tables = await contactsDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];

  // REFERENCES causes "Table 'person' does not exist" when deleting table 'groupp',
  // due to groupMember referencing both tables and person being deleted first
  await contactsDatabase.execute(sql`DROP TABLE IF EXISTS groupMember;`);

  for (let row of tables) {
    let table = row.name;
    if (table?.startsWith("sqlite_")) {
      continue;
    }
    await contactsDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await contactsDatabase.pragma('user_version = 0');
  (contactsDatabase as any).close();
  contactsDatabase = null;
}
