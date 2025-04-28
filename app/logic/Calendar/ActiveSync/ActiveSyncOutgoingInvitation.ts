import type { ActiveSyncEvent } from "./ActiveSyncEvent";
import OutgoingInvitation from "../Invitation/OutgoingInvitation";
import type { MailIdentity } from "../../Mail/MailIdentity";

export default class ActiveSyncOutgoingInvitation extends OutgoingInvitation {
  event: ActiveSyncEvent;

  get identity(): MailIdentity {
    return this.event.calendar.account.identities.first;
  }
}
