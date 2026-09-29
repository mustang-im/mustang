import { ExchangeAutoResponder } from "../EWS/ExchangeAutoResponder";
import type { OWAAccount } from "./OWAAccount";
import { OWARequest } from "./Request/OWARequest";
import { OWAError } from "./OWAError";

export class OWAAutoResponder extends ExchangeAutoResponder {
  declare readonly account: OWAAccount;

  async load(): Promise<void> {
    let response = await this.callOOF(new OWARequest("GetUserOofSettings", {
      __type: "GetUserOofSettingsRequest:#Exchange",
      Mailbox: this.mailbox,
    }));
    this.fromExchange(response);
  }

  async save(): Promise<void> {
    this.validate();
    await this.callOOF(new OWARequest("SetUserOofSettings", {
      __type: "SetUserOofSettingsRequest:#Exchange",
      Mailbox: this.mailbox,
      UserOofSettings: this.toOWA(),
    }));
  }

  /** As in EWS, a lone `ResponseMessage`, which `callOWA()` does not check */
  protected async callOOF(request: OWARequest): Promise<any> {
    let response = await this.account.callOWA(request);
    if (response?.ResponseMessage?.ResponseClass == "Error") {
      throw new OWAError({ json: response.ResponseMessage });
    }
    return response;
  }

  protected get mailbox() {
    return {
      __type: "EmailAddress:#Exchange",
      Address: this.account.emailAddress,
    };
  }

  toOWA() {
    return {
      __type: "UserOofSettings:#Exchange",
      OofState: this.oofState,
      ExternalAudience: this.oofAudience,
      Duration: this.scheduled ? {
        __type: "Duration:#Exchange",
        StartTime: this.startTime.toISOString(),
        EndTime: this.endTime.toISOString(),
      } : undefined,
      InternalReply: {
        __type: "ReplyBody:#Exchange",
        Message: this.fromHTML(this.internalHTML),
      },
      ExternalReply: {
        __type: "ReplyBody:#Exchange",
        Message: this.fromHTML(this.externalHTML),
      },
    };
  }
}
