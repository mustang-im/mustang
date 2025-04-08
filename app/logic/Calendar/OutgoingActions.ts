import type { Event } from "./Event";
import type { Participant } from "./Participant";
import { ResponseType, type iCalMethod } from "./Invitation";
import type { MailAccount } from "../Mail/MailAccount";
import type { PersonUID } from "../Abstract/PersonUID";

export default class OutgoingActions {
  event: Event;

  constructor(event: Event) {
    this.event = event;
  }

  async sendInvitations(account: MailAccount, from?: PersonUID) {
    for (let participant of this.event.participants) {
      if (participant.response != ResponseType.Organizer) {
        participant.response ||= ResponseType.NoResponseReceived;
        await this.send("REQUEST", participant, account, from);
      }
    }
  }

  async sendCancellations(account: MailAccount, from?: PersonUID) {
    for (let participant of this.event.participants) {
      if (participant.response > ResponseType.Organizer) {
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
