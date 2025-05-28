import { Event } from "../Event";
import type { CalDAVCalendar } from "./CalDAVCalendar";
import { convertICalToEvent } from "../ICal/ICalToEvent";
import { getICal } from "../ICal/ICalGenerator";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { URLString } from "../../util/util";
import type { ArrayColl } from "svelte-collections";
import type { DAVObject } from "tsdav";

export class CalDAVEvent extends Event {
  declare calendar: CalDAVCalendar;
  declare parentEvent: CalDAVEvent;
  declare readonly instances: ArrayColl<CalDAVEvent | null | undefined>;
  /** URL of this specific Event on the server. null, if not yet saved on server. */
  url: URLString | null = null;

  get itemID(): string | null {
    return this.pID;
  }
  set itemID(val: string | null) {
    this.pID = val;
  }

  fromDAVObject(entry: DAVObject): false {
    let isEvent = convertICalToEvent(entry.data, this);
    if (!isEvent) {
      return false;
    }
    this.url = entry.url;
    this.syncState = entry.etag;
  }

  getDAVObject(iCal?: string): DAVObject {
    return {
      url: this.url,
      etag: this.syncState as string,
      data: iCal,
    };
  }

  async saveToServer() {
    this.calUID ??= crypto.randomUUID();
    let iCal = getICal(this);
    if (this.url) {
      console.log("updating", this.url, "with ICS", iCal);
      await this.calendar.client.updateCalendarObject({
        calendarObject: this.getDAVObject(iCal),
      });
    } else {
      console.log("creating with ICS", iCal);
      await this.calendar.client.createCalendarObject({
        calendar: this.calendar.davCalendar,
        iCalString: iCal,
        filename: this.calUID + ".ics",
      });
      this.url = this.calendar.calendarURL + "/" + this.calUID + ".ics";
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
    console.log("Delete event", this.url, {
      calendarObject: this.getDAVObject(),
    });
    if (!this.url) {
      return;
    }
    await this.calendar.client.deleteCalendarObject({
      calendarObject: this.getDAVObject(),
    });
  }
}
