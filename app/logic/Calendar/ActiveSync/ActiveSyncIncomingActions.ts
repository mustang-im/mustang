import type { Event } from "../Event";
import { Scheduling, ResponseType, type Responses } from "../Invitation";
import type { ActiveSyncCalendar } from "./ActiveSyncCalendar";
import type { ActiveSyncEMail } from "../../Mail/ActiveSync/ActiveSyncEMail";
import { assert } from "../../util/util";

const ActiveSyncResponse: Record<Responses, number> = {
  [ResponseType.Accept]: 1,
  [ResponseType.Tentative]: 2,
  [ResponseType.Decline]: 3,
};

export class ActiveSyncIncomingActions {
  readonly calendar: ActiveSyncCalendar;
  readonly message: ActiveSyncEMail;
  readonly scheduling: Scheduling;
  readonly event: Event;
  myResponse: ResponseType;

  constructor(calendar: ActiveSyncCalendar, message: ActiveSyncEMail) {
    this.calendar = calendar;
    this.message = message;
    this.scheduling = message.scheduling;
    this.event = message.event;
    let event = calendar.events.find(event => event.calUID == this.event.calUID);
    this.myResponse = event?.response || ResponseType.NoResponseReceived;
  }

  async respondToInvitation(response: Responses) {
    assert(this.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let request = {
      Request: {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.message.folder.id,
        ReqeustId: this.message.serverID,
      },
    };
    await this.calendar.account.callEAS("MeetingResponse", request);
    await this.calendar.account.sendInvitationResponse(this.event, response); // needs 16.x to do this automatically
    await this.message.deleteMessageLocally(); // Exchange deletes the message from the inbox
  }

  async updateFromResponse() {
    await this.calendar.listEvents();
  }
}
