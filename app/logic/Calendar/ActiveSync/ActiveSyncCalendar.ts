import { Calendar } from "../Calendar";
import { ActiveSyncEvent } from "./ActiveSyncEvent";
import type { ActiveSyncAccount, ActiveSyncPingable } from "../../Mail/ActiveSync/ActiveSyncAccount";

export class ActiveSyncCalendar extends Calendar implements ActiveSyncPingable {
  readonly protocol: string = "calendar-activesync";
  account: ActiveSyncAccount;
  readonly folderClass = "Calendar";

  get serverID() {
    return new URL(this.url).searchParams.get("serverID");
  }

  async ping() {
  }

  newEvent(parentEvent?: ActiveSyncEvent): ActiveSyncEvent {
    return new ActiveSyncEvent(this, parentEvent);
  }
}
