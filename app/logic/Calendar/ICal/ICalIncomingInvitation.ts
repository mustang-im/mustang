import type { Event } from "../Event";
import { InvitationEvent } from "../Invitation/InvitationEvent";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { Participant } from "../Participant";
import type { MailAccount } from "../../Mail/MailAccount";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { IncomingInvitation } from "../Invitation/IncomingInvitation";

export class ICalIncomingInvitation extends IncomingInvitation {
  async respondToInvitation(response: InvitationResponseInMessage) {
    assert(this.invitationMessage == InvitationMessage.Invitation, "Only invitations can be responded to");
    let event = this.calEvent();
    if (!event) {
      event = this.calendar.newEvent();
      event.copyFrom(this.event);
      this.calendar.events.add(event);
    } else if (this.event?.lastUpdateTime >= event.lastUpdateTime) {
      event.copyFrom(this.event);
    }
    let { myParticipant } = event.participantMe(this.message.folder.account);
    /* else add participant? */
    let hasChanged = event.myParticipation != response;
    event.myParticipation = this.myParticipation = myParticipant.response = response;
    await event.save();
    if (hasChanged) {
      await ICalIncomingInvitation.sendInvitationResponse(event, myParticipant, this.message.folder.account);
    }
  }

  /** Helper for @see Event.respondToInvitation() */
  static async sendInvitationResponse(repliedEvent: Event, myParticipant: Participant, account: MailAccount) {
    let organizer = repliedEvent.participants.find(participant => participant.response == InvitationResponse.Organizer);
    assert(organizer, "Invitation should have an organizer");
    let email = account.newEMailFrom();
    email.from.emailAddress = myParticipant.emailAddress;
    email.from.name = myParticipant.name || email.from.name;
    email.to.add(organizer);
    email.iCalMethod = "REPLY";
    email.event = new InvitationEvent();
    email.event.copyFrom(repliedEvent);
    // Only myself in reply: RFC 5546 3.2.3
    email.event.participants.replaceAll([myParticipant]);
    if (email.event.descriptionText) {
      email.text = email.event.descriptionText;
      email.html = email.event.descriptionHTML;
    }

    let subject = "";
    if (myParticipant.response == InvitationResponse.Accept) {
      subject = gt`Confirmed *=> Accepted to join this business meeting`;
    } else if (myParticipant.response == InvitationResponse.Decline) {
      subject = gt`Declined *=> Refused to join this business meeting`;
    } else if (myParticipant.response == InvitationResponse.Tentative) {
      subject = gt`Tentative *=> Not sure to join this business meeting`;
    }
    if (subject) {
      subject += ": ";
    }
    email.subject = subject + email.event.title;

    await account.send(email);
  }
}
