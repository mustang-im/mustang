import OWARequest from "../../../Mail/OWA/Request/OWARequest";

export function owaFindPersonsRequest(folderID: string, maxFetchCount: number): OWARequest {
  return new OWARequest("FindPeople", {
    __type: "FindPeopleRequest:#Exchange",
    IndexedPageItemView: {
      __type: "IndexedPageView:#Exchange",
      BasePoint: "Beginning",
      Offset: 0,
      MaxEntriesReturned: maxFetchCount,
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

export function owaGetPersonaRequest(personaID: string): OWARequest {
  return new OWARequest("GetPersona", {
    __type: "GetPersonaRequest:#Exchange",
    PersonaId: {
      __type: "ItemId:#Exchange",
      Id: personaID,
    },
  });
}
