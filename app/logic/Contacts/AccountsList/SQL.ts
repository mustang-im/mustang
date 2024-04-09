import { Addressbook } from '../Addressbook';
import { SQLAddressbook } from '../SQL/SQLAddressbook';
import { SQLGroup } from '../SQL/SQLGroup';
import { ArrayColl, Collection } from 'svelte-collections';

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
  personal.name = "Personal addressbook";
  addressbooks.add(personal);
  SQLAddressbook.save(personal);
  let collected = new Addressbook();
  collected.name = "Collected contacts";
  addressbooks.add(collected);
  SQLAddressbook.save(collected);
  return addressbooks;
}
