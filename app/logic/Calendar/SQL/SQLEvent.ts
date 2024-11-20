import { Event } from "../Event";
import { RecurrenceRule } from "../RecurrenceRule";
import type { Calendar } from "../Calendar";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { backgroundError } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLEvent extends Event {
  static async save(event: Event) {
    assert(event.calendar?.dbID, "Need calendar DB ID to save the event");
    if (!event.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO event (
          title, descriptionText, descriptionHTML,
          startTime, endTime,
          calUID, response, pID, calendarID,
          recurrenceRule, recurrenceMasterEventID,
          recurrenceStartTime, recurrenceIsException
        ) VALUES (
          ${event.title}, ${event.descriptionText}, ${event.descriptionHTML},
          ${event.startTime.toISOString()}, ${event.endTime.toISOString()},
          ${event.calUID}, ${event.response}, ${event.pID}, ${event.calendar?.dbID},
          ${event.recurrenceRule?.getCalString()}, ${event.parentEvent?.dbID},
          ${event.recurrenceStartTime?.toISOString()},
          ${+!!event.parentEvent?.dbID}
        )`);
      event.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE event SET
          title = ${event.title},
          descriptionText = ${event.descriptionText},
          descriptionHTML = ${event.descriptionHTML},
          startTime = ${event.startTime.toISOString()},
          endTime = ${event.endTime.toISOString()},
          calUID = ${event.calUID},
          response = ${event.response},
          pID = ${event.pID},
          calendarID = ${event.calendar?.dbID},
          recurrenceRule = ${event.recurrenceRule?.getCalString()},
          recurrenceMasterEventID = ${event.parentEvent?.dbID},
          recurrenceStartTime = ${event.recurrenceStartTime?.toISOString()},
          recurrenceIsException = ${+!!event.parentEvent?.dbID}
        WHERE id = ${event.dbID}
        `);
    }

    await this.saveExclusions(event);
    await this.saveParticipants(event);
  }

  static async saveExclusions(event: Event) {
    await (await getDatabase()).run(sql`
      DELETE FROM eventExclusion
      WHERE recurrenceMasterEventID = ${event.dbID}
      `);

    for (let i = 0; i < event.instances.length; i++) {
      if (event.instances.get(i) === null) {
        await (await getDatabase()).run(sql`
          INSERT INTO eventExclusion (
            recurrenceMasterEventID, recurrenceIndex
          ) VALUES (
            ${event.dbID}, ${i}
          )`);
      }
    }
  }

  static async saveParticipants(event: Event) {
    await (await getDatabase()).run(sql`
      DELETE FROM eventParticipant
      WHERE eventID = ${event.dbID}
      `);

    for (let personUID of event.participants) {
      await this.saveParticipant(event, personUID);
    }
  }

  static async saveParticipant(event: Event, personUID: PersonUID) {
    await (await getDatabase()).run(sql`
      INSERT INTO eventParticipant (
        eventID, emailAddress, name, confirmed
      ) VALUES (
        ${event.dbID},  ${personUID.emailAddress}, ${personUID.name}, null
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

  static async read(dbID: number, event: Event, row?: any, events?: Collection<Event>): Promise<Event> {
    if (!row) {
      row = await (await getDatabase()).get(sql`
        SELECT
          title, descriptionText, descriptionHTML,
          startTime, endTime,
          calUID, response, pID, calendarID,
          recurrenceRule, recurrenceMasterEventID, recurrenceStartTime
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
    event.startTime = sanitize.date(row.startTime);
    event.endTime = sanitize.date(row.endTime, event.startTime);
    event.calUID = row.calUID;
    event.response = row.response;
    event.pID = row.pID;
    if (row.calendarID) {
      let calendarID = sanitize.integer(row.calendarID, null);
      if (event.calendar) {
        assert(event.calendar.dbID == calendarID, "Wrong calendar");
      } else {
        event.calendar = appGlobal.calendars.find(cal => cal.dbID == calendarID);
      }
    }
    if (row.recurrenceMasterEventID && row.recurrenceStartTime) {
      let masterID = sanitize.integer(row.recurrenceMasterEventID);
      let parentEvent = events?.find(event => event.dbID == masterID);
      if (parentEvent?.recurrenceRule) {
        event.parentEvent = parentEvent;
        event.recurrenceStartTime = sanitize.date(row.recurrenceStartTime);
        let occurrences = event.parentEvent.recurrenceRule.getOccurrencesByDate(event.recurrenceStartTime);
        event.parentEvent.instances.set(occurrences.length - 1, event);
      }
    }
    if (row.recurrenceRule) {
      event.repeat = true;
      event.recurrenceRule = RecurrenceRule.fromCalString(event.startTime, row.recurrenceRule);
      await SQLEvent.readExclusions(event);
    }

    await SQLEvent.readParticipants(event);
    return event;
  }

  protected static async readExclusions(event: Event) {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        recurrenceIndex
      FROM eventExclusion
      WHERE recurrenceMasterEventID = ${event.dbID}
      `) as any;
    for (let row of rows) {
      event.instances.set(row.recurrenceIndex, null);
    }
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
        let personUID = findOrCreatePersonUID(row.emailAddress, row.name);
        event.participants.add(personUID);
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
        calUID, response, pID, id,
        recurrenceRule, recurrenceMasterEventID, recurrenceStartTime
      FROM event
      WHERE calendarID = ${calendar.dbID}
      ORDER BY id
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
        await SQLEvent.read(row.id, event, row, newEvents);
      } catch (ex) {
        calendar.errorCallback(ex);
      }
    }
    calendar.events.addAll(newEvents);
  }
}
