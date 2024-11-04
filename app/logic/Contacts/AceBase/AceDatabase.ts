import { appGlobal } from "../../app";
import { AceBaseHandle } from "../../../../backend/acebase";

let contactsDatabase: AceBaseHandle;

// Lib docs: <https://github.com/appy-one/acebase>

export async function getDatabase(): Promise<AceBaseHandle> {
  if (contactsDatabase) {
    return contactsDatabase;
  }
  contactsDatabase = await appGlobal.remoteApp.getAceDatabase("contacts");
  return contactsDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<AceBaseHandle> {
  contactsDatabase = await appGlobal.remoteApp.getAceDatabase("test-contacts");
  await deleteDatabase();
  return contactsDatabase;
}

async function deleteDatabase(): Promise<void> {
  await contactsDatabase.ref("*").remove();
}

