import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import type { Participant } from "./Participant";
import { IncomingInvitation } from "./Invitation/IncomingInvitation";
import type { EMail } from "../Mail/EMail";
import { appGlobal } from "../app";
import { Collection, ArrayColl } from "svelte-collections";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";

export class Calendar extends Account {
  readonly protocol: string = "calendar-local";
  readonly events = new ArrayColl<Event>();
  /** Can this calendar accept incoming invitations from inboxes in other accounts? */
  readonly canAcceptAnyInvitation: boolean = true;
  storage: CalendarStorage | null = null;
  syncState: string | null = null;

  newEvent(parentEvent?: Event): Event {
    return new Event(this, parentEvent);
  }

  getIncomingInvitationFor(message: EMail) {
    return new IncomingInvitation(this, message);
  }

  async listEvents() {
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    return participants.map(participant => ({ participant, availability: [] }));
  }

  async save(): Promise<void> {
    await this.storage?.saveCalendar(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteCalendar(this);
    appGlobal.calendars.remove(this);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.syncState = json.syncState;
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.syncState = this.syncState;
    return json;
  }
}

export interface CalendarStorage {
  saveEvent(event: Event): Promise<void>;
  deleteEvent(event: Event): Promise<void>;
  saveCalendar(calendar: Calendar): Promise<void>;
  deleteCalendar(calendar: Calendar): Promise<void>;
}

ICalEMailProcessor.hookup();
