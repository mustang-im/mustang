import { Addressbook } from "../Addressbook";
import { ActiveSyncPerson } from "./ActiveSyncPerson";
import { EASError, type ActiveSyncAccount, type ActiveSyncPingable } from "../../Mail/ActiveSync/ActiveSyncAccount";
import { kMaxCount, ensureArray } from "../../Mail/ActiveSync/ActiveSyncFolder";
import { NotSupported } from "../../util/util";
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
   * Queues a `Sync` request locally. It waits until the server is available.
   * @param data 
   * @param responseFunc 
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
   * Makes a `Sync` request to the server. It is called by `queuedSyncRequest`
   * and it may be called multiple times.
   * @param data 
   * @param responseFunc 
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
      responseFunc?.(response.Collections.Collection);
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
