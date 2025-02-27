import OWACreateItemRequest from "../../../Mail/OWA/Request/OWACreateItemRequest";

export default class OWACreateOffice365EventRequest extends OWACreateItemRequest {
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "V2018_01_08",
  };

  get action() {
    return "CreateCalendarEvent";
  }
}
