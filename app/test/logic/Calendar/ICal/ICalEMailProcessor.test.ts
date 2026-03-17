import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import type { Event } from "../../../../logic/Calendar/Event.ts";
import type { EMail } from "../../../../logic/Mail/EMail.ts";
import { ICalEMailProcessor } from "../../../../logic/Calendar/ICal/ICalEMailProcessor";
import { VContainer } from "../../../../logic/util/VParser";
import { getICal, getUpdatedVEvent } from "../../../../logic/Calendar/ICal/EventToICal";
import * as fs from "node:fs/promises";

// Not using JSONEvent because it's really hard to use
// in a test especially when testing for malformed events
// and it's also broken at time of writing anyway
function toJSON(event: Event) {
  return {
    title: event.title,
    startTime: event.startTime?.toJSON(),
    endTime: event.endTime?.toJSON(),
    recurrenceStartTime: event.recurrenceStartTime?.toJSON(),
    timezone: event.timezone != "UTC" && event.timezone || undefined,
    allDay: event.allDay,
    calUID: event.calUID,
    location: event.location,
    descriptionText: event.rawText ?? undefined,
    descriptionHTML: event.rawHTMLDangerous ?? undefined,
    recurrenceRule: event.recurrenceRule?.getCalString(event.allDay),
    participants: event.participants.contents.map(participant => participant._properties),
  };
}

const dataDir = new URL("./TestData/", import.meta.url);
const allFiles = await fs.readdir(dataDir);
const testFiles = allFiles.filter(name => name.endsWith(".ics")).map(name => name.slice(0, -4));
test.each(testFiles)("Parse %s", async name => {
  const calendar = await fs.readFile(new URL(name + ".ics", dataDir), { encoding: 'utf-8' });
  let text = calendar; // we need to be able to parse this variable than once
  const [invitationMessage, event] = JSON.parse(await fs.readFile(new URL(name + ".json", dataDir), { encoding: 'utf-8' }));
  const processor = new ICalEMailProcessor();
  const email: EMail = {
    attachments: [{
      mimeType: "text/calendar",
      content: {
        text() {
          return text;
        }
      }
    }],
    getUpdateCalendars() {
      return [];
    },
  };
  await processor.process(email, null);
  expect(email.invitationMessage).toEqual(invitationMessage);
  expect(toJSON(email.event as Event)).toEqual(event);
  text = getICal(email.event);
  await processor.process(email, null);
  expect(toJSON(email.event as Event)).toEqual(event);
  let parsed = new VContainer(calendar);
  text = getUpdatedVEvent(email.event, parsed.objects.vevent[0]);
  for (let line of calendar.match(/^BEGIN:VEVENT$.*^END:VEVENT$/ims)[0].match(/^\w.+/gm)) {
    // Ignore lines that we know we will have rewritten
    if (!/\b(begin|method|end|version|prodid|dtstamp|summary|location|description|styled-description|x-alt-desc|dtstart|dtend|recurrence-id|rrule|status|organizer|attendee)\b/i.test(line)) {
      expect(text).toContain(line);
    }
  }
});
