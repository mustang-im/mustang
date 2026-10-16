import '../../../logic/app'; // Import first, to set up the module graph and dodge the Account import cycle
import { expect, test } from 'vitest';
import { Event } from '../../../logic/Calendar/Event';
import { MeetAccount } from '../../../logic/Meet/MeetAccount';
import type { URLString } from '../../../logic/util/util';

/** Counts the meetings it creates, instead of contacting a meeting server */
class FakeMeetAccount extends MeetAccount {
  createdMeetings = 0;
  async createMeetingURL(): Promise<URLString> {
    this.createdMeetings++;
    return "https://meet.example.com/" + this.createdMeetings;
  }
}

/** What the event editor does when the user turns "Online meeting" on:
 * Show the meeting box, which picks the meeting account. */
function turnOnlineMeetingOn(event: Event, meetAccount: MeetAccount) {
  event.isOnline = true;
  event.createOnlineMeetingWithAccount ??= meetAccount;
}

/** What the event editor does when the user turns "Online meeting" off.
 * It leaves `createOnlineMeetingWithAccount` as it is. */
function turnOnlineMeetingOff(event: Event) {
  event.isOnline = false;
  event.onlineMeetingURL = null;
}

test("Turning online meeting on and off again before saving creates no meeting", async () => {
  let meetAccount = new FakeMeetAccount();
  let event = new Event();
  turnOnlineMeetingOn(event, meetAccount);
  turnOnlineMeetingOff(event);

  await event.prepareSaveToServer();

  expect(meetAccount.createdMeetings).toBe(0);
  expect(event.onlineMeetingURL).toBeFalsy();
  expect(event.isOnline).toBe(false);
});

test("Turning online meeting on, off and on again creates the meeting", async () => {
  let meetAccount = new FakeMeetAccount();
  let event = new Event();
  turnOnlineMeetingOn(event, meetAccount);
  turnOnlineMeetingOff(event);
  turnOnlineMeetingOn(event, meetAccount);

  await event.prepareSaveToServer();

  expect(meetAccount.createdMeetings).toBe(1);
  expect(event.onlineMeetingURL).toBe("https://meet.example.com/1");
  expect(event.isOnline).toBe(true);
});

test("Turning online meeting on creates the meeting only once", async () => {
  let meetAccount = new FakeMeetAccount();
  let event = new Event();
  turnOnlineMeetingOn(event, meetAccount);

  await event.prepareSaveToServer();
  await event.prepareSaveToServer();

  expect(meetAccount.createdMeetings).toBe(1);
  expect(event.onlineMeetingURL).toBe("https://meet.example.com/1");
});

test("An event with an existing meeting URL keeps it", async () => {
  let meetAccount = new FakeMeetAccount();
  let event = new Event();
  event.isOnline = true;
  event.onlineMeetingURL = "https://teams.example.com/existing";
  // Opening the editor shows the meeting box, which picks the meeting account
  turnOnlineMeetingOn(event, meetAccount);

  await event.prepareSaveToServer();

  expect(meetAccount.createdMeetings).toBe(0);
  expect(event.onlineMeetingURL).toBe("https://teams.example.com/existing");
  expect(event.isOnline).toBe(true);
});
