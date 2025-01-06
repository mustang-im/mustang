import { appGlobal } from "../app";
import { Lock } from "../util/Lock";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { assert } from "../util/util";

/**
 * Implements login via NTLM
 */
export class NTLM extends Observable {
  authorization: string | null = null;
  @notifyChangedProperty
  protected step: Step = Step.LoggedOut;
  lock = new Lock();

  async init() {
    this.authorization = await appGlobal.remoteApp.createType1Message();
    this.step = Step.Step1;
  }

  get isLoggedIn(): boolean {
    return this.step == Step.LoggedIn;
  }

  /**
   * @returns the value for the `Authentication` HTTP header
   */
  get authorizationHeader(): string {
    return this.authorization ?? "";
  }

  /**
   * After calling init(), you first need to make an empty call to the server and then
   * pass in the `WWWAuthenticate` HTTP response header here.
   * This will generate the `authorizationHeader` for the next call.
   *
   * @param WWWAuthenticate  HTTP response header from the first call
   * @throws
   */
  async loginFromPassword(username: string, password: string, WWWAuthenticate: string): Promise<void> {
    assert(!this.isLoggedIn, "NTLM: Already logged in");
    assert(this.step == Step.Step1, "NTLM: Please make an empty call first");
    assert(username && password, "Need username and password");
    this.authorization = await appGlobal.remoteApp.
      createType3MessageFromType2Message(WWWAuthenticate, username, password);
    this.step = Step.LoggedIn;
  }

  async logout(): Promise<void> {
    this.step = Step.LoggedOut;
    this.authorization = null;
  }
}

enum Step {
  LoggedOut,
  Step1,
  LoggedIn,
}
