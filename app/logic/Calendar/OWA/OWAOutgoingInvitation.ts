import type { OWAEvent } from "./OWAEvent";
import { OutgoingInvitation } from "../Invitation/OutgoingInvitation";

export class OWAOutgoingInvitation extends OutgoingInvitation {
  event: OWAEvent;
}
