import type { Event } from "../Event";
import { Scheduling, ResponseType, type Responses } from "../Invitation";
import type { OWACalendar } from "./OWACalendar";
import type { OWAEvent } from "./OWAEvent";
import type { OWAEMail } from "../../Mail/OWA/OWAEMail";
import OWACreateItemRequest from "../../Mail/OWA/Request/OWACreateItemRequest";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";

const ResponseTypes: Record<Responses, string> = {
  [ResponseType.Accept]: "AcceptItem",
  [ResponseType.Tentative]: "TentativelyAcceptItem",
  [ResponseType.Decline]: "DeclineItem",
};

export class OWAIncomingActions {
  readonly calendar: OWACalendar;
  readonly message: OWAEMail;
  readonly scheduling: Scheduling;
  readonly event: Event;
  readonly itemID: string | void;
  myResponse: ResponseType;

  constructor(calendar: OWACalendar, message: OWAEMail) {
    this.calendar = calendar;
    this.message = message;
    this.scheduling = message.scheduling;
    this.event = message.event;
    let event = calendar.events.find(event => event.calUID == this.event.calUID);
    this.itemID = event?.itemID;
    this.myResponse = event?.response || ResponseType.NoResponseReceived;
  }

  async respondToInvitation(response: Responses) {
    assert(this.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let request = new OWACreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", {
      __type: "ItemId:#Exchange",
      Id: this.message.itemID,
    });
    await this.calendar.account.callOWA(request);
    await this.message.deleteMessageLocally(); // Exchange deletes the message from the inbox
  }

  async updateFromResponse() {
    assert(this.itemID, "UI should have been disabled");
    await this.calendar.getEvents([this.itemID], new ArrayColl<OWAEvent>());
  }
}
