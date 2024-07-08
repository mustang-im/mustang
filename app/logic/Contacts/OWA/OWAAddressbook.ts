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
    for (let person of persons) {
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
            Id: person.PersonaId.Id,
          },
        },
      };
      let response = await this.account.callOWA(request);
      Object.assign(person, response.Persona);
      request = new OWAGetNotesForPersonaRequest(person.PersonaId.Id);
      response = await this.account.callOWA(request);
      person.Notes = response.PersonaWithNotes?.BodiesArray[0].Value.Value;
    }
    for (let group of groups) {
      let request: any = new OWAGetGroupInfoRequest(group.EmailAddress.ItemId.Id);
      let response = await this.account.callOWA(request);
      group.Members = response.Members;
      request = new OWAGetNotesForPersonaRequest(group.PersonaId.Id);
      response = await this.account.callOWA(request);
      group.Notes = response.notes?.BodiesArray[0].Value.Value;
    }
    this.persons.replaceAll(persons.map(person => this.newPerson().fromJSON(person)));
    this.groups.replaceAll(groups.map(group => this.newGroup().fromJSON(group)));
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
