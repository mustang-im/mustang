import { ChatAccount } from './Account';
import { ArrayColl } from 'svelte-collections';
import { MatrixAccount } from './Matrix/MatrixAccount';

/**
 * Reads settings for chat accounts,
 * and creates corrsponding `ChatAccount` objects.
 * Returns them, and adds them to `appGlobal.chatAccounts`.
 * 
 * You still need to call `await account.login()` on each of them.
 */
export async function readChatAccounts(): Promise<ArrayColl<ChatAccount>> {
  let accounts = new ArrayColl<ChatAccount>();
  for (let i = 1; true; i++) {
    let prefBranch = `chat.account${i}.`;
    try {
      let protocol = localStorage.getItem(prefBranch + "protocol");
      if (!protocol) {
        break;
      } else if (protocol == "matrix") {
        accounts.add(readMatrixAccount(prefBranch));
      } else {
        console.error(`Unknown chat account ${protocol} in localStorage ${prefBranch}protocol`);
      }
    } catch (ex) {
      console.log("Could not load account", prefBranch);
      console.error(ex);
    }
  }
  if (accounts.isEmpty) {
    console.log("No chat accounts configured. Please set up chat.account1.*");
  }
  return accounts;
}

function readMatrixAccount(prefBranch: string): MatrixAccount {
  let account = new MatrixAccount();
  account.baseURL = localStorage.getItem(prefBranch + "server") ?? "https://matrix.org";
  account.username = localStorage.getItem(prefBranch + "username");
  account.password = localStorage.getItem(prefBranch + "password");
  account.deviceID = localStorage.getItem(prefBranch + "deviceID");
  if (!account.deviceID) {
    account.deviceID = crypto.randomUUID();
    localStorage.setItem(prefBranch + "deviceID", account.deviceID);
  }
  return account;
}
