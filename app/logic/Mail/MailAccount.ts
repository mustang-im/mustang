import { TCPAccount } from "../Abstract/TCPAccount";
import { MailIdentity } from "./MailIdentity";
import { Folder, SpecialFolder } from "./Folder";
import type { EMail } from "./EMail";
import type { SMTPAccount } from "./SMTP/SMTPAccount";
import { ContactEntry } from "../Abstract/Person";
import { FilterRuleAction } from "./FilterRules/FilterRuleAction";
import { OAuth2 } from "../Auth/OAuth2";
import { appGlobal } from "../app";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { AbstractFunction, type URLString } from "../util/util";
import { notifyChangedProperty } from "../util/Observable";
import { Collection, ArrayColl } from 'svelte-collections';

export class MailAccount extends TCPAccount {
  readonly protocol: string = "mail";
  readonly canSendInvitations: boolean = true;
  /** SMTP server
   * Only set for IMAP and POP3, but null for JMAP, Exchange etc. */
  @notifyChangedProperty
  _outgoing: SMTPAccount = null;
  spamStrategy: DeleteStrategy = DeleteStrategy.MoveToTrash;
  protected _inbox: Folder;
  /** Where we got the config from, during setup */
  source: ConfigSource = null;
  storage: MailAccountStorage;
  /** Ways to store email content in RFC822 format. First storage will be used for reading. */
  contentStorage = new ArrayColl<MailContentStorage>();

  @notifyChangedProperty
  emailAddress: string;
  @notifyChangedProperty
  readonly identities = new ArrayColl<MailIdentity>();
  @notifyChangedProperty
  readonly filterRuleActions = new ArrayColl<FilterRuleAction>();
  /** Only for setup. We know a config, but the user needs to do some manual steps for this ISP */
  setupInstructions: SetupInstruction[] | null = null;

  readonly rootFolders: Collection<Folder> = new ArrayColl<Folder>();

  async listFolders(): Promise<void> {
    throw new AbstractFunction();
  }

  getAllFolders(): ArrayColl<Folder> {
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

  get inbox(): Folder | null {
    return this._inbox ??
      (this._inbox = this.getSpecialFolder(SpecialFolder.Inbox)) ??
      this.rootFolders.first;
  }

  get outgoing(): SMTPAccount {
    return this._outgoing;
  }
  set outgoing(smtp: SMTPAccount) {
    this._outgoing = smtp;
    if (smtp && smtp.mainAccount != this) {
      smtp.mainAccount = this;
    }
  }

  async send(email: EMail): Promise<void> {
    throw new AbstractFunction();
  }

  /** Create a folder on the top level, sibling of Inbox.
   * @see Folder.createSubFolder() */
  async createToplevelFolder(name: string): Promise<Folder> {
    let folder = this.newFolder();
    folder.name = name;
    folder.parent = null;
    this.rootFolders.add(folder);
    return folder;
  }

  newFolder(): Folder {
    return new Folder(this);
  }

  newEMailFrom(): EMail {
    let folder = this.getSpecialFolder(SpecialFolder.Sent);
    let email = folder.newEMail();
    email.compose.generateMessageID();
    email.needToLoadBody = false;
    email.from.emailAddress = this.emailAddress;
    email.from.name = this.realname;
    return email;
  }

  async save(): Promise<void> {
    console.log("mail account save", this.protocol, this.name, this, "outgoing", this.outgoing, "mainaccount", this.mainAccount, "storage", this.storage);
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteAccount(this);
    appGlobal.emailAccounts.remove(this);
  }

  isMyEMailAddress(emailAddress: string): boolean {
    return this.emailAddress == emailAddress ||
      this.identities.some(id => id.isEMailAddress(emailAddress));
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

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.emailAddress = sanitize.emailAddress(json.emailAddress);
    this.identities.clear();
    this.identities.addAll(sanitize.array(json.identities, []).map(json =>
      MailIdentity.fromConfigJSON(json, this)));
    this.filterRuleActions.clear();
    this.filterRuleActions.addAll(sanitize.array(json.filterRuleActions, []).map(json => {
      try {
        let rule = new FilterRuleAction(this);
        rule.fromJSON(json);
        return rule;
      } catch (ex) {
        this.errorCallback(ex);
        return null;
      }
    }).filter(rule => !!rule));
    if (json.oAuth2) {
      this.oAuth2 = OAuth2.fromConfigJSON(json.oAuth2, this);
      this.oAuth2.subscribe(() => this.notifyObservers());
    }

    if (!appGlobal.me.name && this.realname) {
      appGlobal.me.name = this.realname;
    }
    if (!appGlobal.me.emailAddresses.find(c => c.value == this.emailAddress)) {
      appGlobal.me.emailAddresses.add(new ContactEntry(this.emailAddress, "account"));
    }
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.identities = this.identities.contents.map(id => id.toConfigJSON());
    json.filterRuleActions = this.filterRuleActions.contents.map(rule => rule.toJSON());
    json.oAuth2 = this.oAuth2 ? this.oAuth2.toConfigJSON() : undefined;
    json.emailAddress = this.emailAddress;
    return json;
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
    this.realname = other.realname;

    // objects
    this.oAuth2 = other.oAuth2;
    this.identities.addAll(other.identities);
  }

  toDebugString() {
    return `${this.protocol.toUpperCase()} account, name ${this.name}, ID ${this.id}, host ${this.hostname}:${this.port}, URL ${this.url}, username ${this.username}, email ${this.emailAddress}`;
  }

  toString(): string {
    return this.toDebugString();
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

export type ConfigSource = "ispdb" | "autoconfig-isp" | "autodiscover-xml" | "autodiscover-json" | "guess" | "manual" | "local" | null;

export interface MailAccountStorage {
  saveAccount(account: MailAccount): Promise<void>;
  deleteAccount(account: MailAccount): Promise<void>;
  readFolderHierarchy(account: MailAccount): Promise<void>;
  saveFolder(folder: Folder): Promise<void>;
  saveFolderProperties(folder: Folder): Promise<void>;
  deleteFolder(folder: Folder): Promise<void>;
  readMessage(email: EMail): Promise<void>;
  readMessageWritableProps(email: EMail): Promise<void>;
  readMessageBody(email: EMail): Promise<void>;
  saveMessage(email: EMail): Promise<void>;
  saveMessages(emails: Collection<EMail>): Promise<void>;
  saveMessageWritableProps(email: EMail): Promise<void>;
  saveMessageTags(email: EMail): Promise<void>;
  deleteMessage(email: EMail): Promise<void>;
  readAllMessages(folder: Folder, limit?: number, startWith?: number): Promise<void>;
  readAllMessagesMainProperties(folder: Folder, limit?: number, startWith?: number): Promise<void>;
}

export interface MailContentStorage {
  save(email: EMail): Promise<void>;
  read(email: EMail): Promise<void>;
  deleteIt(email: EMail): Promise<void>;
}

export enum DeleteStrategy {
  DeleteImmediately = 1,
  Flag = 1,
  MoveToTrash = 3,
}

export class SetupInstruction {
  instruction: string | null;
  url: URLString | null;
  enterPassword: boolean = false;
  enterUsername: boolean = false;
}
