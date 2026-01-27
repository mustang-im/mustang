import { Event } from "../Event";
import { JSCalendarEvent } from "./JSCalendarEvent";
import type { TJMAPCalendarEvent } from "./TJSCalendar";
import type { InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { JMAPCalendar } from "./JMAPCalendar";
import { JMAPOutgoingInvitation } from "./JMAPOutgoingInvitation";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class JMAPEvent extends Event {
  declare calendar: JMAPCalendar;
  declare parentEvent: JMAPEvent;
  declare readonly exceptions: ArrayColl<JMAPEvent>;
  isOrigin = true;

  fromJMAP(jmap: TJMAPCalendarEvent) {
    this.id = sanitize.nonemptystring(jmap.id);
    this.isOrigin = sanitize.boolean(jmap.isOrigin, true);
    JSCalendarEvent.toEvent(jmap, this);
  }

  get outgoingInvitation() {
    return new JMAPOutgoingInvitation(this);
  }

  async saveToServer() {
    await this.prepareSaveToServer();
  }

  async deleteFromServer() {
  }

  async makeExclusions(exclusions: JMAPEvent[]) {
    await super.makeExclusions(exclusions);
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    // ...
    await this.calendar.listEvents(); // Sync whatever the server decides to do
  }
}
