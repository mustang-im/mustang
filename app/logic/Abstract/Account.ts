import { Observable, notifyChangedProperty } from "../util/Observable";

export class Account extends Observable {
  readonly id: string;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  userRealname: string;

  /** Will be called, when there are errors on the connection
   * which cannot be attributed directly to an API function called,
   * e.g. errors while processing server messages. */
  errorCallback = (ex) => console.error(ex);

  constructor() {
    super();
    this.id = crypto.randomUUID();
  }

  async login() {
  }
}
