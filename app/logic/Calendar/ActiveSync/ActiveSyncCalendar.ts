import { Calendar } from "../Calendar";
import { Scheduling, ResponseType, type Responses } from "../Invitation";
import { ActiveSyncEvent, fromCompact } from "./ActiveSyncEvent";
import type { ActiveSyncAccount, ActiveSyncPingable } from "../../Mail/ActiveSync/ActiveSyncAccount";
import type { ActiveSyncEMail } from "../../Mail/ActiveSync/ActiveSyncEMail";
import { kMaxCount } from "../../Mail/ActiveSync/ActiveSyncFolder";
import { ActiveSyncError } from "../../Mail/ActiveSync/ActiveSyncError";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Lock } from "../../util/Lock";
import { assert, ensureArray, NotSupported } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

const ActiveSyncResponse: Record<Responses, number> = {
  [ResponseType.Accept]: 1,
  [ResponseType.Tentative]: 2,
  [ResponseType.Decline]: 3,
};

export class ActiveSyncCalendar extends Calendar implements ActiveSyncPingable {
  readonly protocol: string = "calendar-activesync";
  readonly events: ArrayColl<ActiveSyncEvent>;
  account: ActiveSyncAccount;
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

  async respondToInvitation(email: ActiveSyncEMail, response: Responses) {
    assert(email.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let request = {
      Request: {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: email.folder.id,
        ReqeustId: email.serverID,
      },
    };
    await this.account.callEAS("MeetingResponse", request);
    await this.account.sendInvitationResponse(email.event, response); // needs 16.x to do this automatically
    await email.deleteMessageLocally(); // Exchange deletes the message from the inbox
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
