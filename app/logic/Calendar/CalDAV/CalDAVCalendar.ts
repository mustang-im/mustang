import { Calendar } from "../Calendar";
import type { CalDAVAccount } from "./CalDAVAccount";
import type { Participant } from "../Participant";
import { CalDAVEvent } from "./CalDAVEvent";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Lock } from "../../util/Lock";
import type { URLString } from "../../util/util";
import type { ArrayColl } from "svelte-collections";
import type { DAVCalendar, DAVObject } from "tsdav";

export class CalDAVCalendar extends Calendar {
  readonly protocol: string = "caldav";
  declare account: CalDAVAccount;
  declare readonly events: ArrayColl<CalDAVEvent>;
  /** URL of the specific calendar - a CalDAV account can contain multiple calendars */
  calendarURL: URLString;
  davCalendar: DAVCalendar | null = null;
  ctag: string | null = null;
  protected readonly syncLock = new Lock();

  newEvent(parentEvent?: CalDAVEvent): CalDAVEvent {
    return new CalDAVEvent(this, parentEvent);
  }

  get isLoggedIn(): boolean {
    return this.account.isLoggedIn;
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    return [];
  }

  async listEvents() {
    if (!this.dbID) {
      await this.save();
    }
    await this.sync();
    await this.save();
  }

  protected async fetchAll() {
    let lock = await this.syncLock.lock();
    try {
      this.events.clear();
      let iCalEntries = await this.account.client.fetchCalendarObjects({ calendar: this.davCalendar });
      for (let iCalEntry of iCalEntries) {
        await this.addEvent(iCalEntry);
      }
    } finally {
      lock.release();
    }
}

  protected async sync() {
    let lock = await this.syncLock.lock();
    try {
      /* For multiple calendars:
      let { created, updated, deleted } = await this.client.syncCalendars({
        oldCalendars: [this.davCalendar],
        detailedResult: true,
      });
      if (!updated?.length || !updated.includes(this.davCalendar)) {
        return;
      }*/
      let localObjects = this.events.contents.map(e => ({
        url: e.url,
        etag: e.etag,
        data: undefined, // unused by function, and expensive to calculate
        id: undefined, // unused by function, and not passed by iCalEntry
      }));
      let syncResponse = await this.account.client.smartCollectionSync({
        collection: {
          url: this.calendarURL,
          ctag: this.ctag,
          syncToken: this.syncState,
          objects: localObjects,
          objectMultiGet: (...args) => this.account.client.calendarMultiGet(...args),
        },
        method: 'webdav',
        detailedResult: true,
      });
      let { created, updated, deleted } = syncResponse.objects;
      for (let iCalEntry of created) {
        await this.addEvent(iCalEntry);
      }
      for (let iCalEntry of updated) {
        let existing = this.getEventByURL(iCalEntry.url);
        if (existing) {
          existing.fromDAVObject(iCalEntry);
          await existing.saveLocally();
        } else {
          await this.addEvent(iCalEntry);
        }
      }
      for (let iCalEntry of deleted) {
        let existing = this.getEventByURL(iCalEntry.url);
        if (existing) {
          await existing.deleteLocally();
        }
      }

      this.ctag = syncResponse.ctag;
      this.syncState = syncResponse.syncToken;
    } finally {
      lock.release();
    }
  }

  protected async addEvent(iCalEntry: DAVObject) {
    try {
      let event = this.newEvent();
      let isEvent = event.fromDAVObject(iCalEntry);
      if (!isEvent) {
        return;
      }
      this.events.add(event);
      await event.saveLocally();
    } catch (ex) {
      console.warn(ex);
    }
  }

  getEventByURL(relativeURL: URLString): CalDAVEvent | void {
    let url = new URL(relativeURL, this.calendarURL).href;
    return this.events.find(e => e.url == url);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.calendarURL = sanitize.url(json.calendarURL);
    this.ctag = sanitize.string(json.ctag, null);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.calendarURL = this.calendarURL;
    json.ctag = this.ctag;
    return json;
  }
}
