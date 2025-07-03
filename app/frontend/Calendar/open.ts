import type { Event } from "../../logic/Calendar/Event";
import { selectedDate, selectedEvent, startDate } from "../Calendar/selected";
import { openApp } from "../AppsBar/selectedApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";

export function openEventFromOtherApp(event: Event) {
  selectedEvent.set(event);
  // if full screen: calendarMustangApp.editEvent(event);
  selectedDate.set(new Date(event.startTime));
  startDate.set(new Date(event.startTime));
  openApp(calendarMustangApp);
}
