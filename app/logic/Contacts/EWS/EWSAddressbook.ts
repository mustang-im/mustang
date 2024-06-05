import { Addressbook } from "../Addressbook";
import { SQLAddressbook } from '../SQL/SQLAddressbook';
import { SQLPerson } from '../SQL/SQLPerson';
import { SQLGroup } from '../SQL/SQLGroup';
import { EWSPerson } from "./EWSPerson";
import { EWSGroup } from "./EWSGroup";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { kMaxCount } from "../../Mail/EWS/EWSFolder";
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";

export class EWSAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-ews";
  readonly persons: ArrayColl<EWSPerson>;
  readonly groups: ArrayColl<EWSGroup>;
  account: EWSAccount;

  newPerson(): EWSPerson {
    return new EWSPerson(this);
  }
  newGroup(): EWSGroup {
    return new EWSGroup(this);
  }

  async listContacts() {
    if (!this.dbID) {
      await SQLAddressbook.save(this);
    }

    return this.updateChangedContacts();
  }

  // Uses the sync state to get just the contats that changed since last time.
  async updateChangedContacts() {
    let sync = {
      m$SyncFolderItems: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
        },
        m$SyncFolderId: {
          t$DistinguishedFolderId: {
            Id: "contacts",
          },
        },
        m$SyncState: this.syncState,
        m$MaxChangesReturned: kMaxCount,
      }
    };
    let persons: any[] = [];
    let groups: any[] = [];
    let result: any = { IncludesLastItemInRange: "false" };
    while (result.IncludesLastItemInRange === "false") {
      try {
        result = await this.account.callEWS(sync);
      } catch (ex) {
        if (ex.error?.ResponseCode != 'ErrorInvalidSyncStateData') {
          throw ex;
        }
        this.syncState = null;
        await SQLAddressbook.save(this);
        sync.m$SyncFolderItems.m$SyncState = null;
        result = await this.account.callEWS(sync);
      }
      for (let changes of [result.Changes.Update, result.Changes.Create]) {
        if (changes) {
          for (let change of ensureArray(changes)) {
            if (change.Contact) {
              persons.push(change.Contact);
            }
            if (change.DistributionList) {
              groups.push(change.DistributionList);
            }
          }
        }
      }
      if (result.Changes.Delete) {
        for (let deletion of ensureArray(result.Changes.Delete)) {
          let person = this.getPersonByItemId(sanitize.nonemptystring(deletion.ItemId.Id));
          if (person) {
            this.persons.remove(person);
            await SQLPerson.deleteIt(person);
          }
          let group = this.getGroupByItemId(sanitize.nonemptystring(deletion.ItemId.Id));
          if (group) {
            this.groups.remove(group);
            await SQLGroup.deleteIt(group);
          }
        }
      }
      this.syncState = sync.m$SyncFolderItems.m$SyncState = sanitize.nonemptystring(result.SyncState);
      await SQLAddressbook.save(this);
    }
    await this.listPersons(persons);
    await this.listGroups(groups);
  }

  // Lists all contacts and adds them to the persons and groups.
  // If you don't want this, then clear the sync state and update changes.
  // Updates any contacts that have been loaded from the db.
  async listAllContacts() {
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
            Id: "contacts",
          }],
        },
        Traversal: "Shallow",
      },
    };
    let persons: any[] = [];
    let groups: any[] = [];
    let result: any = { RootFolder: { IncludesLastItemInRange: "false" } };
    while (result?.RootFolder?.IncludesLastItemInRange === "false") {
      result = await this.account.callEWS(request);
      if (!result?.RootFolder?.Items) {
        break;
      }
      request.m$FindItem.m$IndexedPageItemView.Offset = sanitize.integer(result.RootFolder.IndexedPagingOffset);
      if (result.RootFolder.Items.Contact) {
        persons = persons.concat(ensureArray(result.RootFolder.Items.Contact));
      }
      if (result.RootFolder.Items.DistributionList) {
        groups = groups.concat(ensureArray(result.RootFolder.Items.DistributionList));
      }
    }
    await this.listPersons(persons);
    await this.listGroups(groups);
  }

  async listPersons(persons: any[]) {
    for (let i = 0; i < persons.length; i += kMaxCount) {
      let batch = persons.slice(i, i + kMaxCount);
      let request = {
        m$GetItem: {
          m$ItemShape: {
            t$BaseShape: "Default",
            t$BodyType: "Text",
            t$AdditionalProperties: {
              t$FieldURI: [{
                FieldURI: "contacts:Department",
              }, {
                FieldURI: "contacts:GivenName",
              }, {
                FieldURI: "contacts:Surname",
              }, {
                FieldURI: "item:Body", // contact:Notes doesn't work
              }],
            },
          },
          m$ItemIds: {
            t$ItemId: batch.map(person => person.ItemId),
          },
        },
      };
      let results = ensureArray(await this.account.callEWS(request));
      for (let result of results) {
        let person = this.getPersonByItemId(result.Items.Contact.ItemId.Id);
        if (person) {
          person.fromXML(result.Items.Contact);
          await SQLPerson.save(person);
        } else {
          person = new EWSPerson(this);
          person.fromXML(result.Items.Contact);
          await SQLPerson.save(person);
          this.persons.add(person);
        }
      }
    }
  }

  getPersonByItemId(id: string): EWSPerson | void {
    return this.persons.find(p => p.itemID == id);
  }

  async listGroups(groups: any[]) {
    for (let i = 0; i < groups.length; i += kMaxCount) {
      let batch = groups.slice(i, i + kMaxCount);
      let request = {
        m$GetItem: {
          m$ItemShape: {
            t$BaseShape: "IdOnly",
            t$BodyType: "Text",
            t$AdditionalProperties: {
              t$FieldURI: [{
                FieldURI: "item:Body",
              }, {
                FieldURI: "contacts:DisplayName",
              }, {
                FieldURI: "distributionlist:Members",
              }],
            },
          },
          m$ItemIds: {
            t$ItemId: batch.map(group => group.ItemId),
          },
        },
      };
      let results = ensureArray(await this.account.callEWS(request));
      for (let result of results) {
        let group = this.getGroupByItemId(result.Items.DistributionList.ItemId.Id);
        if (group) {
          group.fromXML(result.Items.DistributionList);
          await SQLGroup.save(group);
        } else {
          group = new EWSGroup(this);
          group.fromXML(result.Items.DistributionList);
          await SQLGroup.save(group);
          this.groups.add(group);
        }
      }
    }
  }

  getGroupByItemId(id: string): EWSGroup | void {
    return this.groups.find(p => p.itemID == id);
  }
}
