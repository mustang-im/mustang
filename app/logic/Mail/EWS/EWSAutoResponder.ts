import { AutoResponder, AutoResponderAudience } from "../AutoResponder";
import type { EWSAccount } from "./EWSAccount";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

/** Exchange Out of Office (OOF).
 * Exchange replies only once per sender, and never to
 * `Precedence: bulk/list/junk`, `X-Auto-Response-Suppress`, junk mail
 * or via distribution lists. */
export class EWSAutoResponder extends AutoResponder {
  declare readonly account: EWSAccount;

  /** Only the mailbox owner may access the OOF settings */
  get supported(): boolean {
    return !this.account.isDependentAccount;
  }

  get supportsExternal(): boolean {
    return true;
  }

  get supportsContacts(): boolean {
    return true;
  }

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

  /** @param json `GetUserOofSettingsResponse` */
  fromEWS(json: Record<string, any>) {
    let settings = json.OofSettings;
    let state = sanitize.enum(settings.OofState, ["Disabled", "Enabled", "Scheduled"], "Disabled");
    this.enabled = state != "Disabled";
    this.scheduled = state == "Scheduled";
    this.setTimes(parseUTC(settings.Duration?.StartTime), parseUTC(settings.Duration?.EndTime));
    this.externalAudience = kAudiences[settings.ExternalAudience] ?? AutoResponderAudience.None;
    this.maxAudience = kAudiences[json.AllowExternalOof] ?? AutoResponderAudience.All;
    this.internalHTML = this.toHTML(settings.InternalReply?.Message);
    this.externalHTML = this.toHTML(settings.ExternalReply?.Message);
  }

  /** Elements must be in schema order */
  toEWS() {
    return {
      t$OofState: !this.enabled ? "Disabled" : this.scheduled ? "Scheduled" : "Enabled",
      t$ExternalAudience: Object.keys(kAudiences).find(key => kAudiences[key] == this.externalAudience) ?? "None",
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
}

const kAudiences: Record<string, AutoResponderAudience> = {
  None: AutoResponderAudience.None,
  Known: AutoResponderAudience.Contacts,
  All: AutoResponderAudience.All,
};

/** @param time E.g. "2026-10-05T07:00:00". Exchange omits the time zone, but means UTC. */
function parseUTC(time: string): Date | null {
  if (!time || typeof (time) != "string") {
    return null;
  }
  return sanitize.date(/(Z|[+-]\d\d:?\d\d)$/i.test(time) ? time : time + "Z", null);
}
