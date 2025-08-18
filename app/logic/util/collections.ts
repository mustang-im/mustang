import { ArrayColl, Collection } from "svelte-collections";

/**
 * Like SetColl, but always preserves the first matching entry, and retains the order
 * E.g. `let familyHeads = filterUnique(persons, (a, b) => a.lastname == b.lastname);`
 * Limitations: Does *not* observe the source and therefore the result does not automatically update.
 * @param compareFunc Result items will be unique in this aspect as defined by this function
 */
export function filterUnique<T>(source: Collection<T>, compareFunc: (a: T, b: T) => boolean): ArrayColl<T> {
  let unique = new ArrayColl<T>();
  if (!source) {
    return unique;
  }
  for (let newItem of source) {
    if (!unique.find(previous => compareFunc(previous, newItem))) {
      unique.add(newItem);
    }
  }
  return unique;
}

export function getNext<T>(list: ArrayColl<T>, curObject: T): T | null {
  if (!list) {
    return null;
  }
  let position = list.indexOf(curObject);
  return list.getIndex(position + 1)
    ?? list.last
    ?? null;
}
