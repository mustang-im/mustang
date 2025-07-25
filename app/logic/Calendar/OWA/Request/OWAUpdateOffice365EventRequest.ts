/**
 * The UpdateCalendarEvent and UpdateItem APIs are similar but subtly different,
 * so some parts of the code are duplicated but other parts are not.
 * To properly reflect the inheritance would require three additional classes.
 */
export class OWAUpdateOffice365EventRequest {
  readonly __type = "UpdateCalendarEventJsonRequest:#Exchange";
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "V2018_01_08",
  };
  Body: any = {
    __type: "UpdateCalendarEventRequest:#Exchange",
    ItemChange: {
      __type: "ItemChange:#Exchange",
      ItemId: {
        __type: "ItemId:#Exchange",
      },
      Updates: []
    },
  };

  constructor(id: string, attributes?: { [key: string]: string | boolean }) {
    this.itemChange.ItemId.Id = id;
    this.Body.EventId = this.itemChange.ItemId;
    // XXX Support for attributes is unknown at this time.
  }

  protected get itemChange() {
    return this.Body.ItemChange;
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

  get action() {
    return "UpdateCalendarEvent";
  }
}
