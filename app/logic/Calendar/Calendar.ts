import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import { appGlobal } from "../app";
import { ArrayColl } from "svelte-collections";

export class Calendar extends Account {
  readonly protocol = "calendar-local";
  readonly events = new ArrayColl<Event>();
  storage: CalendarStorage | null = null;

  newEvent(): Event {
    return new Event(this);
  }

  async save(): Promise<void> {
    await this.storage?.saveCalendar(this);
  }

  async deleteIt(): Promise<void> {
    await this.storage?.deleteCalendar(this);
    appGlobal.calendars.remove(this);
  }
}

export interface CalendarStorage {
  saveEvent(event: Event): Promise<void>;
  saveCalendar(calendar: Calendar): Promise<void>;
  deleteCalendar(calendar: Calendar): Promise<void>;
}
