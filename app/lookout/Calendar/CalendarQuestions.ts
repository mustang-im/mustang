import type { Event } from "../../logic/Calendar/Event";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { MessageBox } from "../Shared/Dialog/MessageBox";
import { appName } from "../../logic/build";
import { gt } from "../../l10n/l10n";

export class CalendarQuestions {
  static moveMeeting(event: Event): Promise<boolean> {
    return MessageBox.confirm(gt`Send Update`,
      gt`Would you like to move the meeting "${event.title ?? ""}" and send an update to the attendees?`,
      gt`Send Update`, gt`Cancel`);
  }

  static cancelMeeting(event: Event): Promise<boolean> {
    return MessageBox.ask(gt`Cancel Meeting`, event.parentEvent
      ? gt`Do you want to cancel this occurrence of the meeting "${event.title ?? ""}" and send a cancellation to all attendees?`
      : gt`Do you want to cancel the meeting "${event.title ?? ""}" and send a cancellation to all attendees?`);
  }

  static cancelSeries(event: Event): Promise<boolean> {
    return MessageBox.ask(gt`Cancel Series`,
      gt`Do you want to cancel all occurrences of the meeting "${event.title ?? ""}" and send a cancellation to all attendees?`);
  }

  static deleteSeries(event: Event): Promise<boolean> {
    return MessageBox.ask(gt`Delete Series`, event.isIncomingMeeting
      ? gt`Do you want to delete all occurrences of the recurring meeting "${event.title ?? ""}"?`
      : gt`Do you want to delete all occurrences of the recurring appointment "${event.title ?? ""}"?`);
  }

  static removeRecurrence(): Promise<boolean> {
    return MessageBox.confirm(gt`Remove Recurrence`,
      gt`The appointment will no longer repeat, and all other occurrences of the series will be deleted. Is this OK?`);
  }

  static changeRecurrence(): Promise<boolean> {
    return MessageBox.confirm(gt`Recurrence`,
      gt`Any exceptions associated with this recurring appointment will be lost. Is this OK?`);
  }

  static removeOnlineMeeting(): Promise<boolean> {
    return MessageBox.ask(gt`Online Meeting`,
      gt`Attendees who already have the meeting link might miss the meeting. Do you want to remove the online meeting?`);
  }

  static deleteCalendar(calendar: Calendar): Promise<boolean> {
    return MessageBox.ask(gt`Delete Calendar`, calendar.protocol == "calendar-local"
      ? gt`Are you sure that you want to delete the calendar "${calendar.name}" with all its appointments and meetings?`
      : gt`Do you want to remove the calendar "${calendar.name}" from ${appName}? This does not change the calendar on the server.`);
  }
}
