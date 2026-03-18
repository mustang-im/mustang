import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { chatMustangApp } from "../Chat/ChatMustangApp";
// #if [PROPRIETARY]
import { meetMustangApp } from "../Meet/MeetMustangApp";
// #endif
import { mailMustangApp } from "../Mail/MailMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
// #if [!WEBMAIL]
import { filesMustangApp } from "../Files/FilesMustangApp";
import { webAppsMustangApp } from "../WebApps/WebAppsMustangApp";
// #endif
import { settingsMustangApp } from "../Settings/Window/SettingsMustangApp";
import { mustangApps, selectedApp } from "./selectedApp";
import { production } from "../../logic/build";

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
    // #if [!WEBMAIL]
    filesMustangApp,
    webAppsMustangApp,
    // #endif
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
    settingsMustangApp,
  ]);
  selectedApp.set(contactsMustangApp);
}
