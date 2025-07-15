import type { Calendar } from "./Calendar";
import type { Participant } from "./Participant";
import { RecurrenceRule, type RecurrenceInit, Frequency } from "./RecurrenceRule";
import { OutgoingInvitation } from "./Invitation/OutgoingInvitation";
import { InvitationResponse, type InvitationResponseInMessage } from "./Invitation/InvitationStatus";
import type { MailAccount } from "../Mail/MailAccount";
import { k1DayS, k1HourS, k1MinuteS, myTimezone } from "../../frontend/Util/date";
import { convertHTMLToText, convertTextToHTML, sanitizeHTML } from "../util/convertHTML";
import { Observable, notifyChangedAccessor, notifyChangedProperty, notifyChangedObservable } from "../util/Observable";
import { Lock } from "../util/Lock";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { assert, randomID } from "../util/util";
import { backgroundError } from "../../frontend/Util/error";
import { ArrayColl, Collection } from "svelte-collections";

export class Event extends Observable {
  id: string;
  dbID: number;
  /** iCal UID if this is a meeting */
  calUID: string | null = null;
  /** Protocol-specific ID for this event */
  pID: string | null = null;
  @notifyChangedProperty
  title: string;
  /** HTML hex color string with # */
  @notifyChangedProperty
  color: string | null = null;
  @notifyChangedProperty
  protected _text: string | null = null;
  /** Plaintext version of the description */
  get descriptionText(): string {
    if (this._text != null) {
      return this._text;
    }
    try {
      if (this._rawHTML != null) {
        return this._text = convertHTMLToText(this._rawHTML);
      }
    } catch (ex) {
      backgroundError(ex);
    }
    return "";
  }
  set descriptionText(val: string | null) {
    this._text = val;
    this._rawHTML = null;
    this._sanitizedHTML = null;
  }
  get rawText(): string | null {
    return this._text;
  }
  /* Only use in combination with setting `.rawHTMLDangerous` */
  set rawText(val: string | null) {
    this._text = val;
  }
  /**
   * HTML version of the description.
   * Directly from the network.
   * Attention: Untrusted. MUST be sanitized before using it.
   * This is the version that will be saved on disk.
   * @see _sanitizedHTML
   */
  @notifyChangedProperty
  protected _rawHTML: string | null = null;
  /** HTML version of the description.
   * Sanitized.
   * This is only cached here in RAM, but not saved on disk,
   * so that we can change the sanitization. */
  protected _sanitizedHTML: string | null = null;
  /** Sanitized HTML version of the description. */
  get descriptionHTML(): string {
    if (this._sanitizedHTML != null) {
      return this._sanitizedHTML;
    }
    try {
      if (this._rawHTML != null) {
        return this._sanitizedHTML = sanitizeHTML(this._rawHTML);
      }
      if (this._text != null) {
        return this._sanitizedHTML = convertTextToHTML(this._text);
      }
    } catch (ex) {
      backgroundError(ex);
    }
    return "";
  }
  set descriptionHTML(val: string | null) {
    this._rawHTML = val;
    this._sanitizedHTML = null;
    this._text = null;
  }
  get rawHTMLDangerous(): string | null {
    return this._rawHTML;
  }
  /* Only use in combination with setting `.rawText` */
  set rawHTMLDangerous(val: string | null) {
    this._rawHTML = val;
    this._sanitizedHTML = null;
  }
  get hasHTML(): boolean {
    return !!this.rawHTMLDangerous;
  }

  @notifyChangedProperty
  startTime: Date;
  @notifyChangedProperty
  endTime: Date;
  @notifyChangedProperty
  allDay = false;
  /** IANA timezone name, e.g. "Europe/Berlin" */
  @notifyChangedProperty
  timezone: string | null = null;

