// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPCalendar } from "../../../../logic/Calendar/JMAP/JMAPCalendar";
import type { JMAPEvent } from "../../../../logic/Calendar/JMAP/JMAPEvent";
import type { TJMAPCalendarEvent } from "../../../../logic/Calendar/JMAP/TJSCalendar";
import { ICalEMailProcessor } from "../../../../logic/Calendar/ICal/ICalEMailProcessor";
import { InvitationMessage, InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import type { EMail } from "../../../../logic/Mail/EMail";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import { MailIdentity } from "../../../../logic/Mail/MailIdentity";
import { beforeAll, expect, test } from "vitest";

const kMe = "user2@example.com";
const kOrganizer = "user1@example.com";
const kCalUID = "calsvr.example.com-8739701987387998";

function toICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
}

/** RFC 6047 example invitation, but in the future, because we don't reply to past meetings */
const kStartTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
const kInvitation = `BEGIN:VCALENDAR
PRODID:-//Example/ExampleCalendarClient//EN
METHOD:REQUEST
VERSION:2.0
BEGIN:VEVENT
ORGANIZER:mailto:${kOrganizer}
ATTENDEE;ROLE=CHAIR;PARTSTAT=ACCEPTED:mailto:${kOrganizer}
ATTENDEE;RSVP=YES;CUTYPE=INDIVIDUAL:mailto:${kMe}
DTSTAMP:20080507T170000Z
DTSTART:${toICalDate(kStartTime)}
DTEND:${toICalDate(new Date(kStartTime.getTime() + 30 * 60 * 1000))}
SUMMARY:Phone call to discuss your last visit
UID:${kCalUID}
SEQUENCE:0
STATUS:TENTATIVE
END:VEVENT
END:VCALENDAR
`;


beforeAll(() => {
  appGlobal.remoteApp ??= {
    kyCreate: () => { throw new Error("The test should not talk to a server"); },
  };
});

/** A JMAP account with a linked JMAP calendar, with the server calls captured */
function setup() {
  let account = new JMAPAccount();
  account.emailAddress = kMe;
  account.realname = "User 2";
  account.accountID = "jmapAccount";
  let identity = new MailIdentity(account);
  identity.emailAddress = kMe;
  identity.realname = account.realname;
  account.identities.add(identity);
  for (let specialFolder of [SpecialFolder.Inbox, SpecialFolder.Sent]) {
    let folder = account.newFolder();
    folder.specialFolder = specialFolder;
    account.rootFolders.add(folder);
  }
  let calls: { method: string, args: any }[] = [];
  account.makeSingleCall = async (method: string, args: any) => {
    calls.push({ method, args });
    return { created: { [Object.keys(args.create ?? {})[0]]: { id: "serverEventID" } } };
  };
  let sent: EMail[] = [];
  account.send = async (email: EMail) => {
    sent.push(email);
  };

  let calendar = new JMAPCalendar();
  calendar.initFromMainAccount(account);
  calendar.jmapID = "calendarID";
  calendar.storage = new DummyCalendarStorage();

  return { account, calendar, calls, sent };
}

/** The invitation email, as it arrives in the JMAP inbox */
async function newInvitationEMail(account: JMAPAccount): Promise<EMail> {
  let email = account.getSpecialFolder(SpecialFolder.Inbox).newEMail();
  let attachment = email.newAttachment();
  attachment.fromFile(new File([kInvitation], "invite.ics", { type: "text/calendar" }));
  email.attachments.add(attachment);
  await new ICalEMailProcessor().process(email);
  expect(email.invitationMessage).toEqual(InvitationMessage.Invitation);
  return email;
}

test("Accepting an invitation adds the event to the JMAP calendar", async () => {
  let { account, calendar, calls, sent } = setup();
  let email = await newInvitationEMail(account);

  // As `<InvitationButtons>` does it
  let invitation = calendar.getIncomingInvitationForEMail(email);
  await invitation.respondToInvitationFromMail(InvitationResponse.Accept);
  await invitation.calEvent()?.save();

  let event = calendar.events.first as JMAPEvent;
  expect(calendar.events.length).toEqual(1);
  expect(event.title).toEqual(email.event.title);
  expect(event.calUID).toEqual(email.event.calUID);
  expect(event.startTime).toEqual(email.event.startTime);
  expect(event.myParticipation).toEqual(InvitationResponse.Accept);
  expect(event.jmapID).toEqual("serverEventID");

  expect(calls.length).toEqual(1);
  expect(calls[0].method).toEqual("CalendarEvent/set");
  let created = Object.values(calls[0].args.create)[0] as TJMAPCalendarEvent;
  expect(created.uid).toEqual(email.event.calUID);
  expect(created.calendarIds).toEqual({ calendarID: true });
  let participants = Object.values(created.participants);
  expect(participants.find(participant => participant.email == kMe).participationStatus).toEqual("accepted");
  expect(participants.find(participant => participant.email == kOrganizer).roles.owner).toEqual(true);

  expect(sent.length).toEqual(1);
  expect(sent[0].iCalMethod).toEqual("REPLY");
  expect(sent[0].to.first.emailAddress).toEqual(kOrganizer);
  // Only myself in the reply: RFC 5546 3.2.3
  expect(sent[0].event.participants.length).toEqual(1);
  expect(sent[0].event.participants.first.emailAddress).toEqual(kMe);
  expect(sent[0].event.participants.first.response).toEqual(InvitationResponse.Accept);
});

test("Declining an invitation tells the server and the organizer", async () => {
  let { account, calendar, calls, sent } = setup();
  let email = await newInvitationEMail(account);

  let invitation = calendar.getIncomingInvitationForEMail(email);
  await invitation.respondToInvitationFromMail(InvitationResponse.Decline);
  await invitation.calEvent()?.save();

  let created = Object.values(calls[0].args.create)[0] as TJMAPCalendarEvent;
  let participants = Object.values(created.participants);
  expect(participants.find(participant => participant.email == kMe).participationStatus).toEqual("declined");
  expect(sent[0].event.participants.first.response).toEqual(InvitationResponse.Decline);
});
