import { Calendar } from "../Calendar";
import { OWAEvent } from "./OWAEvent";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";
import { kMaxCount } from "../../Mail/OWA/OWAFolder";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";

export class OWACalendar extends Calendar {
  readonly protocol: string = "calendar-owa";
  readonly events: ArrayColl<OWAEvent>;
  account: OWAAccount;

  newEvent(parentEvent?: OWAEvent): OWAEvent {
    return new OWAEvent(this, parentEvent);
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

  protected async listFolder(folder: string, events: ArrayColl<OWAEvent>) {
    let request = {
      __type: "FindItemJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "FindItemRequest:#Exchange",
        ItemShape: {
          __type: "ItemResponseShape:#Exchange",
          BaseShape: "IdOnly",
        },
        ParentFolderIds: [{
          __type: "DistinguishedFolderId:#Exchange",
          Id: folder,
        }],
        Traversal: "Shallow",
        Paging: {
          __type: "IndexedPageView:#Exchange",
          BasePoint: "Beginning",
          Offset: 0,
          MaxEntriesReturned: kMaxCount,
        },
      },
    };
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

  protected async getEvents(eventIDs: string[], events: ArrayColl<OWAEvent>, parentEvent?: OWAEvent) {
    if (!eventIDs.length) {
      return;
    }
    let request = {
      __type: "GetItemJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "GetItemRequest:#Exchange",
        ItemShape: {
          __type: "ItemResponseShape:#Exchange",
          BaseShape: "Default",
          BodyType: "Best",
          AdditionalProperties: [{
            __type: "PropertyUri:#Exchange",
            FieldURI: "item:Body",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "item:ReminderIsSet",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "item:ReminderMinutesBeforeStart",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "item:LastModifiedTime",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "item:TextBody",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:IsAllDayEvent",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:EnhancedLocation",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:MyResponseType",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:RequiredAttendees",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:OptionalAttendees",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:Recurrence",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:ModifiedOccurrences",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:DeletedOccurrences",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:UID",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:RecurrenceId",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:IsOnlineMeeting",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "task:Recurrence",
          }],
        },
        ItemIds: eventIDs.map(id => ({
          __type: "ItemId:#Exchange",
          Id: id,
        })),
      },
    };
    let results = await this.account.callOWA(request);
    let items = results.ResponseMessages ? results.ResponseMessages.Items.map(item => item.Items[0]) : results.Items;
    let online = items.filter(item => item.IsOnlineMeeting);
    if (online.length) {
      let request = {
        __type: "GetCalendarEventJsonRequest:#Exchange",
        Header: {
          __type: "JsonRequestHeaders:#Exchange",
          RequestServerVersion: "Exchange2013",
        },
        Body: {
          __type: "GetCalendarEventRequest:#Exchange",
          EventIds: online.map(item => ({
            __type: "ItemId:#Exchange",
            Id: item.ItemId.Id,
          })),
          ItemShape: {
          __type: "ItemResponseShape:#Exchange",
            BaseShape: "IdOnly",
          },
        }
      };
      let results = await this.account.callOWA(request);
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
