import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { chatMustangApp } from "../Chat/ChatMustangApp";
// #if [PROPRIETARY]
import { meetMustangApp } from "../Meet/MeetMustangApp";
// #endif
import { mailMustangApp } from "../Mail/MailMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import { filesMustangApp } from "../Files/FilesMustangApp";
import { webAppsMustangApp } from "../WebApps/WebAppsMustangApp";
import { settingsMustangApp } from "../Settings/Window/SettingsMustangApp";
import { mustangApps, selectedApp } from "./selectedApp";
import { production } from "../../logic/build";
import { visualMustangApp } from "../Visual/VisualMustangApp";

export function loadMustangApps() {
  if (!production) {
    loadDemoMustangApps();
    selectedApp.set(mailMustangApp);
    return;
  }
  // Once finished, add apps here, and remove loadDemoMustangApps() */

  mustangApps.replaceAll([
    contactsMustangApp,
    mailMustangApp,
    calendarMustangApp,
    filesMustangApp,
    settingsMustangApp,
  ]);
}

export function loadDemoMustangApps() {
  mustangApps.replaceAll([
    contactsMustangApp,
    mailMustangApp,
    chatMustangApp,
    // #if [PROPRIETARY]
    meetMustangApp,
    // #endif
    calendarMustangApp,
    filesMustangApp,
    webAppsMustangApp,
    visualMustangApp,
    settingsMustangApp,
  ]);
  selectedApp.set(contactsMustangApp);
}
