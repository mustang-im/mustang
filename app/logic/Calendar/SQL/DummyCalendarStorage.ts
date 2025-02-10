import type { Calendar, CalendarStorage } from "../Calendar";
import type { Event } from "../Event";
import { ArrayColl, type Collection } from "svelte-collections";

export class DummyCalendarStorage implements CalendarStorage {
  async deleteCalendar(calendar: Calendar): Promise<void> {
  }
  async saveCalendar(calendar: Calendar): Promise<void> {
  }
  async saveEvent(event: Event): Promise<void> {
  }
  async deleteEvent(event: Event): Promise<void> {
  }
  static async readCalendars(): Promise<Collection<Calendar>> {
    return new ArrayColl<Calendar>();
  }
}
