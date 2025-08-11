import { CalendarAccount } from "../CalendarAccount";
import { CalDAVCalendar } from "./CalDAVCalendar";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { NotReached, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";
import type { DAVClient } from "tsdav";

export class CalDAVAccount extends CalendarAccount {
  readonly protocol: string = "caldav";
  declare calendars: ArrayColl<CalDAVCalendar>;
  client: DAVClient;

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

  async listCalendars(): Promise<void> {
    if (this.calendars.hasItems) {
      return;
    }
    // TODO Read from DB

    // Add new calendars from server
    this.calendars.addAll(await this.listCalendarsOnServer(false));
  }

  async listCalendarsOnServer(duplicates: boolean): Promise<ArrayColl<CalDAVCalendar>> {
    let calendars = new ArrayColl<CalDAVCalendar>();
    let davCalendars = await this.client.fetchCalendars();
    assert(davCalendars.length, "No CalDAV calendars found");
    for (let davCalendar of davCalendars) {
      if (!duplicates && this.calendars.some(cal => cal.url == davCalendar.url)) {
        continue;
      }
      console.log("Found CalDAV calendar", davCalendar.displayName);
      let cal = new CalDAVCalendar();
      cal.name = (typeof(davCalendar.displayName == "string") ? davCalendar.displayName as string : null) || gt`Calendar`;
      cal.url = davCalendar.url;
      calendars.add(cal);
    }
    return calendars;
  }
}
