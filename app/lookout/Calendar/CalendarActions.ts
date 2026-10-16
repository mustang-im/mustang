import type { Event } from "../../logic/Calendar/Event";
import type { Calendar } from "../../logic/Calendar/Calendar";
import type { InvitationResponseInMessage } from "../../logic/Calendar/Invitation/InvitationStatus";
import { OutgoingInvitation } from "../../logic/Calendar/Invitation/OutgoingInvitation";
import { Frequency } from "../../logic/Calendar/RecurrenceRule";
import { selectedCalendar, selectedEvent, shownCalendars, startDate } from "../../frontend/Calendar/selected";
import { inlineTitle, selectedSlots, type SlotSelection } from "./Selected";
import { CalendarSettings } from "./CalendarSettings";
import { CalendarRange } from "./View/CalendarRange";
import { WorkingHours } from "./View/WorkingHours";
import { setNewEventTime } from "../../frontend/Calendar/event";
import { openEvent } from "../../frontend/Calendar/open";
import { calendarMustangApp } from "../../frontend/Calendar/CalendarMustangApp";
import { openComposer } from "../../frontend/Mail/open";
import { contactsMustangApp } from "../../frontend/Contacts/ContactsMustangApp";
import { goTo, openApp } from "../../frontend/AppsBar/selectedApp";
import type { MailAccount } from "../../logic/Mail/MailAccount";
import { CalendarDialogs, type CalendarPropertiesTab } from "./Dialogs/CalendarDialogs";
import { appGlobal } from "../../logic/app";
import { assert } from "../../logic/util/util";
import { catchErrors } from "../../frontend/Util/error";
import { gt } from "../../l10n/l10n";
import { get, writable } from "svelte/store";

export type NewEventKind = "appointment" | "meeting" | "all-day" | "recurring" | "recurring-meeting" | "online-meeting";

export class CalendarActions {
  static readonly updatingCount = writable(0);

  static newEvent(calendar: Calendar | null, start: Date, end: Date | null, kind: NewEventKind = "appointment") {
    calendar ??= get(selectedCalendar) ?? appGlobal.calendars.first;
    assert(calendar, gt`Please set up a calendar first`);
    selectedCalendar.set(calendar);
    let event = calendar.newEvent();
    if (kind == "all-day") {
      let firstDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      let lastTime = end && end > start ? new Date(end.getTime() - 1) : start;
      event.allDay = true;
      setNewEventTime(event, true, firstDay, new Date(lastTime.getFullYear(), lastTime.getMonth(), lastTime.getDate() + 1));
    } else {
      setNewEventTime(event, true, start, end ?? undefined);
    }
    openEvent(event, true);
    if (kind == "recurring" || kind == "recurring-meeting") {
      event.newRecurrenceRule(Frequency.Weekly);
    }
    if (kind == "online-meeting") {
      event.createOnlineMeetingWithAccount ??= calendar.meetAccount;
      event.isOnline = true;
    }
    if (kind == "meeting" || kind == "recurring-meeting" || kind == "online-meeting") {
      event.createMeeting();
    }
  }

