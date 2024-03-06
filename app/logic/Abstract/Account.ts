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

  get isLoggedIn(): boolean {
    return false;
  }

  /**
   * @param interactive
   *   true: If needed, open UI to ask user to log in manually,
   *     e.g. using password, MFA, or passkey
   *   false: Log in with stored credentials, e.g. stored
   *     password, stored OAuth2 refreshToken or similar.
   * @throws
   *   NeedInteraction We don't have stored credentials,
   *     or they expired normally.
   *   LoginFailed We have stored credentials, and we tried them,
   *     but the server refused to accept them.
   *     (Typically for reasons other than expiry.)
   */
  async login(interactive: boolean): Promise<void> {
  }

  async logout(): Promise<void> {
  }
}
