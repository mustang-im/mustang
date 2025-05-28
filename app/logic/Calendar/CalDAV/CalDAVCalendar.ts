import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { CalDAVEvent } from "./CalDAVEvent";
import { AuthMethod } from "../../Abstract/Account";
import { convertICalToEvent } from "../ICal/ICalToEvent";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotReached, assert, type URLString } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection } from "svelte-collections";
import type { DAVClient, DAVCalendar } from "tsdav";

export class CalDAVCalendar extends Calendar {
  readonly protocol: string = "caldav";
  declare readonly events: ArrayColl<CalDAVEvent>;
  /** URL of the specific calendar - a CalDAV account can contain multiple calendars */
  calendarURL: URLString;
  client: DAVClient;

  newEvent(parentEvent?: CalDAVEvent): CalDAVEvent {
    return new CalDAVEvent(this, parentEvent);
  }

  async login(interactive: true) {
    let useOAuth2 = this.authMethod == AuthMethod.OAuth2;
    let usePassword = this.authMethod == AuthMethod.Password;
    if (useOAuth2) {
      assert(this.oAuth2, gt`Need OAuth2 configuration`);
      if (!this.oAuth2.isLoggedIn) {
        await this.oAuth2.login(interactive);
      }
    }
    assert(usePassword || useOAuth2, gt`Unknown authentication method`);
    let options = {
      serverUrl: this.url,
      authType: useOAuth2 ? "Oauth" : "Basic",
      credentials: useOAuth2 ? {
        access_token: this.oAuth2.accessToken,
      } : {
        username: this.username,
        password: usePassword ? this.password : undefined,
      },
      defaultAccountType: "caldav",
    };
    this.client = await appGlobal.remoteApp.createWebDAVClient(options);
    await this.client.login();
  }

  get isLoggedIn(): boolean {
    if (this.authMethod == AuthMethod.OAuth2) {
      return this.oAuth2.isLoggedIn;
    } else if (this.authMethod == AuthMethod.Password) {
      return !!this.password;
    } else {
      throw new NotReached(gt`Unknown authentication method`);
    }
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    return [];
  }

  async listCalendars(): Promise<Collection<DAVCalendar>> {
    return new ArrayColl(await this.client.fetchCalendars());
  }

  async listEvents() {
    if (!this.dbID) {
      await this.save();
    }

    let calendars = await this.listCalendars();
    assert(calendars.hasItems, "No CalDAV calendars found");
    let calendar = calendars.find(cal => cal.url == this.calendarURL);
    assert(calendar, "Selected CalDAV calendar URL not found");
    console.log("Found CalDAV calendars", calendars.contents, "picked", calendar.displayName);
    this.events.clear();
    let iCalEntries = await this.client.fetchCalendarObjects({ calendar });
    for (let iCalEntry of iCalEntries) {
      let event = this.newEvent();
      let isEvent = convertICalToEvent(iCalEntry.data, event);
      if (!isEvent) {
        continue;
      }
      event.syncState = iCalEntry.etag;
      this.events.add(event);
    }

    await this.save();
  }

  getEventByItemID(id: string): CalDAVEvent | void {
    return this.events.find(p => p.itemID == id);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.calendarURL = sanitize.url(json.calendarURL);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.calendarURL = this.calendarURL;
    return json;
  }
}
