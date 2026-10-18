import type { Event } from "../../logic/Calendar/Event";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { ShownCalendars } from "./ShownCalendars";
import { AppWindow } from "../MainWindow/AppWindow";
import { appGlobal } from "../../logic/app";
import { mergeColls, type Collection } from "svelte-collections";
import { writable, type Writable } from "svelte/store";

export type DateInterval = 0 | 1 | 2 | 5 | 7 | 31 | 28;

export function getCalendarSelection(appWindow = AppWindow.current()) {
  return appWindow.uiState(createCalendarSelection);
}

function createCalendarSelection() {
  let selectedCalendar = writable<Calendar | null>(null);
  let shownCalendars = new ShownCalendars(appGlobal.calendars, selectedCalendar);
  let shownCalendarEvents: Collection<Event> =
    mergeColls(shownCalendars.map(cal => cal.eventsWithRecurrences)).sortBy(ev => ev.startTime);
  return {
    selectedCalendar,
    /** Which event is highlighted right now. */
    selectedEvent: writable(null) as Writable<Event>,
    selectedDate: writable(new Date()),
    startDate: writable(new Date()),
    shownCalendars,
    shownCalendarEvents,
    isCalendarListOpen: writable(false),
  };
}
