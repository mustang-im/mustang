// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

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

/** Adds a property decorator to a property outside the class.
 * Useful, if you're dynamically adding properties to the JS object and
 * want the decorator for those properties.
 * Use this sparingly. */
export function addPropertyDecorator<T>(obj: T, propertyName: string, decorator: (obj: T, propertyName: string) => void) {
  let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName);
  if (descriptor.set) { // TODO multiple decorators
    return;
  }
  decorator(obj, propertyName);
}
