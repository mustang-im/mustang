import type { Event } from "./Event";
import type { Participant } from "./Participant";
import { InvitationResponse, type iCalMethod } from "./Invitation";
import type { MailAccount } from "../Mail/MailAccount";

export default class OutgoingActions {
  event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  async sendInvitations(account: MailAccount) {
    for (let participant of this.event.participants) {
      if (participant.response != InvitationResponse.Organizer) {
        participant.response ||= InvitationResponse.NoResponseReceived;
        await this.send(participant, account, "REQUEST");
      }
    }
  }

  async sendCancellations(account: MailAccount) {
    for (let participant of this.event.participants) {
      if (participant.response > InvitationResponse.Organizer) {
        await this.send(participant, account, "CANCEL");
      }
    }
  }

  protected async send(participant: Participant, account: MailAccount, method: iCalMethod) {
    let email = account.newEMailFrom();
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
