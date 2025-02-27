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

  get action() {
    return "DeletePersonas";
  }
}
