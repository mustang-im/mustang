import { Account } from "../Abstract/Account";
import type { PersonUID } from "../Abstract/PersonUID";
import { Event } from "./Event";
import type { Participant } from "./Participant";
import { ICalIncomingInvitation } from "./ICal/ICalIncomingInvitation";
import type { EMail } from "../Mail/EMail";
import { appGlobal } from "../app";
import { ArrayColl, type Collection } from "svelte-collections";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";
import { recurrenceColl } from "./RecurrenceColl";
import { gt } from "../../l10n/l10n";

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
    await super.deleteIt();
    await this.storage?.deleteCalendar(this);
    appGlobal.calendars.remove(this);
  }

  async getSharedPersons(): Promise<ArrayColl<PersonUID>> {
    return new ArrayColl<PersonUID>();
  }

  async deleteSharedPerson(Person: PersonUID) {
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

export enum CalendarShareCombinedPermissions {
  /** Can see whether the user is busy or not, but not the title nor details of the meeting */
  ReadAvailability = "read-busy",
  /** Can see the times and titles of the meeting, but nothing else */
  ReadTitle = "read-title",
  /** Can see all details of all meetings */
  ReadAll = "read-all",
  /** Full access: Modify meeting details, and add and delete meetings */
  Modify = "modify",
}
export const calendarShareCombinedPermissionsLabels: Record<string, string> = {
  [CalendarShareCombinedPermissions.ReadAvailability]: gt`See availability only`,
  [CalendarShareCombinedPermissions.ReadTitle]: gt`See titles only`,
  [CalendarShareCombinedPermissions.ReadAll]: gt`See all meetings with details`,
  [CalendarShareCombinedPermissions.Modify]: gt`Modify, add and delete meetings`,
};