  /**
   * Shows whether this is a normal non-recurring event,
   * recurrence master, generated instance, or exception.
   *
   * | `Event.recurrenceCase` | `Event.parentEvent` | `Event.recurrenceRule` |
   * | ---------------------- | ------------------- | ---------------------- |
   * | Normal                 | without             | without                |
   * | Master                 | without             | with                   |
   * | Instance               | with                | without                |
   * | Exception              | with                | without                |
   *
   * Other state combinations are invalid.
   */
  @notifyChangedProperty
  recurrenceCase = RecurrenceCase.Normal;
  /** Describes the recurrence pattern.
   * Only for RecurrenceCase == Master */
  @notifyChangedProperty
  protected _recurrenceRule: RecurrenceRule | null = null;
  /** Links back to the recurring master.
   * Only for RecurrenceCase == Instance or Exception */
  @notifyChangedProperty
  parentEvent: Event | null = null;
  /**
   * Only for RecurrenceCase == Exception (or Instance)
   *
   * If this is an instance or exception of a recurring meeting (not the master),
   * then this is the instance's original start time.
   * The `startTime` may contain a modified time as an exception.
   * This allows us to work out the instance index of an exception,
   * even if its actual start time has been modified.
   *
   * For RecurrenceCase == Instance, it's identical to `startTime`.
   */
  recurrenceStartTime: Date | null = null;
  /** Contains all instances that should be displayed for this event.
   *
   * For recurrenceCase == Master:
   *
   * Contains all Instances generated from the master.
   * Does *not* contain:
   * - The master itself
   * - Exceptions
   * - Exclusions
   *
   * For recurrenceCase == Normal and Exception:
   *   Contains the event itself.
   *
   * This is a dynamic collection, and will be updated automatically
   * when the master changes or the recurrence rule changes.
   */
  readonly instances = new ArrayColl<Event>([this]);
  /**
   * Only for RecurrenceCase == Master
   *
   * Contains exclusions, i.e. where there would normally
   * be an recurrence instance, but exceptionally, there is none
   * on that specific day/time.
   */
  readonly exclusions = new ArrayColl<Date>;
  /**
   * Only for RecurrenceCase == Master
   *
   * Contains exceptions, i.e. where there would normally
   * be an recurrence instance, but exceptionally, this one
   * is different, e.g. on a different time, or different
   * location or other property.
   *
   * `exceptions.get().recurrenceStartTime` contains the time of the
   * normal instance that this exception replaces.
   */
  readonly exceptions = new ArrayColl<Event>;

  @notifyChangedProperty
  alarm: Date | null = null;

  @notifyChangedProperty
  location: string;
  @notifyChangedProperty
  onlineMeetingURL: string;
  @notifyChangedProperty
  isOnline = false;
  @notifyChangedObservable
  readonly participants = new ArrayColl<Participant>();
  @notifyChangedProperty
  myParticipation = InvitationResponse.Unknown;
  /** Only for incoming meetings
   * The event was cancelled by the organizer (not our user). */
  @notifyChangedProperty
  isCancelled = false;
  /** If we're currently editing this event,
   * saves the original state before the editing.
   *
   * Allows to calculate `hasChanged()`, revert changes,
   * and to implement full editable offline support.
   * Set be `startEditing()` and `stopEditing()` */
  @notifyChangedProperty
  unedited: Event | null = null;
  /** DTSTAMP when the status was sent that is captured in this object.
   * Used during auto-update to avoid overwriting with older info.
   * We don't need to track local changes, only those sent by others.
   * Local changes sent to others will always get the current timestamp in `ICalGenerator` */
  lastUpdateTime: Date | null;
  /** Includes changes to `alarm`, lastUpdateTime does not consider to be a change */
  @notifyChangedProperty
  lastMod = new Date();
  @notifyChangedProperty
  syncState: number | string | undefined;
  @notifyChangedProperty
  calendar: Calendar;
  readonly storageLock = new Lock();

  constructor(calendar?: Calendar, parentEvent?: Event) {
    super();
    this.id = randomID();
    this.calendar = calendar;
    if (parentEvent) {
      this.parentEvent = parentEvent;
      this.copyFromRecurrenceMaster(parentEvent);
      this.recurrenceCase = RecurrenceCase.Instance;
    }
  }

