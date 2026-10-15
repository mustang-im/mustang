import { ExchangeAutoResponder } from "../EWS/ExchangeAutoResponder";
import { AutoResponderAudience } from "../AutoResponder";
import type { OWAAccount } from "./OWAAccount";
import { OWAGetMailboxAutoReplyConfigurationRequest, OWASetMailboxAutoReplyConfigurationRequest } from "./Request/OWAMailboxAutoReplyConfigurationRequests";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class OWAAutoResponder extends ExchangeAutoResponder {
  declare readonly account: OWAAccount;

  async load(): Promise<void> {
    let response = await this.account.callOWA(new OWAGetMailboxAutoReplyConfigurationRequest());
    this.fromOWA(response.Options);
  }

  async save(): Promise<void> {
    this.validate();
    await this.account.callOWA(new OWASetMailboxAutoReplyConfigurationRequest(this.toOWA()));
  }

  /** @param options as returned by `GetMailboxAutoReplyConfiguration` in `load()` */
  fromOWA(options: any) {
    this.oofState = options.AutoReplyState;
    this.setTimes(sanitize.date(options.StartTime, null), sanitize.date(options.EndTime, null));
    this.externalAudience = this.toAudience(options.ExternalAudience, AutoResponderAudience.None);
    this.internalHTML = this.toHTML(options.InternalMessage);
    this.externalHTML = this.toHTML(options.ExternalMessage);
  }

  toOWA() {
    return {
      __type: "MailboxAutoReplyConfigurationOptions:#Exchange",
      AutoReplyState: this.oofState,
      StartTime: this.scheduled ? this.startTime.toISOString() : undefined,
      EndTime: this.scheduled ? this.endTime.toISOString() : undefined,
      ExternalAudience: this.oofAudience,
      InternalMessage: this.fromHTML(this.internalHTML),
      ExternalMessage: this.fromHTML(this.externalHTML),
    };
  }
}
