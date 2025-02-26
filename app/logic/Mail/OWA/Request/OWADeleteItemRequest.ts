import OWARequest from "./OWARequest";

export default class OWADeleteItemRequest extends OWARequest {
  Body: any = {
    __type: "DeleteItemRequest:#Exchange",
    ItemIds: [{
      __type: "ItemId:#Exchange",
    }],
    DeleteType: "MoveToDeletedItems",
  };

  constructor(id: string, attributes?: { [key: string]: string | boolean }) {
    super("DeleteItemJsonRequest");
    this.Body.ItemIds[0].Id = id;
    Object.assign(this.Body, attributes);
  }
}
