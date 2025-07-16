import type { Calendar } from "../Calendar";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

export class JSONCalendar {
  static save(cal: Calendar): any {
    assert(cal.id, "Need calendar ID to save");
    let json: any = {};
    json.id = cal.id;
    json.name = cal.name;
    json.protocol = cal.protocol;
    json.url = cal.url;
    json.syncState = cal.syncState;
    return json;
  }

  static read(cal: Calendar, json: any): Calendar {
    assert(cal.id, "Need calendar ID to read it");
    cal.id = sanitize.alphanumdash(json.id);
    cal.name = sanitize.label(json.name);
    assert(cal.protocol == sanitize.alphanumdash(json.protocol), "Calendar object of wrong type passed in");
    cal.url = sanitize.url(json.url, null);
    cal.username = sanitize.string(json.username, null);
    cal.workspace = json.workspace
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(json.workspaceID, null))
      : null;
    cal.syncState = json.syncState;
    return cal;
  }
}
