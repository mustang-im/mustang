import { Event } from "./Event";
import { FreeBusyStatus, freeBusyStatusLabels } from "./FreeBusyStatus";

export { FreeBusyStatus, freeBusyStatusLabels };

/** An appointment in the calendar of another person, as far as their server reveals it.
 * `title` and `location` are set only when the person lets us see them. */
export class FreeBusyEvent extends Event {
  status: FreeBusyStatus;

  constructor(startTime: Date, endTime: Date, status: FreeBusyStatus) {
    super();
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = status;
  }

  get busyStatus(): FreeBusyStatus {
    return this.status;
  }

  get isFree(): boolean {
    return this.status == FreeBusyStatus.Free;
  }

  get statusLabel(): string {
    return freeBusyStatusLabels[this.status];
  }
}
