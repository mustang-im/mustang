import { Event, RecurrenceCase } from "../Event";
import { Participant } from "../Participant";
import { RecurrenceRule } from "../RecurrenceRule";
import type { Calendar } from "../Calendar";
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
    let jsonStr = JSON.stringify(event.toExtraJSON(), null, 2);
    let lock = await event.storageLock.lock();
    try {
      if (!event.dbID) {
        let insert = await (await getDatabase()).run(sql`
          INSERT INTO event (
            title, descriptionText, descriptionHTML,
            startTime, endTime, allDay, startTimeTZ,
            calUID, responseToOrganizer, pID, calendarID,
            recurrenceRule, recurrenceMasterEventID,
            recurrenceStartTime, recurrenceIsException, json
          ) VALUES (
            ${event.title}, ${event.rawText}, ${event.rawHTMLDangerous},
            ${event.startTime.toISOString()}, ${event.endTime.toISOString()}, ${event.allDay ? 1 : 0}, ${event.timezone},
            ${event.calUID}, ${event.myParticipation}, ${event.pID}, ${event.calendar?.dbID},
            ${event.recurrenceRule?.getCalString(event.allDay)}, ${event.parentEvent?.dbID},
            ${event.recurrenceStartTime?.toISOString()},
            ${+!!event.parentEvent?.dbID},
            ${jsonStr}
          )`);
        event.dbID = insert.lastInsertRowid;
      } else {
        await (await getDatabase()).run(sql`
          UPDATE event SET
            title = ${event.title},
            descriptionText = ${event.rawText},
            descriptionHTML = ${event.rawHTMLDangerous},
            startTime = ${event.startTime.toISOString()},
            endTime = ${event.endTime.toISOString()},
            allDay = ${event.allDay ? 1 : 0},
            startTimeTZ = ${event.timezone},
            calUID = ${event.calUID},
            responseToOrganizer = ${event.myParticipation},
            pID = ${event.pID},
            calendarID = ${event.calendar?.dbID},
            recurrenceRule = ${event.recurrenceRule?.getCalString(event.allDay)},
            recurrenceMasterEventID = ${event.parentEvent?.dbID},
            recurrenceStartTime = ${event.recurrenceStartTime?.toISOString()},
            recurrenceIsException = ${+!!event.parentEvent?.dbID},
            json = ${jsonStr}
          WHERE id = ${event.dbID}
          `);
      }

      await this.saveExclusions(event);
      await this.saveParticipants(event);
    } finally {
      lock.release();
    }
  }

  protected static async saveExclusions(event: Event) {
    await (await getDatabase()).run(sql`
      DELETE FROM eventExclusion
      WHERE recurrenceMasterEventID = ${event.dbID}
      `);

    for (let exclusion of event.exclusions) {
      let index = event.recurrenceRule.getIndexOfOccurrence(exclusion);
      await (await getDatabase()).run(sql`
        INSERT INTO eventExclusion (
          recurrenceMasterEventID, recurrenceIndex
        ) VALUES (
          ${event.dbID}, ${index}
        )`);
    }
  }

  protected static async saveParticipants(event: Event) {
    await (await getDatabase()).run(sql`
      DELETE FROM eventParticipant
      WHERE eventID = ${event.dbID}
      `);

    for (let personUID of event.participants) {
      await this.saveParticipant(event, personUID);
    }
  }

  protected static async saveParticipant(event: Event, participant: Participant) {
    let json = {} as any;
    json.lastUpdateTime = participant.lastUpdateTime;
    await (await getDatabase()).run(sql`
      INSERT INTO eventParticipant (
        eventID, emailAddress, name, confirmed, json
      ) VALUES (
        ${event.dbID}, ${participant.emailAddress}, ${participant.name}, ${participant.response},
        ${JSON.stringify(json, null, 2)}
      )`);
  }

  /** Will also delete all event participant entries, but not the persons itself */
  static async deleteIt(event: Event) {
    assert(event.dbID, "Need Event DB ID to delete");
    let lock = await event.storageLock.lock();
    try {
      let dbID = event.dbID;
      event.dbID = null;
      await (await getDatabase()).run(sql`
        DELETE FROM event
        WHERE id = ${dbID}
        `);
    } finally {
      lock.release();
    }
  }

  static async read(dbID: number, event: Event, row?: any, events?: Collection<Event>): Promise<Event> {
    if (!row) {
      // <copied to="readAll()" />
      row = await (await getDatabase()).get(sql`
        SELECT
          title, descriptionText, descriptionHTML,
          startTime, endTime, allDay, startTimeTZ,
          calUID, responseToOrganizer, pID, calendarID,
          recurrenceRule, recurrenceMasterEventID, recurrenceStartTime, json
        FROM event
        WHERE id = ${dbID}
        `) as any;
    }
    event.dbID = sanitize.integer(dbID);
    event.title = sanitize.label(row.title, "Meeting");
    event.rawText = sanitize.label(row.descriptionText, "");
    let html = sanitize.string(row.descriptionHTML, null);
    if (html) {
      event.rawHTMLDangerous = html;
    }
    event.startTime = sanitize.date(row.startTime);
    event.endTime = sanitize.date(row.endTime, event.startTime);
    event.allDay = sanitize.boolean(row.allDay, false);
    event.timezone = sanitize.string(row.startTimeTZ, null);
    event.calUID = row.calUID;
    event.myParticipation = sanitize.integerRange(row.responseToOrganizer, 0, 5);
    event.pID = row.pID;
    event.fromExtraJSON(sanitize.json(row.json, {}));
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
      // TODO assumes that the master is read before the exception
      let parentEvent = events?.find(event => event.dbID == masterID);
      if (parentEvent?.recurrenceRule) {
        event.recurrenceCase = RecurrenceCase.Exception;
        event.parentEvent = parentEvent;
        event.recurrenceStartTime = sanitize.date(row.recurrenceStartTime);
        parentEvent.exceptions.add(event);
        parentEvent.generateRecurringInstances(); // TODO the exception should keep the parent in sync automatically
      }
    }
    if (row.recurrenceRule) {
      event.recurrenceRule = RecurrenceRule.fromCalString(event.duration, event.startTime, row.recurrenceRule);
      await SQLEvent.readExclusions(event);
      event.generateRecurringInstances(); // TODO the exclusion should keep the parent in sync automatically
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
      let index = row.recurrenceIndex;
      let normalTime = event.recurrenceRule.getOccurrenceByIndex(index);
      if (!normalTime) {
        // TODO fillOccurences()?
        event.calendar.errorCallback(new Error("Occurrence not filled"));
        continue;
      }
      event.exclusions.add(normalTime);
    }
  }

  protected static async readParticipants(event: Event) {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        emailAddress, name, confirmed, json
      FROM eventParticipant
      WHERE eventID = ${event.dbID}
      `) as any;
    for (let row of rows) {
      try {
        let participant = new Participant(row.emailAddress, row.name, row.confirmed);
        let json = sanitize.json(row.json, {});
        participant.lastUpdateTime = sanitize.date(json.lastUpdateTime, null);
        event.participants.add(participant);
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

    // <copied from="read()" />
    let rows = await (await getDatabase()).all(sql`
      SELECT
        title, descriptionText, descriptionHTML,
        startTime, endTime, allDay, startTimeTZ,
        calUID, responseToOrganizer, pID, id,
        recurrenceRule, recurrenceMasterEventID, recurrenceStartTime, json
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
