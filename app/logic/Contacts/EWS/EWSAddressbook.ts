import { Addressbook } from "../Addressbook";
import { EWSPerson } from "./EWSPerson";
import { EWSGroup } from "./EWSGroup";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { kMaxCount } from "../../Mail/EWS/EWSFolder";
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import { NotImplemented } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class EWSAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-ews";
  readonly persons: ArrayColl<EWSPerson>;
  account: EWSAccount;

  newPerson(): EWSPerson {
    return new EWSPerson(this);
  }
  newGroup(): EWSGroup {
    throw new NotImplemented();
    return new EWSGroup(this);
  }

  async listContacts() {
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
      request.m$FindItem.m$IndexedPageItemView.Offset = result.RootFolder.IndexedPagingOffset;
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
        let person = new EWSPerson(this);
        person.fromXML(result.Items.Contact);
        this.persons.add(person);
      }
    }
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
        let group = new EWSGroup(this);
        group.fromXML(result.Items.DistributionList);
        this.groups.add(group);
      }
    }
  }
}
