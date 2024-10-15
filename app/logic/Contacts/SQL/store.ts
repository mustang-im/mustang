import { Addressbook } from '../Addressbook';
import { SQLAddressbook } from './SQLAddressbook';
import { SQLGroup } from './SQLGroup';
import { ArrayColl, Collection } from 'svelte-collections';
import { gt } from '../../../l10n/l10n';

export async function readAddressbooks(): Promise<Collection<Addressbook>> {
  let addressbooks = await SQLAddressbook.readAll();
  for (let addressbook of addressbooks) {
    SQLGroup.readAll(addressbook); // also reads persons
  }
  if (addressbooks.isEmpty) {
    addressbooks.addAll(await createDefaultAddressbooks());
  }
  return addressbooks;
}

async function createDefaultAddressbooks(): Promise<Collection<Addressbook>> {
  console.log("Creating default address books");
  let addressbooks = new ArrayColl<Addressbook>();
  let personal = new Addressbook();
  personal.name = gt`Personal addressbook`;
  addressbooks.add(personal);
  await SQLAddressbook.save(personal);
  let collected = new Addressbook();
  collected.name = gt`Collected contacts`;
  addressbooks.add(collected);
  await SQLAddressbook.save(collected);
  return addressbooks;
}
