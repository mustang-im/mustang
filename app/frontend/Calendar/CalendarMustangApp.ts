import { MustangApp } from "../AppsBar/MustangApp";
import { openApp } from "../AppsBar/selectedApp";
import type { Event } from "../../logic/Calendar/Event";
import CalendarApp from "../Calendar/CalendarApp.svelte";
import ShowEvent from "./DisplayEvent/ShowEvent.svelte";
import CalendarIcon from "../Calendar/CalendarIcon.svelte";
import EditIcon from "lucide-svelte/icons/pencil";
import { derived } from "svelte/store";
import { gt } from "../../l10n/l10n";

export class CalendarMustangApp extends MustangApp {
  id = "calendar";
  name = gt`Calendar`;
  icon = CalendarIcon;
  mainWindow = CalendarApp;

  showEvent(event: Event) {
    let edit = new CalendarEventMustangApp();
    edit.title = derived(event, event => event.title ?? edit.name);
    edit.mainWindowProperties = {
      event: event,
    };
    calendarMustangApp.subApps.add(edit);
    openApp(edit);
  }
}

export class CalendarEventMustangApp extends MustangApp {
  id = "calendar-event-show";
  name = gt`Event`;
  icon = EditIcon;
  mainWindow = ShowEvent;
}

export const calendarMustangApp = new CalendarMustangApp();
