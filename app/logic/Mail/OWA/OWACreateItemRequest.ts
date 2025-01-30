export default class OWACreateItemRequest {
  readonly __type = "CreateItemJsonRequest:#Exchange";
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "Exchange2013",
  };
  Body: any = {
    __type: "CreateItemRequest:#Exchange",
    Items: [{}],
  };

  constructor(attributes?: {[key: string]: string | boolean | object}) {
    Object.assign(this.Body, attributes);
  }

  addField(type: string, key: string, value: any, FieldURI?: string) {
    let item = this.Body.Items[0];
    item.__type = type + ":#Exchange";
    if (value != null) {
      item[key] = value;
    }
  }
}
