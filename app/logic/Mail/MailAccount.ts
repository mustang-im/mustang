import { Account } from "../Abstract/Account";
import { MailIdentity } from "./MailIdentity";
import { Folder, SpecialFolder } from "./Folder";
import type { EMail } from "./EMail";
import type { Person } from "../Abstract/Person";
import { OAuth2 } from "../Auth/OAuth2";
import { appGlobal } from "../app";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { AbstractFunction, assert } from "../util/util";
import { notifyChangedProperty } from "../util/Observable";
import { Collection, ArrayColl, MapColl } from 'svelte-collections';

export class MailAccount extends Account {
  readonly protocol: string = "mail";
  @notifyChangedProperty
  hostname: string | null = null; /** only for some account types */
  @notifyChangedProperty
  port: number | null = null;
  @notifyChangedProperty
  tls = TLSSocketType.Unknown;
  @notifyChangedProperty
  authMethod = AuthMethod.Unknown;
  @notifyChangedProperty
  oAuth2: OAuth2 = null;
  /** SMTP server
   * Only set for IMAP and POP3. null for JMAP, Exchange etc. */
  @notifyChangedProperty
  outgoing: MailAccount = null;
  /** Error that broke the server connection, unrecoverable, including login failures. */
  fatalError: Error = null;
  /** Where we got the config from, during setup */
  source: ConfigSource = null;
  storage: MailAccountStorage;

  @notifyChangedProperty
  emailAddress: string;
  @notifyChangedProperty
  readonly identities = new ArrayColl<MailIdentity>();

  readonly rootFolders: Collection<Folder> = new ArrayColl<Folder>();
  /** List of all messages in all folders,
   * filtered based on the person.
   * TODO move up, across all accounts? */
  readonly messages = new MapColl<Person, EMail>();

  async listFolders(): Promise<void> {
    throw new AbstractFunction();
  }

  getAllFolders() {
    let allFolders = new ArrayColl<Folder>();
    function iterateFolders(folders: Collection<Folder>) {
      allFolders.addAll(folders);
      for (let folder of folders) {
        iterateFolders(folder.subFolders);
      }
    }
    iterateFolders(this.rootFolders);
    return allFolders;
  }
  findFolder(findFunc: (folder: Folder) => boolean): Folder | null {
    return findSubFolderFromList(this.rootFolders, findFunc);
  }
  getFolderByPath(path: string): Folder | null {
    return this.findFolder(folder => folder.path == path);
  }

  get inbox(): Folder | null {
    return this.getSpecialFolder(SpecialFolder.Inbox) ?? this.rootFolders.first;
  }

  async send(email: EMail): Promise<void> {
    throw new AbstractFunction();
  };

  newFolder(): Folder {
    return new Folder(this);
  }

  newEMailFrom(): EMail {
    let folder = this.getSpecialFolder(SpecialFolder.Drafts);
    let email = folder.newEMail();
    email.needToLoadBody = false;
    email.from.emailAddress = this.emailAddress;
    email.from.name = this.userRealname;
    return email;
  }

  async save(): Promise<void> {
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    if (this.outgoing) {
      await this.storage?.deleteAccount(this.outgoing);
    }
    await this.storage?.deleteAccount(this);
    appGlobal.emailAccounts.remove(this);
  }

  isEMailAddress(emailAddress: string): boolean {
    return this.emailAddress == emailAddress ||
      this.identities.some(id => id.emailAddress == emailAddress);
  }

  fromConfigJSON(config: any) {
    assert(typeof (config) == "object", "Config must be a JSON object");
    this.identities.clear();
    this.identities.addAll(sanitize.array(config.identities, []).map(json =>
      MailIdentity.fromConfigJSON(json, this)));
    if (config.oAuth2) {
      this.oAuth2 = OAuth2.fromConfigJSON(config.oAuth2, this);
      this.oAuth2.setPassword(this.password);
      this.oAuth2.username = this.username ?? this.emailAddress;
      this.oAuth2.subscribe(() => this.notifyObservers());
    }
  }
  toConfigJSON(): any {
    return {
      identities: this.identities.contents.map(id => id.toConfigJSON()),
      oAuth2: this.oAuth2 ? this.oAuth2.toConfigJSON() : undefined,
    };
  }

  /** Get the `specialFolder` in this account. */
  getSpecialFolder(specialFolder: SpecialFolder): Folder {
    let folder = this.getAllFolders().find(folder => folder.specialFolder == specialFolder);
    if (folder) {
      return folder;
    }
    if (specialFolder == SpecialFolder.Sent) {
      return this.getSpecialFolder(SpecialFolder.Inbox);
    }
    if (specialFolder == SpecialFolder.Drafts) {
      return this.getSpecialFolder(SpecialFolder.Sent);
    }
    return this.rootFolders.first;
  }

  /** Fills this object with the config values from the other config */
  cloneFrom(other: MailAccount) {
    this.url = other.url;
    this.hostname = other.hostname;
    this.port = other.port;
    this.tls = other.tls;
    this.authMethod = other.authMethod;
    this.username = other.username;
    this.emailAddress = other.emailAddress;
    this.userRealname = other.userRealname;

    // objects
    this.oAuth2 = other.oAuth2;
    this.identities.addAll(other.identities);
    this.outgoing = other.outgoing;
  }

  toDebugString() {
    return `${this.protocol.toUpperCase()} account, id ${this.id}, host ${this.hostname}:${this.port}, username ${this.username}, url ${this.url}`;
  }
}

function findSubFolderFromList(folders: Collection<Folder>, findFunc: (folder: Folder) => boolean): Folder | null {
  for (let folder of folders) {
    if (findFunc(folder)) {
      return folder;
    }
    let sub = findSubFolderFromList(folder.subFolders, findFunc);
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

export type ConfigSource = "ispdb" | "autoconfig-isp" | "autodiscover-xml" | "autodiscover-json" | "guess" | "manual" | null;

export interface MailAccountStorage {
  saveMessage(email: EMail): Promise<void>;
  saveFolder(folder: Folder): Promise<void>;
  saveAccount(account: MailAccount): Promise<void>;
  deleteAccount(account: MailAccount): Promise<void>;
}
