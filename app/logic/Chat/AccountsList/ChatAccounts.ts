import { ChatAccount } from '../ChatAccount';
import { XMPPAccount } from '../XMPP/XMPPAccount';
import { MatrixAccount } from '../Matrix/MatrixAccount';
import { SQLChatStorage } from '../SQL/SQLChatStorage';
import { NotReached } from '../../util/util';
import type { Collection } from 'svelte-collections';
import { isWebMail } from '../../build';

export function newChatAccountForProtocol(protocol: string): ChatAccount {
  let acc = _newChatAccountForProtocol(protocol);
  acc.storage = new SQLChatStorage();
  return acc;
}

function _newChatAccountForProtocol(protocol: string): ChatAccount {
  if (protocol == "xmpp") {
    return new XMPPAccount() as any as ChatAccount;
  } else if (protocol == "matrix") {
    return new MatrixAccount() as any as ChatAccount;
  } else if (protocol == "chat") {
    return new ChatAccount() as any as ChatAccount;
  }
  // #if [WEBMAIL]
  if (isWebMail) {
    throw new NotReached("WebMail supports only XMPP and Matrix chat accounts");
  }
  // #endif
  throw new NotReached(`Unknown chat account type ${protocol}`);
}

// #if [WEBMAIL]
// #else
export async function readChatAccounts(): Promise<Collection<ChatAccount>> {
  return await SQLChatStorage.readChatAccounts();
}
// #endif
