import { Event } from "../Event";
import type { CalDAVCalendar } from "./CalDAVCalendar";
import { convertICalToEvent, convertICalContainerToEvent, parseDate } from "../ICal/ICalToEvent";
import { ICalParser } from "../ICal/ICalParser";
import { getICal } from "../ICal/ICalGenerator";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assertHTTPResponseOK } from "../../util/netUtil";
import { ensureArray, type URLString } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import type { DAVObject } from "tsdav";
import type { ArrayColl } from "svelte-collections";

export class CalDAVEvent extends Event {
  declare calendar: CalDAVCalendar;
  declare parentEvent: CalDAVEvent;
  declare readonly exceptions: ArrayColl<CalDAVEvent>;
  /** URL of this specific Event on the server. null, if not yet saved on server. */
  url: URLString | null = null;
  originalICal: string;

  get itemID(): string | null {
    return this.pID;
  }
  set itemID(val: string | null) {
    this.pID = val;
  }
  get etag(): string | null {
    return this.syncState as string;
  }
  set etag(val: string | null) {
    this.syncState = val;
  }

  fromDAVObject(entry: DAVObject): boolean {
    this.originalICal = entry.data;
    let isEvent = convertICalToEvent(entry.data, this);
    if (!isEvent) {
      return false;
    }
    this.url = new URL(entry.url, this.calendar.calendarURL).href;
    this.etag = entry.etag;
    return true;
  }

  /** Modified occurrences of a recurring event are additional `VEVENT`s
   * with a `RECURRENCE-ID`, and deleted occurrences are `EXDATE`s of the
   * master, in the same ics file. Attach them to this master.
   * Call after `fromDAVObject()` and `saveLocally()`. */
  async updateExceptions() {
    if (!this.recurrenceRule || !this.originalICal) {
      return;
    }
    let parsed = new ICalParser(this.originalICal);
    let vevents = ensureArray(parsed.containers.vevent);
    for (let vevent of vevents) {
      let recurrenceID = vevent.entries.recurrenceid?.[0];
      if (!recurrenceID) {
        continue; // the master itself
      }
      try {
        let [recurrenceStartTime] = parseDate(recurrenceID);
        if (!recurrenceStartTime) {
          continue;
        }
        let occurrence = this.getOccurrenceByDate(recurrenceStartTime, false) as CalDAVEvent | null;
        if (!occurrence) {
          continue;
        }
        convertICalContainerToEvent(vevent, occurrence);
        await occurrence.saveLocally();
      } catch (ex) {
        this.calendar.errorCallback(ex);
      }
    }
    let master = vevents.find(v => !v.entries.recurrenceid);
    for (let entry of ensureArray(master?.entries.exdate)) {
      for (let value of entry.value.split(",")) { // one EXDATE line can hold multiple dates
        let [exclusionTime] = parseDate({ value, properties: entry.properties });
        if (exclusionTime) {
          this.makeExclusionLocally(exclusionTime);
        }
      }
    }
  }

  getDAVObject(iCal?: string): DAVObject {
    return {
      url: this.url,
      etag: this.etag,
      data: iCal,
    };
  }

  async saveToServer() {
    await this.prepareSaveToServer(); // creates the online meeting, so its URL must be in the ics
    this.calUID ??= crypto.randomUUID();
    let iCal = getICal(this);
    await this.calendar.login(false);
    if (this.url) {
      // TODO take `originalICal` and update only the properties we know about
      console.log("updating", this, this.url, "with ICS", iCal);
      let response = await this.calendar.client.updateCalendarObject({
        calendarObject: this.getDAVObject(iCal),
      });
      await assertHTTPResponseOK(response, gt`Saving the event failed`);
    } else {
      console.log("creating", this, "with ICS", iCal);
      let filename = this.calUID + ".ics";
      let response = await this.calendar.client.createCalendarObject({
        calendar: this.calendar.davCalendar,
        iCalString: iCal,
        filename,
      });
      await assertHTTPResponseOK(response, gt`Saving the event failed`);
      this.url = new URL(filename, this.calendar.calendarURL).href;
      this.originalICal = iCal;
    }
    await this.sendInvitationsDirectly();
  }

  async saveTask() {
  }

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.url = sanitize.url(json.url, null);
    this.originalICal = sanitize.string(json.original, null);
  }
  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.url = this.url;
    json.original = this.originalICal;
    return json;
  }

  async deleteFromServer() {
    console.log("Delete event", this, this.url, {
      calendarObject: this.getDAVObject(),
    });
    if (!this.url) {
      return;
    }
    await this.calendar.login(false);
    let response = await this.calendar.client.deleteCalendarObject({
      calendarObject: this.getDAVObject(),
    });
    if (await response.status != 404) { // 404 = already deleted on the server
      await assertHTTPResponseOK(response, gt`Deleting the event failed`);
    }
  }
}
