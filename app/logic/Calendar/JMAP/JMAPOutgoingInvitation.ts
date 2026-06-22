import type { JMAPEvent } from "./JMAPEvent";
import { OutgoingInvitation } from "../Invitation/OutgoingInvitation";

export class JMAPOutgoingInvitation extends OutgoingInvitation {
  declare event: JMAPEvent;
}
