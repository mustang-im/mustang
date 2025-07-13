import type { Event } from "../Event";
import { Participant } from "../Participant";
import { InvitationResponse, type iCalMethod } from "./InvitationStatus";
import { type MailIdentity, findIdentityForEMailAddress } from "../../Mail/MailIdentity";
import type { EMail } from "../../Mail/EMail";
import { appGlobal } from "../../app";
import { NotReached, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import type { Collection } from "svelte-collections";

export class OutgoingInvitation {
  event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  createOrganizer() {
    assert(this.event.participants.isEmpty, "This is already a meeting");
    assert(!this.event.isIncomingMeeting, "This is a meeting you have been invitated to. You cannot be the organizer.");
    this.event.myParticipation = InvitationResponse.Organizer;
    let identity = this.identity;
    this.event.participants.add(new Participant(identity.emailAddress, identity.realname, InvitationResponse.Organizer));
  }

  get identity(): MailIdentity {
    let account = appGlobal.emailAccounts.find(account => account.canSendInvitations);
    assert(account, gt`No suitable email identity to organise this meeting`);
    return account.identities.first;
  }

  async sendInvitationsTo(participants: Collection<Participant>) {
    let sendTo = participants.filterOnce(participant => participant.response != InvitationResponse.Organizer);
    for (let participant of sendTo) {
      participant.response ||= InvitationResponse.NoResponseReceived;
    }
    await this.send("REQUEST", sendTo);
  }

  async sendCancellationsTo(participants: Collection<Participant>) {
    let sendTo = participants.filterOnce(participant => participant.response > InvitationResponse.Organizer);
    await this.send("CANCEL", sendTo);
  }

  async sendInvitations() {
    let event = this.event;
    let unedited = this.event.unedited;
    let removed = unedited.participants.subtract(event.participants);
    // Use the original event when sending cancellations
    unedited.outgoingInvitation.sendCancellationsTo(removed);
    let notify = this.changesNeedToNotify()
      ? event.participants
      : event.participants.subtract(unedited.participants);
    await this.sendInvitationsTo(notify);
  }

  async sendCancellations() {
    let unedited = this.event.unedited;
    if (unedited) {
      await unedited.outgoingInvitation.sendCancellationsTo(unedited.participants);
    } else {
      await this.sendCancellationsTo(this.event.participants);
    }
  }

  protected async send(method: iCalMethod, participants: Collection<Participant>) {
    let email = this.newEMailFrom();
    email.to.addAll(participants);
    email.iCalMethod = method;
    email.event = this.event;
    let subject = "";
    if (method == "REQUEST") {
      subject = gt`Invitation *=> Suggestion to join the business meeting`
    } else if (method == "CANCEL") {
      subject = gt`Cancelled *=> The business meeting is no longer happening`
    } else {
      throw new NotReached(`You cannot ${method} to this invitation, because you're the organizer`);
    }
    email.subject = subject + ": " + this.event.title;
    if (this.event.descriptionText) {
      email.text = this.event.descriptionText;
      email.html = this.event.descriptionHTML;
    }
    await email.folder.account.send(email);
  }

  protected newEMailFrom(): EMail {
    let organizer = this.event.participants.find(participant => participant.response == InvitationResponse.Organizer);
    let identity = findIdentityForEMailAddress(organizer.emailAddress);
    let email = identity.account.newEMailFrom();
    email.from = organizer;
    return email;
  }

  /**
   * Has a property changed that we should notify invitees about?
   */
  changesNeedToNotify(): boolean {
    let event = this.event;
    let unedited = this.event.unedited;
    return !!event.unedited && (
      event.startTime?.getTime() != unedited.startTime?.getTime() ||
      event.endTime?.getTime() != unedited.endTime?.getTime() ||
      event.timezone != unedited.timezone ||
      event.allDay != unedited.allDay ||
      event.title != unedited.title ||
      event.rawText != unedited.rawText ||
      event.rawHTMLDangerous != unedited.rawHTMLDangerous ||
      event.location != unedited.location ||
      event.isOnline != unedited.isOnline ||
      event.onlineMeetingURL != unedited.onlineMeetingURL ||
      event.recurrenceCase != unedited.recurrenceCase ||
      event.recurrenceRule != unedited.recurrenceRule
    );
  }
}
