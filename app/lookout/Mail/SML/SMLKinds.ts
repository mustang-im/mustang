import type { SMLData } from "../../../logic/Mail/SML/SMLData";
import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
import { createPoll, createMeetingTimePoll, createBookMe } from "../../../logic/Mail/SML/SMLCreateKind";
import { SMLHTTPAccount } from "../../../logic/Mail/SML/SMLHTTPAccount";
import { MessageBox } from "../../Shared/Dialog/MessageBox";
import { showError } from "../../../frontend/Util/error";
import PollIcon from "lucide-svelte/icons/list-checks";
import SchedulingPollIcon from "lucide-svelte/icons/calendar-clock";
import BookingsIcon from "lucide-svelte/icons/calendar-check";
import { gt } from "../../../l10n/l10n";

export enum SMLKind {
  Poll = "SimplePoll",
  SchedulingPoll = "MeetingTimePoll",
  Bookings = "BookMe",
}

export class SMLKinds {
  static kindOf(sml: SMLData | null): SMLKind | null {
    let type = sml?.type ?? sml?.sml?.["@type"];
    return Object.values(SMLKind).includes(type) ? type as SMLKind : null;
  }

  static label(kind: SMLKind): string {
    switch (kind) {
      case SMLKind.Poll: return gt`Poll`;
      case SMLKind.SchedulingPoll: return gt`Scheduling Poll`;
      case SMLKind.Bookings: return gt`Bookings`;
    }
  }

  static icon(kind: SMLKind): ConstructorOfATypedSvelteComponent {
    switch (kind) {
      case SMLKind.SchedulingPoll: return SchedulingPollIcon;
      case SMLKind.Bookings: return BookingsIcon;
      default: return PollIcon;
    }
  }

  static create(kind: SMLKind, identity: MailIdentity): SMLData {
    switch (kind) {
      case SMLKind.Poll: return createPoll(identity);
      case SMLKind.SchedulingPoll: return createMeetingTimePoll(identity);
      case SMLKind.Bookings: return createBookMe(identity);
    }
  }

  static async ensureAccount(identity: MailIdentity): Promise<boolean> {
    if (identity.smlAccount) {
      return true;
    }
    let create = await MessageBox.confirm(gt`Polls`,
      gt`Polls and bookings need a free SML account for ${identity.emailAddress}. The SML server sends a confirmation message to this address, which Mustang processes automatically.` + "\n\n" +
      gt`Do you want to create the account now?`,
      gt`Create Account`);
    if (!create) {
      return false;
    }
    let account = await SMLHTTPAccount.getOrCreateAccount(identity);
    if (!account.isLoggedIn) {
      account.login()
        .catch(showError);
    }
    return true;
  }
}
