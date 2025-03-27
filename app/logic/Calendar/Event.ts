import type { Calendar } from "./Calendar";
import { Participant } from "./Participant";
import type { RecurrenceRule } from "./RecurrenceRule";
import { ResponseType, Scheduling, type Responses } from "./Invitation";
import type { MailAccount } from "../Mail/MailAccount";
import { findIdentityForEMailAddress } from "../Mail/MailIdentity";
import type { EMail } from "../Mail/EMail";
import { appGlobal } from "../app";
import { Observable, notifyChangedAccessor, notifyChangedProperty } from "../util/Observable";
import { Lock } from "../util/Lock";
import { assert, randomID } from "../util/util";
import { ArrayColl } from "svelte-collections";
import { gt } from "../../l10n/l10n";

export class Event extends Observable {
  id: string;
  dbID: number;
  /** iCal UID if this is a meeting */
  calUID: string | null = null;
  /** Protocol-specific ID for this event */
  pID: string | null = null;
  @notifyChangedProperty
  title: string;
  @notifyChangedProperty
  descriptionText: string;
  @notifyChangedProperty
  descriptionHTML: string;

  @notifyChangedProperty
  startTime: Date;
  @notifyChangedProperty
  endTime: Date;
  @notifyChangedProperty
  allDay = false;
  /** IANA timezone name, e.g. "Europe/Berlin" */
  @notifyChangedProperty
  timezone: string | null = null;
  @notifyChangedProperty
  repeat = false; // TODO remove
  /** If `repeat` is set, should be the rule which describes the pattern. */
  @notifyChangedProperty
  recurrenceRule: RecurrenceRule | undefined;
  /** Links back to the recurring master from an instance. */
  @notifyChangedProperty
  parentEvent: Event | undefined;
  /**
   * If this is an instance of a recurring meeting (not the master),
   * then this is the instance's original start time.
   * The `startTime` may contain a modified time as an exception.
   * This allows us to work out the instance index of an exception,
   * even if its actual start time has been modified.
   */
  recurrenceStartTime: Date | undefined;
  /**
   * Holds child instances of a recurring event:
   * - undefined means that a recurring instance hasn't been generated yet
   * - null means that that the instance was excluded
   * - a saved event means that the instance is an exception
   * - an unsaved event means that the instance was auto-generated
   *
   * Note that the array may not be complete but `fillRecurrences`
   * will auto-generate additional instances if necessary.
   */
  readonly instances = new ArrayColl<Event | null | undefined>;
  @notifyChangedProperty
  alarm: Date = null;

  @notifyChangedProperty
  location: string;
  @notifyChangedProperty
  onlineMeetingURL: string;
  @notifyChangedProperty
  isOnline = false;
  @notifyChangedProperty
  readonly participants = new ArrayColl<Participant>();
  @notifyChangedProperty
  response = ResponseType.Unknown;
  @notifyChangedProperty
  lastMod = new Date();
  @notifyChangedProperty
  calendar: Calendar;
  storageLock = new Lock();

  constructor(calendar?: Calendar, parentEvent?: Event) {
    super();
    this.id = randomID();
    this.calendar = calendar;
    if (parentEvent) {
      this.parentEvent = parentEvent;
      this.copyFrom(parentEvent);
    }
  }

  /** in seconds */
  get duration(): number {
    let seconds = Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
    if (this.allDay) {
      return Math.round(Math.ceil(seconds / k1Day) * k1Day); // return entire days, not 1 second less
    }
    return seconds;
  }
  @notifyChangedAccessor
  set duration(seconds: number) {
    assert(seconds >= 0, "Duration must be >= 0");
    if (this.allDay) {
      seconds = Math.round(Math.ceil(seconds / k1Day) * k1Day) - 1; // set to 23:59:59
    }
    this.endTime.setTime(this.startTime.getTime() + seconds * 1000);
  }

  /** in minutes */
  get durationMinutes(): number {
    return this.duration / 60;
  }
  set durationMinutes(minutes: number) {
    this.duration = minutes * 60;
  }

  /** in hours */
  get durationHours(): number {
    return this.duration / 3600;
  }
  set durationHours(hours: number) {
    this.duration = hours * 3600;
  }

