import type { OWAEvent } from "./OWAEvent";
import { OutgoingInvitation } from "../Invitation/OutgoingInvitation";
import type { MailIdentity } from "../../Mail/MailIdentity";

export class OWAOutgoingInvitation extends OutgoingInvitation {
  event: OWAEvent;

  get identity(): MailIdentity {
    return this.event.calendar.account.identities.first;
  }
}
