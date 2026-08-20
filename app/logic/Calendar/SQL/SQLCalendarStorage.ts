import type { Calendar, CalendarStorage } from "../Calendar";
import { SQLCalendar } from "./SQLCalendar";
import type { Event } from "../Event";
import { SQLEvent } from "./SQLEvent";
import type { Attachment } from "../../Abstract/Attachment";
import { RawFilesEventAttachment } from "../Store/RawFilesEventAttachment";
import type { Collection } from "svelte-collections";

export class SQLCalendarStorage implements CalendarStorage {
  async deleteCalendar(calendar: Calendar): Promise<void> {
    await SQLCalendar.deleteIt(calendar);
  }
  async saveCalendar(calendar: Calendar): Promise<void> {
    await SQLCalendar.save(calendar);
  }
  async saveEvent(event: Event): Promise<void> {
    await SQLEvent.save(event);
    for (let attachment of event.attachments) {
      await attachment.save();
    }
  }
  async deleteEvent(event: Event): Promise<void> {
    await this.attachmentsStorage.deleteEvent(event);
    await SQLEvent.deleteIt(event);
  }

  static async readCalendars(): Promise<Collection<Calendar>> {
    return await SQLCalendar.readAll();
  }

  protected attachmentsStorage = new RawFilesEventAttachment();
  supportsAttachments = true;
  async readAttachment(attachment: Attachment): Promise<boolean> {
    return await this.attachmentsStorage.readAttachment(attachment);
  }
  async saveAttachment(attachment: Attachment): Promise<void> {
    await this.attachmentsStorage.saveAttachment(attachment);
  }
  async deleteAttachment(attachment: Attachment): Promise<void> {
    await this.attachmentsStorage.deleteAttachment(attachment);
  }
}
