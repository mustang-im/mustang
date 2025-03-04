import OWARequest from "./OWARequest";

export default class OWAUpdateItemRequest extends OWARequest {
  Body: any = {
    __type: "UpdateItemRequest:#Exchange",
    ConflictResolution: "AlwaysOverwrite",
    ItemChanges: [{
      __type: "ItemChange:#Exchange",
      ItemId: {
        __type: "ItemId:#Exchange",
      },
      Updates: []
    }],
  };

  constructor(id: string, attributes?: { [key: string]: string | boolean }) {
    super("UpdateItem");
    this.itemChange.ItemId.Id = id;
    Object.assign(this.Body, attributes);
  }

  protected get itemChange() {
    return this.Body.ItemChanges[0];
  }

  addField(type: string, key: string, value: any, FieldURI: string) {
    let field = {
      __type: "DeleteItemField:#Exchange",
      Path: {
        __type: "PropertyUri:#Exchange",
        FieldURI: FieldURI,
      },
    } as any;
    if (value != null) {
      field.__type = "SetItemField:#Exchange";
      field.Item = {
        __type: type + ":#Exchange",
      };
      field.Item[key] = value;
    }
    this.itemChange.Updates.push(field);
  }
}
