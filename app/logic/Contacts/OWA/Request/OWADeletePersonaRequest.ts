export class OWADeletePersonaRequest {
  /** Persona requests are wrapped in an additional object for some reason. */
  readonly request: any = {
    __type: "DeletePersonasRequest:#Exchange",
    ItemIds: [{
      __type: "ItemId:#Exchange",
    }],
  };

  constructor(id: string) {
    this.request.ItemIds[0].Id = id;
  }

  get action() {
    return "DeletePersonas";
  }
}
