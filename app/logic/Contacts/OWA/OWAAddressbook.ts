// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { Addressbook } from "../Addressbook";
import { OWAPerson } from "./OWAPerson";
import { OWAGroup } from "./OWAGroup";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";
import { kMaxCount } from "../../Mail/OWA/OWAFolder";
import type { ArrayColl } from "svelte-collections";

export class OWAAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-owa";
  readonly persons: ArrayColl<OWAPerson>;
  readonly groups: ArrayColl<OWAGroup>;
  account: OWAAccount;

  newPerson(): OWAPerson {
    return new OWAPerson(this);
  }
  newGroup(): OWAGroup {
    return new OWAGroup(this);
  }

  async listContacts() {
    let response = await this.account.callOWA(new OWAGetPeopleFiltersRequest());
    let contacts = response.find(filter => !filter.IsReadOnly);
    if (!contacts) {
      this.persons.clear();
      this.groups.clear();
      return;
    }
    if (!this.name) {
      this.name = contacts.DisplayName;
    }
    if (!this.dbID) {
      await this.save();
    }

    let persons = [];
    let groups = [];
    let query = {
      __type: "FindPeopleJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "FindPeopleRequest:#Exchange",
        IndexedPageItemView: {
          __type: "IndexedPageView:#Exchange",
          BasePoint: "Beginning",
          Offset: 0,
          MaxEntriesReturned: kMaxCount,
        },
        ParentFolderId: {
          __type: "TargetFolderId:#Exchange",
          BaseFolderId: contacts.FolderId,
        },
        PersonaShape: {
          __type: "PersonaResponseShape:#Exchange",
          BaseShape: "Default",
        },
        QueryString: null,
        SearchPeopleSuggestionIndex: false,
        ShouldResolveOneOffEmailAddress: false,
      },
    };
    do {
      response = await this.account.callOWA(query);
      for (let result of response.ResultSet) {
        if (result.EmailAddress?.EmailAddress) {
          persons.push(result);
        } else if (result.PersonaTypeString == "DistributionList") {
          groups.push(result);
        } else {
          persons.push(result);
        }
      }
      query.Body.IndexedPageItemView.Offset += kMaxCount;
    } while (response.ResultSet.length == kMaxCount);
    await this.listPersons(persons);
    await this.listGroups(groups);
  }

  async listPersons(persons: any[]) {
    for (let person of this.persons.contents.filter(person => !persons.some(result => result.PersonaId.Id == person.personaID))) {
      this.persons.remove(person);
      await person.deleteIt();
    }
    for (let result of persons) {
      try {
        let request: any = {
          __type: "GetPersonaJsonRequest:#Exchange",
          Header: {
            __type: "JsonRequestHeaders:#Exchange",
            RequestServerVersion: "Exchange2013",
          },
          Body: {
            __type: "GetPersonaRequest:#Exchange",
            PersonaId: {
              __type: "ItemId:#Exchange",
              Id: result.PersonaId.Id,
            },
          },
        };
        let response = await this.account.callOWA(request);
        Object.assign(result, response.Persona);
        request = new OWAGetNotesForPersonaRequest(result.PersonaId.Id);
        response = await this.account.callOWA(request);
        result.Notes = response.PersonaWithNotes?.BodiesArray[0].Value.Value;
        let person = this.getPersonByPersonaID(result.PersonaId.Id);
        if (person) {
          person.fromJSON(result);
          await person.save();
        } else {
          person = this.newPerson();
          person.fromJSON(result);
          await person.save();
          this.persons.add(person);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }

  async listGroups(groups: any[]) {
    for (let group of this.groups.contents.filter(group => !groups.some(result => result.PersonaId.Id == group.personaID))) {
      this.groups.remove(group);
      await group.deleteIt();
    }
    for (let result of groups) {
      try {
        let request: any = new OWAGetGroupInfoRequest(result.EmailAddress.ItemId.Id);
        let response = await this.account.callOWA(request);
        result.Members = response.Members;
        request = new OWAGetNotesForPersonaRequest(result.PersonaId.Id);
        response = await this.account.callOWA(request);
        result.Notes = response.notes?.BodiesArray[0].Value.Value;
        let group = this.getGroupByPersonaID(result.PersonaId.Id);
        if (group) {
          group.fromJSON(result);
          await group.save();
        } else {
          group = this.newGroup();
          group.fromJSON(result);
          await group.save();
          this.groups.add(group);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }

  getPersonByPersonaID(id: string): OWAPerson | void {
    return this.persons.find(p => p.personaID == id);
  }

  getGroupByPersonaID(id: string): OWAGroup | void {
    return this.groups.find(p => p.personaID == id);
  }
}

class OWAGetPeopleFiltersRequest {
  get type() {
    return "GetPeopleFilters";
  }
}

class OWAGetNotesForPersonaRequest {
  readonly getNotesForPersonaRequest: any = {
    __type: "GetNotesForPersonaRequest:#Exchange",
    MaxBytesToFetch: 512000,
  };

  constructor(id) {
    this.getNotesForPersonaRequest.PersonaId = id;
  }

  get type() {
    return "GetNotesForPersona";
  }
}

class OWAGetGroupInfoRequest {
  readonly getGroupInfoRequest: any = {
    __type: "GetGroupInfoRequest:#Exchange",
    ItemId: {
      __type: "ItemId:#Exchange",
    },
    Paging: {
      __type: "IndexedPageView:#Exchange",
      BasePoint: "Beginning",
      MaxEntriesReturned: kMaxCount,
      Offset: 0,
    },
    ParentFolderId: {
      __type: "TargetFolderId:#Exchange",
      BaseFolderId: null,
    },
    ResultSet: 2,
  };

  constructor(id) {
    this.getGroupInfoRequest.ItemId.Id = id;
  }

  get type() {
    return "GetGroupInfo";
  }
}
