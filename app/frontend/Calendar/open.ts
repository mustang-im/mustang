import type { Event } from "../../logic/Calendar/Event";
import { getCalendarSelection } from "../Calendar/selected";
import { getNavigation } from "../AppsBar/selectedApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import type { AppWindow } from "../MainWindow/AppWindow";
import { appGlobal } from "../../logic/app";

// TODO compare openUIFor()
export function openEvent(event: Event, appWindow: AppWindow, edit = true) {
  let { selectedDate, selectedEvent, startDate } = getCalendarSelection(appWindow.mainWindow);
  let { goTo, openApp, bringAppToFront } = getNavigation(appWindow);
  selectedEvent.set(event);
  selectedDate.set(new Date(event.startTime));
  startDate.set(new Date(event.startTime));
  if (appGlobal.isMobile) {
    goTo("/calendar/event", { event });
  } else {
    openApp(calendarMustangApp, { event });
    if (edit) {
      calendarMustangApp.showEvent(event, appWindow);
      event.startEditing();
    }
  }
  if (appWindow.mainWindow != appWindow) {
    bringAppToFront();
  }
}
