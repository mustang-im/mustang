import { AutoResponder, AutoResponderAudience } from "../AutoResponder";
import type { ActiveSyncAccount } from "./ActiveSyncAccount";
import { ActiveSyncError } from "./ActiveSyncError";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from "../../util/util";

/** `Settings` command, `Oof` property. Exchange replies once per sender. */
export class ActiveSyncAutoResponder extends AutoResponder {
  declare readonly account: ActiveSyncAccount;

  get supported(): boolean {
    return true;
  }

  get supportsExternal(): boolean {
    return true;
  }

  get supportsContacts(): boolean {
    return true;
  }

  async load(): Promise<void> {
    let response = await this.callOOF({ Get: { BodyType: "HTML" } });
    this.fromEAS(response.Get ?? {});
  }

  async save(): Promise<void> {
    this.validate();
    await this.callOOF({ Set: this.toEAS() });
  }

  /** @param request `Get` or `Set`
   * @returns `Oof` of the response */
  protected async callOOF(request: { Get?: object, Set?: object }): Promise<Record<string, any>> {
    let response = await this.account.callEAS("Settings", { Oof: request });
    if (response?.Oof?.Status != "1") {
      throw new ActiveSyncError("Settings", response?.Oof?.Status, this.account);
    }
    return response.Oof;
  }

  /** @param get `Get` of the `Oof` response */
  fromEAS(get: Record<string, any>) {
    let state = sanitize.enum(get.OofState, ["0", "1", "2"], "0");
    this.enabled = state != "0";
    this.scheduled = state == "2";
    this.setTimes(sanitize.date(get.StartTime, null), sanitize.date(get.EndTime, null));
    let messages = ensureArray(get.OofMessage).filter(message => message && typeof (message) == "object");
    let internal = messages.find(message => "AppliesToInternal" in message);
    let known = messages.find(message => "AppliesToExternalKnown" in message);
    let unknown = messages.find(message => "AppliesToExternalUnknown" in message);
    this.externalAudience =
      unknown?.Enabled == "1" ? AutoResponderAudience.All :
      known?.Enabled == "1" ? AutoResponderAudience.Contacts :
      AutoResponderAudience.None;
    // The server omits the audiences that the admin does not allow
    this.maxAudience =
      unknown ? AutoResponderAudience.All :
      known ? AutoResponderAudience.Contacts :
      AutoResponderAudience.None;
    let external = [unknown, known].find(message => message?.Enabled == "1") ?? unknown ?? known;
    this.internalHTML = this.toHTML(internal?.ReplyMessage);
    this.externalHTML = this.toHTML(external?.ReplyMessage);
  }

  /** Elements must be in schema order, apart from within `OofMessage` */
  toEAS() {
    let set: any = {
      OofState: !this.enabled ? "0" : this.scheduled ? "2" : "1",
    };
    if (this.scheduled) {
      set.StartTime = this.startTime.toISOString();
      set.EndTime = this.endTime.toISOString();
    }
    let external = this.fromHTML(this.externalHTML);
    set.OofMessage = [
      oofMessage("AppliesToInternal", true, this.fromHTML(this.internalHTML)),
      oofMessage("AppliesToExternalKnown", this.externalAudience != AutoResponderAudience.None, external),
      oofMessage("AppliesToExternalUnknown", this.externalAudience == AutoResponderAudience.All, external),
    ];
    return set;
  }
}

function oofMessage(appliesTo: string, enabled: boolean, message: string) {
  return {
    [appliesTo]: {},
    Enabled: enabled ? "1" : "0",
    ReplyMessage: message,
    BodyType: "HTML",
  };
}
