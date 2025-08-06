import type { Calendar } from "../Calendar";
import { assert } from "../../util/util";

export class JSONCalendar {
  static save(cal: Calendar): any {
    return cal.toConfigJSON();
  }

  static read(cal: Calendar, json: any): Calendar {
    assert(cal.id, "Need calendar ID to read it");
    cal.fromConfigJSON(json);
    return cal;
  }
}
