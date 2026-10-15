import { type Event, RecurrenceCase } from "../../../logic/Calendar/Event";
import { Participant } from "../../../logic/Calendar/Participant";
import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { InvitationResponse, type InvitationResponseInMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
import { OutgoingInvitation } from "../../../logic/Calendar/Invitation/OutgoingInvitation";
import { openExternalURL } from "../../../logic/util/os-integration";
import { RecurrencePattern } from "./RecurrencePattern";
import { calendarMustangApp } from "../../../frontend/Calendar/CalendarMustangApp";
import { selectedEvent } from "../../../frontend/Calendar/selected";
import { goBack } from "../../../frontend/AppsBar/selectedApp";
import { openComposer } from "../../../frontend/Mail/open";
import { showError } from "../../../frontend/Util/error";
import { gt } from "../../../l10n/l10n";

export type SeriesChoice = "occurrence" | "following" | "series";

export class EventEditFlow {
  readonly event: Event;
  pattern: RecurrencePattern;
  protected onClosed: () => void;

  constructor(event: Event, onClosed: () => void = () => goBack()) {
    this.event = event;
    this.onClosed = onClosed;
    this.pattern = RecurrencePattern.fromEvent(event);
  }

  get master(): Event {
    return this.event.parentEvent ?? this.event;
  }

  get isMeeting(): boolean {
    return this.event.participants.hasItems;
  }

  get isSaved(): boolean {
    return !this.master.isNew;
  }

  get isSentMeeting(): boolean {
    return this.event.isOutgoingMeeting && this.isSaved;
  }

  get attendees(): Participant[] {
    return this.event.participants.contents.filter(participant => participant.response != InvitationResponse.Organizer);
  }

  get hasMinimalProps(): boolean {
    let event = this.event;
    return !!event.title && !!event.startTime && !!event.endTime &&
      event.startTime.getTime() <= event.endTime.getTime();
  }

  get missingPropsReason(): string | null {
    let event = this.event;
    if (!event.title) {
      return gt`Please enter a title`;
    }
    if (!event.startTime || !event.endTime || event.startTime.getTime() > event.endTime.getTime()) {
      return gt`The end time is before the start time`;
    }
    return null;
  }

  get seriesEndChanged(): boolean {
    return this.pattern.endDiffersFrom(this.master.recurrenceRule);
  }

  get canSaveSeries(): boolean {
    let event = this.event;
    return this.hasMinimalProps && event.hasChanged() && event.recurrenceCase == RecurrenceCase.Instance ||
      !!event.parentEvent?.hasChanged() ||
      this.hasMinimalProps && !!event.parentEvent && this.seriesEndChanged;
  }

  get canSaveSingle(): boolean {
    let event = this.event;
    return this.hasMinimalProps && event.hasChanged() ||
      this.hasMinimalProps && !!event.recurrenceRule && !event.parentEvent;
  }

  get hasChanges(): boolean {
    return this.event.hasChanged() || !!this.event.parentEvent?.hasChanged() || this.seriesEndChanged;
  }

  get willSend(): boolean {
    return this.isMeeting && !this.event.isIncomingMeeting;
  }

  get needsSeriesChoice(): boolean {
    return !!this.event.parentEvent && this.canSaveSeries;
  }

  seriesChoices(): SeriesChoice[] {
    let choices: SeriesChoice[] = [];
    if (this.canSaveSingle) {
      choices.push("occurrence");
    }
    if (this.event.seriesStatus == "middle") {
      choices.push("following");
    }
    choices.push("series");
    return choices;
  }

  async saveWith(choice: SeriesChoice | null) {
    if (choice == "series") {
      await this.changeAll();
    } else if (choice == "following") {
      await this.changeRemainder();
    } else if (choice == "occurrence") {
      await this.saveException();
    } else {
      await this.save();
    }
  }

  protected skippedOccurrences(): number {
    let event = this.event;
    let rule = event.parentEvent?.unedited?.recurrenceRule ?? event.parentEvent?.recurrenceRule;
    if (!rule || !event.recurrenceStartTime) {
      return 0;
    }
    return Math.max(0, rule.getIndexOfOccurrence(event.recurrenceStartTime));
  }

  applyPattern(pattern: RecurrencePattern) {
    this.pattern = pattern;
    pattern.applyTo(this.master);
  }

  removeRecurrence() {
    RecurrencePattern.removeFrom(this.event);
    this.pattern = RecurrencePattern.fromEvent(this.event);
  }

  // <copied from="../../../frontend/Calendar/EditEvent/DialogHeader.svelte">
  confirmAndChangeRecurrenceRule(): boolean {
    let event = this.event;
    let master = event.parentEvent || event;
    if (!master.recurrenceRule && master.unedited?.recurrenceRule) {
      if (!confirm(gt`Are you sure you want to remove this unfortunate series of events?`)) {
        return false;
      }
    } else if (master.recurrenceRule && master.unedited?.recurrenceRule &&
        !master.unedited.recurrenceRule.timesMatch(master.recurrenceRule)) {
      if (!confirm(gt`This change will remove all exceptions and exclusions for this series.`)) {
        return false;
      }
    }
    return true;
  }

  cancel() {
    let event = this.event;
    event.cancelEditing();
    event.parentEvent?.cancelEditing();
    this.close(true);
  }

  async save() {
    let event = this.event;
    event.parentEvent?.cancelEditing();
    // Lookout: Also confirms changes of the series rule here, and sets the series end, which `hasChanged()` does not see
    if (!event.parentEvent && !this.confirmAndChangeRecurrenceRule()) {
      return;
    }
    await this.pattern.applyEndTo(event);
    await this.saveEvent(event);
    this.close();
  }

  async saveEvent(event: Event) {
    if (!event.calendar.events.contains(event)) {
      event.calendar.events.add(event);
    }
    await event.save();
  }
  // </copied>

  async changeAll() {
    let event = this.event;
    let master = event.parentEvent;
    let before = master.calendar.newEvent();
    before.copyFrom(master);
    master.startEditing();
    this.applyOccurrenceToSeries();
    if (!this.confirmAndChangeRecurrenceRule()) {
      master.copyFrom(before);
      return;
    }
    await this.pattern.applyEndTo(master);
    await master.save();
    master.finishEditing();
    this.close();
  }

  // Unlike frontend, the series keeps its first occurrence. A changed day or time of the occurrence moves all occurrences.
  protected applyOccurrenceToSeries() {
    let event = this.event;
    let master = event.parentEvent;
    let original = event.unedited ?? event;
    let start = new Date(master.startTime);
    let dayShift = EventEditFlow.daysBetween(original.startTime, event.startTime);
    start.setDate(start.getDate() + dayShift);
    if (event.startTime.getTime() != original.startTime.getTime()) {
      start.setHours(event.startTime.getHours(), event.startTime.getMinutes(), 0, 0);
    }
    let duration = event.duration != original.duration ? event.duration : master.duration;
    let reminderMS = event.alarm ? event.startTime.getTime() - event.alarm.getTime() : null;
    let timesChanged = start.getTime() != master.startTime.getTime() || duration != master.duration ||
      event.allDay != master.allDay || event.timezone != original.timezone;
    let rule = master.recurrenceRule;
    let timezone = master.timezone;
    master.copyEditableFieldsFrom(event);
    master.startTime = start;
    master.duration = duration;
    master.alarm = reminderMS == null ? null : new Date(start.getTime() - reminderMS);
    if (!timesChanged) {
      master.timezone = timezone;
    } else if (rule) {
      let { frequency, interval, week, weekdays } = rule;
      master.newRecurrenceRule(frequency, interval, week, weekdays?.map(weekday => (weekday + dayShift % 7 + 7) % 7));
    }
  }

  static daysBetween(from: Date, to: Date): number {
    return Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / (24 * 60 * 60 * 1000));
  }

  // <copied from="../../../frontend/Calendar/EditEvent/DialogHeader.svelte">
  async changeRemainder() {
    let event = this.event;
    let skipped = this.skippedOccurrences();
    let master = event.calendar.newEvent();
    master.startEditing();
    master.copyEditableFieldsFrom(event);
    master.calUID = null;
    if (event.parentEvent.recurrenceRule) {
      let { frequency, interval, week, weekdays } = event.parentEvent.recurrenceRule;
      master.newRecurrenceRule(frequency, interval, week, weekdays);
      await this.pattern.applyEndTo(master, skipped);
    }
    await this.saveEvent(master);
    master.finishEditing();
    event.cancelEditing();
    event.parentEvent.cancelEditing();
    await event.truncateRecurrence();
    this.close();
  }

  async saveException() {
    let event = this.event;
    event.parentEvent?.cancelEditing();
    await this.saveEvent(event);
    this.close();
  }

  async deleteIt() {
    let event = this.event;
    if (event.seriesStatus == "only") {
      await event.parentEvent.deleteIt();
    } else {
      event.parentEvent?.cancelEditing();
      await event.deleteIt();
    }
    this.close(true);
  }

  async deleteAll() {
    if (!confirm(gt`Are you sure you want to remove this unfortunate series of events?`)) {
      return;
    }
    let master = this.event.parentEvent;
    await master.deleteIt();
    this.close(true);
  }

  async deleteRemainder() {
    let event = this.event;
    event.cancelEditing();
    event.parentEvent.cancelEditing();
    await event.truncateRecurrence();
    this.close(true);
  }

  close(deselect = false) {
    let event = this.event;
    event.finishEditing();
    calendarMustangApp.closeEvent(event);
    if (deselect) {
      selectedEvent.set(null);
    }
    this.onClosed();
  }
  // </copied>

  async cancelMeeting() {
    if (!confirm(gt`Cancel the meeting "${this.event.title ?? ""}" and send a cancellation to all attendees?`)) {
      return;
    }
    await this.deleteIt();
  }

  async cancelMeetingSeries() {
    if (!confirm(gt`Cancel all occurrences of the meeting "${this.event.title ?? ""}" and send a cancellation to all attendees?`)) {
      return;
    }
    await this.master.deleteIt();
    this.close(true);
  }

  async respond(response: InvitationResponseInMessage) {
    // <copied from="../../../frontend/Calendar/Invitation/InvitationButtons.svelte" respond()>
    await this.event.respondToInvitation(response);
    // </copied>
    this.close();
  }

  // <copied from="../../../frontend/Calendar/Invitation/InvitationButtons.svelte" onForward()>
  async forward() {
    let mail = await OutgoingInvitation.forwardEventByMail(this.event);
    openComposer(mail);
  }
  // </copied>

  // <copied from="../../../frontend/Calendar/EditEvent/ParticipantsBox.svelte" onAddPerson()>
  static addParticipant(event: Event, person: PersonUID) {
    let participant = new Participant(person.emailAddress, person.name, InvitationResponse.Unknown);
    participant.nameIsUnknown = person.nameIsUnknown;
    participant.person = person.findPerson(); // GAL entry is in no cached address book
    event.participants.add(participant);
    participant.person?.fetchEncryptionKeys()
      .catch(showError);
  }
  // </copied>

  inviteAttendees() {
    // <copied from="../../../frontend/Calendar/EditEvent/EditEvent.svelte" expandParticipants()>
    if (this.event.myParticipation == InvitationResponse.Organizer) {
      return;
    }
    this.event.createMeeting();
    // </copied>
  }

  setOnline() {
    // <copied from="../../../frontend/Calendar/EditEvent/EditEvent.svelte" expandOnlineMeeting()>
    this.event.isOnline = true;
    this.inviteAttendees();
    // </copied>
    this.event.createOnlineMeetingWithAccount ??= this.event.calendar.meetAccount;
  }

  // <copied from="../../../frontend/Calendar/EditEvent/OnlineMeetingBox.svelte">
  setOffline() {
    let event = this.event;
    if (event.participants.hasItems && !event.isNew && !confirm(gt`Changing the meeting URL might cause some participants to miss the meeting. Are you sure?`)) {
      return;
    }
    event.isOnline = false;
    event.onlineMeetingURL = null;
  }

  async joinOnlineMeeting() {
    await openExternalURL(this.event.onlineMeetingURL);
  }
  // </copied>
}
