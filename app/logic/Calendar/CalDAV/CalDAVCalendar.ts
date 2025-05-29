import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { CalDAVEvent } from "./CalDAVEvent";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Lock } from "../../util/Lock";
import { NotReached, assert, type URLString } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection } from "svelte-collections";
import type { DAVClient, DAVCalendar, DAVObject } from "tsdav";

export class CalDAVCalendar extends Calendar {
  readonly protocol: string = "caldav";
  declare readonly events: ArrayColl<CalDAVEvent>;
  /** URL of the specific calendar - a CalDAV account can contain multiple calendars */
  calendarURL: URLString;
  davCalendar: DAVCalendar | null = null;
  ctag: string | null = null;
  client: DAVClient;
  protected syncLock = new Lock();

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
    let lock = await this.syncLock.lock();
    try {
      return new ArrayColl(await this.client.fetchCalendars());
    } finally {
      lock.release();
    }
  }

  async listEvents() {
    if (!this.dbID) {
      await this.save();
    }

    if (!this.davCalendar) {
        let calendars = await this.listCalendars();
        assert(calendars.hasItems, "No CalDAV calendars found");
        this.davCalendar = calendars.find(cal => cal.url == this.calendarURL);
        assert(this.davCalendar, "Selected CalDAV calendar URL not found");
        // console.log("Found CalDAV calendars", calendars.contents, "picked", calendar.displayName);
    }

    await this.sync();

    await this.save();
  }

  protected async fetchAll() {
    let lock = await this.syncLock.lock();
    try {
      this.events.clear();
      let iCalEntries = await this.client.fetchCalendarObjects({ calendar: this.davCalendar });
      for (let iCalEntry of iCalEntries) {
        this.addEvent(iCalEntry);
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
      let syncResponse = await this.client.smartCollectionSync({
        collection: {
          url: this.calendarURL,
          ctag: this.ctag,
          syncToken: this.syncState,
          objects: localObjects,
          objectMultiGet: (...args) => this.client.calendarMultiGet(...args),
        },
        method: 'webdav',
        detailedResult: true,
      });
      let { created, updated, deleted } = syncResponse.objects;
      for (let iCalEntry of created) {
        this.addEvent(iCalEntry);
      }
      for (let iCalEntry of updated) {
        let existing = this.getEventByURL(iCalEntry.url);
        if (existing) {
          existing.fromDAVObject(iCalEntry);
          await existing.save();
        } else {
          this.addEvent(iCalEntry);
        }
      }
      for (let iCalEntry of deleted) {
        let existing = this.getEventByURL(iCalEntry.url);
        if (existing) {
          await existing.deleteIt();
        }
      }

      this.ctag = syncResponse.ctag;
      this.syncState = syncResponse.syncToken;
    } finally {
      lock.release();
    }
  }

  protected addEvent(iCalEntry: DAVObject) {
    try {
      let event = this.newEvent();
      let isEvent = event.fromDAVObject(iCalEntry);
      if (!isEvent) {
        return;
      }
      this.events.add(event);
    } catch (ex) {
      console.warn(ex);
    }
  }

  getEventByURL(url: URLString): CalDAVEvent | void {
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
