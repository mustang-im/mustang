import type { Calendar } from "../../logic/Calendar/Calendar";
import type { WorkHours } from "../../logic/Calendar/WorkHours";
import type { Collection } from "svelte-collections";
import type { Readable, Subscriber } from "svelte/store";

/** The work hours of the shown calendars, as Svelte store.
 * Updates when the user shows or hides a calendar, or when work hours change. */
export class ShownWorkHours implements Readable<WorkHours[]> {
  protected readonly calendars: Collection<Calendar>;

  constructor(calendars: Collection<Calendar>) {
    this.calendars = calendars;
  }

  subscribe(run: Subscriber<WorkHours[]>): () => void {
    let unsubscribeCalendars: (() => void)[] = [];
    let update = () => run(this.calendars.contents
      .map(calendar => calendar.workHours)
      .filter(workHours => workHours));
    let unsubscribeList = this.calendars.subscribe(() => {
      unsubscribeCalendars.forEach(unsubscribe => unsubscribe());
      unsubscribeCalendars = this.calendars.contents.map(calendar => calendar.subscribe((_calendar, property) => {
        if (property == "workHours") {
          update();
        }
      }));
      update();
    });
    return () => {
      unsubscribeList();
      unsubscribeCalendars.forEach(unsubscribe => unsubscribe());
    };
  }
}
