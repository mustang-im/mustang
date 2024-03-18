import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { mailDatabaseSchema } from "./createDatabase";

let mailDatabase: Database;

// Lib docs:
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
// https://github.com/radically-straightforward/radically-straightforward/tree/main/sqlite
// https://www.sqlite.org/lang.html

export async function getDatabase(): Promise<Database> {
  if (mailDatabase) {
    return mailDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  mailDatabase = await getDatabase("mail.db");
  let dbVersion = (await mailDatabase.pragma('user_version') as any)[0].user_version;
  await mailDatabase.migrate(mailDatabaseSchema);
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
  mailDatabase = await getDatabase("test.db");
  let tables = await mailDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    console.log("deleting table", table);
    await mailDatabase.run(sql`DROP TABLE ${table}`);
  }
  await mailDatabase.migrate(mailDatabaseSchema);
  await mailDatabase.pragma('foreign_keys = true');
  await mailDatabase.pragma('journal_mode = DELETE');
  return mailDatabase;
}