  /** in seconds */
  get duration(): number {
    let seconds = Math.round((this.endTime?.getTime() - this.startTime?.getTime()) / 1000);
    if (this.allDay) {
      return Math.round(Math.ceil(seconds / k1DayS) * k1DayS); // return entire days, not 1 second less
    }
    return seconds;
  }
  @notifyChangedAccessor
  set duration(seconds: number) {
    assert(seconds >= 0, `Duration must be >= 0, but is ${seconds}, starttime ${this.startTime?.toLocaleTimeString()}, endtime ${this.endTime?.toLocaleTimeString()}`);
    if (this.allDay) {
      this.endTime.setTime(this.startTime.getTime());
      // End date is non-inclusive next day. RFC 5545 section 3.6.1
      this.endTime.setDate(this.endTime.getDate() + Math.round(seconds / k1DayS));
    } else {
      this.endTime.setTime(this.startTime.getTime() + seconds * 1000);
    }
  }

  /** in minutes */
  get durationMinutes(): number {
    return this.duration / k1MinuteS;
  }
  set durationMinutes(minutes: number) {
    this.duration = minutes * k1MinuteS;
  }

  /** in hours */
  get durationHours(): number {
    return this.duration / k1HourS;
  }
  set durationHours(hours: number) {
    this.duration = hours * k1HourS;
  }

  /** in days */
  get durationDays(): number {
    return this.duration / k1DayS;
  }
  set durationDays(days: number) {
    this.duration = days * k1DayS;
  }

  get recurrenceRule(): RecurrenceRule | null {
    return this._recurrenceRule!;
  }
  set recurrenceRule(rule: RecurrenceRule | null) {
    if (rule) {
      this.setRecurrenceRule(rule);
    } else {
      this.clearRecurrenceRule();
    }
  }
  /**
   * Removes a recurrence pattern and all instances and exceptions.
   */
  protected clearRecurrenceRule() {
    if (!this._recurrenceRule) {
      return;
    }
    // clearExceptions() in finishEditing()
    this._muteObservers = true;
    this.recurrenceCase = RecurrenceCase.Normal;
    this._muteObservers = false;
    this._recurrenceRule = null; // notifies
    this.instances.replaceAll([this]);
  }
  /**
   * Updates a recurrence pattern.
   * Instances and exceptions are regenerated if necessary.
   */
  protected setRecurrenceRule(rule: RecurrenceRule) {
    assert(this.recurrenceCase == RecurrenceCase.Normal || this.recurrenceCase == RecurrenceCase.Master, "Instances can't themselves recur");
    this._muteObservers = true;
    this.recurrenceCase = RecurrenceCase.Master;
    this._muteObservers = false;
    this._recurrenceRule = rule; // notifies
    // clearExceptions() as necessary in finishEditing()
    this.generateRecurringInstances();
  }

  newRecurrenceRule(frequency: Frequency, interval = 1, week = 0, weekdays?: number[]): void {
    let init: RecurrenceInit = {
      masterDuration: this.duration,
      seriesStartTime: this.startTime,
      frequency,
      interval,
    };
    if (frequency == Frequency.Weekly) {
      init.weekdays = weekdays ?? [this.startTime.getDay()]; // e.g. Monday and Thursday
    } else if (frequency == Frequency.Monthly || frequency == Frequency.Yearly) {
      init.week = week;
      if (week) {
        init.weekdays = [this.startTime.getDay()]; // e.g. 3rd Wednesday of month
      }
    }
    this.recurrenceRule = new RecurrenceRule(init);
  }

  /** Create a new instance of the same event.
   * Copy all data of the `original` event into this new Event object.
   * Not sure why anyone would need this; editing code can use
   * copyEditableFieldsFrom and recurring events need extra care. */
  copyFrom(original: Event) {
    this.copyEditableFieldsFrom(original);
    this.recurrenceStartTime = original.recurrenceStartTime ? new Date(original.recurrenceStartTime) : null;
    this.recurrenceCase = original.recurrenceCase;
    this.recurrenceRule = original.recurrenceRule;
    this.parentEvent = original.parentEvent;
  }

