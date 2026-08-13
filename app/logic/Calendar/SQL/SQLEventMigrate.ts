import { eventAttachmentSchema } from "./createDatabase";
import sql, { type Database } from "../../../../lib/rs-sqlite";

/** Add table `eventAttachment` to pre-existing calendar.db.
 * Pattern: read source-of-truth via `sqlite_schema`, create on miss. */
export async function addEventAttachmentTable(database: Database): Promise<void> {
  let existing = await database.get(sql`
    SELECT name FROM sqlite_schema
    WHERE type = 'table' AND name = 'eventAttachment'
    `) as any;
  if (existing) {
    return;
  }
  await database.execute(eventAttachmentSchema);
}
