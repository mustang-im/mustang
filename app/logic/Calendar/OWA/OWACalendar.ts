import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { OWAEvent } from "./OWAEvent";
import { OWAIncomingInvitation } from "./OWAIncomingInvitation";
import { type OWAAccount, kMaxFetchCount } from "../../Mail/OWA/OWAAccount";
import { OWAGetUserAvailabilityRequest } from "./Request/OWAGetUserAvailabilityRequest";
import type { OWAEMail } from "../../Mail/OWA/OWAEMail";
import { owaFindEventsRequest, owaGetCalendarEventsRequest, owaGetEventsRequest } from "./Request/OWAEventRequests";
import { RunOnce } from "../../util/RunOnce";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from "../../util/util";
import { ArrayColl } from "svelte-collections";

export class OWACalendar extends Calendar {
  readonly protocol: string = "calendar-owa";
  declare readonly events: ArrayColl<OWAEvent>;
  /** Exchange FolderID for this calendar. Not DistinguishedFolderId */
  folderID: string;
  /** Exchange's calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;
  /** Is this the default calendar that handles incoming invitations */
  useForInvitations: boolean = false;
  protected listEventsRunOnce = new RunOnce();

  get account(): OWAAccount {
    return this.mainAccount as OWAAccount;
  }

  get isLoggedIn(): boolean {
    return this.account.isLoggedIn;
  }

  async login(interactive: boolean) {
    if (this.isLoggedIn) {
      return;
    }
    await this.account.login(interactive);
  }

  callOWA(aRequest: any) {
    return this.username == this.account.username
      ? this.account.callOWA(aRequest)
      : this.account.callOWA(aRequest, { mailbox: this.username });
  }

  newEvent(parentEvent?: OWAEvent): OWAEvent {
    return new OWAEvent(this, parentEvent);
  }

  getIncomingInvitationForEMail(message: OWAEMail) {
    return new OWAIncomingInvitation(this, message);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    let results = await this.callOWA(new OWAGetUserAvailabilityRequest(participants, from, to));
    return participants.map((participant, i) => ({
      participant,
      availability: ensureArray(results.Responses[i].CalendarView.Items).map(event => ({
        from: new Date(event.Start + "Z"),
        to: new Date(event.End + "Z"),
        free: event.FreeBusyType == "Free",
      })),
    }));
  }

  protected getEventByItemID(id: string): OWAEvent | undefined {
    return this.events.find(p => p.itemID == id);
  }

  async listEvents() {
    await super.listEvents();
    await this.listEventsRunOnce.runOnce(() => this.listEventsSlow());
  }

  async listEventsSlow() {
    await super.listEvents();
    let events = new ArrayColl<OWAEvent>;
    await this.listFolder(events);
    for (let event of this.events.subtract(events)) {
      // This might be a filled occurrence that has since been modified.
      await event.deleteLocally();
    }
    this.events.replaceAll(events);
  }

  protected async listFolder(events: ArrayColl<OWAEvent>) {
    let request = owaFindEventsRequest(this.folderID, kMaxFetchCount);
    let result: any = { RootFolder: { IncludesLastItemInRange: false } };
    while (result?.RootFolder?.IncludesLastItemInRange === false) {
      result = await this.callOWA(request);
      if (!result?.RootFolder?.Items?.length) {
        break;
      }
      request.Body.Paging.Offset = sanitize.integer(result.RootFolder.IndexedPagingOffset);
      let eventIDs: string[] = [];
      for (let item of result.RootFolder.Items) {
        let event = this.getEventByItemID(item.ItemId.Id);
        if (event?.lastMod.getTime() == sanitize.date(item.LastModifiedTime, null)?.getTime()) {
          // Our local event is up-to-date, so just add it directly to the results.
          events.add(event);
          events.addAll(event.exceptions);
        } else {
          // This is a new or updated event that we need to fetch.
          eventIDs.push(item.ItemId.Id);
        }
      }
      await this.getEvents(eventIDs, events);
    }
  }

  async getEvents(eventIDs: string[], events: ArrayColl<OWAEvent>, parentEvent?: OWAEvent) {
    if (!eventIDs.length) {
      return;
    }
    let results = await this.callOWA(owaGetEventsRequest(eventIDs));
    let items = results.ResponseMessages ? results.ResponseMessages.Items.map(item => item.Items[0]) : results.Items;
    let online = items.filter(item => item.IsOnlineMeeting);
    if (online.length) {
      let results = await this.callOWA(owaGetCalendarEventsRequest(online.map(item => item.ItemId.Id)));
      let items = results.ResponseMessages ? results.ResponseMessages.Items.map(item => item.Items[0]) : results.Items;
      for (let i = 0; i < items.length; i++) {
        online[i].OnlineMeetingJoinUrl = items[i].OnlineMeetingJoinUrl;
      }
    }
    for (let item of items) {
      try {
        let event = this.getEventByItemID(sanitize.nonemptystring(item.ItemId.Id)) || parentEvent?.getOccurrenceByDate(sanitize.date(item.RecurrenceId)) as OWAEvent || this.newEvent();
        event.fromJSON(item);
        await event.saveLocally();
        events.add(event);
        if (item.ModifiedOccurrences?.length && event.recurrenceRule) {
          await this.getEvents(item.ModifiedOccurrences.map(item => item.ItemId.Id), events, event);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }

  async createOrUpdateEventFromServerByID(itemID: string) {
    let events = new ArrayColl<OWAEvent>();
    await this.getEvents([itemID], events);
    for (let event of events) {
      if (!this.events.contains(event)) {
        this.events.add(event);
      }
    }
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.folderID = sanitize.string(json.folderID, null);
    this.useForInvitations = sanitize.boolean(json.useForInvitations, false);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.folderID = this.folderID;
    json.useForInvitations = this.useForInvitations;
    return json;
  }
}
