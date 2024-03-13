import { appGlobal } from "../../app";
import sql, { type Database } from "@radically-straightforward/sqlite";
import { mailDatabaseSchema } from "./createDatabase";

export async function testDatabase() {
  let result;
  const Database = appGlobal.remoteApp.getSQLiteDatabase() as Database;
  const mailDatabase = new Database("mail.db");
  try {
    await mailDatabase.migrate(mailDatabaseSchema);

    mailDatabase.run(sql`
      INSERT INTO "emailPersons" ("name", "emailAddress") VALUES (${"Fred"}, ${"fred@example.com"})
    `);

    result = mailDatabase.get(sql`
        SELECT "id", "name", "emailAddress" FROM "users" WHERE "name" LIKE ${"%@example.com"}
      `); // => { id: 1, name: 'Fred', emailAddress: 'fred@example.com' }
  } finally {
    mailDatabase.close();
  }
  return result;
}
