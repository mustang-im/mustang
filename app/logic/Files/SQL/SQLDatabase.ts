import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { filesDatabaseSchema } from "./createDatabase";
import { addLastModOnServer } from "./SQLFileMigrate";
import { getSQLiteDatabase } from "../../util/backend-wrapper";

let filesDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (filesDatabase) {
    return filesDatabase;
  }
  filesDatabase = await getSQLiteDatabase("files.db");
  await filesDatabase.migrate(filesDatabaseSchema, addLastModOnServer);
  await filesDatabase.pragma('foreign_keys = true');
  await filesDatabase.pragma('journal_mode = WAL');
  return filesDatabase;
}

export async function makeTestDatabase(): Promise<Database> {
  filesDatabase = await getSQLiteDatabase("test-files.db");
  await deleteDatabase();
  await filesDatabase.migrate(filesDatabaseSchema, addLastModOnServer);
  await filesDatabase.pragma('foreign_keys = true');
  return filesDatabase;
}

export async function deleteDatabase(): Promise<void> {
  let tables = await filesDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    if (table?.startsWith("sqlite_")) {
      continue;
    }
    await filesDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await filesDatabase.pragma('user_version = 0');
  (filesDatabase as any).close();
  filesDatabase = null;
}
