import { Addressbook } from "../Addressbook";
import { ActiveSyncPerson } from "./ActiveSyncPerson";
import { EASError, type ActiveSyncAccount, type ActiveSyncPingable } from "../../Mail/ActiveSync/ActiveSyncAccount";
import { kMaxCount } from "../../Mail/ActiveSync/ActiveSyncFolder";
import { ensureArray, NotSupported } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class ActiveSyncAddressbook extends Addressbook implements ActiveSyncPingable {
  readonly protocol: string = "addressbook-activesync";
  readonly persons: ArrayColl<ActiveSyncPerson>;
  account: ActiveSyncAccount;
  syncKeyBusy: Promise<any> | null;
  readonly folderClass = "Contacts";

  get serverID() {
    return new URL(this.url).searchParams.get("serverID");
  }

  async ping() {
    await this.listContacts();
  }

  newPerson(): ActiveSyncPerson {
    return new ActiveSyncPerson(this);
  }
  newGroup(): never {
    throw new NotSupported("ActiveSync does not support distribution lists");
  }

  /**
   * Queues a `Sync` (synchronization) request locally. It waits until the server is available.
   * @param data information about the request
   * @param responseFunc
   * - It performs actions using the parameter `response.Collections.Collection`.
   * - It is called when the response is not null.
   * - It will be repeatedly called while `response.Collections.Collection.MoreAvailable` is 
   * equal to an empty string.
   * - It may be called many times.
   */
  async queuedSyncRequest(data: any, responseFunc?: (response: any) => Promise<void>): Promise<any> {
    if (!this.syncState && !this.syncKeyBusy) try {
      // First request must be an empty request.
      this.syncKeyBusy = this.makeSyncRequest();
      await this.syncKeyBusy;
    } finally {
      this.syncKeyBusy = null;
    }
    while (this.syncKeyBusy) try {
      await this.syncKeyBusy;
    } catch (ex) {
      // If the function currently holding the sync key throws, we don't care.
    }
    try {
      this.syncKeyBusy = this.makeSyncRequest(data, responseFunc);
      return await this.syncKeyBusy;
    } finally {
      this.syncKeyBusy = null;
    }
  }

  /**
   * Makes a `Sync` (synchronization) request to the server.
   * You probably want to call it using the wrapper `queuedSyncRequest()`.
   * @param data information about the request
   * @param responseFunc
   * - It performs actions using the parameter `response.Collections.Collection`.
   * - It is called when the response is not null.
   * - It will be repeatedly called while `response.Collections.Collection.MoreAvailable` is 
   * equal to an empty string.
   * - It may be called many times.
   */
  protected async makeSyncRequest(data?: any, responseFunc?: (response: any) => Promise<void>): Promise<any> {
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
  }

  async listContacts() {
    if (!this.dbID) {
      await this.save();
    }

    let data = {
      WindowSize: String(kMaxCount),
      Options: {
        BodyPreference: {
          Type: "1",
        },
      },
    };
    await this.queuedSyncRequest(data, async response => {
      for (let item of ensureArray(response.Commands?.Add).concat(ensureArray(response.Commands?.Change))) {
        try {
          let person = this.getPersonByServerID(item.ServerId);
          if (person) {
            person.fromWBXML(item.ApplicationData);
            await person.save();
          } else {
            person = this.newPerson();
            person.serverID = item.ServerId;
            person.fromWBXML(item.ApplicationData);
            await person.save();
            this.persons.add(person);
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
      for (let item of ensureArray(response.Commands?.Delete)) {
        try {
         let person = this.getPersonByServerID(item.ServerId);
          if (person) {
            await person.deleteIt();
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
    });
    this.account.addPingable(this);
  }

  getPersonByServerID(id: string): ActiveSyncPerson | void {
    return this.persons.find(p => p.serverID == id);
  }
}
