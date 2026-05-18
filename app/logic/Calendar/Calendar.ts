import { Account } from "../Abstract/Account";
import type { PersonUID } from "../Abstract/PersonUID";
import { Event } from "./Event";
import type { Participant } from "./Participant";
import type { EMail } from "../Mail/EMail";
import { ICalIncomingInvitation } from "./ICal/ICalIncomingInvitation";
import { SQLEvent } from "./SQL/SQLEvent";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";
import { recurrenceColl } from "./RecurrenceColl";
import { appGlobal } from "../app";
import { RunOnce } from "../util/flow/RunOnce";
import { gt } from "../../l10n/l10n";
import { ArrayColl, type Collection } from "svelte-collections";

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
  readDBRunOnce = new RunOnce();

  newEvent(parentEvent?: Event): Event {
    return new Event(this, parentEvent);
  }

  get isLoggedIn(): boolean {
    // Please override in subclasses
    return true; // for local calendar
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

  async startup() {
    await super.startup();
    await this.listEvents();
  }

  async listEvents() {
    await this.readEventsFromDB();
  }

  async readEventsFromDB() {
    await this.readDBRunOnce.runOnce(async () => {
      if (!this.dbID) {
        await this.save();
      }
      if (this.events.isEmpty) {
        await SQLEvent.readAll(this);
      }
    });
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability?: { from: Date, to: Date, free: boolean }[] }[]> {
    return [];
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

  async getSharedPersons(): Promise<ArrayColl<PersonUID>> {
    return new ArrayColl<PersonUID>();
  }

  async deleteSharedPerson(Person: PersonUID) {
  }

  async addSharedPerson(person: PersonUID, access: CalendarShareCombinedPermissions) {
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
