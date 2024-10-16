import { Addressbook } from '../Addressbook';
import { EWSAddressbook } from '../EWS/EWSAddressbook';
import { OWAAddressbook } from '../OWA/OWAAddressbook';
import { ActiveSyncAddressbook } from '../ActiveSync/ActiveSyncAddressbook';
import { SQLAddressbookStorage } from '../SQL/SQLAddressbookStorage';
import { NotReached } from '../../util/util';

export function newAddressbookForProtocol(protocol: string): Addressbook {
  let ab: Addressbook;
  if (protocol == "addressbook-local") {
    ab = new Addressbook();
  } else if (protocol == "addressbook-ews") {
    ab = new EWSAddressbook();
  } else if (protocol == "addressbook-owa") {
    ab = new OWAAddressbook();
  } else if (protocol == "addressbook-activesync") {
    ab = new ActiveSyncAddressbook();
  } else {
    throw new NotReached(`Unknown addressbook type ${protocol}`);
  }
  ab.storage = new SQLAddressbookStorage();
  return ab;
}
