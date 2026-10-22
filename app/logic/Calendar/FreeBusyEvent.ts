import { Event } from "./Event";
import { gt } from "../../l10n/l10n";

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

  get isFree(): boolean {
    return this.status == FreeBusyStatus.Free;
  }

  get statusLabel(): string {
    return freeBusyStatusLabels[this.status];
  }
}

export enum FreeBusyStatus {
  Free = "free",
  Tentative = "tentative",
  Busy = "busy",
  OutOfOffice = "oof",
  WorkingElsewhere = "elsewhere",
}

export const freeBusyStatusLabels: Record<FreeBusyStatus, string> = {
  [FreeBusyStatus.Free]: gt`Free *=> Availability: Not busy at this time`,
  [FreeBusyStatus.Tentative]: gt`Tentative *=> Availability: Has a tentative appointment at this time`,
  [FreeBusyStatus.Busy]: gt`Busy`,
  [FreeBusyStatus.OutOfOffice]: gt`Out of office`,
  [FreeBusyStatus.WorkingElsewhere]: gt`Working elsewhere`,
};
