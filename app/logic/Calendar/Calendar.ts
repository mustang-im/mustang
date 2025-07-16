import { Event } from "./Event";
import type { Participant } from "./Participant";
import type { CalendarAccount, CalendarStorage } from "./CalendarAccount";
import type { MailAccount } from "../Mail/MailAccount";
import { getWorkspaceByID, type Workspace } from "../Abstract/Workspace";
import { ICalIncomingInvitation } from "./ICal/ICalIncomingInvitation";
import type { EMail } from "../Mail/EMail";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";
import { recurrenceColl } from "./RecurrenceColl";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl, type Collection } from "svelte-collections";
import type { ComponentType } from "svelte";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { assert } from "../util/util";

export class Calendar extends Observable {
  readonly protocol: string = "calendar-local";
  account: CalendarAccount | MailAccount;

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

  // Meta data
  id: string;
  /** The primary ID in the database */
  dbID: number | string | null = null;
  @notifyChangedProperty
  name: string;
  /** A `data:` URL to an image that represents this account.
   * E.g. the company logo. */
  @notifyChangedProperty
  icon: string | ComponentType | null = null;
  @notifyChangedProperty
  color: string = "#FFFFFF";
  @notifyChangedProperty
  workspace: Workspace | null = null;
  /** Show this calendar in our UI.
   * If false, pretend that this calendar and the events in it don't exist.
   * Useful for "Birthdays", "Holidays" etc. calendars.
   * If false, this calendar should *not* appear in `appGlobal.calendars`,
   * and its events should *not* appear in `appGlobal.calendarEvents`. */
  @notifyChangedProperty
  enabled: boolean = true;

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

  toConfigJSON(): any {
    assert(this.id, "Need calendar ID to save");
    let json = {} as any;
    json.id = this.id;
    json.protocol = this.protocol;
    json.name = this.name;
    json.workspaceID = this.workspace?.id;
    json.color = this.color;
    json.icon = this.icon;
    json.syncState = this.syncState;
    return json;
  }
  fromConfigJSON(json: any) {
    assert(typeof (json) == "object", "Config must be a JSON object");
    assert(this.protocol == sanitize.alphanumdash(json.protocol), `Calendar object of wrong type passed in: data ${json.protocol} != class ${this.protocol}`);
    (this.id as any) = sanitize.alphanumdash(json.id);
    this.name = sanitize.label(json.name, this.account.name);
    this.color = sanitize.nonemptystring(json.color, this.color);
    this.icon = sanitize.url(json.icon, null, ["data"]);
    this.workspace = getWorkspaceByID(sanitize.string(json.workspaceID, null));
    this.syncState = json.syncState;
  }
}

ICalEMailProcessor.hookup();
