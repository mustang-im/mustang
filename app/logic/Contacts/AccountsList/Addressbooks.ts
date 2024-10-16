import { Addressbook } from '../Addressbook';
import { EWSAddressbook } from '../EWS/EWSAddressbook';
import { OWAAddressbook } from '../OWA/OWAAddressbook';
import { ActiveSyncAddressbook } from '../ActiveSync/ActiveSyncAddressbook';
import { SQLAddressbookStorage } from '../SQL/SQLAddressbookStorage';
import { NotReached } from '../../util/util';

export function newAddressbookForProtocol(protocol: string): Addressbook {
  let ab = _newAddressbookForProtocol(protocol);
  ab.storage = new SQLAddressbookStorage();
  return ab;
}

function _newAddressbookForProtocol(protocol: string): Addressbook {
  if (protocol == "addressbook-local") {
    return new Addressbook();
  } else if (protocol == "addressbook-ews") {
    return new EWSAddressbook();
  } else if (protocol == "addressbook-owa") {
    return new OWAAddressbook();
  } else if (protocol == "addressbook-activesync") {
    return new ActiveSyncAddressbook();
  }
  throw new NotReached(`Unknown addressbook type ${protocol}`);
}
