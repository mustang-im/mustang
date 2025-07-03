import type { Event } from "../../logic/Calendar/Event";
import { selectedEvent } from "./selected";
import { calendarMustangApp } from "./CalendarMustangApp";
import { openApp, bringAppToFront } from "../AppsBar/selectedApp";
import { appGlobal } from "../../logic/app";
import { getLocalStorage } from "../Util/LocalStorage";
import CalendarIcon from '../asset/icon/appBar/calendar.svg?raw';
import { sleep } from "../../logic/util/util";
import { backgroundError } from "../Util/error";
import type { Collection } from "svelte-collections";

let eventsWithAlarms: Collection<Event>;

export async function reminderListener() {
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
  let settings = getLocalStorage("notifications.mail", ["popup", "sound"]).value;
  const doSound = settings.includes("sound");
  const doTaskbar = settings.includes("taskbar");
  const doTray = settings.includes("try");
  const doWebNotification = settings.includes("popup");
  const doOSNotification = settings.includes("popup-os");
  let isOSNotificationSupported: boolean = undefined;

  if (doOSNotification && isOSNotificationSupported === undefined) {
    isOSNotificationSupported = await appGlobal.remoteApp.isOSNotificationSupported();
  }

  if (doSound) {
    try {
      let audioEl = new Audio("/sound/new-message.mp3");
      audioEl.autoplay = true;
    } catch (ex) {
      backgroundError(ex);
    }
  }

  if (doWebNotification) {
    for (let event of events) {
      try {
        let notification = new Notification(event.title, {
          body: event.descriptionText,
          tag: "Meeting",
          renotify: true,
          // icon: url,
          // image: url,
          data: event,
        });
        // shows automatically after creating the object
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }

  if (doOSNotification && isOSNotificationSupported) {
    for (let event of events) {
      try {
        let notification = await appGlobal.remoteApp.newOSNotification({
          title: event.title,
          body: event.descriptionText,
          // icon: url,
          // Linux only
          urgency: "normal",
          // Windows
          // toastXml: ...,
        });
        console.log("notification", notification);
        notification.show();

        notification.on("click", event => openEvent(event));
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }

  if (doTaskbar) {
    try {
    } catch (ex) {
      backgroundError(ex);
    }
  }

  if (doTray) {
    try {
      await appGlobal.remoteApp.newTrayIcon(bubbleImageURL(events.length));
    } catch (ex) {
      backgroundError(ex);
    }
  }
}

async function openEvent(event: Event) {
  try {
    selectedEvent.set(event);
    openApp(calendarMustangApp);
    bringAppToFront();
  } catch (ex) {
    console.error(ex);
  }
}

function bubbleImageURL(count: number) {
  return "data:image/svg;base64," + btoa(CalendarIcon);
}
