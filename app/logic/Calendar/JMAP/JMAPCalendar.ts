import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { JMAPEvent } from "./JMAPEvent";
import { JMAPIncomingInvitation } from "./JMAPIncomingInvitation";
import type { JMAPAccount } from "../../Mail/JMAP/JMAPAccount";
import type { JMAPEMail } from "../../Mail/JMAP/JMAPEMail";
import type { TJMAPCalendar } from "./TJMAPCalendar";
import type { TID } from "../../Mail/JMAP/TJMAPGeneric";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";

export class JMAPCalendar extends Calendar {
  readonly protocol: string = "calendar-jmap";
  declare readonly events: ArrayColl<JMAPEvent>;
  /** TODO JMAP calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;
  /** ID in JMAP (because `.id` is the ID our database) */
  jmapID: TID;
  /** Primary calendar for this account */
  isDefault = false;
  /** isSubscribed - if false, the user doesn't want to see it in the UI */
  shouldShow = true;

  get account(): JMAPAccount {
    return this.mainAccount as JMAPAccount;
  }

  newEvent(parentEvent?: JMAPEvent): JMAPEvent {
    return new JMAPEvent(this, parentEvent);
  }

  fromJMAP(jmap: TJMAPCalendar) {
    this.jmapID = sanitize.nonemptystring(jmap.id);
    this.isDefault = sanitize.boolean(jmap.isDefault, false);
    this.shouldShow = sanitize.boolean(jmap.isSubscribed, true);
    if (!this.name || !this.isDefault) { // Default calendar name = account name, as set by `initFromMainAccount()`
      this.name = sanitize.nonemptystring(jmap.name);
    }
  }

  getIncomingInvitationForEMail(message: JMAPEMail) {
    return new JMAPIncomingInvitation(this, message);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
  }

  async listEvents() {
    await super.listEvents();
  }

  getEventByID(id: string): JMAPEvent | undefined {
    return this.events.find(p => p.id == id);
  }

  async getEvents(eventIDs: { Id: string }[], events: JMAPEvent[], parentEvent?: JMAPEvent) {
    if (!eventIDs.length) {
      return;
    }
  }

  async fetchChangedEventsForAllCalendars(): Promise<ArrayColl<JMAPEvent>> {
    return new ArrayColl();
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.jmapID = sanitize.alphanumdash(json.jmapID);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.jmapID = this.jmapID;
    return json;
  }
}
