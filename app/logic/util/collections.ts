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

/** Creates an `ArrayColl` for a JS array, populates it with the contents,
 * and syncs the changes to the ArrayColl back to the JS array. */
export function syncArrayColl<T>(org: Array<T>, sortBy?: (i: T) => any): ArrayColl<T> {
  let coll = new ArrayColl<T>(org);
  coll.subscribe(() => {
    org.length = 0;
    let c = sortBy ? coll.sortBy(sortBy) : coll; // TODO leaking observing SortedCollection?
    org.push(...c.contents);
  });
  return coll;
}