  /**
   * Copy editable data between events. Can be used to make temporary copies
   * to see how they have been changed by editing, or in case you actually
   * end up wanting to change a different event, e.g. by applying changes
   * to the rest of the series. Does not copy recurrence data; use
   * `confirmAndChangeRecurrenceRule` to update edited recurrence data.
   */
  copyEditableFieldsFrom(original: Event) {
    this.copyFromRecurrenceMaster(original);
    this.startTime = original.startTime ? new Date(original.startTime) : null;
    this.endTime = original.endTime ? new Date(original.endTime) : null;
    this.alarm = original.alarm ? new Date(original.alarm) : null;
  }

  /**
   * Used to update placeholder instances from their recurring master.
   * Copies the event properties that are shared between recurring instances.
   */
  protected copyFromRecurrenceMaster(original: Event) {
    this.calUID = original.calUID;
    this.title = original.title;
    this.rawText = original.rawText;
    this.rawHTMLDangerous = original.rawHTMLDangerous;
    this.timezone = original.timezone;
    this.allDay = original.allDay;
    this.location = original.location;
    this.isOnline = original.isOnline;
    this.onlineMeetingURL = original.onlineMeetingURL;
    this.participants.replaceAll(original.participants);
    this.myParticipation = original.myParticipation;
    this.lastUpdateTime = original.lastUpdateTime;
  }

  fromExtraJSON(json: any) {
    assert(typeof (json) == "object", "Must be a JSON object");
    this.syncState = json.syncState;
    this.isCancelled = sanitize.boolean(json.isCancelled, false);
    this.lastUpdateTime = sanitize.date(json.lastUpdateTime, null);
  }
  toExtraJSON(): any {
    let json: any = {};
    json.syncState = this.syncState;
    json.isCancelled = this.isCancelled;
    json.lastUpdateTime = this.lastUpdateTime;
    return json;
  }

  get outgoingInvitation() {
    return new OutgoingInvitation(this);
  }

  /** Assumes that `startEditing()` was called before */
  hasChanged(): boolean {
    return !!this.unedited && !this.matches(this.unedited);
  }

  matches(other: Event): boolean {
    return (
      this.calUID == other.calUID &&
      this.startTime?.getTime() == other.startTime?.getTime() &&
      this.endTime?.getTime() == other.endTime?.getTime() &&
      this.timezone == other.timezone &&
      this.allDay == other.allDay &&
      this.title == other.title &&
      this.rawText == other.rawText &&
      this.rawHTMLDangerous == other.rawHTMLDangerous &&
      this.location == other.location &&
      this.isOnline == other.isOnline &&
      this.onlineMeetingURL == other.onlineMeetingURL &&
      this.myParticipation == other.myParticipation &&
      this.participants.length == other.participants.length &&
      (this.participants.isEmpty || this.participants.contents.every((pThis, i) =>
        pThis.emailAddress == other.participants.get(i).emailAddress)) &&
      !this.recurrenceRule == !other.recurrenceRule &&
      (!this.recurrenceRule || this.recurrenceRule.matches(other.recurrenceRule)) &&
      this.alarm?.getTime() == other.alarm?.getTime()
    );
  }

  /**
   * Starts editing an event.
   *
   * If it is already being edited, this is a no-op. This can happen when switching
   * between the event editor and another screen, or certain updates within
   * editing events can also trigger it.
   */
  startEditing() {
    if (this.unedited) {
      return;
    }
    this.timezone ||= myTimezone();
    this.unedited = this.calendar.newEvent();
    this.unedited.copyFrom(this);
  }
  finishEditing() {
    if (this.unedited?.recurrenceCase == RecurrenceCase.Master) {
      let timesMatch = this.unedited._recurrenceRule?.timesMatch(this._recurrenceRule);
      if (!timesMatch) {
        this.clearExceptions();
      }
    }
    this.unedited = null;
  }
  cancelEditing() {
    if (this.unedited) {
      this.copyFrom(this.unedited);
    }
    this.finishEditing();
  }

