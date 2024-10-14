import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import { setStorage } from "./Store/setStorage";
import { appGlobal } from "../app";
import { Collection, ArrayColl } from "svelte-collections";

export class Calendar extends Account {
  readonly protocol: string = "calendar-local";
  readonly events = new ArrayColl<Event>();
  storage: CalendarStorage | null = null;
  syncState: string | null = null;

  constructor() {
    super();
    setStorage(this);
  }

  newEvent(parentEvent?: Event): Event {
    return new Event(this, parentEvent);
  }

  /**
   * Ensures that instances for all recurring events in the calendar exist
   * up to the provided date. Returns all events as a convenience.
   */
  fillRecurrences(endDate: Date): Collection<Event> {
    for (let event of this.events.contents.filter(event => event.recurrenceRule)) {
      event.fillRecurrences(endDate);
    }
    return this.events;
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
  deleteEvent(event: Event): Promise<void>;
  saveCalendar(calendar: Calendar): Promise<void>;
  deleteCalendar(calendar: Calendar): Promise<void>;
}
