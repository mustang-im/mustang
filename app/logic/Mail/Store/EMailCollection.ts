import { ArrayColl, SortedCollection } from 'svelte-collections';
import { PromiseAllDone } from '../../util/PromiseAllDone';
import type { EMail } from '../EMail';
import type { Folder } from '../Folder';

export class EMailCollection<T extends EMail> extends ArrayColl<T> {
  folder: Folder;
  sortFunc: (a: T, b: T) => number;

  constructor(folder: Folder) {
    super();
    this.folder = folder;
  }

  getIndexRange(i: number, length: number): T[] {
    let emails = super.getIndexRange(i, length);

    let needEmails = emails.filter((email: any) => !email.haveMetadata);
    if (needEmails.length) {
      let wait = new PromiseAllDone();
      for (let email of needEmails) {
        if (email.dbID) {
          wait.add((async () => {
            await email.storage.readMessage(email);
            (email as any).haveMetadata = true;
          })());
        }
      }
      wait.wait().catch(needEmails[0].folder.account.errorCallback);
    }

    return emails;
  }

  sortBy(sortValueFunc: (item: T) => any): SortedCollection<T> {
    this.sortFunc = (a, b) => compareValues(sortValueFunc(a), sortValueFunc(b));
    this.replaceAll(this.contents.sort(compareValues));
    return this as any as SortedCollection<T>;
  }

  protected _addWithoutObserver(item: T) {
    let array = (this as any)._array as T[];
    array.splice(this.sortedIndex(item), 0, item);
  }

  protected sortedIndex(value: T): number {
    let array = (this as any)._array as T[];
    let low = 0;
    let high = array.length;

    while (low < high) {
      let mid = (low + high) >>> 1;
      if (this.sortFunc(value, array[mid]) > 0) { // value > array[mid]
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
}


/**
 * Works for strings, numbers and `Date`s
 * @param a, b {`T extends string | number | Date`}
 * @returns
 *     `-1`: `a` before `b`
 *     `1`: `b` before `a`
 *     `0`: `a` is sorted identical to `b`
 */
function compareValues<T>(a: T, b: T): number {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else { // equal
    return 0;
  }
}