  createMeeting() {
    this.outgoingInvitation.createOrganizer();
  }

  get isNew(): boolean {
    return !this.dbID;
  }

  get isIncomingMeeting(): boolean {
    switch (this.myParticipation) {
    case InvitationResponse.Unknown:
    case InvitationResponse.Organizer:
      return false;
    }
    return true;
  }

  get isOutgoingMeeting(): boolean {
    return this.myParticipation == InvitationResponse.Organizer;
  }

  /** Call this whenever the master changes */
  generateRecurringInstances(endDate?: Date) {
    assert(this.recurrenceCase == RecurrenceCase.Master, "Only for master");
    this.instances.clear();
    this.fillRecurrences(endDate);
  }

  getOccurrenceByDate(recurrenceStartTime: Date): Event {
    assert(this.recurrenceCase == RecurrenceCase.Master, "Only for master");
    assert(!this.exclusions.find(date => date.getTime() == recurrenceStartTime.getTime()), "occurrence was already excluded");
    let event = this.exceptions.find(event => event.recurrenceStartTime.getTime() == recurrenceStartTime.getTime());
    if (event) {
      return event;
    }
    event = this.instances.find(event => event.recurrenceStartTime.getTime() == recurrenceStartTime.getTime());
    if (event) {
      return event;
    }
    let index = this.recurrenceRule.getIndexOfOccurrence(recurrenceStartTime);
    assert(index != -1, "occurrence date not in recurrence");
    this.generateRecurringInstances(recurrenceStartTime);
    return this.instances.last;
  }

  protected makeExclusionLocally(recurrenceStartTime: Date) {
    assert(this.recurrenceCase == RecurrenceCase.Master, "Only for master");
    if (this.exclusions.some(date => date.getTime() == recurrenceStartTime.getTime())) {
      return; // already excluded
    }
    this.getOccurrenceByDate(recurrenceStartTime).deleteLocally().catch(this.calendar.errorCallback);
  }

  /**
   * Calculates the position of this instance in a recurring series.
   * "none" - event isn't an instance or exception
   * "only" - event is the only instance or exception remaining
   * "last" - event is the last instance, but there may be more exceptions
   * "exception" - event is an exception and there are further instances
   * "first" - event is the first instance after exclusions
   * "middle" - event is an instance, but none of the above apply
   * In particular:
   * "only" - don't delete the event, delete the master instead
   * "first" - offer to edit the whole series
   * "middle" - offer to edit the remainder of the series
   */
  get seriesStatus(): "none" | "only" | "last" | "exception" | "first" | "middle" {
    // Normally the parent of an instance would always have a
    // recurrence rule, but this might get removed during saving,
    // and would cause Svelte to crash if we didn't handle it.
    let master = this.parentEvent?.unedited ?? this.parentEvent;
    let rule = master?.recurrenceRule;
    if (!rule) {
      return "none";
    }
    if (rule.countIs(master.exclusions.length + 1)) {
      return "only";
    }
    // Not supporting "last" any more; fortunately nobody needs it
    // (it's prohibitively expensive to compute these days)
    return this.isNew ? this.recurrenceStartTime.getDate() == master.instances.first.recurrenceStartTime.getDate() ? "first" : "middle" : "exception";
  }

  /**
   * Saves the event to the server and to the database.
   */
  async save() {
    await this.saveLocally();
    await this.saveToServer();
  }

  /**
   * Saves the event locally to the database.
   */
  async saveLocally() {
    assert(this.calendar, "To save an event, it needs to be in a calendar first");
    assert(this.calendar.storage, "To save an event, the calendar needs to be saved first");
    this.calUID ??= crypto.randomUUID();
    await this.calendar.storage.saveEvent(this);

    if (this.recurrenceCase == RecurrenceCase.Master) {
      this.generateRecurringInstances();
    } else if (this.recurrenceCase == RecurrenceCase.Instance) {
      this.recurrenceCase = RecurrenceCase.Exception;
      this.parentEvent.instances.remove(this);
      this.parentEvent.exceptions.add(this);
      await this.parentEvent.save();
    }
  }

