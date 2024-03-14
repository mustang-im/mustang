import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { mailDatabaseSchema } from "./createDatabase";

// Lib docs:
// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md
// https://github.com/radically-straightforward/radically-straightforward/tree/main/sqlite
// https://www.sqlite.org/lang.html

export async function testDatabase() {
  let result;
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  const mailDatabase: Database = await getDatabase("mail.db");
  try {
    let dbVersion = (await mailDatabase.pragma('user_version') as any)[0].user_version;
    console.log("database version", dbVersion);
    await mailDatabase.migrate(mailDatabaseSchema);
    await mailDatabase.pragma('foreign_keys = true');
    await mailDatabase.pragma('journal_mode = DELETE');

    await mailDatabase.run(sql`
      INSERT INTO "emailPersons" ("name", "emailAddress") VALUES (${"Fred"}, ${"fred@example.com"})
    `);

    result = await mailDatabase.get(sql`
      SELECT "id", "name", "emailAddress" FROM "emailPersons" WHERE "name" LIKE ${"%@example.com"}
    `); // => { id: 1, name: 'Fred', emailAddress: 'fred@example.com' }
  } finally {
    await mailDatabase.close();
  }
  console.log("db result", result);
  return result;
}
