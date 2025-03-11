import type { Calendar } from "../Calendar";
import { getDatabase } from "./SQLDatabase";
import { newCalendarForProtocol } from "../AccountsList/Calendars";
import { SQLCalendarStorage } from "./SQLCalendarStorage";
import { getWorkspaceByID } from "../../Abstract/Workspace";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLCalendar {
  static async save(cal: Calendar) {
    if (!cal.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM calendar
        WHERE
          idStr = ${cal.id}
        `) as any;
      if (existing?.id) {
        cal.dbID = existing.id;
      }
    }
    if (!cal.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO calendar (
          idStr, name, protocol, url, username,
          workspace, syncState, configJSON
        ) VALUES (
          ${cal.id}, ${cal.name}, ${cal.protocol}, ${cal.url}, ${cal.username},
          ${cal.workspace?.id}, ${cal.syncState},
          ${JSON.stringify(cal.toConfigJSON(), null, 2)}
        )`);
      cal.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE calendar SET
          name = ${cal.name}, url = ${cal.url}, username = ${cal.username},
          workspace = ${cal.workspace?.id}, syncState = ${cal.syncState},
          configJSON = ${JSON.stringify(cal.toConfigJSON(), null, 2)}
        WHERE id = ${cal.dbID}
        `);
    }
  }

  /** Also deletes all persons and groups in this address book */
  static async deleteIt(calendar: Calendar) {
    assert(calendar.dbID, "Need calendar DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM calendar
      WHERE id = ${calendar.dbID}
      `);
  }

  static async read(dbID: number, cal: Calendar) {
    assert(dbID, "Need calendar DB ID to read it");
    let row = await (await getDatabase()).get(sql`
      SELECT
        idStr, name, protocol, url, username,
        workspace, syncState, configJSON
      FROM calendar
      WHERE id = ${dbID}
      `) as any;
    cal.dbID = dbID;
    (cal.id as any) = sanitize.alphanumdash(row.idStr);
    cal.name = sanitize.label(row.name);
    assert(cal.protocol == sanitize.alphanumdash(row.protocol), "Calendar object of wrong type passed in");
    cal.username = sanitize.string(row.username, null);
    cal.url = sanitize.url(row.url, null);
    cal.fromConfigJSON(sanitize.json(row.configJSON, {}));
    cal.workspace = getWorkspaceByID(sanitize.string(row.workspaceID, null));
    cal.syncState = row.syncState;
    cal.storage = new SQLCalendarStorage();
    return cal;
  }

  static async readAll(): Promise<ArrayColl<Calendar>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, protocol
      FROM calendar
      `) as any;
    let calendars = new ArrayColl<Calendar>();
    for (let row of rows) {
      try {
        let calendar = newCalendarForProtocol(row.protocol);
        await SQLCalendar.read(row.id, calendar);
        calendars.add(calendar);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return calendars;
  }
}
