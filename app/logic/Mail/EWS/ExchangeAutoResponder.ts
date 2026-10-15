import { AutoResponder, AutoResponderAudience } from "../AutoResponder";
import type { ExchangeMailAccount } from "./ExchangeMailAccount";

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

  protected get oofState(): OOFState {
    return !this.enabled ? OOFState.Disabled : this.scheduled ? OOFState.Scheduled : OOFState.Enabled;
  }

  protected set oofState(state: OOFState) {
    this.enabled = state == OOFState.Enabled || state == OOFState.Scheduled;
    this.scheduled = state == OOFState.Scheduled;
  }

  protected get oofAudience(): OOFAudience {
    return ExchangeAutoResponder.kAudiences.indexOf(this.externalAudience);
  }

  protected toAudience(audience: OOFAudience, fallback: AutoResponderAudience): AutoResponderAudience {
    return ExchangeAutoResponder.kAudiences[audience] ?? fallback;
  }

  protected static readonly kAudiences = [
    AutoResponderAudience.None,
    AutoResponderAudience.Contacts,
    AutoResponderAudience.All,
  ];
}

export enum OOFState {
  Disabled = 0,
  Enabled = 1,
  Scheduled = 2,
}

export enum OOFAudience {
  None = 0,
  Known = 1,
  All = 2,
}
