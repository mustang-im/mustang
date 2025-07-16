import { Event } from "./Event";
import type { Participant } from "./Participant";
import type { CalendarAccount } from "./CalendarAccount";
import type { MailAccount } from "../Mail/MailAccount";
import { ICalIncomingInvitation } from "./ICal/ICalIncomingInvitation";
import type { EMail } from "../Mail/EMail";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";
import { recurrenceColl } from "./RecurrenceColl";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl, type Collection } from "svelte-collections";
import type { ComponentType } from "svelte";

export class Calendar extends Observable {
  id: string;
  /** The primary ID in the type-specific database (not in accounts DB) */
  dbID: number | string | null = null;
  readonly protocol: string = "calendar-local";
  account: CalendarAccount | MailAccount;
  @notifyChangedProperty
  name: string;
  /** A `data:` URL to an image that represents this account.
   * E.g. the company logo. */
  @notifyChangedProperty
  icon: string | ComponentType | null = null;
  @notifyChangedProperty
  color: string = "#FFFFFF";

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
  eventsWithRecurrences: Collection<Event> = recurrenceColl(this.events);

  protected invalidateRecurringCache() {
  }

  getIncomingInvitationForEMail(message: EMail) {
    return new ICalIncomingInvitation(this, message);
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
    await this.storage?.deleteCalendar(this);
    appGlobal.calendars.remove(this);
  }

  fromConfigJSON(json: any) {
    this.syncState = json.syncState;
  }
  toConfigJSON(): any {
    let json = {} as any;
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
