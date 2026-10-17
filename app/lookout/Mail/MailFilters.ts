import { quickSearch } from "../../frontend/Mail/Selected";
import { globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
import { MailSearch, SearchScope, type SearchOptions } from "./Search/MailSearch";
import { searchOptions } from "./Selected";
import { get } from "svelte/store";

export enum QuickFilter {
  Unread = "unread",
  Flagged = "flagged",
  Attachments = "attachments",
}

export class MailFilters {
  static isSearching(): boolean {
    return !!get(globalSearchTerm)?.trim() || MailSearch.hasRefiners(get(searchOptions));
  }

  static isActive(filter: QuickFilter): boolean {
    if (MailFilters.isSearching()) {
      let options = get(searchOptions);
      switch (filter) {
        case QuickFilter.Unread: return options.isRead === false;
        case QuickFilter.Flagged: return options.flagged;
        case QuickFilter.Attachments: return options.hasAttachment;
      }
    }
    switch (filter) {
      case QuickFilter.Unread: return quickSearch.isRead === false;
      case QuickFilter.Flagged: return quickSearch.isStarred === true;
      case QuickFilter.Attachments: return quickSearch.hasAttachment === true;
    }
  }

  static toggle(filter: QuickFilter) {
    let isActive = MailFilters.isActive(filter);
    if (MailFilters.isSearching()) {
      switch (filter) {
        case QuickFilter.Unread:
          return searchOptions.update(options => ({ ...options, isRead: isActive ? null : false }));
        case QuickFilter.Flagged:
          return searchOptions.update(options => ({ ...options, flagged: !isActive }));
        case QuickFilter.Attachments:
          return searchOptions.update(options => ({ ...options, hasAttachment: !isActive }));
      }
    }
    switch (filter) {
      case QuickFilter.Unread:
        quickSearch.isRead = isActive ? null : false;
        break;
      case QuickFilter.Flagged:
        quickSearch.isStarred = isActive ? null : true;
        break;
      case QuickFilter.Attachments:
        quickSearch.hasAttachment = isActive ? null : true;
        break;
    }
  }

  static searchInFolder(change: Partial<SearchOptions>) {
    if (MailFilters.isSearching()) {
      searchOptions.update(options => ({ ...options, ...change }));
      return;
    }
    let carried: Partial<SearchOptions> = {
      isRead: quickSearch.isRead === false ? false : null,
      flagged: quickSearch.isStarred === true,
      hasAttachment: quickSearch.hasAttachment === true,
    };
    quickSearch.reset();
    globalSearchTerm.set(null);
    searchOptions.set({ ...MailSearch.defaultOptions(), scope: SearchScope.CurrentFolder, ...carried, ...change });
  }
}
