import type { EMail } from "../../../logic/Mail/EMail";
import type { Calendar } from "../../../logic/Calendar/Calendar";
import type { Contact } from "../../../logic/Abstract/Contact";
import type { Attachment } from "../../../logic/Abstract/Attachment";
import type { MustangApp } from "../../../frontend/AppsBar/MustangApp";
import { Person } from "../../../logic/Abstract/Person";
import { personsToVCardFile } from "../../../logic/Contacts/VCard/VCard";
import { mailMustangApp } from "../../../frontend/Mail/MailMustangApp";
import { calendarMustangApp } from "../../../frontend/Calendar/CalendarMustangApp";
import { contactsMustangApp } from "../../../frontend/Contacts/ContactsMustangApp";
import { ImportExportFlow } from "../ImportExport/ImportExportFlow";
import { saveBlobAsFile } from "../../../frontend/Util/util";
import { assert } from "../../../logic/util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export type BackstageArea = "mail" | "calendar" | "people" | null;

export class BackstageItem {
  static areaOf(app: MustangApp | null): BackstageArea {
    if (!app) {
      return null;
    }
    if (app == mailMustangApp || mailMustangApp.subApps.includes(app)) {
      return "mail";
    }
    if (app == calendarMustangApp || calendarMustangApp.subApps.includes(app)) {
      return "calendar";
    }
    if (app == contactsMustangApp || contactsMustangApp.subApps.includes(app)) {
      return "people";
    }
    return null;
  }

  static attachmentsOf(message: EMail | null): Attachment[] {
    return message?.attachments.contents.filter(attachment => !attachment.hidden) ?? [];
  }

  static async saveContact(contact: Contact | null) {
    assert(contact instanceof Person, gt`Select a contact first`);
    let file = personsToVCardFile(new ArrayColl([contact]), contact.name || gt`Contact`);
    await saveBlobAsFile(file);
  }

  static async saveCalendar(calendar: Calendar | null) {
    assert(calendar, gt`Select a calendar first`);
    await ImportExportFlow.exportFolder(calendar);
  }
}
