import { ChatAccount } from '../ChatAccount';
import { XMPPAccount } from '../XMPP/XMPPAccount';
// #if [!WEBMAIL]
import { MatrixAccount } from '../Matrix/MatrixAccount';
import { SQLChatStorage } from '../SQL/SQLChatStorage';
// #else
import { DummyChatStorage } from '../SQL/DummyChatStorage';
// #endif
import { NotReached } from '../../util/util';
import type { Collection } from 'svelte-collections';

export function newChatAccountForProtocol(protocol: string): ChatAccount {
  let acc = _newChatAccountForProtocol(protocol);
  // #if [!WEBMAIL]
  acc.storage = new SQLChatStorage();
  // #else
  acc.storage = new DummyChatStorage();
  // #endif
  return acc;
}

function _newChatAccountForProtocol(protocol: string): ChatAccount {
  if (protocol == "xmpp") {
    return new XMPPAccount() as any as ChatAccount;
  }
  // #if [!WEBMAIL]
  if (protocol == "matrix") {
    return new MatrixAccount() as any as ChatAccount;
  } else if (protocol == "chat") {
    return new ChatAccount() as any as ChatAccount;
  }
  // #endif
  throw new NotReached(`Unsupported chat account type ${protocol}`);
}

// #if [!WEBMAIL]
export async function readChatAccounts(): Promise<Collection<ChatAccount>> {
  return await SQLChatStorage.readChatAccounts();
}
// #endif
