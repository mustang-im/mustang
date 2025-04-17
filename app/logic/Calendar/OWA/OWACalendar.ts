import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { OWAEvent } from "./OWAEvent";
import { OWAIncomingInvitation } from "./OWAIncomingInvitation";
import { type OWAAccount, kMaxFetchCount } from "../../Mail/OWA/OWAAccount";
import OWAGetUserAvailabilityRequest from "./Request/OWAGetUserAvailabilityRequest";
import type { OWAEMail } from "../../Mail/OWA/OWAEMail";
import { owaFindEventsRequest, owaGetCalendarEventsRequest, owaGetEventsRequest } from "./Request/OWAEventRequests";
import { ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";

export class OWACalendar extends Calendar {
  readonly protocol: string = "calendar-owa";
  readonly events: ArrayColl<OWAEvent>;

  get account(): OWAAccount {
    return this.mainAccount as OWAAccount;
  }

  newEvent(parentEvent?: OWAEvent): OWAEvent {
    return new OWAEvent(this, parentEvent);
  }

  getIncomingInvitationFor(message: OWAEMail) {
    return new OWAIncomingInvitation(this, message);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    let results = await this.account.callOWA(new OWAGetUserAvailabilityRequest(participants, from, to));
    return participants.map((participant, i) => ({ participant, availability: ensureArray(results.Responses[i].CalendarView.Items).map(event => ({ from: new Date(event.Start + "Z"), to: new Date(event.End + "Z"), free: event.FreeBusyType == "Free" })) }));
  }

  protected getEventByItemID(id: string): OWAEvent | void {
    return this.events.find(p => p.itemID == id);
  }

  async listEvents() {
    if (!this.dbID) {
      await this.save();
    }

    let events = new ArrayColl<OWAEvent>;
    await this.listFolder("calendar", events);
    /* Disabling tasks for now.
    await this.listFolder("tasks", events);
    */
    for (let event of this.events.subtract(events)) {
      // This might be a filled occurrence that has since been modified.
      if (event.dbID) {
        await event.deleteIt();
      }
    }
    this.events.replaceAll(events);
  }

  protected async listFolder(folderID: string, events: ArrayColl<OWAEvent>) {
    let request = owaFindEventsRequest(folderID, kMaxFetchCount);
    let result: any = { RootFolder: { IncludesLastItemInRange: false } };
    while (result?.RootFolder?.IncludesLastItemInRange === false) {
      result = await this.account.callOWA(request);
      if (!result?.RootFolder?.Items?.length) {
        break;
      }
      request.Body.Paging.Offset = sanitize.integer(result.RootFolder.IndexedPagingOffset);
      await this.getEvents(result.RootFolder.Items.map(item => item.ItemId.Id), events);
    }
  }

  async getEvents(eventIDs: string[], events: ArrayColl<OWAEvent>, parentEvent?: OWAEvent) {
    if (!eventIDs.length) {
      return;
    }
    let results = await this.account.callOWA(owaGetEventsRequest(eventIDs));
    let items = results.ResponseMessages ? results.ResponseMessages.Items.map(item => item.Items[0]) : results.Items;
    let online = items.filter(item => item.IsOnlineMeeting);
    if (online.length) {
      let results = await this.account.callOWA(owaGetCalendarEventsRequest(online.map(item => item.ItemId.Id)));
      let items = results.ResponseMessages ? results.ResponseMessages.Items.map(item => item.Items[0]) : results.Items;
      for (let i = 0; i < items.length; i++) {
        online[i].OnlineMeetingJoinUrl = items[i].OnlineMeetingJoinUrl;
      }
    }
    for (let item of items) {
      try {
        let event = this.getEventByItemID(sanitize.nonemptystring(item.ItemId.Id)) || this.newEvent(parentEvent);
        event.fromJSON(item);
        await event.save();
        events.add(event);
        if (parentEvent && event.recurrenceStartTime) {
          event.parentEvent = parentEvent; // should already be correct
          let occurrences = parentEvent.recurrenceRule.getOccurrencesByDate(event.recurrenceStartTime);
          parentEvent.replaceInstance(occurrences.length - 1, event);
        }
        if (item.ModifiedOccurrences?.length && event.recurrenceRule) {
          await this.getEvents(item.ModifiedOccurrences.map(item => item.ItemId.Id), events, event);
        }
        if (event.recurrenceRule) {
          // Also include any filled occurrences we happen to have.
          events.addAll(event.instances.contents.filter(instance => instance && !instance.dbID));
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }
}
