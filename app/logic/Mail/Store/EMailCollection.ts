import { ArrayColl } from 'svelte-collections';
import { PromiseAllDone } from '../../util/PromiseAllDone';
import type { EMail } from '../EMail';
import type { Folder } from '../Folder';

export class EMailCollection<T extends EMail> extends ArrayColl<T> {
  folder: Folder;

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

  sortBy(sortFunc: any) {
    return this;
  }
}
