import { Event, RecurrenceCase } from "../Event";
import { Participant } from "../Participant";
import { RecurrenceRule } from "../RecurrenceRule";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { Collection } from "svelte-collections";

export class JSONEvent {
  static save(event: Event): any {
    assert(event.calendar?.id, "Need calendar ID to save the event");
    let json: any = {};
    json.id = event.id;
    json.title = event.title;
    json.descriptionText = event.descriptionText;
    json.descriptionHTML = event.descriptionHTML;
    json.startTime = event.startTime.toISOString();
    json.endTime = event.endTime.toISOString();
    json.calUID = event.calUID;
    json.pID = event.pID;
    json.calendarID = event.calendar.id;
    json.recurrenceRule = event.recurrenceRule?.getCalString();
    json.recurrenceMasterEventID = event.parentEvent?.pID;
    json.recurrenceStartTime = event.recurrenceStartTime?.toISOString();
    json.recurrenceIsException = +!!event.parentEvent?.pID;

    this.saveExclusions(event, json);
    this.saveParticipants(event, json);
    return json;
  }

  static saveExclusions(event: Event, json: any) {
    json.eventExclusions = [];
    for (let i = 0; i < event.instances.length; i++) {
      if (event.instances.get(i) === null) {
        json.eventExclusions.push(i);
      }
    }
  }

  static saveParticipants(event: Event, json: any) {
    json.participants = [];
    for (let personUID of event.participants) {
      json.participants.push(this.saveParticipant(personUID));
    }
    return json;
  }

  static saveParticipant(participant: Participant): any {
    let json: any = {};
    json.name = participant.name;
    json.emailAddress = participant.emailAddress;
    json.response = participant.response;
    return json;
  }

  static read(event: Event, json: any, events?: Collection<Event>): Event {
    event.id = json.id;
    event.title = sanitize.label(json.title, "Meeting");
    event.descriptionText = sanitize.label(json.descriptionText, "");
    let html = sanitize.string(json.descriptionHTML, null);
    if (html) {
      event.descriptionHTML = html;
    }
    event.startTime = sanitize.date(json.startTime);
    event.endTime = sanitize.date(json.endTime, event.startTime);
    event.calUID = json.calUID;
    event.pID = json.pID;
    if (json.calendarID) {
      let calendarID = sanitize.string(json.calendarID, null);
      if (event.calendar) {
        assert(event.calendar.id == calendarID, "Wrong calendar");
      } else {
        event.calendar = appGlobal.calendars.find(cal => cal.id == calendarID);
      }
    }
    if (json.recurrenceMasterEventID && json.recurrenceStartTime) {
      let masterID = sanitize.string(json.recurrenceMasterEventID);
      let parentEvent = events?.find(event => event.pID == masterID);
      if (parentEvent?.recurrenceRule) {
        event.recurrenceCase = RecurrenceCase.Exception;
        event.parentEvent = parentEvent;
        event.recurrenceStartTime = sanitize.date(json.recurrenceStartTime);
        let occurrences = event.parentEvent.recurrenceRule?.getOccurrencesByDate(event.recurrenceStartTime) as Date[];
        event.parentEvent.instances.set(occurrences.length - 1, event);
      }
    }
    if (json.recurrenceRule) {
      event.recurrenceCase = RecurrenceCase.Master;
      event.recurrenceRule = RecurrenceRule.fromCalString(event.startTime, json.recurrenceRule);
      JSONEvent.readExclusions(event, json);
    }

    JSONEvent.readParticipants(event, json);
    return event;
  }

  static readExclusions(event: Event, json: any) {
    for (let i of json.recurrenceIndex) {
      event.instances.set(i, null);
    }
  }

  static readParticipants(event: Event, json: any) {
    for (let participant of json.participants) {
      event.participants.add(new Participant(participant.emailAddress, participant.name, participant.response));
    }
  }
}
