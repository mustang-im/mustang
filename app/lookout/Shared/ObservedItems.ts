import type { Observable } from "../../logic/util/Observable";
import type { Collection } from "svelte-collections";
import { derived, type Readable } from "svelte/store";

export class ObservedItems {
  static of<T extends Observable>(items: Collection<T>): Readable<T[]> {
    return derived(items, (collection, set) =>
      derived(collection.contents, () => collection.contents).subscribe(set));
  }
}
