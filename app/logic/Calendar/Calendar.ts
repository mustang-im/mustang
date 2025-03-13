import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import { Scheduling, ResponseType, type Responses } from "./Invitation";
import type { EMail } from "../Mail/EMail";
import { appGlobal } from "../app";
import { assert } from "../util/util";
import { Collection, ArrayColl } from "svelte-collections";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";

export class Calendar extends Account {
  readonly protocol: string = "calendar-local";
  readonly events = new ArrayColl<Event>();
  readonly account: Account = null;
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

  async respondToInvitation(email: EMail, response: Responses) {
    assert(email.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let event = this.events.find(event => event.calUID == email.event.calUID);
    if (!event) {
      event = this.newEvent();
      event.copyFrom(email.event);
      event.startTime = email.event.startTime;
      event.endTime = email.event.endTime;
      event.recurrenceRule = email.event.recurrenceRule;
      event.response = ResponseType.NoResponseReceived;
      this.events.add(event);
      if (event.recurrenceRule) {
        event.fillRecurrences(new Date(Date.now() + 1e11));
      }
    }
    let participant = event.participants.find(participant => participant.emailAddress == email.folder.account.emailAddress);
    if (participant) {
      event.response = participant.response = response;
      await event.save();
      await email.folder.account.sendInvitationResponse(email.event, response);
    }
    /* else add participant? */
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

ICalEMailProcessor.hookup();
