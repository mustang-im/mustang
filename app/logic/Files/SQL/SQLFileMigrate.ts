import sql, { type Database } from "../../../../lib/rs-sqlite";

/** Add `file.lastModOnServer` to pre-existing files.db.
 * Pattern: read source-of-truth via `pragma_table_info`, ALTER on miss.
 * SQLite forbids non-constant defaults on ADD COLUMN, so we add with
 * default 0 and then backfill from `lastMod` (the closest we have for
 * the value the server last reported). */
export async function addLastModOnServer(database: Database): Promise<void> {
  let columns = await database.all(sql`SELECT name FROM pragma_table_info('file')`) as any[];
  if (columns.some(c => c.name == "lastModOnServer")) {
    return;
  }
  await database.execute(sql`
    ALTER TABLE file ADD COLUMN "lastModOnServer" INTEGER not null default 0;
    UPDATE file SET lastModOnServer = lastMod;
  `);
}
