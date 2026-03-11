import { mailSourceDatabaseSchema } from "./createSourceDatabase";
import sql, { type Database } from "../../../../../lib/rs-sqlite";

export async function migrateToNewSchema(database: Database) {
  if (await isEmailIDUnique(database)) {
    return;
  }
  try {
    await database.execute(sql`
      BEGIN TRANSACTION;

      -- Delete duplicates from the DB, keep the latest version
      DELETE FROM emailMIME
      WHERE id NOT IN
        (SELECT MAX(id)
          FROM emailMIME
          GROUP BY emailID);

      ALTER TABLE emailMIME RENAME TO emailMIME_old;
      $${mailSourceDatabaseSchema}

      -- Don't copy DB IDs, generate new IDs
      INSERT INTO emailMIME (emailID, messageID, mime)
      SELECT emailID, messageID, mime FROM emailMIME_old;

      DROP TABLE emailMIME_old;

      END TRANSACTION;
    `);
  } catch(ex) {
    await database.run(sql`ROLLBACK TRANSACTION`);
    throw ex;
  }
}

export async function isEmailIDUnique(database: Database) {
  let indexes: any[] = await database.all(sql`SELECT * FROM pragma_index_list('emailMIME')`);
  // Check for indexes created by the UNIQUE constraint
  let uniqueIndexes = indexes.filter(i => i.unique == 1 && i.origin == "u");
  if (uniqueIndexes.length == 0) {
    return false;
  }
  // Check if the index has the emailID column
  for (let uIndex of uniqueIndexes) {
    let columns: any[] = await database.all(sql`SELECT * FROM pragma_index_info(${uIndex.name})`);
    if (columns.some(c => c.name == "emailID")) {
      return true;
    }
  }
  return false;
}
