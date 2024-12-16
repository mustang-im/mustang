import { appGlobal } from "../../app";
import { mailDatabaseSchema } from "./createDatabase";
import { Lock, type Locked } from "../../util/Lock";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";

let mailDatabase: Database;

// Lib docs:
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
// https://github.com/radically-straightforward/radically-straightforward/tree/main/sqlite
// https://www.sqlite.org/lang.html
// <copied to="Contacts/SQL/SQLDatabase.ts">

const dbLock = new Lock();

export async function getDatabase(withLock = true): Promise<Database> {
  let lock = withLock ? await dbLock.lock() : null; // also protects transactions via `getDatabaseLock()`
  try {
    if (mailDatabase) {
      return mailDatabase;
    }
    const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
    mailDatabase = await getDatabase("mail.db");
    await mailDatabase.migrate(mailDatabaseSchema);
    await mailDatabase.pragma('foreign_keys = true');
    await mailDatabase.pragma('journal_mode = DELETE');
    return mailDatabase;
  } finally {
    lock?.release();
  }
}

export async function getDatabaseLock(): Promise<{ db: Database, lock: Locked }> {
  let lock = await dbLock.lock();
  let db = await getDatabase(false);
  return { db, lock };
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
}
