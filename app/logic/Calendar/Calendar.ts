import { Account } from "../Abstract/Account";
import { Event } from "./Event";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "./Invitation/InvitationStatus";
import type { Participant } from "./Participant";
import type { EMail } from "../Mail/EMail";
import { appGlobal } from "../app";
import { assert } from "../util/util";
import { Collection, ArrayColl } from "svelte-collections";
import { ICalEMailProcessor } from "./ICal/ICalEMailProcessor";

export class Calendar extends Account {
  readonly protocol: string = "calendar-local";
  readonly events = new ArrayColl<Event>();
  storage: CalendarStorage | null = null;
  syncState: string | null = null;

  newEvent(parentEvent?: Event): Event {
    return new Event(this, parentEvent);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    return participants.map(participant => ({ participant, availability: [] }));
  }

  /**
   * Ensures that instances for all recurring events in the calendar exist
   * up to the provided date. Returns all events as a convenience.
   */
  fillRecurrences(endDate: Date): Collection<Event> {
    for (let event of this.events.contents.filter(event => event.recurrenceRule)) {
      event.fillRecurrences(endDate);
    }
    return this.events;
  }

  async respondToInvitation(email: EMail, response: InvitationResponseInMessage) {
    assert(email.invitationMessage == InvitationMessage.Invitation, "Only invitations can be responded to");
    let event = this.events.find(event => event.calUID == email.event.calUID);
    if (!event) {
      event = this.newEvent();
      event.copyFrom(email.event);
      event.recurrenceRule = email.event.recurrenceRule;
      event.myParticipation = InvitationResponse.NoResponseReceived;
      this.events.add(event);
      if (event.recurrenceRule) {
        event.fillRecurrences(new Date(Date.now() + 1e11));
      }
    }
    let participant = event.participants.find(participant => participant.emailAddress == email.folder.account.emailAddress);
    if (participant) {
      event.myParticipation = participant.response = response;
      await event.save();
      await email.event.sendInvitationResponse(response, email.folder.account);
    }
    /* else add participant? */
  }

  async updateFromResponse(invitationMessage: InvitationMessage, response: Event) {
    assert(invitationMessage && invitationMessage != InvitationMessage.Invitation, "can't update from an invitation");
    let attendee = response.participants.find(participant => participant.response != InvitationResponse.Organizer);
    let event = this.events.find(p => p.calUID == response.calUID);
    if (invitationMessage == InvitationMessage.CancelledEvent) {
      let organizer = event.participants.find(participant => participant.response == InvitationResponse.Organizer);
      if (organizer) {
        organizer.response = InvitationResponse.Decline;
        await event.save();
      }
    } else {
      let participant = event.participants.find(participant => participant.emailAddress == attendee.emailAddress);
      if (participant) {
        participant.response = attendee.response;
        await event.save();
      }
    }
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
