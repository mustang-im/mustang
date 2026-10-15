import type { Event } from "../../../logic/Calendar/Event";
import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { globalSearchTerm } from "../../../frontend/AppsBar/selectedApp";
import { writable } from "svelte/store";

export enum CalendarSearchScope {
  CurrentFolder = "current",
  AllCalendarItems = "all",
}

export interface CalendarSearchOptions {
  scope: CalendarSearchScope;
  isRecurring: boolean;
  hasAttachments: boolean;
  organizerEMail: string | null;
}

export class CalendarSearch {
  static readonly options = writable<CalendarSearchOptions>(CalendarSearch.defaultOptions(CalendarSearchScope.AllCalendarItems));

  static defaultOptions(scope: CalendarSearchScope): CalendarSearchOptions {
    return {
      scope,
      isRecurring: false,
      hasAttachments: false,
      organizerEMail: null,
    };
  }

  static update(change: Partial<CalendarSearchOptions>) {
    CalendarSearch.options.update(options => ({ ...options, ...change }));
  }

  static close() {
    globalSearchTerm.set(null);
    CalendarSearch.options.update(options => CalendarSearch.defaultOptions(options.scope));
  }

  static matches(event: Event, term: string, options: CalendarSearchOptions): boolean {
    return event.matchesSearch(term.trim().toLowerCase()) &&
      (!options.isRecurring || !!event.recurrenceRule) &&
      (!options.hasAttachments || event.attachments.hasItems) &&
      (!options.organizerEMail || event.organizer?.emailAddress == options.organizerEMail);
  }

  static organizers(events: Event[]): PersonUID[] {
    let byEMail = new Map<string, PersonUID>();
    for (let event of events) {
      let organizer = event.organizer;
      if (organizer?.emailAddress && !byEMail.has(organizer.emailAddress)) {
        byEMail.set(organizer.emailAddress, organizer);
      }
    }
    return [...byEMail.values()].sort((a, b) => (a.name ?? a.emailAddress).localeCompare(b.name ?? b.emailAddress));
  }
}
