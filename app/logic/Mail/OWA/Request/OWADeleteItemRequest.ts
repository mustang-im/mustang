import { OWARequest } from "./OWARequest";

export class OWADeleteItemRequest extends OWARequest {
  Body: any = {
    __type: "DeleteItemRequest:#Exchange",
    ItemIds: [{
      __type: "ItemId:#Exchange",
    }],
    DeleteType: "MoveToDeletedItems",
  };

  constructor(id: string, attributes?: { [key: string]: string | boolean }) {
    super("DeleteItem");
    this.Body.ItemIds[0].Id = id;
    Object.assign(this.Body, attributes);
  }
}
