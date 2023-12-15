import { CollectionObserver } from "svelte-collections";

export class DebugObserver<Item> extends CollectionObserver<Item> {
  added(items: Item[], coll) {
    console.log("Added items to collection", items);
  }
  removed(items: Item[], coll) {
    console.log("Removed items from collection", items);
  }
}
