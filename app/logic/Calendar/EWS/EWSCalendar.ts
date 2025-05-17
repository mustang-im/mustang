import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { EWSEvent } from "./EWSEvent";
import { EWSIncomingInvitation } from "./EWSIncomingInvitation";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import type { EWSEMail } from "../../Mail/EWS/EWSEMail";
import { kMaxCount } from "../../Mail/EWS/EWSFolder";
import { ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";

export class EWSCalendar extends Calendar {
  readonly protocol: string = "calendar-ews";
  readonly events: ArrayColl<EWSEvent>;
  /** Exchange's calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;

  get account(): EWSAccount {
    return this.mainAccount as EWSAccount;
  }

  newEvent(parentEvent?: EWSEvent): EWSEvent {
    return new EWSEvent(this, parentEvent);
  }

  getIncomingInvitationFor(message: EWSEMail) {
    return new EWSIncomingInvitation(this, message);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    let request = {
      m$GetUserAvailabilityRequest: {
        m$MailboxDataArray: {
          t$MailboxData: participants.map(participant => ({
            t$Email: {
              t$Address: participant.emailAddress,
            },
            t$AttendeeType: "Required",
          })),
        },
        t$FreeBusyViewOptions: {
          t$TimeWindow: {
            t$StartTime: from.toISOString(),
            t$EndTime: to.toISOString(),
          },
          t$RequestedView: "FreeBusy",
        },
      },
    };
    let results = await this.account.callEWS(request);
    return participants.map((participant, i) => ({
      participant,
      availability: ensureArray(results[i].FreeBusyView.CalendarEventArray?.CalendarEvent).map(event => ({
        from: new Date(event.StartTime + "Z"),
        to: new Date(event.EndTime + "Z"),
        free: event.BusyType == "Free",
      })),
    }));
  }

  async listEvents() {
    if (!this.dbID) {
      await this.save();
    }

    /* Disabling tasks for now.
    // syncState is base64-encoded so it's safe to split and join on comma
    let [calendar, tasks] = this.syncState?.split(",") || [];
    calendar = await this.syncFolder("calendar", calendar);
    tasks = await this.syncFolder("tasks", tasks);
    this.syncState = calendar + "," + tasks;
    */
    // Delete the next line when enabling tasks.
    this.syncState = await this.syncFolder("calendar", this.syncState);
    await this.save();
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
          let event = this.getEventByItemID(sanitize.nonemptystring(deletion.ItemId.Id));
          if (event) {
            this.events.remove(event);
            this.events.removeAll(event.instances);
            await event.deleteIt();
          }
        }
      }
      await this.getEvents(eventIDs, events);
      syncState = sync.m$SyncFolderItems.m$SyncState = sanitize.nonemptystring(result.SyncState);
    }
    this.events.addAll(events);
    return sanitize.string(syncState);
  }

  getEventByItemID(id: string): EWSEvent | void {
    return this.events.find(p => p.itemID == id);
  }

  // Lists all events and tasks starting from scratch, ignoring the sync state.
  // If you don't want this, then clear the sync state and update changes.
  // Updates any events that have been loaded from the db.
  async listAllEvents() {
    let events: EWSEvent[] = [];
    await this.listFolder("calendar", events);
    /* Disabling tasks for now.
    await this.listFolder("tasks", events);
    */
    // Keep any filled instances we already generated.
    for (let event of events) {
      for (let instance of event.instances) {
        if (!events.includes(instance)) {
          events.push(instance);
        }
      }
    }
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

  async getEvents(eventIDs, events: EWSEvent[], parentEvent?: EWSEvent) {
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
              FieldURI: "calendar:StartTimeZoneId",
            }, {
              FieldURI: "calendar:IsAllDayEvent",
            }, {
              FieldURI: "calendar:MyResponseType",
            }, {
              FieldURI: "calendar:RequiredAttendees",
            }, {
              FieldURI: "calendar:OptionalAttendees",
            }, {
              FieldURI: "calendar:Recurrence",
            }, {
              FieldURI: "calendar:ModifiedOccurrences",
            }, {
              FieldURI: "calendar:DeletedOccurrences",
            }, {
              FieldURI: "calendar:UID",
            }, {
              FieldURI: "calendar:RecurrenceId",
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
      let item = result.Items.CalendarItem || result.Items.Task;
      try {
        let event = this.getEventByItemID(sanitize.nonemptystring(item.ItemId.Id));
        if (event) {
          event.parentEvent = parentEvent; // should already be correct
          event.fromXML(item);
          await event.save();
        } else {
          event = this.newEvent(parentEvent);
          event.fromXML(item);
          await event.save();
          events.push(event);
        }
        if (parentEvent && event.recurrenceStartTime) {
          let occurrences = parentEvent.recurrenceRule.getOccurrencesByDate(event.recurrenceStartTime);
          parentEvent.replaceInstance(occurrences.length - 1, event)
        }
        if (item.ModifiedOccurrences?.Occurrence && event.recurrenceRule) {
          await this.getEvents(ensureArray(item.ModifiedOccurrences.Occurrence).map(item => item.ItemId), events, event);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }
}
