import { appGlobal } from "../../app";
import type { AceBase } from "acebase";

let mailDatabase: AceBase;

// Lib docs: <https://github.com/appy-one/acebase>

export async function getDatabase(): Promise<AceBase> {
  if (mailDatabase) {
    return mailDatabase;
  }
  mailDatabase = await appGlobal.remoteApp.getAceDatabase("mail.db");
  return mailDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<AceBase> {
  mailDatabase = await appGlobal.remoteApp.getAceDatabase("test-mail.db");
  await deleteDatabase();
  return mailDatabase;
}

async function deleteDatabase(): Promise<void> {
  await mailDatabase.ref("*").remove();
}
