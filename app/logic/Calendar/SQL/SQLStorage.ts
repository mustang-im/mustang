import type { Calendar, CalendarStorage } from "../Calendar";
import { SQLCalendar } from "../SQL/SQLCalendar";
import type { Event } from "../Event";
import { SQLEvent } from "./SQLEvent";

export class SQLStorage implements CalendarStorage {
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
}