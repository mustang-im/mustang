import { readAccounts, addNewAccountFromConfig } from 'mustang-lib/logic/account/account-list'
import { findAccountConfig } from 'mustang-lib/logic/account/setup/setup'
import AccountConfig from 'mustang-lib/logic/account/setup/AccountConfig'
import JPCWebSocket from 'jpc-ws'

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

async function start() {
  try {
    let appGlobal = await createGlobalAppObject();
    let jpc = new JPCWebSocket(appGlobal);
    await jpc.listen(kSecret, 5455, false);
  } catch (ex) {
    console.error(ex);
  }
}
start();

async function createGlobalAppObject() {
  return {
    //addNewAccountFromConfig,
    //findAccountConfig,
    //AccountConfig,
    accounts: await readAccounts(),
  };
}
