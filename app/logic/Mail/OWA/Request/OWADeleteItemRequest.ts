export default class OWADeleteItemRequest {
  readonly __type = "DeleteItemJsonRequest:#Exchange";
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "Exchange2013",
  };
  Body: any = {
    __type: "DeleteItemRequest:#Exchange",
    ItemIds: [{
      __type: "ItemId:#Exchange",
    }],
    DeleteType: "MoveToDeletedItems",
  };

  constructor(id: string, attributes?: {[key: string]: string | boolean}) {
    this.Body.ItemIds[0].Id = id;
    Object.assign(this.Body, attributes);
  }
}
