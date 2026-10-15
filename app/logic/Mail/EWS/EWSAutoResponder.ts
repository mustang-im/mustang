import { ExchangeAutoResponder, OOFAudience, OOFState } from "./ExchangeAutoResponder";
import { AutoResponderAudience } from "../AutoResponder";
import type { EWSAccount } from "./EWSAccount";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class EWSAutoResponder extends ExchangeAutoResponder {
  declare readonly account: EWSAccount;

  async load(): Promise<void> {
    let request = {
      m$GetUserOofSettingsRequest: {
        t$Mailbox: {
          t$Address: this.account.emailAddress,
        },
      },
    };
    let response = await this.account.callEWS(request);
    this.fromEWS(response);
  }

  async save(): Promise<void> {
    this.validate();
    let request = {
      m$SetUserOofSettingsRequest: {
        t$Mailbox: {
          t$Address: this.account.emailAddress,
        },
        t$UserOofSettings: this.toEWS(),
      },
    };
    await this.account.callEWS(request);
  }

  /** @param json as returned by `GetUserOofSettings` in `load()` */
  fromEWS(json: any) {
    let settings = json.OofSettings;
    this.oofState = OOFState[settings.OofState as string];
    this.setTimes(this.parseUTC(settings.Duration?.StartTime), this.parseUTC(settings.Duration?.EndTime));
    this.externalAudience = this.toAudience(OOFAudience[settings.ExternalAudience as string], AutoResponderAudience.None);
    this.maxAudience = this.toAudience(OOFAudience[json.AllowExternalOof as string], AutoResponderAudience.All);
    this.internalHTML = this.toHTML(settings.InternalReply?.Message);
    this.externalHTML = this.toHTML(settings.ExternalReply?.Message);
  }

  /** Elements must be in schema order */
  toEWS() {
    return {
      t$OofState: OOFState[this.oofState],
      t$ExternalAudience: OOFAudience[this.oofAudience],
      t$Duration: this.scheduled ? {
        t$StartTime: this.startTime.toISOString(),
        t$EndTime: this.endTime.toISOString(),
      } : null,
      t$InternalReply: {
        t$Message: this.fromHTML(this.internalHTML),
      },
      t$ExternalReply: {
        t$Message: this.fromHTML(this.externalHTML),
      },
    };
  }

  /** @param time E.g. "2026-10-05T07:00:00". Exchange omits the time zone, but means UTC. */
  protected parseUTC(time: string): Date | null {
    if (!time || typeof (time) != "string") {
      return null;
    }
    return sanitize.date(/(Z|[+-]\d\d:?\d\d)$/i.test(time) ? time : time + "Z", null);
  }
}
