// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPCalendar } from "../../../../logic/Calendar/JMAP/JMAPCalendar";
import type { JMAPEvent } from "../../../../logic/Calendar/JMAP/JMAPEvent";
import type { TJMAPCalendarEvent } from "../../../../logic/Calendar/JMAP/TJSCalendar";
import { InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import type { EMail } from "../../../../logic/Mail/EMail";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
import { afterEach, beforeAll, expect, test } from "vitest";

const kMe = "calendar-alice@example.com";
const kAttendee = "calendar-bob@example.com";
const kStartTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

beforeAll(() => {
  appGlobal.remoteApp ??= {
    kyCreate: () => { throw new Error("The test should not talk to a server"); },
  } as any;
});

afterEach(() => {
  appGlobal.calendars.clear();
  appGlobal.emailAccounts.clear();
});

/** A JMAP account with my identity and a JMAP calendar, with the server calls and sent mails captured.
 * Stalwart does not send scheduling messages unless asked, so our client must send them.
 * @param destroyResponse what the server answers to `CalendarEvent/set destroy` */
function setup(destroyResponse: (id: string) => any = id => ({ destroyed: [id] })) {
  let account = new JMAPAccount();
  account.emailAddress = kMe;
  account.realname = "Alice";
  account.accountID = "u";
  let identity = new MailIdentity(account);
  identity.emailAddress = kMe;
  identity.realname = account.realname;
  account.identities.add(identity);
  for (let specialFolder of [SpecialFolder.Inbox, SpecialFolder.Sent]) {
    let folder = account.newFolder();
    folder.specialFolder = specialFolder;
    account.rootFolders.add(folder);
  }
  appGlobal.emailAccounts.add(account);
  let calls: { method: string, args: any }[] = [];
  account.makeSingleCall = async (method: string, args: any) => {
    calls.push({ method, args });
    return { accountId: "u", oldState: "s1", newState: "s2", ...destroyResponse(args.destroy[0]) };
  };
  let sent: EMail[] = [];
  account.send = async (email: EMail) => {
    sent.push(email);
  };

  let calendar = new JMAPCalendar();
  calendar.initFromMainAccount(account);
  calendar.jmapID = "b";
  calendar.storage = new DummyCalendarStorage();
  appGlobal.calendars.add(calendar);
  return { calendar, calls, sent };
}

/** A meeting as Stalwart returns it from `CalendarEvent/get` */
function serverMeeting(organizer: string, myStatus: string): TJMAPCalendarEvent {
  return {
    "@type": "Event",
    id: "e",
    uid: "c3edf21c-a0f3-4ad2-b6e4-1edf565c59bf",
    calendarIds: { b: true },
    isDraft: false,
    isOrigin: organizer == kMe,
    title: "Project meeting",
    start: kStartTime.toISOString().replace(/\.\d+Z$/, ""),
    duration: "PT1H",
    sequence: 0,
    organizerCalendarAddress: "mailto:" + organizer,
    participants: {
      "92f6ff39-1ef7-4784-8081-d514dcd744f0": {
        "@type": "Participant",
        calendarAddress: "mailto:" + kMe,
        name: "Alice",
        participationStatus: organizer == kMe ? "accepted" : myStatus,
        ...(organizer == kMe ? { roles: { owner: true } } : {}),
      },
      "fbcf2288-5a44-4c3c-abe8-552619ac3d37": {
        "@type": "Participant",
        calendarAddress: "mailto:" + kAttendee,
        name: "Bob",
        participationStatus: organizer == kMe ? "needs-action" : "accepted",
        ...(organizer == kAttendee ? { roles: { owner: true } } : {}),
      },
    },
  } as any as TJMAPCalendarEvent;
}

function addEvent(calendar: JMAPCalendar, json: TJMAPCalendarEvent): JMAPEvent {
  let event = calendar.newEvent();
  event.fromJMAP(json);
  calendar.events.add(event);
  return event;
}

test("Deleting a meeting that I organize cancels it for the attendees", async () => {
  let { calendar, calls, sent } = setup();
  let event = addEvent(calendar, serverMeeting(kMe, "accepted"));
  expect(event.isOutgoingMeeting).toBe(true);

  await event.deleteIt();

  expect(calls.map(call => [call.method, call.args.destroy])).toEqual([["CalendarEvent/set", ["e"]]]);
  expect(sent.length).toBe(1);
  expect(sent[0].iCalMethod).toBe("CANCEL");
  expect(sent[0].to.contents.map(person => person.emailAddress)).toEqual([kAttendee]);
});

test("Deleting an invitation declines it", async () => {
  let { calendar, calls, sent } = setup();
  let event = addEvent(calendar, serverMeeting(kAttendee, "accepted"));
  expect(event.isIncomingMeeting).toBe(true);

  await event.deleteIt();

  expect(calls.map(call => [call.method, call.args.destroy])).toEqual([["CalendarEvent/set", ["e"]]]);
  expect(sent.length).toBe(1);
  expect(sent[0].iCalMethod).toBe("REPLY");
  expect(sent[0].to.first.emailAddress).toBe(kAttendee);
  expect(sent[0].event.participants.first.response).toBe(InvitationResponse.Decline);
});

test("Nothing is sent when the server refuses to delete the meeting", async () => {
  let { calendar, sent } = setup(id => ({ notDestroyed: { [id]: { type: "forbidden" } } }));
  let event = addEvent(calendar, serverMeeting(kMe, "accepted"));

  await expect(event.deleteIt()).rejects.toThrow("Failed to delete on server");
  expect(sent.length).toBe(0);
});

test("Deleting an event without participants sends nothing", async () => {
  let { calendar, calls, sent } = setup();
  let json = serverMeeting(kMe, "accepted");
  delete json.participants;
  delete json.organizerCalendarAddress;
  let event = addEvent(calendar, json);

  await event.deleteIt();

  expect(calls.length).toBe(1);
  expect(sent.length).toBe(0);
});
