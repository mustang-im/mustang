import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { chatMustangApp } from "../Chat/ChatMustangApp";
import { meetMustangApp } from "../Meet/MeetMustangApp";
import { mailMustangApp } from "../Mail/MailMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import { filesMustangApp } from "../Files/FilesMustangApp";
import { webAppsMustangApp } from "../WebApps/WebAppsMustangApp";
import { mustangApps, selectedApp } from "./selectedApp";

export function loadMustangApps() {
  mustangApps.addAll([
    contactsMustangApp,
    mailMustangApp,
    chatMustangApp,
    calendarMustangApp,
    meetMustangApp,
    filesMustangApp,
    webAppsMustangApp,
  ]);
  selectedApp.set(contactsMustangApp);
}
