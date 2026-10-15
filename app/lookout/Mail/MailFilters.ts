import { quickSearch } from "../../frontend/Mail/Selected";

export enum QuickFilter {
  Unread = "unread",
  Flagged = "flagged",
  Attachments = "attachments",
}

export class MailFilters {
  static isActive(filter: QuickFilter): boolean {
    switch (filter) {
      case QuickFilter.Unread: return quickSearch.isRead === false;
      case QuickFilter.Flagged: return quickSearch.isStarred === true;
      case QuickFilter.Attachments: return quickSearch.hasAttachment === true;
    }
  }

  static toggle(filter: QuickFilter) {
    let isActive = MailFilters.isActive(filter);
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

  static clear() {
    quickSearch.reset();
  }
}
