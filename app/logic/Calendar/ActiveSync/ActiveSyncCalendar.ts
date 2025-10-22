import { Calendar } from "../Calendar";
import type { Participant } from "../Participant";
import { ActiveSyncEvent, fromCompact } from "./ActiveSyncEvent";
import { ActiveSyncIncomingInvitation } from "./ActiveSyncIncomingInvitation";
import type { ActiveSyncAccount, ActiveSyncPingable } from "../../Mail/ActiveSync/ActiveSyncAccount";
import type { ActiveSyncEMail } from "../../Mail/ActiveSync/ActiveSyncEMail";
import { kMaxCount } from "../../Mail/ActiveSync/ActiveSyncFolder";
import { ActiveSyncError } from "../../Mail/ActiveSync/ActiveSyncError";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Lock } from "../../util/Lock";
import { ensureArray } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

const kHalfHour = 30 * 60 * 1000; // milliseconds

export class ActiveSyncCalendar extends Calendar implements ActiveSyncPingable {
  readonly protocol: string = "calendar-activesync";
  declare readonly events: ArrayColl<ActiveSyncEvent>;
  /** Exchange's calendar can only accept incoming invitations from its inbox */
  readonly canAcceptAnyInvitation = false;
  readonly folderClass = "Calendar";
  protected readonly requestLock = new Lock();
  /** ActiveSync ServerId for this calendar */
  serverID: string;

  get account(): ActiveSyncAccount {
    return this.mainAccount as ActiveSyncAccount;
  }

  async ping() {
    await this.listEvents();
  }

  newEvent(parentEvent?: ActiveSyncEvent): ActiveSyncEvent {
    return new ActiveSyncEvent(this, parentEvent);
  }

  getIncomingInvitationForEMail(message: ActiveSyncEMail) {
    return new ActiveSyncIncomingInvitation(this, message);
  }

  async arePersonsFree(participants: Participant[], from: Date, to: Date): Promise<{ participant: Participant, availability: { from: Date, to: Date, free: boolean }[] }[]> {
    return Promise.all(participants.map(async participant => {
      let request = {
        To: participant.emailAddress,
        Options: {
          Availability: { // Yes these are regular dates.
            StartTime: from.toISOString(),
            EndTime: to.toISOString(),
          },
        },
      };
      let result = await this.account.callEAS("ResolveRecipients", request);
      if (result.Response.Status != "1") {
        throw new ActiveSyncError("ResolveRecipients", result.Response.Status, this);
      }
      let freebusy = result.Response.Recipient.Availability.MergedFreeBusy || "";
      let availability = freebusy.split("").map((c: string, i: number) => ({
        from: new Date(from.getTime() + i * kHalfHour),
        to: new Date(from.getTime() + (i + 1) * kHalfHour),
        free: c == "0",
      }));
      return { participant, availability };
    }));
  }

  /**
   * Makes a `Sync` (synchronization) request to the server.
   * @param data information about the request
   * @param responseFunc
   * - It performs actions using the parameter `response.Collections.Collection`.
   * - It is called when the response is not null.
   * - It will be repeatedly called while `response.Collections.Collection.MoreAvailable` is
   * equal to an empty string.
   * - It may be called many times.
   */
  async makeSyncRequest(data?: any, responseFunc?: (response: any) => Promise<void>): Promise<any> {
    if (!this.syncState && !this.requestLock.haveWaiting && data != undefined) {
      // First request must be an empty request
      await this.makeSyncRequest();
    }
    let lock = await this.requestLock.lock();
    try {
      let response;
      do {
        let request = {
          Collections: {
            Collection: Object.assign({
              SyncKey: this.syncState || "0",
              CollectionId: this.serverID,
            }, data),
          },
        };
        response = await this.account.callEAS("Sync", request);
        if (!response) {
          return null;
        }
        if (response.Collections.Collection.Status == "3") {
          // Out of sync.
          this.syncState = null;
          await this.save();
        }
        if (response.Collections.Collection.Status != "1") {
          throw new ActiveSyncError("Sync", response.Collections.Collection.Status, this);
        }
        await responseFunc?.(response.Collections.Collection);
        this.syncState = sanitize.string(response.Collections.Collection.SyncKey, null);
        await this.save();
      } while (responseFunc && response.Collections.Collection.MoreAvailable == "");
      return response.Collections.Collection;
    } finally {
      lock.release();
    }
  }

  async listEvents() {
    if (!this.dbID || !this.serverID) {
      this.serverID ??= new URL(this.url).searchParams.get("serverID");
      await this.save();
    }

    let data = {
      WindowSize: String(kMaxCount),
      Options: {
        BodyPreference: {
          Type: "2",
        },
      },
    };
    await this.makeSyncRequest(data, async response => {
      for (let item of ensureArray(response.Commands?.Add).concat(ensureArray(response.Commands?.Change))) {
        try {
          let event = this.getEventByServerID(item.ServerId);
          if (event) {
            event.fromWBXML(item.ApplicationData);
            await event.saveLocally();
          } else {
            event = this.newEvent();
            event.serverID = item.ServerId;
            event.fromWBXML(item.ApplicationData);
            await event.saveLocally();
            this.events.add(event);
          }
          // Exceptions must be handled after the master event has been saved.
          for (let exception of ensureArray(item.ApplicationData.Exceptions?.Exception)) {
            if (exception.Deleted != "1") {
              let exceptionTime = fromCompact(exception.ExceptionStartTime);
              let existing = event.exceptions.find(event => event.recurrenceStartTime.getTime() == exceptionTime.getTime());
              if (existing) {
                existing.fromWBXML(exception);
                await existing.saveLocally();
              } else {
                let instance = event.getOccurrenceByDate(exceptionTime) as ActiveSyncEvent;
                instance.fromWBXML(exception);
                await instance.saveLocally();
                this.events.add(event);
              }
            }
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
      for (let item of ensureArray(response.Commands?.Delete)) {
        try {
          let event = this.getEventByServerID(item.ServerId);
          if (event) {
            this.events.remove(event);
            this.events.removeAll(event.exceptions);
            await event.deleteLocally();
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
    });
    this.account.addPingable(this);
  }

  getEventByServerID(id: string): ActiveSyncEvent | undefined {
    return this.events.find(p => p.serverID == id);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.serverID = sanitize.string(json.serverID, null);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.serverID = this.serverID;
    return json;
  }
}