  /** in days */
  get durationDays(): number {
    return this.duration / 86400;
  }
  set durationDays(days: number) {
    this.duration = days * 86400;
  }

  /**
   * Used to update placeholder instances from their recurring master.
   * Copies the event properties that are shared between recurring instances.
   */
  copyFrom(original: Event) {
    this.calUID = original.calUID;
    this.title = original.title;
    this.descriptionText = original.descriptionText;
    this.descriptionHTML = original.descriptionHTML;
    this.allDay = original.allDay;
    this.location = original.location;
    this.isOnline = original.isOnline;
    this.onlineMeetingURL = original.onlineMeetingURL;
    this.participants.replaceAll(original.participants);
    this.response = original.response;
  }

  /**
   * Saves the event locally to the database.
   */
  async save() {
    assert(this.calendar, "To save an event, it needs to be in a calendar first");
    assert(this.calendar.storage, "To save an event, the calendar needs to be saved first");
    await this.calendar.storage.saveEvent(this);
    for (let occurrence of this.instances) {
      if (occurrence && !occurrence.dbID) {
        occurrence.copyFrom(this);
      }
    }
  }

  async saveToServer(): Promise<void> {
    // nothing to do for local events
  }

  get isNew(): boolean {
    return !this.dbID;
  }

  /**
   * Deletes the event locally from the database.
   */
  async deleteIt() {
    assert(this.calendar, "To delete an event, it needs to be in a calendar first");
    assert(this.calendar.storage, "To delete an event, the calendar needs to be saved first");
    if (this.dbID) {
      await this.calendar.storage.deleteEvent(this);
    }
    this.calendar.events.remove(this);
    this.calendar.events.removeAll(this.instances);
    if (this.parentEvent) {
      let pos = this.parentEvent.instances.indexOf(this);
      if (pos >= 0) {
        this.parentEvent.instances.set(pos, null);
        await this.calendar.storage.saveEvent(this.parentEvent);
      }
    }
  }

  async deleteFromServer(): Promise<void> {
    // nothing to do for local events
  }

  ////////////////////////
  // Invitations

  /**
   * @param addMe If our user is not yet in the participants list, then add it. (Optional, default false)
   * @returns the entry from `this.participants` that is our own user
   */
  participantMe(addMe: MailAccount): Participant | null {
    let me = this.participants.find(participant => !!findIdentityForEMailAddress(participant.emailAddress));
    if (me) {
      return me;
    } else if (addMe) {
      let identity = addMe.identities.first;
      assert(identity, "Please set up some email accounts, with identities");
      let me = new Participant(identity.emailAddress, identity.name, ResponseType.Unknown);
      this.participants.add(me);
      return me;
    } else {
      return null;
    }
  }

  /**
   * Tell the organizer whether you will attend the meeting.
   * Use this function when `this` event is part of a calendar.
   * @param response Whether you want to attend
   */
  async respondToInvitation(response: Responses): Promise<void> {
    assert(this.response > ResponseType.Organizer, "Only invitations can be responded to");
    let me = this.participantMe(appGlobal.emailAccounts.first);
    let identity = findIdentityForEMailAddress(me.emailAddress);
    this.response = me.response = response;
    await this.save();
    await this.sendInvitationResponse(response, me, identity.account);
  }

