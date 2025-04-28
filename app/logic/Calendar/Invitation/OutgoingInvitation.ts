import type { Event } from "../Event";
import { Participant } from "../Participant";
import { InvitationResponse, type iCalMethod } from "./InvitationStatus";
import type { MailAccount } from "../../Mail/MailAccount";
import type { MailIdentity } from "../../Mail/MailIdentity";
import type { PersonUID } from "../../Abstract/PersonUID";
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
    assert(account, gt`No suitable identity to organise this meeting`);
    return account.identities.first;
  }

  async sendInvitations(account: MailAccount, from?: PersonUID) {
    for (let participant of this.event.participants) {
      if (participant.response != InvitationResponse.Organizer) {
        participant.response ||= InvitationResponse.NoResponseReceived;
        await this.send("REQUEST", participant, account, from);
      }
    }
  }

  async sendCancellations(account: MailAccount, from?: PersonUID) {
    for (let participant of this.event.participants) {
      if (participant.response > InvitationResponse.Organizer) {
        await this.send("CANCEL", participant, account, from);
      }
    }
  }

  protected async send(method: iCalMethod, participant: Participant, account: MailAccount, from?: PersonUID) {
    let email = account.newEMailFrom();
    if (from) {
      email.from = from;
    }
    email.to.add(participant);
    email.iCalMethod = method;
    email.event = this.event;
    if (this.event.descriptionText) {
      email.text = this.event.descriptionText;
      email.html = this.event.descriptionHTML;
    }
    await account.send(email);
  }
}
