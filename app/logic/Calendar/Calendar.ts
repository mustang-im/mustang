import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import type { Participant } from "./Participant";
import { IncomingInvitation } from "./Invitation/IncomingInvitation";
import type { EMail } from "../Mail/EMail";
import { appGlobal } from "../app";
import { Collection, ArrayColl } from "svelte-collections";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";
import { RecurrenceColl } from "./RecurrenceColl";

export class Calendar extends Account {
  readonly protocol: string = "calendar-local";
  /** Contains
   * - single events
   * - recurring masters
   * - recurring exceptions
   * If you want events to display @see eventWithRecurrences() */
  readonly events = new ArrayColl<Event>();
  /** Can this calendar accept incoming invitations from inboxes in other accounts? */
  readonly canAcceptAnyInvitation: boolean = true;
  storage: CalendarStorage | null = null;
  syncState: string | null = null;

  newEvent(parentEvent?: Event): Event {
    return new Event(this, parentEvent);
  }

  /** Calculated from `events`. Returns
   * - Single events
   * - Recurring instances generated
   * - Recurring exceptions
   *
   * This is cached. It will observe changes to `events`, but
   * the cache needs to be invalidated when
   * recurring event masters change.
   */
  eventsWithRecurrences = new RecurrenceColl(this.events);

  protected invalidateRecurringCache() {
  }

  getIncomingInvitationFor(message: EMail) {
    return new IncomingInvitation(this, message);
  }

  async listEvents() {
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    return participants.map(participant => ({ participant, availability: [] }));
  }

  async save(): Promise<void> {
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
