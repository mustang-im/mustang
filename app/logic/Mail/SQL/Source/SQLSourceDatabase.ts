import { appGlobal } from "../../../app";
import type { Database } from "../../../../../lib/rs-sqlite/index";
import { mailSourceDatabaseSchema } from "./createSourceDatabase";

let mailSourceDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (mailSourceDatabase) {
    return mailSourceDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  mailSourceDatabase = await getDatabase("backup/mail-backup.db");
  await mailSourceDatabase.migrate(mailSourceDatabaseSchema);
  return mailSourceDatabase;
}
