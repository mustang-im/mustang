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

export function loadMustangApps() {
  if (production) {
    mustangApps.addAll([
      contactsMustangApp,
      mailMustangApp,
      calendarMustangApp,
      filesMustangApp,
      settingsMustangApp,
    ]);
  } else {
    mustangApps.addAll([
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
  }
  selectedApp.set(contactsMustangApp);
}
