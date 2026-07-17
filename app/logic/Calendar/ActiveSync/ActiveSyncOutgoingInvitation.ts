import type { ActiveSyncEvent } from "./ActiveSyncEvent";
import { OutgoingInvitation } from "../Invitation/OutgoingInvitation";

export class ActiveSyncOutgoingInvitation extends OutgoingInvitation {
  event: ActiveSyncEvent;
}
