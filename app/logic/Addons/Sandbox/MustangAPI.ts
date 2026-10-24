import type { ChatAccount, EMail, HookPoints, MailAccount } from "../API/addon-api";
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
  message?: EMail;
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
  register(id: string, implementation: AddonProtocol): void;
  newMessages(accountID: string, folderID: string): void;
}

export interface AddonProtocol {
  [operation: string]: (...args: any[]) => Promise<any>;
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
