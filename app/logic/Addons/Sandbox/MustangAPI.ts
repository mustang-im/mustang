import type { ChatAccount, EMail, HookPoints, MailAccount, SpecialFolder } from "../API/addon-api";
import type { Collection } from "svelte-collections";

export interface MustangAPI {
  readonly addon: AddonInfo;
  readonly ui: AddonUI;
  /** Needs the permission `mail.all` */
  readonly mail: { readonly accounts: Collection<MailAccount> };
  /** Needs the permission `chat.all` */
  readonly chat: { readonly accounts: Collection<ChatAccount> };
  readonly hooks: AddonHooks;
  readonly protocols: AddonProtocols;
  readonly storage: AddonStorage;
  /** Waits until a collection of app objects has all its items.
   * Collections in arguments and results come with their items. The collections of those items load when read, in the background. */
  loaded(collection: Collection<any>): Promise<void>;
}

export interface AddonInfo {
  readonly name: string;
  readonly version: string;
}

export interface AddonUI {
  onCommand(command: string, handler: (event: CommandEvent) => void | Promise<void>): void;
  /** In UI frames */
  readonly context: Subscribable<UIContext>;
}

export interface CommandEvent {
  /** From `message-toolbar` and `message-menu` */
  messages?: EMail[];
  /** From `composer-toolbar` */
  draft?: EMail;
}

export interface UIContext {
  /** In `message-panel` */
  message?: EMail;
  /** In a popup of `message-toolbar` and `message-menu` */
  messages?: EMail[];
  /** In a popup of `composer-toolbar` */
  draft?: EMail;
  theme: { dark: boolean };
}

export interface AddonHooks {
  /** Return `{ cancel }` to stop the app function, with this reason for the user. */
  before<P extends keyof HookPoints>(point: P, hook: (args: HookPoints[P]["args"]) => Promise<HookCancel | void> | HookCancel | void): void;
  /** Runs after the app function succeeded, with read-only arguments. */
  after<P extends keyof HookPoints>(point: P, hook: (args: HookPoints[P]["args"], result: HookPoints[P]["result"]) => void): void;
}

export interface HookCancel {
  cancel: string;
}

export interface AddonProtocols {
  /** In the main code: Implements the protocol with this `id` from `mustang.protocols` in the manifest */
  register(id: string, implementation: MailProtocol): void;
  /** In the main code: The server has new messages in this folder, e.g. from a push notification.
   * The app then calls `listMessages()` for the folder. */
  newMessages(accountID: string, folderID: string): void;
  /** In the `setup` UI of a protocol: The account as the user entered it so far.
   * When the user continues, the app checks the login with the last values and creates the account. */
  setupAccount(account: AccountSetup): void;
}

/** From the `setup` UI. At most 10 KB together. */
export interface AccountSetup {
  /** Shown to the user, e.g. "Work" */
  name: string;
  username: string;
  /** The app stores it in its password storage. Only the protocol's `login()` gets it. */
  password?: string;
  /** https */
  serverURL?: string;
  /** Anything else that the protocol needs for this account */
  extra?: JSONValue;
}

/** The account, as the protocol operations get it */
export interface AccountData {
  /** For `mustang.protocols.newMessages()` */
  id: string;
  name: string;
  emailAddress: string;
  username: string;
  serverURL: string | null;
  extra: JSONValue | null;
}

/** A mail protocol, implemented by the addon. IDs are those of the server.
 * Every operation gets the account as first argument. Errors reach the user with their message. */
export interface MailProtocol {
  /** Before any other operation of this account. Also after the addon restarted. */
  login(account: AccountData, password: string | null): Promise<void>;
  listFolders(account: AccountData): Promise<FolderData[]>;
  /** The new, changed and removed messages since `syncState`, at most 1,000 per call.
   * The app calls again with the returned `syncState`, while `hasMore` is true.
   * @param syncState null = list all messages; else the `syncState` of the last call */
  listMessages(account: AccountData, folderID: string, syncState: string | null): Promise<MessageList>;
  /** @returns The complete messages in RFC 5322 format, at most 50 MB each */
  downloadMessages(account: AccountData, folderID: string, ids: string[]): Promise<{ id: string, mime: Uint8Array }[]>;
  /** Sets only the given flags */
  setFlags(account: AccountData, folderID: string, ids: string[], flags: MessageFlags): Promise<void>;
  moveMessages(account: AccountData, folderID: string, ids: string[], targetFolderID: string): Promise<void>;
  copyMessages(account: AccountData, folderID: string, ids: string[], targetFolderID: string): Promise<void>;
  deleteMessages(account: AccountData, folderID: string, ids: string[]): Promise<void>;
  /** @param parentID null = top level */
  createFolder(account: AccountData, parentID: string | null, name: string): Promise<FolderData>;
  renameFolder(account: AccountData, folderID: string, name: string): Promise<void>;
  /** Also deletes its messages and subfolders */
  deleteFolder(account: AccountData, folderID: string): Promise<void>;
  /** @param mime The complete message, made by the app, without Bcc header
   * @param from The envelope sender
   * @param recipients The envelope recipients, including Bcc */
  send(account: AccountData, mime: Uint8Array, from: string, recipients: string[]): Promise<void>;
}

export interface FolderData {
  id: string;
  name: string;
  /** null or missing = top level */
  parentID?: string | null;
  specialFolder?: SpecialFolder;
  countTotal?: number;
  countUnread?: number;
}

export interface MessageList {
  /** New and changed messages */
  messages: MessageData[];
  /** IDs of messages that are no longer in the folder */
  removed?: string[];
  /** Opaque for the app, at most 10 KB. The app stores it with the folder. */
  syncState: string;
  /** There are more changes. The app calls again with `syncState`. */
  hasMore?: boolean;
}

export interface MessageData extends MessageFlags {
  id: string;
  /** The `Message-ID` header, without <> */
  messageID?: string;
  subject?: string;
  from?: PersonData;
  to?: PersonData[];
  cc?: PersonData[];
  bcc?: PersonData[];
  replyTo?: PersonData;
  /** The `Message-ID` of the message that this one answers */
  inReplyTo?: string;
  /** A Date, an ISO 8601 string, or ms since 1970 */
  sent?: Date | string | number;
  received?: Date | string | number;
  /** Of the complete message, in bytes */
  size?: number;
}

export interface PersonData {
  name?: string;
  emailAddress: string;
}

export interface MessageFlags {
  isRead?: boolean;
  isStarred?: boolean;
  isReplied?: boolean;
  isForwarded?: boolean;
  isDraft?: boolean;
  isSpam?: boolean;
  isImportant?: boolean;
}

export interface AddonStorage {
  get(key: string): Promise<JSONValue | undefined>;
  set(key: string, value: JSONValue): Promise<void>;
  remove(key: string): Promise<void>;
}

export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export interface AddonObject {
  subscribe(run: (value: this) => void): () => void;
  /** Lets the app forget this object. Reading it afterwards fails. */
  release(): void;
}

export interface Subscribable<T> {
  subscribe(run: (value: T) => void): () => void;
}
