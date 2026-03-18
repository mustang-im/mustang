import { Calendar } from "../Calendar";
import type { Event } from "../Event";
import { JMAPEvent } from "./JMAPEvent";
import type { TJMAPCalendar } from "./TJMAPCalendar";
import type { TJMAPCalendarEvent } from "./TJSCalendar";
import type { JMAPAccount } from "../../Mail/JMAP/JMAPAccount";
import type { JMAPEMail } from "../../Mail/JMAP/JMAPEMail";
import type { TID, TJMAPChangeResponse, TJMAPGetResponse } from "../../Mail/JMAP/TJMAPGeneric";
import { JMAPIncomingInvitation } from "./JMAPIncomingInvitation";
import type { Participant } from "../Participant";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl, Collection, SetColl } from "svelte-collections";

export class JMAPCalendar extends Calendar {
  readonly protocol: string = "calendar-jmap";
  declare readonly events: ArrayColl<JMAPEvent>;
  readonly deletions = new Set<string>();
  /** TODO JMAP calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;
  /** ID in JMAP (because `.id` is the ID our database) */
  jmapID: TID;
  /** Primary calendar for this account */
  isDefault = false;
  /** isSubscribed - if false, the user doesn't want to see it in the UI */
  shouldShow = true;

  get account(): JMAPAccount {
    return this.mainAccount as JMAPAccount;
  }

  newEvent(parentEvent?: JMAPEvent): JMAPEvent {
    return new JMAPEvent(this, parentEvent);
  }

  fromJMAP(jmap: TJMAPCalendar) {
    this.jmapID = sanitize.nonemptystring(jmap.id);
    this.isDefault = sanitize.boolean(jmap.isDefault, false);
    this.shouldShow = sanitize.boolean(jmap.isSubscribed, true);
    if (!this.name || !this.isDefault) { // Default calendar name = account name, as set by `initFromMainAccount()`
      this.name = sanitize.nonemptystring(jmap.name);
    }
  }

  getIncomingInvitationForEMail(message: JMAPEMail) {
    return new JMAPIncomingInvitation(this, message);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
  }

  async listEvents() {
    await super.listEvents();
    if (!this.account.isLoggedIn) {
      await this.account.login(false);
    }

    this.events.isEmpty
      ? await this.listAllEvents()
      : await this.listChangedEvents();
  }

  /** Lists all events in this calendar. */
  protected async listAllEvents(): Promise<ArrayColl<JMAPEvent>> {
    const batchSize = 200;
    let hasMore = true;
    let allNewEvents = new ArrayColl<JMAPEvent>();
    for (let i = 0; hasMore; i += batchSize) {
      let { newEvents, updatedEvents } = await this.fetchEvents(i, batchSize + 1);
      this.events.addAll(newEvents);
      await this.saveEvents(newEvents);
      await this.updateRecurrenceOverrides(newEvents);
      allNewEvents.addAll(newEvents);
      hasMore = newEvents.length + updatedEvents.length > batchSize;
    }
    return allNewEvents;
  }

  protected async fetchEvents(start?: number, limit?: number, options?: any): Promise<UpdateResult<JMAPEvent>> {
    console.log("JMAP fetch", limit || start ? `start ${start} limit ${limit}` : "all");
    let listResponse: TJMAPGetResponse<TJMAPCalendarEvent>;
    let lock = await this.account.stateLock.lock();
    let after = new Date();
    after.setMonth(after.getMonth() - 6); // Don't fetch old appointments, only last 6 months
    try {
      // <https://www.rfc-editor.org/rfc/rfc8621.html#section-4.4>
      let response = await this.account.makeCombinedCall([
        [
          "CalendarEvent/query", {
            accountId: this.account.accountID,
            filter: {
              inCalendar: this.jmapID,
            },
            sort: [
              { property: "start" }
            ],
            after: after.toISOString().substring(0, 19),
            position: start,
            limit: limit,
          },
          "list",
        ], [
          "CalendarEvent/get", {
            accountId: this.account.accountID,
            "#ids": {
              name: "CalendarEvent/query",
              path: "/ids",
              resultOf: "list",
            },
          },
          "events",
        ],
      ]);
      listResponse = response["events"] as TJMAPGetResponse<TJMAPCalendarEvent>;

      let result = this.parseEventsList(listResponse.list);
      this.account.syncState.set("CalendarEvent", listResponse.state);
      return result;
    } finally {
      lock.release();
    }
  }

  /** Lists all events in this calendar that are new or updated since the last fetch. */
  protected async listChangedEvents(): Promise<ArrayColl<JMAPEvent>> {
    if (!this.account.syncState.has("CalendarEvent")) {
      return await this.listAllEvents();
    }

    return await this.fetchChangedEventsForAllCalendars();
  }

