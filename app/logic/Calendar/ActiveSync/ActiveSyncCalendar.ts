import { Calendar } from "../Calendar";
import { ActiveSyncEvent, fromCompact } from "./ActiveSyncEvent";
import { EASError, type ActiveSyncAccount, type ActiveSyncPingable } from "../../Mail/ActiveSync/ActiveSyncAccount";
import { kMaxCount } from "../../Mail/ActiveSync/ActiveSyncFolder";
import { Lock } from "../../util/Lock";
import { ensureArray } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class ActiveSyncCalendar extends Calendar implements ActiveSyncPingable {
  readonly protocol: string = "calendar-activesync";
  readonly events: ArrayColl<ActiveSyncEvent>;
  account: ActiveSyncAccount;
  syncKeyBusy: Promise<any> | null;
  readonly folderClass = "Calendar";
  protected requestLock = new Lock();

  get serverID() {
    return new URL(this.url).searchParams.get("serverID");
  }

  async ping() {
    await this.listEvents();
  }

  newEvent(parentEvent?: ActiveSyncEvent): ActiveSyncEvent {
    return new ActiveSyncEvent(this, parentEvent);
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
    if (!this.syncState && this.requestLock._waiting.length == 0 && data != undefined) {
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
          throw new EASError("Sync", response.Collections.Collection.Status);
        }
        await responseFunc?.(response.Collections.Collection);
        this.syncState = response.Collections.Collection.SyncKey;
        await this.save();
      } while (responseFunc && response.Collections.Collection.MoreAvailable == "");
      return response.Collections.Collection;
    } finally {
      lock.release();
    }
  }

  async listEvents() {
    if (!this.dbID) {
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
            await event.save();
          } else {
            event = this.newEvent();
            event.serverID = item.ServerId;
            event.fromWBXML(item.ApplicationData);
            await event.save();
            this.events.add(event);
          }
          // Exceptions must be handled after the master event has been saved.
          for (let exception of ensureArray(item.ApplicationData.Exceptions?.Exception)) {
            if (exception.Deleted != "1") {
              let occurrences = event.recurrenceRule.getOccurrencesByDate(fromCompact(exception.ExceptionStartTime));
              let instance = event.instances.get(occurrences.length - 1);
              if (instance) {
                instance.fromWBXML(exception);
                await instance.save();
              } else {
                instance = this.newEvent(event);
                instance.fromWBXML(exception);
                await instance.save();
                event.replaceInstance(occurrences.length - 1, instance);
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
            this.events.removeAll(event.instances);
            await event.deleteIt();
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
    });
  }

  getEventByServerID(id: string): ActiveSyncEvent | void {
    return this.events.find(p => p.serverID == id);
  }
}