  /**
   * Tell the organizer whether you will attend the meeting.
   * Use this function when `this` event is part of an email with an invitation,
   * but not part of a calendar yet.
   * @param email The email with the invitation that this event represents and
   *   that you want to respond to
   * @param response Whether you want to attend
   * @param addToCalendar Which calendar to add the event to.
   *  This does not work for Exchange calendars, they will always add it to the main calendar
   *  of the email account where the invitation arrived.
   *  Optional, default to connected calendar for Exchange accounts, and
   *  to first calendar for IMAP accounts.
   */
  async respondToInvitationEMail(response: Responses, email: EMail, addToCalendar?: Calendar): Promise<void> {
    assert(email.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let event = findEventInCalendar(addToCalendar ?? appGlobal.calendars.first); // adds, if needed
    let mailAccount = email.folder.account;
    let me = event.participantMe(mailAccount);
    event.response = me.response = response;
    await event.save();
    await this.sendInvitationResponse(response, me, mailAccount);
  }

  protected async sendInvitationResponse(response: Responses, me: Participant, mailAccount: MailAccount): Promise<void> {
    assert(me, gt`Cound not find out which meeting participant is you`);
    let organizer = this.participants.find(participant => participant.response == ResponseType.Organizer);
    assert(organizer, "Invitation should have an organizer");
    let email = mailAccount.newEMailFrom();
    email.to.add(organizer);
    email.iCalMethod = "REPLY";
    email.event = new Event();
    email.event.copyFrom(this);
    email.event.startTime = this.startTime;
    email.event.endTime = this.startTime;
    email.event.recurrenceRule = this.recurrenceRule;
    email.event.participants.replaceAll([new Participant(me.emailAddress, null, response)]);
    if (email.event.descriptionText) {
      email.text = email.event.descriptionText;
      email.html = email.event.descriptionHTML;
    }
    await mailAccount.send(email);
  }

  ////////////////////////
  // Recurring events

  /**
   * Ensures that all recurring instances exist up to the provided date.
   * Must only be called on recurring master events.
   */
  fillRecurrences(endDate: Date) {
    let newOccurrences: Event[] = [];
    let occurrences = this.recurrenceRule.getOccurrencesByDate(endDate);
    for (let i = 0; i < occurrences.length; i++) {
      if (this.instances.get(i) === undefined) {
        let occurrence = this.calendar.newEvent(this);
        occurrence.recurrenceStartTime = occurrences[i];
        occurrence.startTime = new Date(occurrences[i]); // Clone in case of exception
        occurrence.endTime = new Date(this.endTime.getTime() + occurrence.startTime.getTime() - this.startTime.getTime());
        if (this.alarm) {
          occurrence.alarm = new Date(this.alarm.getTime() + occurrence.startTime.getTime() - this.startTime.getTime());
        }
        this.instances.set(i, occurrence);
        newOccurrences.push(occurrence);
      }
    }
    this.calendar.events.addAll(newOccurrences);
  }

  clearExceptions() {
    this.calendar.events.removeAll(this.instances.contents.filter(Boolean));
    for (let event of this.instances) {
      if (event?.dbID) {
        this.calendar.storage.deleteEvent(event).catch(this.calendar.errorCallback);
      }
    }
    this.instances.clear();
  }

  /**
   * Removes any previous instance at that position from the calendar
   * (and also database when an exception subsequently becomes an exclusion).
   */
  replaceInstance(index: number, occurrence: Event) {
    let previous = this.instances.get(index);
    this.instances.set(index, occurrence);
    // There won't be a previous instance if this is a new recurring event
    // and we haven't filled its occurrences yet. Or, this might be an update
    // to a known existing exception.
    if (!previous || previous == occurrence) {
      return;
    }
    // Three cases remain:
    // 1. Deleting a filled instance.
    // 2. Replacing a filled instance with an exception.
    // 3. Deleting an exception. In this case, also need to delete from db.
    this.calendar.events.remove(previous);
    if (previous.dbID) {
      this.calendar.storage.deleteEvent(previous).catch(this.calendar.errorCallback);
    }
  }
}

const k1Day = 86400;


/** If this is an event without calendar, find a matching event in
 * any of the user's calendars */
function findEventInCalendar(addToCalendar: Calendar = null): Event | null {
  for (let calendar of appGlobal.calendars) {
    let eventInOtherCal = calendar.events.find(event => event.calUID == this.calUID);
    if (eventInOtherCal) {
      return eventInOtherCal;
    }
  }
  if (addToCalendar) {
    // Create event
    let event = addToCalendar.newEvent();
    event.copyFrom(this);
    event.startTime = this.startTime;
    event.endTime = this.endTime;
    event.recurrenceRule = this.recurrenceRule;
    event.response = ResponseType.NoResponseReceived;
    addToCalendar.events.add(event);
    if (event.recurrenceRule) {
      event.fillRecurrences(new Date(Date.now() + 1e11));
    }
    return event;
  } else {
    return null;
  }
}
