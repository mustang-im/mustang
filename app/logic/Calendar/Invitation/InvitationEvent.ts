import { Event } from "../Event";
import { NotReached } from "../../util/util";

/** This is the event information included in an invitation email.
 * This event is not in any calendar. To put the event in a calendar, you need
 * to call calendar.newEvent()` to create a protocol-specific calendar event
 * implementation and then clone into info from here into that calendar event. */
export class InvitationEvent extends Event {
  async save(): Promise<never> {
    throw new NotReached("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async saveLocally(): Promise<never> {
    throw new NotReached("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async saveToServer(): Promise<never> {
    throw new NotReached("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async deleteIt(): Promise<never> {
    throw new NotReached("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async deleteLocally(): Promise<never> {
    throw new NotReached("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
  async deleteFromServer(): Promise<never> {
    throw new NotReached("InvitationEvent holds a temporary copy of event data for incoming and outgoing invitations only");
  }
}
