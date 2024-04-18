import type { Collection } from "svelte-collections";

export interface TreeItem {
  /** null = root item (there can be multiple root items) */
  parent: TreeItem;
  children: Collection<TreeItem>;
}

/** @returns 0 = root, 1 = first level children, 2 = grand children etc. */
export function getIndentionLevelFor(item: TreeItem): number {
  let indentionLevel = -1;
  let cur = item;
  while (cur) {
    indentionLevel++;
    cur = cur.parent;
  }
  return indentionLevel;
}
