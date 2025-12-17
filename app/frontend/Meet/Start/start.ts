import { MeetingState, VideoConfMeeting } from "../../../logic/Meet/VideoConfMeeting";
import { MeetAccount } from "../../../logic/Meet/MeetAccount";
import { LiveKitAccount } from "../../../logic/Meet/LiveKit/LiveKitAccount";
import { VideoStream } from "../../../logic/Meet/VideoStream";
import { MeetingParticipant } from "../../../logic/Meet/Participant";
import type { Person } from "../../../logic/Abstract/Person";
import { Event } from "../../../logic/Calendar/Event";
import { joinConferenceByURL } from "../../../logic/Meet/StartCall";
import { isLicensed } from "../../../logic/util/LicenseClient";
import { appGlobal } from "../../../logic/app";
import { LocalMediaDeviceStreams } from "../../../logic/Meet/LocalMediaDeviceStreams";
import { gt } from "../../../l10n/l10n";
import { UserError, type URLString } from "../../../logic/util/util";

export async function startAdHocMeeting(): Promise<VideoConfMeeting> {
  await createMustangMeetAccountIfPossible();
  let meeting = getMeetAccount().newMeeting();
  await meeting.createNewConference();
  appGlobal.meetings.add(meeting);
  return meeting;
}

export function getMeetAccount(): MeetAccount {
  let account = appGlobal.meetAccounts.find(acc => acc.canVideo && acc.canMultipleParticipants);
  if (!account) {
    throw new UserError(gt`Please configure a matching meeting account first`);
  }
  return account;
}

export async function startFakeMeeting() {
  const { FakeMeeting } = await import("../../../logic/Meet/FakeMeeting");
  let meeting = new FakeMeeting();
  await meeting.createNewConference();
  appGlobal.meetings.add(meeting);
}

class FakeIncomingCall extends VideoConfMeeting {
  constructor() {
    super();
    this.account = new MeetAccount();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.listenStreamChanges();
    this.state = MeetingState.IncomingCall;
  }
  async answer(): Promise<void> {
    super.answer();
    this.myParticipant = new MeetingParticipant();
    this.state = MeetingState.Ongoing;
  }
}

export async function testIncoming(person: Person) {
  const { faker } = await import("@faker-js/faker");
  let fakeMeeting = new Event();
  fakeMeeting.startTime = faker.date.soon({ days: 1/24/4 });
  fakeMeeting.endTime = faker.date.soon({ days: 1/24 });
  fakeMeeting.title = faker.word.words();
  fakeMeeting.descriptionText = faker.hacker.phrase();
  appGlobal.calendars.first.events.add(fakeMeeting);

  let caller = new MeetingParticipant();
  caller.name = person.name;
  caller.picture = person.picture;
  let meeting = new FakeIncomingCall();
  meeting.participants.add(caller);
  appGlobal.meetings.add(meeting);
}

export async function callSelected(person: Person): Promise<VideoConfMeeting> {
  const { faker } = await import("@faker-js/faker");
  let callee = new MeetingParticipant();
  callee.name = person.name;
  callee.picture = person.picture;

  let event = new Event();
  event.startTime = faker.date.past({ years: 0.001 });
  event.endTime = faker.date.future({ years: 0.001 });
  event.title = gt`Final Approval UX Meet`;
  event.descriptionHTML = gt`<p>
    Objectives of the meeting are:
    <ol>
      <li>Review of the UX specs for Meet app</li>
      <li>Discussion of feedback</li>
      <li>Decision whether to proceed</li>
      <li>Next steps</li>
    </ol>
  </p>`;

  // TODO Figure out the best account to call this person
  let meeting = getMeetAccount().newMeeting();
  await meeting.createNewConference();
  meeting.state = MeetingState.OutgoingCallConfirm;
  meeting.event = event;
  meeting.participants.add(callee);
  appGlobal.meetings.add(meeting);
  meeting.videos.add(new VideoStream(new MediaStream(), callee));
  let self = new VideoStream(new MediaStream());
  self.isMe = true;
  meeting.videos.add(self);
  // meeting.myParticipant.role = ParticipantRole.Moderator;
  return meeting;
}

export async function joinByURL(url: URLString) {
  let meeting = await joinConferenceByURL(url);
  appGlobal.meetings.add(meeting);
}

export async function createMustangMeetAccountIfPossible() {
  // For paying users only, create a free Meet account for demo purposes
  if (!appGlobal.meetAccounts.find(acc => acc.url == "https://meet.mustang.im") &&
      appGlobal.emailAccounts.hasItems &&
      await isLicensed()) {
    let account = new LiveKitAccount();
    account.name = "Demo";
    account.url = "https://meet.mustang.im";
    account.username = appGlobal.emailAccounts.first.emailAddress;
    appGlobal.meetAccounts.add(account);
  }
}
