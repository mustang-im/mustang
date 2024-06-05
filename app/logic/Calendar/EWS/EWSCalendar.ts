import { Calendar } from "../Calendar";
import { EWSEvent } from "./EWSEvent";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { SQLCalendar } from "../SQL/SQLCalendar";
import { SQLEvent } from "../SQL/SQLEvent";
import { kMaxCount } from "../../Mail/EWS/EWSFolder";
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";

export class EWSCalendar extends Calendar {
  readonly protocol: string = "calendar-ews";
  readonly events: ArrayColl<EWSEvent>;
  account: EWSAccount;

  newEvent(): EWSEvent {
    return new EWSEvent(this);
  }

  async listEvents() {
    // syncState is base64-encoded so it's safe to split and join on comma
    let [calendar, tasks] = this.syncState?.split(",") || [];
    calendar = await this.syncFolder("calendar", calendar);
    tasks = await this.syncFolder("tasks", tasks);
    this.syncState = calendar + "," + tasks;
    await SQLCalendar.save(this);
  }

  async syncFolder(folder: string, syncState: string | null): Promise<string> {
    let sync = {
      m$SyncFolderItems: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
        },
        m$SyncFolderId: {
          t$DistinguishedFolderId: {
            Id: folder,
          },
        },
        m$SyncState: syncState,
        m$MaxChangesReturned: kMaxCount,
      }
    };
    let events: EWSEvent[] = [];
    let result: any = { IncludesLastItemInRange: "false" };
    while (result.IncludesLastItemInRange === "false") {
      try {
        result = await this.account.callEWS(sync);
      } catch (ex) {
        if (ex.error?.ResponseCode != 'ErrorInvalidSyncStateData') {
          throw ex;
        }
        sync.m$SyncFolderItems.m$SyncState = null;
        result = await this.account.callEWS(sync);
      }
      let eventIDs: any[] = [];
      for (let changes of [result.Changes.Update, result.Changes.Create]) {
        if (changes) {
          for (let change of ensureArray(changes)) {
            if (change.CalendarItem) {
              eventIDs.push(change.CalendarItem.ItemId);
            }
            if (change.Task) {
              eventIDs.push(change.Task.ItemId);
            }
          }
        }
      }
      if (result.Changes.Delete) {
        for (let deletion of ensureArray(result.Changes.Delete)) {
          let event = this.getEventByItemId(sanitize.nonemptystring(deletion.ItemId.Id));
          if (event) {
            this.events.remove(event);
            await SQLEvent.deleteIt(event);
          }
        }
      }
      await this.getEvents(eventIDs, events);
      syncState = sync.m$SyncFolderItems.m$SyncState = sanitize.nonemptystring(result.SyncState);
    }
    this.events.addAll(events);
    return syncState!;
  }

  getEventByItemId(id: string): EWSEvent | void {
    return this.events.find(p => p.itemID == id);
  }

  // Lists all events and tasks starting from scratch, ignoring the sync state.
  // If you don't want this, then clear the sync state and update changes.
  // Updates any events that have been loaded from the db.
  async listAllEvents() {
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
      request.m$FindItem.m$IndexedPageItemView.Offset = sanitize.integer(result.RootFolder.IndexedPagingOffset);
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
      let event = this.getEventByItemId(sanitize.nonemptystring(result.Items.CalendarItem?.ItemId.Id || result.Items.Task.ItemId.Id));
      if (event) {
        event.fromXML(result.Items.CalendarItem || result.Items.Task);
        await SQLEvent.save(event);
      } else {
        event = this.newEvent();
        event.fromXML(result.Items.CalendarItem || result.Items.Task);
        await SQLEvent.save(event);
        events.push(event);
      }
    }
  }
}
