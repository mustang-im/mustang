import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { JMAPEvent } from "./JMAPEvent";
import { JMAPIncomingInvitation } from "./JMAPIncomingInvitation";
import type { JMAPAccount } from "../../Mail/JMAP/JMAPAccount";
import type { JMAPEMail } from "../../Mail/JMAP/JMAPEMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";

export class JMAPCalendar extends Calendar {
  readonly protocol: string = "calendar-jmap";
  declare readonly events: ArrayColl<JMAPEvent>;
  /** TODO JMAP calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;

  get account(): JMAPAccount {
    return this.mainAccount as JMAPAccount;
  }

  newEvent(parentEvent?: JMAPEvent): JMAPEvent {
    return new JMAPEvent(this, parentEvent);
  }

  getIncomingInvitationForEMail(message: JMAPEMail) {
    return new JMAPIncomingInvitation(this, message);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
  }

  async listEvents() {
    await super.listEvents();
  }

  getEventByItemID(id: string): JMAPEvent | undefined {
    return this.events.find(p => p.itemID == id);
  }

  async listFolder(folder: string, events: JMAPEvent[]) {
  }

  async getEvents(eventIDs: { Id: string }[], events: JMAPEvent[], parentEvent?: JMAPEvent) {
    if (!eventIDs.length) {
      return;
    }
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.folderID = sanitize.string(json.folderID, null);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.folderID = this.folderID;
    return json;
  }
}
