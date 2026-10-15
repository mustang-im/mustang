import type { Folder } from "../../../logic/Mail/Folder";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import type { Tag } from "../../../logic/Abstract/Tag";
import type { Person } from "../../../logic/Abstract/Person";
import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
import { newServerSearchEMail } from "../../../logic/Mail/Store/setStorage";
import { AllFolders } from "../../../logic/Mail/Virtual/AllFolders";
import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
import { appGlobal } from "../../../logic/app";
import { get, writable } from "svelte/store";

export enum SearchScope {
  AllAccounts = "all",
  CurrentAccount = "account",
  CurrentFolder = "folder",
}

export interface SearchOptions {
  scope: SearchScope;
  hasAttachment: boolean;
  unread: boolean;
  flagged: boolean;
  sentByMe: boolean;
  tags: Tag[];
  person: Person | null;
}

export class MailSearch {
  static readonly kLimit = 200;
  static readonly options = writable<SearchOptions>(MailSearch.defaultOptions());

  static defaultOptions(): SearchOptions {
    return {
      scope: SearchScope.CurrentAccount,
      hasAttachment: false,
      unread: false,
      flagged: false,
      sentByMe: false,
      tags: [],
      person: null,
    };
  }

  static current(): SearchOptions {
    return get(MailSearch.options);
  }

  static reset() {
    MailSearch.options.set(MailSearch.defaultOptions());
  }

  static update(change: Partial<SearchOptions>) {
    MailSearch.options.update(options => ({ ...options, ...change }));
  }

  static toggleTag(options: SearchOptions, tag: Tag) {
    MailSearch.update({
      tags: options.tags.includes(tag)
        ? options.tags.filter(existing => existing != tag)
        : [...options.tags, tag],
    });
  }

  static isRealFolder(folder: Folder | null): boolean {
    return !!folder && !(folder instanceof AllFolders) && !(folder instanceof SavedSearchFolder);
  }

  static isRealAccount(account: MailAccount | null): boolean {
    return !!account && appGlobal.emailAccounts.contains(account);
  }

  static isScopeAvailable(scope: SearchScope, account: MailAccount | null, folder: Folder | null): boolean {
    switch (scope) {
      case SearchScope.CurrentFolder:
        return MailSearch.isRealFolder(folder);
      case SearchScope.CurrentAccount:
        return MailSearch.isRealAccount(MailSearch.isRealFolder(folder) ? folder.account : account);
      default:
        return true;
    }
  }

  static effectiveScope(options: SearchOptions, account: MailAccount | null, folder: Folder | null): SearchScope {
    if (MailSearch.isScopeAvailable(options.scope, account, folder)) {
      return options.scope;
    }
    return MailSearch.isScopeAvailable(SearchScope.CurrentAccount, account, folder)
      ? SearchScope.CurrentAccount
      : SearchScope.AllAccounts;
  }

  static newSearch(term: string, options: SearchOptions, account: MailAccount | null, folder: Folder | null): SearchEMail {
    let search = newServerSearchEMail();
    search.bodyText = term;
    let scope = MailSearch.effectiveScope(options, account, folder);
    if (scope == SearchScope.CurrentFolder) {
      search.folder = folder;
    } else if (scope == SearchScope.CurrentAccount) {
      search.account = MailSearch.isRealFolder(folder) ? folder.account : account;
    }
    if (options.hasAttachment) {
      search.hasAttachment = true;
    }
    if (options.unread) {
      search.isRead = false;
    }
    if (options.flagged) {
      search.isStarred = true;
    }
    if (options.sentByMe) {
      search.isOutgoing = true;
    }
    for (let tag of options.tags) {
      search.tags.add(tag);
    }
    if (options.person) {
      search.includesPerson = options.person;
    }
    return search;
  }
}
