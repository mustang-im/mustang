import { ExchangeAutoResponder } from "./ExchangeAutoResponder";
import type { EWSAccount } from "./EWSAccount";

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
    this.fromExchange(response);
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

  /** Elements must be in schema order */
  toEWS() {
    return {
      t$OofState: this.oofState,
      t$ExternalAudience: this.oofAudience,
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
