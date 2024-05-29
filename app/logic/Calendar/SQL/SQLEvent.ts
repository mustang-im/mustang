import { Event } from "../Event";
import type { Calendar } from "../Calendar";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { backgroundError } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLEvent extends Event {
  static async save(event: Event) {
    assert(event.calendar?.dbID, "Need calendar DB ID to save the event");
    if (!event.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO event (
          title, descriptionText, descriptionHTML,
          startTime, endTime,
          iCalUID, pID, calendarID
        ) VALUES (
          ${event.title}, ${event.descriptionText}, ${event.descriptionHTML},
          ${event.startTime?.toISOString()}, ${event.endTime?.toISOString()},
          ${event.iCalUID}, ${event.pID}, ${event.calendar?.dbID}
        )`);
      event.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE event SET
          title = ${event.title},
          descriptionText = ${event.descriptionText},
          descriptionHTML = ${event.descriptionHTML},
          startTime = ${event.startTime?.toISOString()},
          endTime = ${event.endTime?.toISOString()},
          iCalUID = ${event.iCalUID},
          pID = ${event.pID},
          calendarID = ${event.calendar?.dbID}
        WHERE id = ${event.dbID}
        `);
    }

    await this.saveParticipants(event);
  }

  static async saveParticipants(event: Event) {
    // TODO Use a more elegant way to remove deleted entries
    await (await getDatabase()).run(sql`
      DELETE FROM eventParticipant
      WHERE eventID = ${event.dbID}
      `);

    for (let uid of event.participants) {
      await this.saveParticipant(event, uid);
    }
  }

  static async saveParticipant(event: Event, uid: PersonUID) {
    await (await getDatabase()).run(sql`
      INSERT INTO eventParticipant (
        eventID, emailAddress, name, confirmed
      ) VALUES (
        ${event.dbID}, ${uid.emailAddress}, ${uid.name}, null
      )`);
  }

  /** Will also delete all event participant entries, but not the persons itself */
  static async deleteIt(event: Event) {
    assert(event.dbID, "Need Event DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM event
      WHERE id = ${event.dbID}
      `);
  }

  static async read(dbID: number, event: Event, row?: any): Promise<Event> {
    if (!row) {
      row = await (await getDatabase()).get(sql`
        SELECT
          title, descriptionText, descriptionHTML,
          startTime, endTime,
          iCalUID, pID, calendarID
        FROM event
        WHERE id = ${dbID}
        `) as any;
    }
    event.dbID = sanitize.integer(dbID);
    event.title = sanitize.label(row.title, "Meeting");
    event.descriptionText = sanitize.label(row.descriptionText, "");
    let html = sanitize.string(row.descriptionHTML, null);
    if (html) {
      event.descriptionHTML = html;
    }
    event.startTime = sanitize.date(row.startTime, null);
    event.endTime = sanitize.date(row.endTime, event.startTime);
    event.iCalUID = row.iCalUID;
    event.pID = row.pID;
    if (row.calendarID) {
      let calendarID = sanitize.integer(row.calendarID, null);
      if (event.calendar) {
        assert(event.calendar.dbID == calendarID, "Wrong calendar");
      } else {
        event.calendar = appGlobal.calendars.find(cal => cal.dbID == calendarID);
      }
    }

    await SQLEvent.readParticipants(event);
    return event;
  }

  protected static async readParticipants(event: Event) {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        emailAddress, name, confirmed
      FROM eventParticipant
      WHERE eventID = ${event.dbID}
      `) as any;
    for (let row of rows) {
      try {
        let uid = findOrCreatePersonUID(row.emailAddress, row.name);
        event.participants.add(uid);
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }

  /**
   * Also first reads the persons from DB.
   * @returns all groups with their members
   */
  static async readAll(calendar: Calendar): Promise<void> {
    assert(calendar.dbID, "Need calendar ID to read events from SQL database");

    let rows = await (await getDatabase()).all(sql`
      SELECT
        title, descriptionText, descriptionHTML,
        startTime, endTime,
        iCalUID, pID, id
      FROM event
      WHERE calendarID = ${calendar.dbID}
      `) as any;
    let newEvents = new ArrayColl<Event>();
    for (let row of rows) {
      try {
        let event = calendar.events.find(event => event.dbID == row.id);
        if (!event) {
          event = calendar.newEvent();
          newEvents.add(event);
        }
        event.calendar = calendar;
        await SQLEvent.read(row.id, event, row);
      } catch (ex) {
        calendar.errorCallback(ex);
      }
    }
    calendar.events.addAll(newEvents);
  }
}
