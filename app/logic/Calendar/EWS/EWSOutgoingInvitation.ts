import type { EWSEvent } from "./EWSEvent";
import OutgoingInvitation from "../Invitation/OutgoingInvitation";

export default class EWSOutgoingInvitation extends OutgoingInvitation {
  event: EWSEvent;
}