  /**
   * Checks new events for *all* calendars in this account,
   * and updates *all* calendars.
   * @returns new events of *this* calendar
   */
  async fetchChangedEventsForAllCalendars(): Promise<ArrayColl<JMAPEvent>> {
    assert(this.account.syncState.has("CalendarEvent"), "No sync state");
    let lock = await this.account.stateLock.lock();
    try {
      if (lock.wasWaiting && false) { // TODO always true
        console.log("JMAP fetch changes for calendar", this.name, "already in progress");
        return new ArrayColl();
      }
      // <https://www.rfc-editor.org/rfc/rfc8620#section-5.2>
      let response = await this.account.makeCombinedCall([
        [
          "CalendarEvent/changes", {
            accountId: this.account.accountID,
            sinceState: this.account.syncState.get("CalendarEvent"),
            maxChanges: 500,
          },
          "changes",
        ], [
          "CalendarEvent/get", {
            accountId: this.account.accountID,
            "#ids": {
              resultOf: "changes",
              name: "CalendarEvent/changes",
              path: "/created",
            },
          },
          "added",
        ], [
          "CalendarEvent/get", {
            accountId: this.account.accountID,
            "#ids": {
              resultOf: "changes",
              name: "CalendarEvent/changes",
              path: "/updated",
            },
          },
          "changed",
        ],
      ]);

      let changes = response["changes"] as TJMAPChangeResponse<TJMAPCalendarEvent>;
      let addedResponse = response["added"] as TJMAPGetResponse<TJMAPCalendarEvent>;
      let changedResponse = response["changed"] as TJMAPGetResponse<TJMAPCalendarEvent>;

      // Split the responses by calendar: map Calendar JMAP ID -> JMAP Calendar Event
      let addedByCal = new Map<string, TJMAPCalendarEvent[]>();
      let changedByCal = new Map<string, TJMAPCalendarEvent[]>();
      let newEventsOfThisCal = new ArrayColl<JMAPEvent>();
      splitByCalendar(addedResponse.list, addedByCal);
      splitByCalendar(changedResponse.list, changedByCal);

      let allCalendars = this.account.dependentAccounts().filterOnce(a => a instanceof JMAPCalendar) as Collection<JMAPCalendar>;
      for (let calendar of allCalendars) {
        await calendar.readEventsFromDB();
        let removed = this.findMovedAway(changedResponse.list, calendar);
        let addedThisCal = addedByCal.get(calendar.id);
        let changedThisCal = changedByCal.get(calendar.id);
        if (!(addedThisCal || changedThisCal ||
          removed.hasItems || changes.destroyed?.length)) {
          continue;
        }
        removed.addAll(await calendar.parseRemovedEvents(changes.destroyed));
        let addedResult = calendar.parseEventsList(addedThisCal ?? [], false);
        let changedResult = calendar.parseEventsList(changedThisCal ?? []);
        addedResult.newEvents.addAll(changedResult.newEvents);

        calendar.events.removeAll(removed);
        calendar.events.addAll(addedResult.newEvents);
        for (let event of removed) {
          await event.deleteLocally();
        }
        await this.saveEvents(changedResult.updatedEvents);
        await this.updateRecurrenceOverrides(changedResult.updatedEvents);
        await this.saveEvents(addedResult.newEvents);
        await this.updateRecurrenceOverrides(addedResult.newEvents);
        if (this === calendar) {
          newEventsOfThisCal = addedResult.newEvents;
        }
      }

      this.account.syncState.set("CalendarEvent", changes.newState);
      await this.account.save();
      if (changes.hasMoreChanges) {
        lock.release();
        await this.fetchChangedEventsForAllCalendars();
      }
      return newEventsOfThisCal;
    } finally {
      lock.release();
    }
  }

  protected async parseRemovedEvents(jmapIDs: string[]): Promise<ArrayColl<JMAPEvent>> {
    return new ArrayColl<JMAPEvent>(jmapIDs
      .map(jmapID => this.getEventByJMAPID(jmapID))
      .filter(ev => ev));
  }

  /**
   * Find `events` that were moved away from `calendars`.
   *
   * To handle copy of the same calendar event object to a second calendar, and then deleting it from only one of the calendars,
   * we need to check *all* calendars for *every* changed contact, even if the calendar didn't change, because
   * JMAP doesn't tell us about moves or removals of the second copy. :-(
   * @return removed calendar events. It's the caller's obligation to remove them from the calendar
   */
  protected findMovedAway(events: TJMAPCalendarEvent[], calendar: JMAPCalendar): SetColl<JMAPEvent> {
    let removed = new SetColl<JMAPEvent>();
    for (let event of events) {
      let existing = calendar.getEventByJMAPID(event.id);
      // added events are handled by `calendar.parseEventsList(changedThisCal...`
      if (existing && !event.calendarIds[calendar.jmapID]) {
        removed.add(existing);
      }
    }
    return removed;
  }

  protected parseEventsList(events: TJMAPCalendarEvent[], checkUpdates = true): UpdateResult<JMAPEvent> {
    let newEvents = new ArrayColl<JMAPEvent>();
    let updatedEvents = new ArrayColl<JMAPEvent>();
    for (let json of events) {
      let id = sanitize.nonemptystring(json.id);
      if (this.deletions.has(id)) {
        continue;
      }
      let event = checkUpdates && this.getEventByJMAPID(id);
      if (event) {
        event.fromJMAP(json);
        updatedEvents.add(event);
      } else {
        event = this.newEvent();
        event.fromJMAP(json);
        newEvents.add(event);
      }
    }
    return { newEvents, updatedEvents };
  }

  protected async saveEvents(events: Collection<Event>) {
    for (let event of events) {
      await event.save();
    }
  }

  protected async updateRecurrenceOverrides(events: Collection<JMAPEvent>) {
    let exceptions = new ArrayColl<Event>();
    for (let event of events) {
      event.updateRecurrenceOverrides(exceptions);
    }
    await this.saveEvents(exceptions);
  }

  getEventByJMAPID(jmapID: string): JMAPEvent | undefined {
    return this.events.find(p => p.jmapID == jmapID);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.jmapID = sanitize.alphanumdash(json.jmapID);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.jmapID = this.jmapID;
    return json;
  }
}

type UpdateResult<T> = { newEvents: ArrayColl<T>, updatedEvents: ArrayColl<T> }

function splitByCalendar(list: TJMAPCalendarEvent[], map: Map<string, TJMAPCalendarEvent[]>) {
  for (let resp of list) {
    for (let calendarID in resp.calendarIds) {
      let list = map.get(calendarID);
      if (!list) {
        list = [];
        map.set(calendarID, list);
      }
      list.push(resp);
    }
  }
}
