import { appGlobal } from "../../../app";
import type { Database } from "../../../../../lib/rs-sqlite/index";
import { mailSourceDatabaseSchema } from "./createSourceDatabase";

let mailSourceDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (mailSourceDatabase) {
    return mailSourceDatabase;
  }
  let dir = await appGlobal.remoteApp.getFilesDir() + "/backup";
  await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  mailSourceDatabase = await getDatabase("backup/mail-backup.db");
  await mailSourceDatabase.migrate(mailSourceDatabaseSchema);
  return mailSourceDatabase;
}
