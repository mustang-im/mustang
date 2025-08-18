import { OWACreateItemRequest } from "../../../Mail/OWA/Request/OWACreateItemRequest";

/**
 * Almost the same as an OWACreateItemRequest, but it has a custom action
 * and we also need to request Exchange Online for Teams meeting support.
 */
export class OWACreateOffice365EventRequest extends OWACreateItemRequest {
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "V2018_01_08",
  };

  get action() {
    return "CreateCalendarEvent";
  }
}
