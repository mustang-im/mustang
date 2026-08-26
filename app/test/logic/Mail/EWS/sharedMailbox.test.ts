import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { ExchangeMailAccount } from "../../../../logic/Mail/EWS/ExchangeMailAccount";
import { ExchangeCalendar } from "../../../../logic/Calendar/EWS/ExchangeCalendar";

// Alice's own mailbox, plus Bob's and Carol's, which they shared with her
let alice = new ExchangeMailAccount();
alice.username = "alice@example.com";
let aliceCalendar = new ExchangeCalendar();
aliceCalendar.initFromMainAccount(alice);
aliceCalendar.useForInvitations = true;

let bob = new ExchangeMailAccount();
bob.initFromMainAccount(alice);
bob.username = "bob@example.com";
let bobCalendar = new ExchangeCalendar();
bobCalendar.initFromMainAccount(alice);
bobCalendar.username = bob.username;
bobCalendar.useForInvitations = true;

// Carol shared no calendar
let carol = new ExchangeMailAccount();
carol.initFromMainAccount(alice);
carol.username = "carol@example.com";

appGlobal.emailAccounts.addAll([alice, bob, carol]);
appGlobal.calendars.addAll([aliceCalendar, bobCalendar]);

test("Invitations to the shared mailbox go to the shared calendar", () => {
  expect(bob.calendarsAvailable.length).toBe(1);
  expect(bob.calendarsAvailable.first).toBe(bobCalendar);
  expect(bob.calendar).toBe(bobCalendar);
});

test("Invitations to a shared mailbox without a shared calendar go to our own calendar", () => {
  expect(carol.calendarsAvailable.length).toBe(1);
  expect(carol.calendarsAvailable.first).toBe(aliceCalendar);
  expect(carol.calendar).toBe(aliceCalendar);
});

test("Invitations to our own mailbox do not go to the shared calendar", () => {
  expect(alice.calendarsAvailable.length).toBe(1);
  expect(alice.calendarsAvailable.first).toBe(aliceCalendar);
  expect(alice.calendar).toBe(aliceCalendar);
});
