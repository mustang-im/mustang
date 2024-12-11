// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

export default class OWADeletePersonaRequest {
  readonly request: any = {
    __type: "DeletePersonasRequest:#Exchange",
    ItemIds: [{
      __type: "ItemId:#Exchange",
    }],
  };

  constructor(id: string) {
    this.request.ItemIds[0].Id = id;
  }

  get type() {
    return "DeletePersonas";
  }
}
