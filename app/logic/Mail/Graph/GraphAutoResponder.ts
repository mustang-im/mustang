import { AutoResponder, AutoResponderAudience } from "../AutoResponder";
import type { GraphAccount } from "./GraphAccount";
import type { TGraphAutoReplies, TGraphDateTimeZone } from "./TGraphMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { UserError } from "../../util/util";
import { gt } from "../../../l10n/l10n";

/** `mailboxSettings/automaticRepliesSetting`. Exchange replies once per sender. */
export class GraphAutoResponder extends AutoResponder {
  declare readonly account: GraphAccount;

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
    let settings = await this.call(() => this.account.graphCall("mailboxSettings/automaticRepliesSetting"));
    this.fromGraph(settings);
  }

  async save(): Promise<void> {
    this.validate();
    await this.call(() => this.account.graphPatch("mailboxSettings", { automaticRepliesSetting: this.toGraph() }));
  }

  async grantPermission(): Promise<void> {
    await this.account.upgradeScopes();
    this.needsPermission = false;
  }

  protected async call<T>(func: () => Promise<T>): Promise<T> {
    try {
      let result = await func();
      this.needsPermission = false;
      return result;
    } catch (ex) {
      // Logins from before we asked for `MailboxSettings.ReadWrite`
      if ((ex?.httpCode ?? ex?.status) == 403) {
        this.needsPermission = true;
        throw new UserError(gt`To see and change your automatic replies, please log in once more and allow access.`);
      }
      throw ex;
    }
  }

  fromGraph(json: TGraphAutoReplies) {
    // The server is not consistent in the casing
    let status = sanitize.string(json.status, "").toLowerCase();
    this.enabled = status == "alwaysenabled" || status == "scheduled";
    this.scheduled = status == "scheduled";
    this.setTimes(parseTime(json.scheduledStartDateTime), parseTime(json.scheduledEndDateTime));
    let audience = sanitize.string(json.externalAudience, "").toLowerCase();
    this.externalAudience =
      audience == "all" ? AutoResponderAudience.All :
      audience == "contactsonly" ? AutoResponderAudience.Contacts :
      AutoResponderAudience.None;
    this.internalHTML = this.toHTML(json.internalReplyMessage);
    this.externalHTML = this.toHTML(json.externalReplyMessage);
  }

  toGraph(): TGraphAutoReplies {
    let settings: TGraphAutoReplies = {
      status: !this.enabled ? "disabled" : this.scheduled ? "scheduled" : "alwaysEnabled",
      externalAudience:
        this.externalAudience == AutoResponderAudience.All ? "all" :
        this.externalAudience == AutoResponderAudience.Contacts ? "contactsOnly" :
        "none",
      internalReplyMessage: this.fromHTML(this.internalHTML),
      externalReplyMessage: this.fromHTML(this.externalHTML),
    };
    // Omit, not null, which the backend would send
    if (this.scheduled) {
      settings.scheduledStartDateTime = toTime(this.startTime);
      settings.scheduledEndDateTime = toTime(this.endTime);
    }
    return settings;
  }
}

/** Exchange keeps them in UTC */
function parseTime(time: TGraphDateTimeZone): Date | null {
  if (!time?.dateTime || time.timeZone && time.timeZone != "UTC") {
    return null;
  }
  return sanitize.date(time.dateTime + "Z", null);
}

function toTime(date: Date): TGraphDateTimeZone {
  return {
    dateTime: date.toISOString().replace("Z", ""),
    timeZone: "UTC",
  };
}
