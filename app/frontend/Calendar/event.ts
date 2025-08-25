import type { Event } from "../../logic/Calendar/Event";
import { getLocalStorage } from "../Util/LocalStorage";

export function setNewEventTime(event: Event, exact: boolean = true, startTime: Date, endTime?: Date): void {
  event.startTime = new Date(startTime);
  if (!exact) {
    event.startTime.setHours(event.startTime.getHours() + 1, 0, 0, 0);
  }
  if (endTime) {
    event.endTime = new Date(endTime);
  } else {
    const defaultLengthInMinutes = Math.max(getLocalStorage("calendar.defaultEventLengthInMinutes", 60).value, 1);
    event.endTime = new Date(event.startTime);
    event.endTime.setMinutes(event.startTime.getMinutes() + defaultLengthInMinutes);
  }
}
