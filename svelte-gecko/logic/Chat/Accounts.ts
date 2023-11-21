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
  return new MatrixAccount()];
}
