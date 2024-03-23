import { Account } from "../Abstract/Account";
import { Folder } from "./Folder";
import type { EMail } from "./EMail";
import type { Person } from "../Abstract/Person";
import { AbstractFunction } from "../util/util";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from 'svelte-collections';

export class MailAccount extends Account {
  readonly protocol: string = "mail";
  @notifyChangedProperty
  url: string | null = null; /** only for some account types */
  @notifyChangedProperty
  hostname: string | null = null; /** only for some account types */
  @notifyChangedProperty
  port: number | null = null;
  @notifyChangedProperty
  tls = TLSSocketType.Unknown;
  @notifyChangedProperty
  username: string;
  @notifyChangedProperty
  password: string | null = null;
  @notifyChangedProperty
  authMethod = AuthMethod.Unknown;
  /** SMTP server
   * Null for JMAP, Exchange etc. */
  @notifyChangedProperty
  outgoing: MailAccount & OutgoingMailAccount = null;
  /** Where we got the config from, during setup */
  source: "ispdb" | "autoconfig-isp" | "autodiscover-xml" | "autodiscover-json" | "guess" | null = null;

  dbID: number | null = null;

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

  async listFolders(): Promise<void> {
    throw new AbstractFunction();
  }

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

  newFolder(): Folder {
    return new Folder(this);
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

export enum AuthMethod {
  Unknown = 0,
  Password = 1,
  OAuth2 = 2,
  GSSAPI = 3,
  CRAMMD5 = 5,
  NTLM = 6,
}

export interface OutgoingMailAccount {
  send(email: EMail): Promise<void>;
}
