import OWARequest from "./OWARequest";

export default class OWACreateItemRequest extends OWARequest {
  Body: any = {
    __type: "CreateItemRequest:#Exchange",
    Items: [{}],
  };

  constructor(attributes?: { [key: string]: string | boolean | object }) {
    super("CreateItemJsonRequest");
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
