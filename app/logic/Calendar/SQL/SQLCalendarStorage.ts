import type { Calendar, CalendarStorage } from "../Calendar";
import { SQLCalendar } from "./SQLCalendar";
import type { Event } from "../Event";
import { SQLEvent } from "./SQLEvent";
import type { Collection } from "svelte-collections";

export class SQLCalendarStorage implements CalendarStorage {
  async deleteCalendar(calendar: Calendar): Promise<void> {
    await SQLCalendar.deleteIt(calendar);
  }
  async saveCalendar(calendar: Calendar): Promise<void> {
    await SQLCalendar.save(calendar);
  }
  async saveEvent(event: Event): Promise<void> {
    await SQLEvent.save(event);
  }
  async deleteEvent(event: Event): Promise<void> {
    await SQLEvent.deleteIt(event);
  }

  static async readCalendars(): Promise<Collection<Calendar>> {
    return await SQLCalendar.readAll();
  }
}
