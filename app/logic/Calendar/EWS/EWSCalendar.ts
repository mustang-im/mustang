import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { EWSEvent } from "./EWSEvent";
import { EWSIncomingInvitation } from "./EWSIncomingInvitation";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import type { EWSEMail } from "../../Mail/EWS/EWSEMail";
import { kMaxCount } from "../../Mail/EWS/EWSFolder";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class EWSCalendar extends Calendar {
  readonly protocol: string = "calendar-ews";
  declare readonly events: ArrayColl<EWSEvent>;
  /** Exchange's calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;
  /** Exchange FolderID for this calendar. Not DistinguishedFolderId */
  folderID: string;
  /** Is this the default calendar that handles incoming invitations */
  usedForInvitations: boolean = false;

  get account(): EWSAccount {
    return this.mainAccount as EWSAccount;
  }

  newEvent(parentEvent?: EWSEvent): EWSEvent {
    return new EWSEvent(this, parentEvent);
  }

  getIncomingInvitationForEMail(message: EWSEMail) {
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

    await this.syncFolder();
    await this.save();
  }

  protected async syncFolder(): Promise<void> {
    let sync = {
      m$SyncFolderItems: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
        },
        m$SyncFolderId: {
          t$FolderId: {
            Id: this.folderID,
          },
        },
        m$SyncState: this.syncState,
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
            await event.deleteLocally();
          }
        }
      }
      await this.getEvents(eventIDs, events);
      this.syncState = sync.m$SyncFolderItems.m$SyncState = sanitize.nonemptystring(result.SyncState);
    }
    this.events.addAll(events);
  }

  getEventByItemID(id: string): EWSEvent | undefined {
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

  async getEvents(eventIDs: { Id: string }[], events: EWSEvent[], parentEvent?: EWSEvent) {
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
              FieldURI: "calendar:IsCancelled",
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
              FieldURI: "calendar:DateTimeStamp",
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
          await event.saveLocally();
        } else {
          event = parentEvent?.getOccurrenceByDate(sanitize.date(item.RecurrenceId)) as EWSEvent || this.newEvent();
          event.fromXML(item);
          await event.saveLocally();
          events.push(event);
        }
        if (item.ModifiedOccurrences?.Occurrence && event.recurrenceRule) {
          await this.getEvents(ensureArray(item.ModifiedOccurrences.Occurrence).map(item => item.ItemId), events, event);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.folderID = sanitize.string(json.folderID, null);
    this.usedForInvitations = sanitize.boolean(json.usedForInvitations, false);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.folderID = this.folderID;
    json.usedForInvitations = this.usedForInvitations;
    return json;
  }
}
