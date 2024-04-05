import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import { ArrayColl } from "svelte-collections";

export class Calendar extends Account {
  readonly protocol = "calendar-local";
  readonly events = new ArrayColl<Event>();
  storage: CalendarStorage | null = null;

  newEvent(): Event {
    return new Event(this);
  }
}

export interface CalendarStorage {
  saveEvent(event: Event): Promise<void>;
  saveCalendar(calendar: Calendar): Promise<void>;
}
