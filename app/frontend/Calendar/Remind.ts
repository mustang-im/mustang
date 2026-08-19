import type { Event } from "../../logic/Calendar/Event";
import { openEvent } from "./open";
import { bringAppToFront } from "../AppsBar/selectedApp";
import { appGlobal } from "../../logic/app";
import { SystemNotification, NotificationKinds } from "../Shared/SystemNotification";
import { getLocalStorage } from "../Util/LocalStorage";
import CalendarIcon from '../asset/icon/appBar/calendar.svg?raw';
import { sleep } from "../../logic/util/util";
import type { Collection } from "svelte-collections";
import { gt } from "../../l10n/l10n";

let eventsWithAlarms: Collection<Event>;

export async function reminderListener() {
  return;
  await sleep(3);
  waitForNextAlarm();
}

let timeout: NodeJS.Timeout;
let unsubscribe: () => void;
let isSubscribing = false;

function waitForNextAlarm() {
  console.log("waitForAlarm");
  if (isSubscribing) {
    return;
  }
  clearTimeout(timeout);
  unsubscribe?.();
  let now = Date.now();
  eventsWithAlarms = appGlobal.calendarEvents.filterObservable(event =>
    event.alarm && event.alarm.getTime() > now)
    .sortBy(event => event.alarm);
  console.log("events with alarms", eventsWithAlarms.contents, eventsWithAlarms.contents.map(ev => ev.title + " " + ev.alarm.toLocaleString()).join(", "));
  isSubscribing = true;
  unsubscribe = eventsWithAlarms.subscribe(() => waitForNextAlarm());
  isSubscribing = false;
  let nextEvent = eventsWithAlarms.first;
  if (!nextEvent) {
    return;
  }
  console.log("next event", nextEvent.title, nextEvent.alarm.toLocaleString());
  console.log("timeout in", (nextEvent.alarm.getTime() - now) / 1000, "s");
  setTimeout(showReminder, nextEvent.alarm.getTime() - now);
}

export async function showReminder() {
  console.log("show reminder");
  let now = Date.now();
  let events = eventsWithAlarms.filterOnce(event => event.alarm.getTime() < now);
  console.log("Show reminders for", events.contents);
  waitForNextAlarm();
  if (events.isEmpty) {
    return;
  }

  // settings
  const kinds = new NotificationKinds(getLocalStorage("notifications.calendar", ["popup", "sound"]).value);

  for (let event of events) {
    let notification = new SystemNotification(kinds, event.title, event.descriptionText, gt`Meeting *=> an event in the user's calendar`);
    notification.icon = CalendarIcon;
    notification.onClick = () => openEventInApp(event);
    await notification.show();
  }
}

async function openEventInApp(event: Event) {
  try {
    openEvent(event);
    bringAppToFront();
  } catch (ex) {
    console.error(ex);
  }
}
