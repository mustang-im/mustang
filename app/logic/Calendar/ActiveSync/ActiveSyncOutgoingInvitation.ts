import type { ActiveSyncEvent } from "./ActiveSyncEvent";
import OutgoingInvitation from "../Invitation/OutgoingInvitation";

export default class ActiveSyncOutgoingInvitation extends OutgoingInvitation {
  event: ActiveSyncEvent;
}
