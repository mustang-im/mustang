import { Addressbook } from '../Addressbook';
import { EWSAddressbook } from '../EWS/EWSAddressbook';
import { OWAAddressbook } from '../OWA/OWAAddressbook';
import { ActiveSyncAddressbook } from '../ActiveSync/ActiveSyncAddressbook';
import { SQLAddressbookStorage } from '../SQL/SQLAddressbookStorage';
import { NotReached } from '../../util/util';
import { ArrayColl, type Collection } from 'svelte-collections';
import { gt } from '../../../l10n/l10n';

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

export async function readAddressbooks(): Promise<Collection<Addressbook>> {
  let addressbooks = await SQLAddressbookStorage.readAddressbooks();
  if (addressbooks.isEmpty) {
    addressbooks.addAll(await createDefaultAddressbooks());
  }
  return addressbooks;
}

async function createDefaultAddressbooks(): Promise<Collection<Addressbook>> {
  console.log("Creating default address books");
  let addressbooks = new ArrayColl<Addressbook>();
  let personal = newAddressbookForProtocol("addressbook-local");
  personal.name = gt`Personal addressbook`;
  addressbooks.add(personal);
  await personal.save();
  let collected = newAddressbookForProtocol("addressbook-local");
  collected.name = gt`Collected contacts`;
  addressbooks.add(collected);
  await collected.save();
  return addressbooks;
}
