import { k1MinuteMS } from "../../../frontend/Util/date";
import { readable } from "svelte/store";

export class CurrentTime {
  // <copied from="../../../frontend/Calendar/CurrentTimeMarker.svelte">
  static readonly minute = readable(new Date(), set => {
    let timeout: ReturnType<typeof setTimeout>;
    function update() {
      let time = new Date();
      timeout = setTimeout(update, k1MinuteMS - time.getSeconds() * 1000 - time.getMilliseconds());
      time.setSeconds(0, 0);
      set(time);
    }
    update();
    return () => clearTimeout(timeout);
  });
  // </copied>

  static isToday(day: Date, now: Date): boolean {
    return day.toDateString() == now.toDateString();
  }

  static isBeforeToday(day: Date, now: Date): boolean {
    let today = new Date(now);
    today.setHours(0, 0, 0, 0);
    return day < today;
  }
}
