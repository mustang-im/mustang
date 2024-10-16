import { ChatAccount } from '../ChatAccount';
import { XMPPAccount } from '../XMPP/XMPPAccount';
import { MatrixAccount } from '../Matrix/MatrixAccount';
import { SQLChatStorage } from '../SQL/SQLChatStorage';
import { NotReached } from '../../util/util';

export function newChatAccountForProtocol(protocol: string): ChatAccount {
  let acc: ChatAccount;
  if (protocol == "xmpp") {
    acc = new XMPPAccount() as any as ChatAccount;
  } else if (protocol == "matrix") {
    acc = new MatrixAccount() as any as ChatAccount;
  } else if (protocol == "chat") {
    acc = new ChatAccount() as any as ChatAccount;
  } else {
    throw new NotReached(`Unknown chat account type ${protocol}`);
  }
  acc.storage = new SQLChatStorage();
  return acc;
}
