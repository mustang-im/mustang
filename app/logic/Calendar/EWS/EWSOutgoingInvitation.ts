import type { EWSEvent } from "./EWSEvent";
import { OutgoingInvitation } from "../Invitation/OutgoingInvitation";
import type { MailIdentity } from "../../Mail/MailIdentity";

export class EWSOutgoingInvitation extends OutgoingInvitation {
  event: EWSEvent;

  get identity(): MailIdentity {
    return this.event.calendar.account.identities.first;
  }
}
