import type { OWAEvent } from "../OWAEvent";

/** As with OWAUpdateOccurenceRequest, this is similar to the
 * OWAUpdateOffice365EventRequest but the format of the item id is different. */
export default class OWAUpdateOffice365OccurrenceRequest {
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
        __type: "OccurrenceItemId:#Exchange",
      },
      Updates: []
    },
  };

  constructor(event: OWAEvent, attributes?: { [key: string]: string | boolean }) {
    this.itemChange.ItemId.RecurringMasterId = event.parentEvent.itemID;
    this.itemChange.ItemId.InstanceIndex = event.parentEvent.instances.indexOf(event) + 1;
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
}
