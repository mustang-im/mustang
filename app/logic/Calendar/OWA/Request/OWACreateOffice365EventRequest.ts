import OWACreateItemRequest from "../../../Mail/OWA/OWACreateItemRequest";

export default class OWACreateOffice365EventRequest extends OWACreateItemRequest {
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "V2018_01_08",
  };

  get type() {
    return "CreateCalendarEvent";
  }
}
