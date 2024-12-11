// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

export default class OWACreatePersonaRequest {
  readonly request: any = {
    __type: "CreatePersonaJsonRequest:#Exchange",
    Header: {
      __type: "JsonRequestHeaders:#Exchange",
      RequestServerVersion: "Exchange2013",
    },
    Body: {
      __type: "CreatePersonaRequest:#Exchange",
      // PersonaId: null,
      PersonTypeString: "Person",
      PropertyUpdates: [],
      ParentFolderId: {
        __type: "TargetFolderId:#Exchange",
        BaseFolderId: {
          __type: "DistinguishedFolderId:#Exchange",
          Id: "contacts",
        },
      },
    },
  };

  constructor(old: Record<string, string>, fields: Record<string, string>) {
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

  get type() {
    return "CreatePersona";
  }
}
