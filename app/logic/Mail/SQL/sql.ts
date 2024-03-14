import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { mailDatabaseSchema } from "./createDatabase";

export async function testDatabase() {
  let result;
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  const mailDatabase: Database = await getDatabase("mail.db");
  try {
    mailDatabase.pragma('foreign_keys');
    await mailDatabase.migrate(mailDatabaseSchema);

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
