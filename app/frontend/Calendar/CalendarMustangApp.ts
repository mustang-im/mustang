import { MustangApp } from "../AppsBar/MustangApp";
import { openApp } from "../AppsBar/selectedApp";
import type { Event } from "../../logic/Calendar/Event";
import CalendarApp from "../Calendar/CalendarApp.svelte";
import EditEvent from "./EditEvent/EditEvent.svelte";
import CalendarIcon from "../Calendar/CalendarIcon.svelte";
import EventEditIcon from "lucide-svelte/icons/pencil";

export class CalendarMustangApp extends MustangApp {
  id = "calendar";
  name = "Calendar";
  icon = CalendarIcon;
  mainWindow = CalendarApp;

  editEvent(event: Event) {
    let edit = new EventEditMustangApp();
    edit.mainWindowProperties = {
      event: event,
    };
    calendarMustangApp.subApps.add(edit);
    openApp(edit);
  }
}

export class EventEditMustangApp extends MustangApp {
  id = "calendar-event-edit";
  name = "Event";
  icon = EventEditIcon;
  mainWindow = EditEvent;
}

export const calendarMustangApp = new CalendarMustangApp();
