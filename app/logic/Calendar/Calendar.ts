import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import { Scheduling, ResponseType } from "./IMIP";
import { appGlobal } from "../app";
import { assert } from "../util/util";
import { Collection, ArrayColl } from "svelte-collections";
import { ICSProcessor } from "./ICSProcessor";

export class Calendar extends Account {
  readonly protocol: string = "calendar-local";
  readonly events = new ArrayColl<Event>();
  readonly canUpdateFromResponse: boolean = true;
  storage: CalendarStorage | null = null;
  syncState: string | null = null;

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

  async updateFromResponse(scheduling: Scheduling, response: Event) {
    let attendee = response.participants.find(participant => participant.response != ResponseType.Organizer);
    let event = this.events.find(p => p.calUID == response.calUID);
    switch (scheduling) {
    case Scheduling.CANCEL:
      let organizer = event.participants.find(participant => participant.response == ResponseType.Organizer);
      if (organizer) {
        organizer.response = ResponseType.Decline;
        await event.save();
      }
      break;
    case Scheduling.REPLY:
      let participant = event.participants.find(participant => participant.emailAddress == attendee.emailAddress);
      if (participant) {
        participant.response = attendee.response;
        await event.save();
      }
      /* else add participant? */
      break;
    default:
      assert(false, "trying to update from an invitation, not a response");
      break;
    }
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

ICSProcessor.hookup();
