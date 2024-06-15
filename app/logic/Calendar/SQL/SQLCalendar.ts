import type { Calendar, CalendarStorage } from "../Calendar";
import type { Event } from "../Event";
import { getDatabase } from "./SQLDatabase";
import { newCalendarForProtocol } from "../AccountsList/Calendars";
import { SQLEvent } from "./SQLEvent";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLCalendar implements CalendarStorage {
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
      // TODO save password separately
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO calendar (
          idStr, name, protocol, url, username,
          workspace, syncState
        ) VALUES (
          ${cal.id}, ${cal.name}, ${cal.protocol}, ${cal.url}, ${cal.username},
          ${cal.workspace}, ${cal.syncState}
        )`);
      cal.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE calendar SET
          name = ${cal.name}, url = ${cal.url}, username = ${cal.username},
          workspace = ${cal.workspace}, syncState = ${cal.syncState}
        WHERE id = ${cal.dbID}
        `);
    }
    if (!cal.storage) {
      cal.storage = new SQLCalendar();
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
        workspace, syncState
      FROM calendar
      WHERE id = ${dbID}
      `) as any;
    cal.dbID = dbID;
    (cal.id as any) = sanitize.alphanumdash(row.idStr);
    cal.name = sanitize.label(row.name);
    assert(cal.protocol == sanitize.alphanumdash(row.protocol), "Calendar object of wrong type passed in");
    cal.username = sanitize.string(row.username, null);
    cal.url = sanitize.url(row.url, null);
    cal.workspace = row.workspace
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(row.workspace, null))
      : null;
    cal.syncState = row.syncState;
    if (!cal.storage) {
      cal.storage = new SQLCalendar();
    }
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

  async deleteCalendar(calendar: Calendar): Promise<void> {
    await SQLCalendar.deleteIt(calendar);
  }
  async saveCalendar(calendar: Calendar): Promise<void> {
    await SQLCalendar.save(calendar);
  }
  async saveEvent(event: Event): Promise<void> {
    await SQLEvent.save(event);
  }
  async deleteEvent(event: Event): Promise<void> {
    await SQLEvent.deleteIt(event);
  }
}
