import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import type { Event } from "../../../../logic/Calendar/Event.ts";
import type { EMail } from "../../../../logic/Mail/EMail.ts";
import { ICalEMailProcessor } from "../../../../logic/Calendar/ICal/ICalEMailProcessor";
import * as fs from "node:fs/promises";

// Not using JSONEvent because it's really hard to use
// in a test especially when testing for malformed events
// and it's also broken at time of writing anyway
function toJSON(event: Event) {
  return {
    title: event.title,
    startTime: event.startTime?.toJSON(),
    endTime: event.endTime?.toJSON(),
    timezone: event.timezone || undefined,
    allDay: event.allDay,
    calUID: event.calUID,
    location: event.location,
    descriptionText: event.descriptionText,
    recurrenceRule: event.recurrenceRule?.getCalString(event.allDay),
    participants: event.participants.contents.map(participant => participant._properties),
  };
}

const dataDir = new URL("./TestData/", import.meta.url);
const allFiles = await fs.readdir(dataDir);
const testFiles = allFiles.filter(name => name.endsWith(".ics")).map(name => name.slice(0, -4));
test.each(testFiles)("Parse %s", async name => {
  const calendar = await fs.readFile(new URL(name + ".ics", dataDir), { encoding: 'utf-8' });
  const [invitationMessage, event] = JSON.parse(await fs.readFile(new URL(name + ".json", dataDir), { encoding: 'utf-8' }));
  const processor = new ICalEMailProcessor();
  const email: EMail = {
    attachments: [{
      mimeType: "text/calendar",
      content: {
        text() {
          return calendar;
        }
      }
    }],
  };
  await processor.process(email, null);
  expect(email.invitationMessage).toEqual(invitationMessage);
  expect(toJSON(email.event as Event)).toEqual(event);
});
