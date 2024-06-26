import { ChatAccount } from '../ChatAccount';
import { XMPPAccount } from '../XMPP/XMPPAccount';
import { MatrixAccount } from '../Matrix/MatrixAccount';
import { NotReached } from '../../util/util';

export function newChatAccountForProtocol(protocol: string): ChatAccount {
  if (protocol == "xmpp") {
    return new XMPPAccount() as any as ChatAccount;
  }
  if (protocol == "matrix") {
    return new MatrixAccount() as any as ChatAccount;
  }
  if (protocol == "chat") {
    return new ChatAccount() as any as ChatAccount;
  }
  throw new NotReached(`Unknown chat account type ${protocol}`);
}
