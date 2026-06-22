import type { EWSEvent } from "./EWSEvent";
import { OutgoingInvitation } from "../Invitation/OutgoingInvitation";

export class EWSOutgoingInvitation extends OutgoingInvitation {
  event: EWSEvent;
}
