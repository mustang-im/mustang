import { appGlobal } from "../../app";
import { AceBaseHandle } from "../../../../backend/acebase";

let mailDatabase: AceBaseHandle;

// Lib docs: <https://github.com/appy-one/acebase>

export async function getDatabase(): Promise<AceBaseHandle> {
  if (mailDatabase) {
    return mailDatabase;
  }
  mailDatabase = await appGlobal.remoteApp.getAceDatabase("mail");
  return mailDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<AceBaseHandle> {
  mailDatabase = await appGlobal.remoteApp.getAceDatabase("test-mail");
  await deleteDatabase();
  return mailDatabase;
}

async function deleteDatabase(): Promise<void> {
  await mailDatabase.ref("*").remove();
}
