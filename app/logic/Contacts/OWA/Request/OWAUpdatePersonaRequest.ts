export class OWAUpdatePersonaRequest {
  /** Persona requests are wrapped in an additional object for some reason. */
  readonly request: any = {
    __type: "UpdatePersonaJsonRequest:#Exchange",
    Header: {
      __type: "JsonRequestHeaders:#Exchange",
      RequestServerVersion: "Exchange2013",
    },
    Body: {
      __type: "UpdatePersonaRequest:#Exchange",
      PersonTypeString: "Person",
      PropertyUpdates: [],
      PersonaId: {
        __type: "ItemId:#Exchange",
      },
    },
  };

  constructor(id: string, old: Record<string, string>, fields: Record<string, string>) {
    this.request.Body.PersonaId.Id = id;
    this.request.Body.PropertyUpdates = Object.keys(fields).filter(key => old[key] != fields[key]).map(key => ({
      __type: "PersonaPropertyUpdate:#Exchange",
      Path: {
        __type: "PropertyUri:#Exchange",
        FieldURI: key,
      },
      OldValue: old[key],
      NewValue: fields[key],
    }));
  }

  get action() {
    return "UpdatePersona";
  }
}
