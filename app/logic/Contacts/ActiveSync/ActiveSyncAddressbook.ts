import { Addressbook } from "../Addressbook";
import { SQLAddressbook } from '../SQL/SQLAddressbook';
import { SQLPerson } from '../SQL/SQLPerson';
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

  async queuedSyncRequest(data: any): Promise<any> {
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
      this.syncKeyBusy = this.makeSyncRequest(data);
      return await this.syncKeyBusy;
    } finally {
      this.syncKeyBusy = null;
    }
  }

  protected async makeSyncRequest(data?: any): Promise<any> {
    let request = {
      Collections: {
        Collection: Object.assign({
          SyncKey: this.syncState || "0",
          CollectionId: this.serverID,
        }, data),
      },
    };
    let response = await this.account.callEAS("Sync", request);
    if (!response) {
      return null;
    }
    if (response.Collections.Collection.Status == "3") {
      // Out of sync.
      this.syncState = null;
      await SQLAddressbook.save(this);
    }
    if (response.Collections.Collection.Status != "1") {
      throw new EASError("Sync", response.Collections.Collection.Status);
    }
    this.syncState = response.Collections.Collection.SyncKey;
    await SQLAddressbook.save(this);
    return response.Collections.Collection;
  }

  async listContacts() {
    if (!this.dbID) {
      await SQLAddressbook.save(this);
    }

    let data = {
      WindowSize: String(kMaxCount),
      Options: {
        BodyPreference: {
          Type: "1",
        },
      },
    };
    let response: any = { MoreAvailable: "" };
    while (response.MoreAvailable == "") {
      response = await this.queuedSyncRequest(data);
      if (!response) {
        // No changes at all.
        break;
      }
      for (let item of ensureArray(response.Commands?.Add).concat(ensureArray(response.Commands?.Change))) {
        try {
          let person = this.getPersonByServerID(item.ServerId);
          if (person) {
            person.fromWBXML(item.ApplicationData);
            await SQLPerson.save(person);
          } else {
            person = this.newPerson();
            person.serverID = item.ServerId;
            person.fromWBXML(item.ApplicationData);
            await SQLPerson.save(person);
            this.persons.add(person);
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
      for (let item of ensureArray(response.Commands?.Delete)) {
        let person = this.getPersonByServerID(item.ServerId);
        if (person) {
          await SQLPerson.deleteIt(person);
        }
      }
    }
    this.account.addPingable(this);
  }

  getPersonByServerID(id: string): ActiveSyncPerson | void {
    return this.persons.find(p => p.serverID == id);
  }
}
