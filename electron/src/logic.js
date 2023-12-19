//import { readAccounts, addNewAccountFromConfig, findAccountConfig } from "mustang-lib";
import { readAccounts, addNewAccountFromConfig } from "mustang-lib/logic/account/account-list";
import { findAccountConfig } from "mustang-lib/logic/account/setup/setup";
//import SQLAccount from "mustang-lib/logic/storage/SQLAccount";
import JPCWebSocket from 'jpc-ws'

export async function startupLogic() {
  let appGlobal = await createSharedAppObject();
  let jpc = new JPCWebSocket(appGlobal);
  await jpc.listen(kSecret, 5455, false);
}

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

async function createSharedAppObject() {
  let accounts = await readAccounts();
  return {
    accounts,
    addNewAccountFromConfig,
    findAccountConfig,
  };
}
