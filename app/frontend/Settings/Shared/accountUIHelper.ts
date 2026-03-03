import type { Account } from "../../../logic/Abstract/Account";
import { Calendar } from "../../../logic/Calendar/Calendar";
import { MailAccount } from "../../../logic/Mail/MailAccount";
import { ChatAccount } from "../../../logic/Chat/ChatAccount";
import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { MeetAccount } from "../../../logic/Meet/MeetAccount";
import { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
import { contactsMustangApp } from "../../Contacts/ContactsMustangApp";
import { calendarMustangApp } from "../../Calendar/CalendarMustangApp";
import { meetMustangApp } from "../../Meet/MeetMustangApp";
import { chatMustangApp } from "../../Chat/ChatMustangApp";
import { mailMustangApp } from "../../Mail/MailMustangApp";
import { filesMustangApp } from "../../Files/FilesMustangApp";
import AccountIcon from "lucide-svelte/icons/server";
import { gt } from "../../../l10n/l10n";

export function getAccountIcon(acc: Account) {
  if (acc instanceof MailAccount) {
    return mailMustangApp.icon;
  } else if (acc instanceof ChatAccount) {
    return chatMustangApp.icon;
  } else if (acc instanceof MeetAccount) {
    return meetMustangApp.icon;
  } else if (acc instanceof Calendar) {
    return calendarMustangApp.icon;
  } else if (acc instanceof Addressbook) {
    return contactsMustangApp.icon;
  } else if (acc instanceof FileSharingAccount) {
    return filesMustangApp.icon;
  } else {
    return AccountIcon;
  }
}

export function getAccountMainTypeLabel(acc: Account) {
  if (acc instanceof MailAccount) {
    return gt`Mail`;
  } else if (acc instanceof ChatAccount) {
    return gt`Chat`;
  } else if (acc instanceof MeetAccount) {
    return gt`Meet`;
  } else if (acc instanceof Calendar) {
    return gt`Calendar`;
  } else if (acc instanceof Addressbook) {
    return gt`Addressbook`;
  } else if (acc instanceof FileSharingAccount) {
    return gt`Files`;
  } else {
    return gt`Account`;
  }
}
