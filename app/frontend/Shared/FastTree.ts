import type { Collection } from "svelte-collections";

export interface TreeItem<T> {
  /** null = root item (there can be multiple root items) */
  parent: T;
  children: Collection<T>;
}

/** @returns 0 = root, 1 = first level children, 2 = grand children etc. */
export function getIndentionLevelFor<T extends TreeItem<T>>(item: T): number {
  let indentionLevel = -1;
  let cur = item;
  while (cur) {
    indentionLevel++;
    cur = cur.parent;
  }
  return indentionLevel;
}
