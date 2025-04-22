import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import type { Participant } from "./Participant";
import { appGlobal } from "../app";
import { Collection, ArrayColl } from "svelte-collections";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";

export class Calendar extends Account {
  readonly protocol: string = "calendar-local";
  readonly events = new ArrayColl<Event>();
  storage: CalendarStorage | null = null;
  syncState: string | null = null;

  newEvent(parentEvent?: Event): Event {
    return new Event(this, parentEvent);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    return participants.map(participant => ({ participant, availability: [] }));
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
    await super.save();
    await this.storage?.saveCalendar(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteCalendar(this);
    appGlobal.calendars.remove(this);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.syncState = json.syncState;
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.syncState = this.syncState;
    return json;
  }
}

export interface CalendarStorage {
  saveEvent(event: Event): Promise<void>;
  deleteEvent(event: Event): Promise<void>;
  saveCalendar(calendar: Calendar): Promise<void>;
  deleteCalendar(calendar: Calendar): Promise<void>;
}

ICalEMailProcessor.hookup();
