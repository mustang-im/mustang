import { Account } from "../Abstract/Account";
import type { Folder } from "./Folder";
import type { EMail } from "./EMail";
import type { Person } from "../Abstract/Person";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from 'svelte-collections';

export class MailAccount extends Account {
  readonly protocol = "mail";
  @notifyChangedProperty
  url: string; /** only for some account types */
  @notifyChangedProperty
  hostname: string; /** only for some account types */
  @notifyChangedProperty
  port: number;
  @notifyChangedProperty
  tls = TLSSocketType.Unknown;
  @notifyChangedProperty
  username: string;
  @notifyChangedProperty
  password: string;
  dbID: number;

  @notifyChangedProperty
  emailAddress: string;
  readonly rootFolders = new ArrayColl<Folder>();
  /** List of all messages in all folders,
   * filtered based on the person.
   * TODO move up, across all accounts? */
  readonly messages = new MapColl<Person, EMail>();
  @notifyChangedProperty
  inbox: Folder;
  trash: Folder;
  spam: Folder;
  sent: Folder;
  drafts: Folder;
  archive: Folder;

  getAllFolders() {
    let allFolders = new ArrayColl<Folder>();
    function iterateFolders(folders: ArrayColl<Folder>) {
      allFolders.addAll(folders);
      for (let folder of folders) {
        iterateFolders(folder.subFolders);
      }
    }
    iterateFolders(this.rootFolders);
    return allFolders;
  }
  findFolder(findFunc: (folder: Folder) => boolean): Folder | null {
    return findFolderFromList(this.rootFolders, findFunc);
  }
}

function findFolderFromList(folders: ArrayColl<Folder>, findFunc: (folder: Folder) => boolean): Folder | null {
  for (let folder of folders) {
    if (findFunc(folder)) {
      return folder;
    }
    let sub = findFolderFromList(folder.subFolders, findFunc);
    if (sub) {
      return sub;
    }
  }
  return null;
}

export enum TLSSocketType {
  Unknown = 0,
  Plain = 1,
  TLS = 2,
  STARTTLS = 3,
}
