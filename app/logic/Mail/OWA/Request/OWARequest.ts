export default class OWARequest {
  readonly __type: string;
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "Exchange2013",
  };
  Body: any;

  /**
   * @param type __type
   * @param body Body
   */
  constructor(type: string, body?: any) {
    this.__type = type + ":#Exchange";
    this.Body = body;
  }
}
