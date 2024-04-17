import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { chatMustangApp } from "../Chat/ChatMustangApp";
import { meetMustangApp } from "../Meet/MeetMustangApp";
import { mailMustangApp } from "../Mail/MailMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import { filesMustangApp } from "../Files/FilesMustangApp";
import { webAppsMustangApp } from "../WebApps/WebAppsMustangApp";
import { settingsMustangApp } from "../Settings/Window/SettingsMustangApp";
import { mustangApps, selectedApp } from "./selectedApp";

export function loadMustangApps() {
  mustangApps.addAll([
    contactsMustangApp,
    mailMustangApp,
    chatMustangApp,
    meetMustangApp,
    calendarMustangApp,
    filesMustangApp,
    webAppsMustangApp,
    settingsMustangApp,
  ]);
  selectedApp.set(contactsMustangApp);
}
