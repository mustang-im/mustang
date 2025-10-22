import type { JMAPEvent } from "./JMAPEvent";
import { OutgoingInvitation } from "../Invitation/OutgoingInvitation";
import type { MailIdentity } from "../../Mail/MailIdentity";

export class JMAPOutgoingInvitation extends OutgoingInvitation {
  declare event: JMAPEvent;

  get identity(): MailIdentity {
    return this.event.calendar.account.identities.first;
  }
}
