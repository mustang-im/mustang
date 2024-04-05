import { Addressbook } from '../Addressbook';
import { NotReached } from '../../util/util';

export function newAddressbookForProtocol(protocol: string): Addressbook {
  if (protocol == "addressbook-local") {
    return new Addressbook();
  }
  throw new NotReached(`Unknown addressbook type ${protocol}`);
}
