import type { Event } from "../Event";
import type { Participant } from "../Participant";
import { InvitationResponse, type iCalMethod } from "./InvitationStatus";
import type { MailAccount } from "../../Mail/MailAccount";
import type { PersonUID } from "../../Abstract/PersonUID";

export default class OutgoingInvitation {
  event: Event;

  constructor(event: Event) {
    this.event = event;
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
