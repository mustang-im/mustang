import { CalendarAccount } from "../CalendarAccount";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { NotReached, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection } from "svelte-collections";
import type { DAVClient, DAVCalendar } from "tsdav";

export class CalDAVAccount extends CalendarAccount {
  readonly protocol: string = "caldav";
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

  protected async listCalendars(): Promise<Collection<DAVCalendar>> {
    if (!this.davCalendar) {
      let calendars = await this.listCalendars();
      assert(calendars.hasItems, "No CalDAV calendars found");
      this.davCalendar = calendars.find(cal => cal.url == this.calendarURL);
      assert(this.davCalendar, "Selected CalDAV calendar URL not found");
      // console.log("Found CalDAV calendars", calendars.contents, "picked", calendar.displayName);
    }
    return new ArrayColl(await this.client.fetchCalendars());
  }
}
