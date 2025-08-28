import { appGlobal } from "../../../app";
import type { Database } from "../../../../../lib/rs-sqlite/index";
import { mailSourceDatabaseSchema } from "./createSourceDatabase";
import { getConfigDir } from "../../../util/backend-wrapper";

let mailSourceDatabase: Database;

export async function getDatabase(): Promise<Database> {
  if (mailSourceDatabase) {
    return mailSourceDatabase;
  }
  let dir = await appGlobal.remoteApp.path.join(
    await getConfigDir(), "backup");
  await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  let file = await appGlobal.remoteApp.path.join("backup", "mail-backup.db");
  mailSourceDatabase = await getDatabase(file);
  await mailSourceDatabase.migrate(mailSourceDatabaseSchema);
  return mailSourceDatabase;
}
