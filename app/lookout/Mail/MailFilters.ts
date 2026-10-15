import { quickSearch } from "../../frontend/Mail/Selected";
import { globalSearchTerm } from "../../frontend/AppsBar/selectedApp";
import { MailSearch, SearchScope, type SearchOptions } from "./Search/MailSearch";
import { get } from "svelte/store";

export enum QuickFilter {
  Unread = "unread",
  Flagged = "flagged",
  Attachments = "attachments",
}

export class MailFilters {
  static isSearching(): boolean {
    return MailSearch.hasCriteria(get(globalSearchTerm)?.trim() || null, MailSearch.current());
  }

  static isActive(filter: QuickFilter): boolean {
    if (MailFilters.isSearching()) {
      let options = MailSearch.current();
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
          return MailSearch.update({ isRead: isActive ? null : false });
        case QuickFilter.Flagged:
          return MailSearch.update({ flagged: !isActive });
        case QuickFilter.Attachments:
          return MailSearch.update({ hasAttachment: !isActive });
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

  static hasFilter(): boolean {
    return quickSearch.hasSearch() || MailFilters.isSearching();
  }

  static searchInFolder(change: Partial<SearchOptions>) {
    if (MailFilters.isSearching()) {
      MailSearch.update(change);
      return;
    }
    let carried: Partial<SearchOptions> = {
      isRead: quickSearch.isRead === false ? false : null,
      flagged: quickSearch.isStarred === true,
      hasAttachment: quickSearch.hasAttachment === true,
    };
    quickSearch.reset();
    MailSearch.findRelated({ scope: SearchScope.CurrentFolder, ...carried, ...change });
  }

  static moreFilters() {
    if (!MailFilters.isSearching()) {
      MailFilters.searchInFolder({});
    }
    MailSearch.isAdvancedSearchOpen.set(true);
  }

  static clear() {
    quickSearch.reset();
    if (MailFilters.isSearching()) {
      MailSearch.close();
    }
  }
}
