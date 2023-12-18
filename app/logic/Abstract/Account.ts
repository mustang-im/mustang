import { Observable, notifyChangedProperty } from "../util/Observable";

export class Account extends Observable {
  readonly id: string;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  userRealname: string;

  constructor() {
    super();
    this.id = crypto.randomUUID();
  }

  async login() {
  }
}
