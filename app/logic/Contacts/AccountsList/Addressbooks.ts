import { Addressbook } from '../Addressbook';
import { EWSAddressbook } from '../EWS/EWSAddressbook';
import { OWAAddressbook } from '../OWA/OWAAddressbook';
import { ActiveSyncAddressbook } from '../ActiveSync/ActiveSyncAddressbook';
import { NotReached } from '../../util/util';

export function newAddressbookForProtocol(protocol: string): Addressbook {
  if (protocol == "addressbook-local") {
    return new Addressbook();
  }
  if (protocol == "addressbook-ews") {
    return new EWSAddressbook();
  }
  if (protocol == "addressbook-owa") {
    return new OWAAddressbook();
  }
  if (protocol == "addressbook-activesync") {
    return new ActiveSyncAddressbook();
  }
  throw new NotReached(`Unknown addressbook type ${protocol}`);
}