  static newEventAtSelection(calendar: Calendar | null, kind: NewEventKind = "appointment") {
    let slots = get(selectedSlots);
    if (slots && (!slots.allDay || kind == "all-day")) {
      CalendarActions.newEvent(calendar ?? slots.calendar, slots.start, slots.end, kind);
      return;
    }
    let range = new CalendarRange(CalendarSettings.view.value, get(startDate), CalendarSettings.dayCount.value);
    let now = new Date();
    let start: Date;
    if (!slots && range.contains(now)) {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
    } else {
      let day = slots?.start ?? range.start;
      start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), WorkingHours.startHour);
    }
    CalendarActions.newEvent(calendar ?? slots?.calendar, start, null, kind);
  }

  static commitInlineTitle() {
    let title = get(inlineTitle)?.trim();
    let selection = get(selectedSlots);
    inlineTitle.set(null);
    if (!title || !selection) {
      return;
    }
    selectedSlots.set(null);
    catchErrors(() => CalendarActions.newEventWithTitle(selection, title));
  }

  static async newEventWithTitle(selection: SlotSelection, title: string) {
    let calendar = selection.calendar ?? get(selectedCalendar) ?? appGlobal.calendars.first;
    assert(calendar, gt`Please set up a calendar first`);
    let event = calendar.newEvent();
    event.startEditing();
    event.title = title;
    event.allDay = selection.allDay;
    setNewEventTime(event, true, selection.start, selection.end);
    // <copied from="../../frontend/Calendar/EditEvent/DialogHeader.svelte">
    if (!event.calendar.events.contains(event)) {
      event.calendar.events.add(event);
    }
    await event.save();
    // </copied>
    event.finishEditing();
    if (!get(selectedSlots)) {
      selectedEvent.set(event);
    }
  }

  static open(event: Event) {
    openEvent(event, true);
  }

  static async changeTime(event: Event, start: Date, end: Date) {
    assert(event.isEditable, gt`You cannot change the time of a meeting that someone else organized`);
    if (event.isOutgoingMeeting && event.participants.length > 1 &&
        !confirm(gt`Move the meeting "${event.title ?? ""}" and send an update to the attendees?`)) {
      return;
    }
    event.startEditing();
    event.parentEvent?.cancelEditing();
    event.startTime = start;
    event.endTime = end;
    try {
      await event.save();
    } catch (ex) {
      event.cancelEditing();
      throw ex;
    }
    event.finishEditing();
  }

  static async respond(event: Event, response: InvitationResponseInMessage) {
    await event.respondToInvitation(response);
  }

  static async forward(event: Event) {
    let mail = await OutgoingInvitation.forwardEventByMail(event);
    openComposer(mail);
  }

  static async cancelMeeting(event: Event) {
    if (!confirm(gt`Cancel the meeting "${event.title ?? ""}" and send a cancellation to all attendees?`)) {
      return;
    }
    await CalendarActions.deleteOccurrence(event);
  }

  static async deleteDefault(event: Event) {
    if (event.isOutgoingMeeting && !event.isCancelled) {
      await CalendarActions.cancelMeeting(event);
    } else {
      await CalendarActions.deleteOccurrence(event);
    }
  }

  // <copied from="../../frontend/Calendar/DisplayEvent/DialogHeader.svelte">, without the dialog closing
  static async deleteOccurrence(event: Event) {
    if (event.seriesStatus == "only") {
      await event.parentEvent.deleteIt();
    } else {
      event.parentEvent?.cancelEditing();
      await event.deleteIt();
    }
    CalendarActions.deselect(event);
  }

  static async deleteSeries(event: Event) {
    if (!confirm(gt`Delete all occurrences of "${event.title ?? ""}"?`)) {
      return;
    }
    let master = event.parentEvent ?? event;
    await master.deleteIt();
    CalendarActions.deselect(event);
  }

  static async deleteRemainder(event: Event) {
    event.parentEvent.cancelEditing();
    event.cancelEditing();
    await event.truncateRecurrence();
    CalendarActions.deselect(event);
  }
  // </copied>

  protected static deselect(event: Event) {
    calendarMustangApp.closeEvent(event);
    if (get(selectedEvent) == event) {
      selectedEvent.set(null);
    }
  }

  static async update(calendars: Calendar[]) {
    CalendarActions.updatingCount.update(count => count + 1);
    try {
      await Promise.all(calendars.map(calendar => calendar.listEvents()));
    } finally {
      CalendarActions.updatingCount.update(count => count - 1);
    }
  }

  static showOnly(calendar: Calendar) {
    for (let listedCalendar of appGlobal.calendars.contents) {
      shownCalendars.show(listedCalendar, listedCalendar == calendar);
    }
    selectedCalendar.set(calendar);
  }

  static openProperties(calendar: Calendar, tab: CalendarPropertiesTab = "general") {
    CalendarDialogs.open({ kind: "properties", calendar, tab });
  }

  static openSharing(calendar: Calendar) {
    CalendarActions.openProperties(calendar, "permissions");
  }

  static openSharedCalendar(account: MailAccount | null, fromAddressBook = false) {
    CalendarDialogs.open({ kind: "open-calendar", account, fromAddressBook });
  }

  static rename(calendar: Calendar) {
    CalendarDialogs.open({ kind: "rename", calendar });
  }

  static openAddressBook() {
    openApp(contactsMustangApp, {});
  }

  static addCalendarAccount() {
    goTo("/setup/calendar", {});
  }

  static async deleteSharedCalendar(calendar: Calendar): Promise<boolean> {
    if (!confirm(gt`Remove the calendar ${calendar.name} from this app? This does not change the calendar on the server.`)) {
      return false;
    }
    await calendar.deleteIt();
    return true;
  }
}
