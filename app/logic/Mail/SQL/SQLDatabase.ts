import { appGlobal } from "../../app";
import { type Database } from "../../../../lib/rs-sqlite/index";
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
  console.log("database version", dbVersion);
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
  await mailDatabase.pragma('user_version = 0');
  let dbVersion = (await mailDatabase.pragma('user_version') as any)[0].user_version;
  console.log("database version", dbVersion);
  await mailDatabase.migrate(mailDatabaseSchema);
  await mailDatabase.pragma('foreign_keys = true');
  await mailDatabase.pragma('journal_mode = DELETE');
  return mailDatabase;
}
