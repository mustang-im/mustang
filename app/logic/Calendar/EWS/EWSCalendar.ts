import { Calendar } from "../Calendar";
import { EWSEvent } from "./EWSEvent";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { ensureArray } from "../../Mail/EWS/EWSEMail";

export class EWSCalendar extends Calendar {
  readonly protocol: string = "calendar-ews";
  account: EWSAccount;

  newEvent(): EWSEvent {
    return new EWSEvent(this);
  }

  async listEvents() {
    let events: EWSEvent[] = [];
    await this.listFolder("calendar", events);
    await this.listFolder("tasks", events);
    this.events.replaceAll(events);
  }

  async listFolder(folder: string, events: EWSEvent[]) {
    let request = {
      m$FindItem: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
        },
        m$IndexedPageItemView: {
          BasePoint: "Beginning",
          Offset: 0,
        },
        m$ParentFolderIds: {
          t$DistinguishedFolderId: [{
            Id: folder,
          }],
        },
        Traversal: "Shallow",
      },
    };
    let result: any = { RootFolder: { IncludesLastItemInRange: "false" } };
    while (result?.RootFolder?.IncludesLastItemInRange === "false") {
      result = await this.account.callEWS(request);
      if (!result?.RootFolder?.Items) {
        break;
      }
      request.m$FindItem.m$IndexedPageItemView.Offset = result.RootFolder.IndexedPagingOffset;
      await this.getEvents(ensureArray(result.RootFolder.Items.CalendarItem || result.RootFolder.Items.Task).map(item => item.ItemId), events);
    }
  }

  async getEvents(eventIDs, events: EWSEvent[]) {
    if (!eventIDs.length) {
      return;
    }
    let request = {
      m$GetItem: {
        m$ItemShape: {
          t$BaseShape: "Default",
          t$BodyType: "Best",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "item:Body",
            }, {
              FieldURI: "item:ReminderIsSet",
            }, {
              FieldURI: "item:ReminderMinutesBeforeStart",
            }, {
              FieldURI: "item:LastModifiedTime",
            }, {
              FieldURI: "item:TextBody",
            }, {
              FieldURI: "calendar:IsAllDayEvent",
            }, {
              FieldURI: "calendar:RequiredAttendees",
            }, {
              FieldURI: "calendar:OptionalAttendees",
            }, {
              FieldURI: "calendar:Recurrence",
            }, {
              FieldURI: "calendar:UID",
            }, {
              FieldURI: "task:Recurrence",
            }],
          },
        },
        m$ItemIds: {
          t$ItemId: eventIDs,
        },
      },
    };
    let results = ensureArray(await this.account.callEWS(request));
    for (let result of results) {
      let event = this.newEvent();
      event.fromXML(result.Items.CalendarItem || result.Items.Task);
      events.push(event);
    }
  }
}
