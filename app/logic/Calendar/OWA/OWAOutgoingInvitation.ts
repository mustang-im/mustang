import type { OWAEvent } from "./OWAEvent";
import OutgoingInvitation from "../Invitation/OutgoingInvitation";

export default class OWAOutgoingInvitation extends OutgoingInvitation {
  event: OWAEvent;
}
