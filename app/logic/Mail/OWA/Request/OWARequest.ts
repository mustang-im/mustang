export class OWARequest {
  [Symbol.toStringTag]: string;
  readonly __type: string;
  readonly Header = {
    __type: "JsonRequestHeaders:#Exchange",
    RequestServerVersion: "Exchange2013",
  };
  Body: any;

  /**
   * @param action Action
   * @param body Body
   */
  constructor(action: string, body?: any) {
    this[Symbol.toStringTag] = action;
    this.__type = action + "JsonRequest:#Exchange";
    this.Body = body;
  }

  get action() {
    return this[Symbol.toStringTag];
  }
}
