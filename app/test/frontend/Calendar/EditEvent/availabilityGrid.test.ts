// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { Calendar } from "../../../../logic/Calendar/Calendar";
import { Participant } from "../../../../logic/Calendar/Participant";
import { InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
import { selectedEvent } from "../../../../frontend/Calendar/selected";
import { notifications } from "../../../../frontend/MainWindow/Notification";
import { getWeekStart } from "../../../../frontend/Util/date";
import AvailabilityGrid from "../../../../frontend/Calendar/EditEvent/AvailabilityGrid.svelte";
import { ArrayColl } from "svelte-collections";
import { flushSync, mount, unmount } from "svelte";
import { get } from "svelte/store";
import { afterEach, beforeAll, beforeEach, expect, test } from "vitest";

beforeAll(() => {
  appGlobal.remoteApp = {} as any;
});

beforeEach(() => {
  selectedEvent.set(null);
  notifications.clear();
});

class TestCalendar extends Calendar {
  async arePersonsFree(participants: Participant[], from: Date, to: Date) {
    return participants.map(participant => ({
      participant,
      availability: [{ from, to, free: participant.emailAddress.startsWith("free") }],
    }));
  }
}

let grid: Record<string, any> | null = null;

afterEach(() => {
  if (grid) {
    unmount(grid);
    grid = null;
  }
  document.body.innerHTML = "";
});

async function showGrid(): Promise<void> {
  let start = getWeekStart(new Date(2026, 8, 3));
  start.setHours(9, 0, 0, 0);
  let participants = new ArrayColl([
    new Participant("free@example.com", "Frida Free", InvitationResponse.Unknown),
    new Participant("busy@example.com", "Bob Busy", InvitationResponse.Unknown),
  ]);
  grid = mount(AvailabilityGrid, {
    target: document.body,
    props: { participants, start, calendar: new TestCalendar() },
  });
  await new Promise(resolve => setTimeout(resolve, 0));
  flushSync();
}

/** The free/busy blocks are `Event`s that are in no calendar,
 * so opening or selecting them would fail #1430 */
test("Clicking a free/busy block neither selects nor opens it", async () => {
  await showGrid();
  let blocks = document.querySelectorAll(".event, .event *");
  expect(blocks.length).toBeGreaterThan(0);

  for (let block of blocks) {
    block.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    block.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  }
  flushSync();

  expect(notifications.contents.map(notification => notification.message)).toEqual([]);
  expect(get(selectedEvent)).toBeNull();
});
