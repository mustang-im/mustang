import { AutoResponder, AutoResponderAudience } from "../AutoResponder";
import type { EWSAccount } from "./EWSAccount";
import { convertTextToHTML, sanitizeHTML } from "../../util/convertHTML";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";

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
    if (this.enabled && this.scheduled) {
      assert(this.endTime > this.startTime, gt`The end time must be after the start time`);
    }
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
    let startTime = parseUTC(settings.Duration?.StartTime);
    let endTime = parseUTC(settings.Duration?.EndTime);
    // Old dates of a past vacation are useless as defaults
    if (startTime && endTime && (this.scheduled || endTime > new Date())) {
      this.startTime = startTime;
      this.endTime = endTime;
    }
    this.externalAudience = kAudiences[settings.ExternalAudience] ?? AutoResponderAudience.None;
    this.maxAudience = kAudiences[json.AllowExternalOof] ?? AutoResponderAudience.All;
    this.internalHTML = toHTML(settings.InternalReply?.Message);
    this.externalHTML = toHTML(settings.ExternalReply?.Message);
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
        t$Message: fromHTML(this.internalHTML),
      },
      t$ExternalReply: {
        t$Message: fromHTML(this.externalHTML),
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

/** @param message The reply, as the server has it: HTML from Outlook, plaintext from older clients
 * @returns HTML */
function toHTML(message: string): string {
  if (!message || typeof (message) != "string") {
    return "";
  }
  return /<[a-z!\/][^>]*>/i.test(message)
    ? sanitizeHTML(message)
    : convertTextToHTML(message);
}

/** @returns HTML for the server, or "" for none */
function fromHTML(html: string): string {
  // What the editor leaves when emptied
  return !html || html == "<p></p>" ? "" : html;
}
