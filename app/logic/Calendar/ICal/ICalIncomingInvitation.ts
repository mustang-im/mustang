import { IncomingInvitation } from "../Invitation/IncomingInvitation";
import { type Event, RecurrenceCase } from "../Event";
import { InvitationEvent } from "../Invitation/InvitationEvent";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { Participant } from "../Participant";
import type { MailAccount } from "../../Mail/MailAccount";
import type { MailIdentity } from "../../Mail/MailIdentity";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";

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
    let { myParticipant } = ICalIncomingInvitation.participantMe(this.event, this.message.folder.account);
    /* else add participant? */
    let hasChanged = event.myParticipation != response;
    event.myParticipation = this.myParticipation = myParticipant.response = response;
    await event.save();

    let isFuture = event.startTime?.getTime() > Date.now() || event.recurrenceCase == RecurrenceCase.Master;
    if (hasChanged && isFuture) {
      await ICalIncomingInvitation.sendInvitationResponse(event, myParticipant, this.message.folder.account);
    }
  }

  static async respondToInvitationFromCalEvent(calEvent: Event, response: InvitationResponseInMessage, mailAccount?: MailAccount) {
    let { identity, myParticipant } = this.participantMe(calEvent, mailAccount);
    let hasChanged = myParticipant.response != response;
    calEvent.myParticipation = myParticipant.response = response;
    await calEvent.save();

    let isFuture = calEvent.startTime?.getTime() > Date.now() || calEvent.recurrenceCase == RecurrenceCase.Master;
    if (hasChanged && isFuture) {
      await ICalIncomingInvitation.sendInvitationResponse(calEvent, myParticipant, identity.account);
    }
  }

  static participantMe(event: Event, mailAccount?: MailAccount): { identity: MailIdentity, myParticipant: Participant } {
    let results = [];
    let accounts = mailAccount ? [mailAccount] : appGlobal.emailAccounts.contents.filter(account => account.canSendInvitations);
    for (let account of accounts) {
      for (let identity of account.identities) {
        for (let myParticipant of event.participants) {
          if (identity.isEMailAddress(myParticipant.emailAddress)) {
            results.push({ identity, myParticipant });
          }
        }
      }
    }
    assert(results.length == 1, "Failed to find unique identity for meeting");
    return results[0];
  }

  /** Helper for @see Event.respondToInvitation() */
  protected static async sendInvitationResponse(repliedEvent: Event, myParticipant: Participant, account: MailAccount) {
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
