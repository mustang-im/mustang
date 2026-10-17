import type { Event } from "../../logic/Calendar/Event";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { WorkingHours } from "./View/WorkingHours";
import { shownCalendars } from "../../frontend/Calendar/selected";
import { ShownWorkHours } from "../../frontend/Calendar/ShownWorkHours";
import { writable } from "svelte/store";

export interface SlotSelection {
  start: Date;
  end: Date;
  allDay: boolean;
  calendar: Calendar | null;
}

export interface EventPeek {
  event: Event;
  anchor: HTMLElement;
}

export const selectedSlots = writable<SlotSelection | null>(null);
export const eventPeek = writable<EventPeek | null>(null);
export const inlineTitle = writable<string | null>(null);
export const workWeekHours = WorkingHours.ofAll(new ShownWorkHours(
  shownCalendars.filterObservable(calendar => !calendar.isOtherPersonsCalendar)));

export interface CalendarMenus {
  openEventMenu(mouseEvent: MouseEvent, event: Event): void;
  openSlotMenu(mouseEvent: MouseEvent, slots: SlotSelection): void;
}
export const kCalendarMenus = "lookout-calendar-menus";
