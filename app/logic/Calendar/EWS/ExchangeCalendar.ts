import { Calendar } from "../Calendar";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class ExchangeCalendar extends Calendar {
  /** Exchange's calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;
  /** Is this the default calendar that handles incoming invitations */
  useForInvitations: boolean = false;

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.useForInvitations = sanitize.boolean(json.useForInvitations, false);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.useForInvitations = this.useForInvitations;
    return json;
  }
}
