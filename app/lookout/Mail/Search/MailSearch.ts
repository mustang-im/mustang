import type { Folder } from "../../../logic/Mail/Folder";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import type { Tag } from "../../../logic/Abstract/Tag";
import type { Person } from "../../../logic/Abstract/Person";
import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
import { newServerSearchEMail } from "../../../logic/Mail/Store/setStorage";
import { AllFolders } from "../../../logic/Mail/Virtual/AllFolders";
import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
import { appGlobal } from "../../../logic/app";
import { SizeRange, SizeRanges } from "./SearchRanges";
import { gt } from "../../../l10n/l10n";

export enum SearchScope {
  AllAccounts = "all",
  CurrentAccount = "account",
  CurrentFolder = "folder",
}

export interface SearchOptions {
  scope: SearchScope;
  person: Person | null;
  isOutgoing: boolean | null;
  isRead: boolean | null;
  hasAttachment: boolean;
  flagged: boolean;
  replied: boolean;
  tags: Tag[];
  size: SizeRange;
  threadID: string | null;
}

export class MailSearch {
  static readonly kLimit = 200;

  static defaultOptions(): SearchOptions {
    return {
      scope: SearchScope.CurrentAccount,
      person: null,
      isOutgoing: null,
      isRead: null,
      hasAttachment: false,
      flagged: false,
      replied: false,
      tags: [],
      size: SizeRange.Any,
      threadID: null,
    };
  }

  static hasRefiners(options: SearchOptions): boolean {
    return !!options.person ||
      options.isOutgoing != null ||
      options.isRead != null ||
      options.hasAttachment ||
      options.flagged ||
      options.replied ||
      options.tags.length > 0 ||
      options.size != SizeRange.Any ||
      !!options.threadID;
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

  static scopeLabel(scope: SearchScope): string {
    switch (scope) {
      case SearchScope.AllAccounts: return gt`All Accounts`;
      case SearchScope.CurrentAccount: return gt`Current Account`;
      case SearchScope.CurrentFolder: return gt`Current Folder`;
    }
  }

  static scopeShortLabel(scope: SearchScope): string {
    switch (scope) {
      case SearchScope.AllAccounts: return gt`All *=> All accounts`;
      case SearchScope.CurrentAccount: return gt`Account *=> Current account`;
      case SearchScope.CurrentFolder: return gt`Folder *=> Current folder`;
    }
  }

  static newSearch(term: string | null, options: SearchOptions, account: MailAccount | null, folder: Folder | null): SearchEMail {
    let search = newServerSearchEMail();
    search.bodyText = term;
    let scope = MailSearch.effectiveScope(options, account, folder);
    if (scope == SearchScope.CurrentFolder) {
      search.folder = folder;
    } else if (scope == SearchScope.CurrentAccount) {
      search.account = MailSearch.isRealFolder(folder) ? folder.account : account;
    }
    search.includesPerson = options.person;
    search.isOutgoing = options.isOutgoing;
    search.isRead = options.isRead;
    if (options.hasAttachment) {
      search.hasAttachment = true;
    }
    if (options.flagged) {
      search.isStarred = true;
    }
    if (options.replied) {
      search.isReplied = true;
    }
    for (let tag of options.tags) {
      search.tags.add(tag);
    }
    let sizes = SizeRanges.bytes(options.size);
    search.sizeMin = sizes.min;
    search.sizeMax = sizes.max;
    search.threadID = options.threadID;
    return search;
  }
}
