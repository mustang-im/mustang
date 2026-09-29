import { AutoResponder, AutoResponderAudience } from "../AutoResponder";
import type { ExchangeMailAccount } from "./ExchangeMailAccount";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

/** Exchange Out of Office (OOF), as EWS and OWA have it.
 * Exchange replies only once per sender, and never to
 * `Precedence: bulk/list/junk`, `X-Auto-Response-Suppress`, junk mail
 * or via distribution lists. */
export class ExchangeAutoResponder extends AutoResponder {
  declare readonly account: ExchangeMailAccount;

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

  /** @param json `GetUserOofSettingsResponse` */
  fromExchange(json: Record<string, any>) {
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

  protected get oofState(): string {
    return !this.enabled ? "Disabled" : this.scheduled ? "Scheduled" : "Enabled";
  }

  protected get oofAudience(): string {
    return Object.keys(kAudiences).find(key => kAudiences[key] == this.externalAudience) ?? "None";
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
