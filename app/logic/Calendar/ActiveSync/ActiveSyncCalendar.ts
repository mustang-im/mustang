import { Calendar } from "../Calendar";
import { ActiveSyncEvent } from "./ActiveSyncEvent";
import type { ActiveSyncAccount } from "../../Mail/ActiveSync/ActiveSyncAccount";

export class ActiveSyncCalendar extends Calendar {
  readonly protocol: string = "calendar-activesync";
  account: ActiveSyncAccount;

  newEvent(parentEvent?: ActiveSyncEvent): ActiveSyncEvent {
    return new ActiveSyncEvent(this, parentEvent);
  }
}
