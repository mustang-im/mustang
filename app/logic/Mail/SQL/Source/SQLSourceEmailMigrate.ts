import { mailSourceDatabaseSchema } from "./createSourceDatabase";
import { RunOnce } from "../../../util/flow/RunOnce";
import sql, { type Database } from "../../../../../lib/rs-sqlite";

const runOnce = new RunOnce<void>();

export async function migrateToNewSchema(database: Database) {
  // Run in runOnce because this seems to be called multiple times in parallel
  await runOnce.runOnce(async () => {
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

        INSERT INTO emailMIME SELECT * FROM emailMIME_old;
        DROP TABLE emailMIME_old;

        END TRANSACTION;
      `);
    } catch(ex) {
      await database.run(sql`ROLLBACK TRANSACTION`);
      throw ex;
    }
  });
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
