import { Event } from "../Event";

export class InvitationEvent extends Event {
  constructor() {
    super();
  }
  async save(): Promise<never> {
    throw new Error("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async saveLocally(): Promise<never> {
    throw new Error("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async saveToServer(): Promise<never> {
    throw new Error("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async deleteIt(): Promise<never> {
    throw new Error("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async deleteLocally(): Promise<never> {
    throw new Error("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async deleteFromServer(): Promise<never> {
    throw new Error("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
}
