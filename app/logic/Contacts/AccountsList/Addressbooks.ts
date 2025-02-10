import { Addressbook } from '../Addressbook';
// #if [WEBMAIL]
// #else
import { EWSAddressbook } from '../EWS/EWSAddressbook';
import { OWAAddressbook } from '../OWA/OWAAddressbook';
import { ActiveSyncAddressbook } from '../ActiveSync/ActiveSyncAddressbook';
import { SQLAddressbookStorage } from '../SQL/SQLAddressbookStorage';
// #endif
import { isWebMail } from '../../build';
import { NotReached, assert } from '../../util/util';
import type { Collection } from 'svelte-collections';
import { gt } from '../../../l10n/l10n';

export function newAddressbookForProtocol(protocol: string): Addressbook {
  let ab = _newAddressbookForProtocol(protocol);
  ab.storage = new SQLAddressbookStorage();
  return ab;
}

function _newAddressbookForProtocol(protocol: string): Addressbook {
  // #if [WEBMAIL]
  if (isWebMail) {
    if (protocol == "addressbook-local") {
      return new Addressbook();
    } else if (protocol == "jmap-addressbook") {
      // return new JMAPAddressbook();
    }
    throw new NotReached(`Need JMAP account for webmail. ${protocol} is not supported here.`);
  }
  // #else
  if (protocol == "addressbook-ews") {
    return new EWSAddressbook();
  } else if (protocol == "addressbook-owa") {
    return new OWAAddressbook();
  } else if (protocol == "addressbook-activesync") {
    return new ActiveSyncAddressbook();
  }
  throw new NotReached(`Unknown addressbook type ${protocol}`);
  // #endif
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
