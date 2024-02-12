import { MustangApp } from "../AppsBar/MustangApp";
import CalendarApp from "../Calendar/CalendarApp.svelte";
import CalendarIcon from "../Calendar/CalendarIcon.svelte";

export class CalendarMustangApp extends MustangApp {
  id = "calendar";
  name = "Calendar";
  icon = CalendarIcon;
  mainWindow = CalendarApp;
}

export const calendarMustangApp = new CalendarMustangApp();