  async saveToServer(): Promise<void> {
    this.calUID ??= crypto.randomUUID();
    if (!this.isIncomingMeeting && this.participants.hasItems && this.hasChanged()) {
      await this.outgoingInvitation.sendInvitations();
    }
  }

  /**
   * Deletes the event on the server and from the database.
   */
  async deleteIt() {
    await this.deleteLocally();
    await this.deleteFromServer();
  }

  /**
   * Deletes the event locally from the database.
   */
  async deleteLocally() {
    assert(this.calendar, "To delete an event, it needs to be in a calendar first");
    assert(this.calendar.storage, "To delete an event, the calendar needs to be saved first");
    // this.recurrenceRule = null; is overkill for removing exceptions; the database already cascades the delete
    this.calendar.events.removeAll(this.exceptions);
    this.calendar.events.remove(this);
    if (this.dbID) {
      await this.calendar.storage.deleteEvent(this);
    }
    if (this.parentEvent) {
      this.parentEvent.instances.remove(this);
      this.parentEvent.exceptions.remove(this);
      this.parentEvent.exclusions.add(this.recurrenceStartTime);
      await this.calendar.storage.saveEvent(this.parentEvent);
    }
  }

  async deleteFromServer(): Promise<void> {
    try {
      if (!this.participants.length) {
        return;
      }
      if (this.isOutgoingMeeting) {
        await this.outgoingInvitation.sendCancellations();
      } else if (this.isIncomingMeeting) {
        await this.respondToInvitation(InvitationResponse.Decline);
      }
    } catch (ex) {
      this.calendar.errorCallback(ex);
    }
  }

  /** Delete multiple instances */
  async makeExclusions(exclusions: Event[]) {
    this.calendar.events.removeAll(exclusions);
    this.instances.removeAll(exclusions);
    this.exceptions.removeAll(exclusions);
    this.exclusions.addAll(exclusions.map(event => event.recurrenceStartTime));
    for (let exclusion of exclusions) {
      if (!exclusion.isNew) {
        await this.calendar.storage.deleteEvent(exclusion);
      }
    }
  }

  /**
   * Remove the event from the current calendar and
   * add it to the `newCalendar`.
   * If the Calendar Events have different implementations,
   * re-create the event in the correct Event subclass
   * for the new calendar.
   *
   * Saves the changes to disk.
   *
   * @returns the new (or same) Event object */
  async moveToCalendar(newCalendar: Calendar): Promise<Event> {
    if (this.calendar == newCalendar || !newCalendar) {
      return this;
    }
    this.calendar?.events.remove(this);
    let newEvent = newCalendar.newEvent();
    if (Object.getPrototypeOf(this) == Object.getPrototypeOf(newEvent)) {
      this.calendar = newCalendar;
      newCalendar.events.add(this);
      await this.save();
      return this;
    }
    newEvent.copyFrom(this);
    newEvent.calendar = newCalendar;
    newCalendar.events.add(newEvent);
    await newEvent.save();
    await this.deleteIt();
    return newEvent;
  }

