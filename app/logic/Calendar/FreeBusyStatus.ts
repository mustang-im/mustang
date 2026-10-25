import { gt } from "../../l10n/l10n";

export enum FreeBusyStatus {
  Free = "free",
  Tentative = "tentative",
  Busy = "busy",
  OutOfOffice = "out-of-office",
  WorkingElsewhere = "elsewhere",
}

export const freeBusyStatusLabels: Record<FreeBusyStatus, string> = {
  [FreeBusyStatus.Free]: gt`Free *=> Availability: Not busy at this time`,
  [FreeBusyStatus.Tentative]: gt`Tentative *=> Availability: Has a tentative appointment at this time`,
  [FreeBusyStatus.Busy]: gt`Busy *=> Availability: Not free at this time`,
  [FreeBusyStatus.OutOfOffice]: gt`Out of office`,
  [FreeBusyStatus.WorkingElsewhere]: gt`Working elsewhere`,
};
