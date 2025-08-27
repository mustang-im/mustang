import { ArrayColl, SortedCollection } from 'svelte-collections';
import { PromiseAllDone } from '../../util/PromiseAllDone';
import type { EMail } from '../EMail';
import type { Folder } from '../Folder';

export class EMailCollection<T extends EMail> extends SortedCollection<T> {
  folder: Folder;
  sortFunc: (a: EMail, b: EMail) => number;

  constructor(folder: Folder) {
    let sortFunc = (a: EMail, b: EMail) => compareValues(b.sent, a.sent); // inverted = newest first
    /* Normally, a `SortedCollection` is simply a sorted /copy/ of the source collection.
     * Here, we don't use a source collection, but add the items directly to the
     * `SortedCollection`, using `.add()` and `.remove()`. The `SortedCollection`
     * has code to ensure that even those items added directly to it are also sorted. */
    super(new ArrayColl(), sortFunc);
    this.folder = folder;
  }

  /** Reads the messages from DB on-demand, as the frontend displays them. */
  getIndexRange(i: number, length: number): T[] {
    let emails = super.getIndexRange(i, length);

    if (emails.length) {
      // async: Return before filtering and reading emails
      this.readMessagesFromDB(emails)
        .catch(emails[0].folder.account.errorCallback);
    }
    return emails;
  }

  async readMessagesFromDB(emails: EMail[]) {
    let needEmails = emails.filter((email: any) => !email.haveMetadata);
    if (!needEmails.length) {
      return;
    }
    for (let email of needEmails) {
      if (email.dbID) {
        await email.storage.readMessage(email);
        (email as any).haveMetadata = true;
      }
    }
  }

  async readMessagesFromDB_parallel(emails: EMail[]) {
    let needEmails = emails.filter((email: any) => !email.haveMetadata);
    if (!needEmails.length) {
      return;
    }
    let wait = new PromiseAllDone();
    for (let email of needEmails) {
      if (email.dbID) {
        wait.add((async () => {
          await email.storage.readMessage(email);
          (email as any).haveMetadata = true;
        })());
      }
    }
    await wait.wait();
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