  /** TODO Move API to @see IncomingInvitation and code to @see ICalIncomingInvitation */
  async respondToInvitation(response: InvitationResponseInMessage, mailAccount?: MailAccount): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    const { ICalIncomingInvitation } = await import("./ICal/ICalIncomingInvitation"); // HACK to avoid circular import in `InvitationEvent`
    await ICalIncomingInvitation.respondToInvitationFromCalEvent(this, response, mailAccount);
  }

  /**
   * Ensures that all recurring instances exist up to the provided date.
   * Only for recurrenceCase == Master
   *
   * TODO Call this when the user scrolls further than the default fill date.
   */
  fillRecurrences(seriesEndTime: Date = new Date(Date.now() + 1e11)): Collection<Event> {
    assert(this.recurrenceCase == RecurrenceCase.Master, "Not a recurrence master");
    if (this.instances.hasItems || // cached
        !this.calendar) { // Not for pseudo events in messages
      // TODO Fill more, if seriesEndTime >> last.startTime
      return this.instances;
    }
    let occurrences = this.recurrenceRule.getOccurrencesByDate(seriesEndTime);
    for (let occurrence of occurrences) {
      if (this.exceptions.some(exception => exception.recurrenceStartTime.getTime() == occurrence.getTime())) {
        continue;
      }
      if (this.exclusions.some(exclusion => exclusion.getTime() == occurrence.getTime())) {
        continue;
      }
      let instance = this.calendar.newEvent(this);
      instance.recurrenceCase = RecurrenceCase.Instance;
      instance.recurrenceStartTime = occurrence;
      instance.startTime = new Date(occurrence); // Clone in case of exception
      instance.endTime = new Date(this.endTime.getTime() + instance.startTime.getTime() - this.startTime.getTime());
      if (this.alarm) {
        instance.alarm = new Date(this.alarm.getTime() + instance.startTime.getTime() - this.startTime.getTime());
      }
      this.instances.add(instance);
    }
    return this.instances;
  }

  /**
   * Used when a master recurrence rule is removed or changed incompatibly.
   */
  protected clearExceptions() {
    if (this.calendar) {
      this.calendar.events.removeAll(this.exceptions);
      for (let exception of this.exceptions) {
        // Not using deleteLocally because that's for creating an exclusion
        this.calendar.storage.deleteEvent(exception)
          .catch(this.calendar.errorCallback); // TODO server? No, server will delete when it sees the rule change.
      }
    }
    this.exceptions.clear();
    this.exclusions.clear();
  }

  /**
   * Deletes the event and any subsequent instances that are not exceptions.
   */
  async truncateRecurrence() {
    let master = this.parentEvent;
    assert(master.recurrenceCase == RecurrenceCase.Master, "parentEvent must a Recurrence.Master");
    let lastException = this.recurrenceStartTime;
    for (let exception of master.exceptions) {
      if (exception.recurrenceStartTime > lastException) {
        lastException = exception.recurrenceStartTime;
      }
    }
    master.generateRecurringInstances(lastException);
    let exclusions = master.instances.contents.filter(event => event.recurrenceStartTime> this.recurrenceStartTime && event.recurrenceStartTime < lastException);
    if (lastException > this.recurrenceStartTime) {
      // Isn't cache invalidation fun!
      exclusions.push(master.getOccurrenceByDate(this.recurrenceStartTime));
    }
    let count = master.recurrenceRule.getIndexOfOccurrence(lastException) + (lastException > this.recurrenceStartTime ? 1 : 0);
    if (master.recurrenceRule.getOccurrenceByIndex(count)) {
      let { masterDuration, seriesStartTime, frequency, interval, weekdays, week, first } = master.recurrenceRule;
      master.recurrenceRule = new RecurrenceRule({ masterDuration, seriesStartTime, count, frequency, interval, weekdays, week, first });
      await master.saveToServer();
    }
    if (exclusions.length) {
      await master.makeExclusions(exclusions);
    } else if (!this.isNew) {
      await this.calendar.storage.deleteEvent(this);
    }
    await master.save();
  }
}

export enum RecurrenceCase {
  /** Not recurring */
  Normal = "normal",
  /** Recurring Master event.
   * Contains the rules how to create the recurrence instances.
   * Not directly shown in the UI. */
  Master = "master",
  /** Recurrence Instance, generated from the master.
   * Only exists in RAM objects, not saved on server and in DB. */
  Instance = "instance",
  /** Recurrence Exception.
   * Like an instance, but at a different time or with modified properties.
   * Overrides a specific instance. */
  Exception = "exception",
}
