import { Calendar } from "../Calendar";
import { OWAEvent } from "./OWAEvent";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";

export class OWACalendar extends Calendar {
  readonly protocol: string = "calendar-owa";
  account: OWAAccount;

  newEvent(): OWAEvent {
    return new OWAEvent(this);
  }
}
