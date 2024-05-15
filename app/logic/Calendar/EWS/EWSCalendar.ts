import { Calendar } from "../Calendar";
import { EWSEvent } from "./EWSEvent";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";

export class EWSCalendar extends Calendar {
  readonly protocol: string = "calendar-ews";
  account: EWSAccount;

  newEvent(): EWSEvent {
    return new EWSEvent(this);
  }
}
