import type { OWAEvent } from "../OWAEvent";
import OWARequest from "../../../Mail/OWA/Request/OWARequest";

/** This is similar to the UpdateItem request,
 * but the format of the item id is different. */
export default class OWAUpdateOccurrenceRequest extends OWARequest {
  Body: any = {
    __type: "UpdateItemRequest:#Exchange",
    ConflictResolution: "AlwaysOverwrite",
    ItemChanges: [{
      __type: "ItemChange:#Exchange",
      ItemId: {
        __type: "OccurrenceItemId:#Exchange",
      },
      Updates: []
    }],
  };

  constructor(event: OWAEvent, attributes?: { [key: string]: string | boolean }) {
    super("UpdateItem");
    this.itemChange.ItemId.RecurringMasterId = event.parentEvent.itemID;
    this.itemChange.ItemId.InstanceIndex = event.parentEvent.instances.indexOf(event) + 1;
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
