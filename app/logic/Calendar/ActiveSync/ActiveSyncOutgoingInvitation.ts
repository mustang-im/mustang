import type { ActiveSyncEvent } from "./ActiveSyncEvent";
import OutgoingInvitation from "../Invitation/OutgoingInvitation";
import type { MailIdentity } from "../../Mail/MailIdentity";
import type { EMail } from "../../Mail/EMail";

export default class ActiveSyncOutgoingInvitation extends OutgoingInvitation {
  event: ActiveSyncEvent;

  get identity(): MailIdentity {
    return this.event.calendar.account.identities.first;
  }

  protected newEMailFrom(): EMail {
    return this.event.calendar.account.newEMailFrom();
  }
}
