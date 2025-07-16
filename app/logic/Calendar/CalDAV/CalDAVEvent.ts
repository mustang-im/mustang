import { Event } from "../Event";
import type { CalDAVCalendar } from "./CalDAVCalendar";
import { convertICalToEvent } from "../ICal/ICalToEvent";
import { getICal } from "../ICal/ICalGenerator";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { URLString } from "../../util/util";
import type { DAVObject } from "tsdav";
import type { ArrayColl } from "svelte-collections";

export class CalDAVEvent extends Event {
  declare calendar: CalDAVCalendar;
  declare parentEvent: CalDAVEvent;
  declare readonly exceptions: ArrayColl<CalDAVEvent>;
  /** URL of this specific Event on the server. null, if not yet saved on server. */
  url: URLString | null = null;

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
    let isEvent = convertICalToEvent(entry.data, this);
    if (!isEvent) {
      return false;
    }
    this.url = new URL(entry.url, this.calendar.calendarURL).href;
    this.etag = entry.etag;
    return true;
  }

  getDAVObject(iCal?: string): DAVObject {
    return {
      url: this.url,
      etag: this.etag,
      data: iCal,
    };
  }

  async saveToServer() {
    this.calUID ??= crypto.randomUUID();
    let iCal = getICal(this);
    if (this.url) {
      console.log("updating", this, this.url, "with ICS", iCal);
      await this.calendar.account.client.updateCalendarObject({
        calendarObject: this.getDAVObject(iCal),
      });
    } else {
      console.log("creating", this, "with ICS", iCal);
      let filename = this.calUID + ".ics";
      await this.calendar.account.client.createCalendarObject({
        calendar: this.calendar.davCalendar,
        iCalString: iCal,
        filename,
      });
      this.url = new URL(filename, this.calendar.calendarURL).href;
    }
    await super.saveToServer();
  }

  async saveTask() {
  }

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.url = sanitize.url(json.url, null);
  }
  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.url = this.url;
    return json;
  }

  async deleteFromServer() {
    console.log("Delete event", this, this.url, {
      calendarObject: this.getDAVObject(),
    });
    if (!this.url) {
      return;
    }
    await this.calendar.account.client.deleteCalendarObject({
      calendarObject: this.getDAVObject(),
    });
  }
}
