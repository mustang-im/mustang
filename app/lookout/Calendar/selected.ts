import type { Event } from "../../logic/Calendar/Event";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { WorkingHours } from "./View/WorkingHours";
import { shownCalendars } from "../../frontend/Calendar/selected";
import { ShownWorkHours } from "../../frontend/Calendar/ShownWorkHours";
import { k1MinuteMS } from "../../frontend/Util/date";
import { readable, writable } from "svelte/store";

export type CalendarViewType = "day" | "workweek" | "week" | "month" | "schedule" | "dual";

export enum CalendarCurrentView {
  Calendar = "calendar",
  Preview = "preview",
  List = "list",
  Active = "active",
}

export enum CalendarFolderPane {
  Normal = "normal",
  Minimized = "minimized",
  Off = "off",
}

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
// <copied from="../../frontend/Calendar/CurrentTimeMarker.svelte">
export const now = readable(new Date(), set => {
  let timeout: ReturnType<typeof setTimeout>;
  function update() {
    let time = new Date();
    timeout = setTimeout(update, k1MinuteMS - time.getSeconds() * 1000 - time.getMilliseconds());
    time.setSeconds(0, 0);
    set(time);
  }
  update();
  return () => clearTimeout(timeout);
});
// </copied>
export const workWeekHours = WorkingHours.ofAll(new ShownWorkHours(
  shownCalendars.filterObservable(calendar => !calendar.isOtherPersonsCalendar)));

export interface CalendarMenus {
  openEventMenu(mouseEvent: MouseEvent, event: Event): void;
  openSlotMenu(mouseEvent: MouseEvent, slots: SlotSelection): void;
}
export const kCalendarMenus = "lookout-calendar-menus";
