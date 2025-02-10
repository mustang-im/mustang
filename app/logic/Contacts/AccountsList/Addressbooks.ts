import { Addressbook } from '../Addressbook';
// #if [WEBMAIL]
import { DummyAddressbookStorage } from '../SQL/DummyAddressbookStorage';
// #else
import { EWSAddressbook } from '../EWS/EWSAddressbook';
import { OWAAddressbook } from '../OWA/OWAAddressbook';
import { ActiveSyncAddressbook } from '../ActiveSync/ActiveSyncAddressbook';
import { SQLAddressbookStorage } from '../SQL/SQLAddressbookStorage';
// #endif
import { NotReached, NotImplemented } from '../../util/util';
import type { Collection } from 'svelte-collections';
import { gt } from '../../../l10n/l10n';

export function newAddressbookForProtocol(protocol: string): Addressbook {
  let ab = _newAddressbookForProtocol(protocol);
  // #if [WEBMAIL]
  ab.storage = new DummyAddressbookStorage();
   // #else
  ab.storage = new SQLAddressbookStorage();
  // #endif
  return ab;
}

function _newAddressbookForProtocol(protocol: string): Addressbook {
  if (protocol == "addressbook-local") {
    return new Addressbook();
  } else if (protocol == "addressbook-jmap") {
    throw new NotImplemented("JMAP Addressbook not implemented"); // return new JMAPAddressbook();
  }
  // #if [WEBMAIL]
  // #else
  if (protocol == "addressbook-ews") {
    return new EWSAddressbook();
  } else if (protocol == "addressbook-owa") {
    return new OWAAddressbook();
  } else if (protocol == "addressbook-activesync") {
    return new ActiveSyncAddressbook();
  }
  // #endif
  throw new NotReached(`Unknown addressbook type ${protocol}`);
}

// #if [WEBMAIL]
// #else
export async function readAddressbooks(): Promise<Collection<Addressbook>> {
  let addressbooks = await SQLAddressbookStorage.readAddressbooks();
  if (addressbooks.isEmpty) {
    addressbooks.add(await createPersonalAddressbook());
    addressbooks.add(await createCollectedAddressbook());
  }
  return addressbooks;
}
// #endif

export async function createPersonalAddressbook(): Promise<Addressbook> {
  console.log("Creating personal address book");
  let personal = newAddressbookForProtocol("addressbook-local");
  personal.name = gt`Personal addressbook`;
  await personal.save();
  return personal;
}

export async function createCollectedAddressbook(): Promise<Addressbook> {
  let collected = newAddressbookForProtocol("addressbook-local");
  collected.name = gt`Collected contacts`;
  await collected.save();
  return collected;
}
