import type { Event } from "../Event";
import { Participant } from "../Participant";
import { InvitationResponse, type iCalMethod } from "./InvitationStatus";
import { type MailIdentity, findIdentityForEMailAddress } from "../../Mail/MailIdentity";
import type { EMail } from "../../Mail/EMail";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";

export default class OutgoingInvitation {
  event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  createOrganizer() {
    let identity = this.identity;
    this.event.participants.add(new Participant(identity.emailAddress, identity.realname, InvitationResponse.Organizer));
    this.event.myParticipation = InvitationResponse.Organizer;
  }

  get identity(): MailIdentity {
    let account = appGlobal.emailAccounts.find(account => account.canSendInvitations);
    assert(account, gt`No suitable email identity to organise this meeting`);
    return account.identities.first;
  }

  async sendInvitations() {
    for (let participant of this.event.participants) {
      if (participant.response != InvitationResponse.Organizer) {
        participant.response ||= InvitationResponse.NoResponseReceived;
        await this.send("REQUEST", participant);
      }
    }
  }

  async sendCancellations() {
    for (let participant of this.event.participants) {
      if (participant.response > InvitationResponse.Organizer) {
        await this.send("CANCEL", participant);
      }
    }
  }

  protected async send(method: iCalMethod, participant: Participant) {
    let email = this.newEMailFrom();
    email.to.add(participant);
    email.iCalMethod = method;
    email.event = this.event;
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
}
