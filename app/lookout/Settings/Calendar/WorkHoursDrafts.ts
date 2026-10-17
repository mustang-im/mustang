import type { Calendar } from "../../../logic/Calendar/Calendar";
import { WorkHours } from "../../../logic/Calendar/WorkHours";

export class WorkHoursDrafts {
  protected readonly drafts = new Map<Calendar, WorkHours>();

  draftOf(calendar: Calendar): WorkHours | null {
    if (!calendar.workHours) {
      return null;
    }
    if (calendar.isOtherPersonsCalendar) {
      return calendar.workHours;
    }
    let draft = this.drafts.get(calendar);
    if (!draft) {
      draft = new WorkHours();
      draft.copyFrom(calendar.workHours);
      this.drafts.set(calendar, draft);
    }
    return draft;
  }

  get changedCalendars(): Calendar[] {
    return [ ...this.drafts.entries() ]
      .filter(([ calendar, draft ]) => calendar.workHours && !calendar.workHours.equals(draft))
      .map(([ calendar ]) => calendar);
  }

  async save() {
    for (let calendar of this.changedCalendars) {
      calendar.workHours.copyFrom(this.drafts.get(calendar));
      await calendar.saveWorkHours();
    }
  }
}
