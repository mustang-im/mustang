import type { Event } from "../../../logic/Calendar/Event";
import type { Calendar } from "../../../logic/Calendar/Calendar";
import { EventTable } from "./EventTable";
import { CalendarSearch, CalendarSearchScope, type CalendarSearchOptions } from "./CalendarSearch";
import { shownCalendars } from "../../../frontend/Calendar/selected";
import { appGlobal } from "../../../logic/app";
import { mergeColls, type Collection } from "svelte-collections";

export class EventLists {
  static readonly shown: Collection<Event> =
    mergeColls(shownCalendars.map(calendar => calendar.events)).filterObservable(event => EventTable.isListed(event));
  static readonly all: Collection<Event> =
    mergeColls(appGlobal.calendars.map(calendar => calendar.events)).filterObservable(event => EventTable.isListed(event));

  static active(): Collection<Event> {
    return EventLists.shown.filterObservable(event => event.isUpcoming());
  }

  static searchResults(term: string, options: CalendarSearchOptions, selectedCalendar: Calendar | null): Collection<Event> {
    let scope = options.scope == CalendarSearchScope.CurrentFolder && selectedCalendar
      ? selectedCalendar.events.filterObservable(event => EventTable.isListed(event))
      : EventLists.all;
    return scope.filterObservable(event => CalendarSearch.matches(event, term, options));
  }
}
