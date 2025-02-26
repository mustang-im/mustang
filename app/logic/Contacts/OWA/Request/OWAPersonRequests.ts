import OWARequest from "../../../Mail/OWA/Request/OWARequest";
import { kMaxFetchCount } from "../../../Mail/OWA/OWAFolder";

export function owaFindPersonsRequest(folderID: string): OWARequest {
  return new OWARequest("FindPeopleJsonRequest", {
    __type: "FindPeopleRequest:#Exchange",
    IndexedPageItemView: {
      __type: "IndexedPageView:#Exchange",
      BasePoint: "Beginning",
      Offset: 0,
      MaxEntriesReturned: kMaxFetchCount,
    },
    ParentFolderId: {
      __type: "TargetFolderId:#Exchange",
      BaseFolderId: folderID,
    },
    PersonaShape: {
      __type: "PersonaResponseShape:#Exchange",
      BaseShape: "Default",
    },
    QueryString: null,
    SearchPeopleSuggestionIndex: false,
    ShouldResolveOneOffEmailAddress: false,
  });
}

export function owaGetPersonasRequest(personaIDs: string[]): OWARequest {
  return new OWARequest("GetPersonaJsonRequest", {
    __type: "GetPersonaRequest:#Exchange",
    PersonaId: {
      __type: "ItemId:#Exchange",
      Id: personaIDs,
    },
  });
}
