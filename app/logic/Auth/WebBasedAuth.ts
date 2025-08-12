import type { Account } from "../Abstract/Account";
import { Observable } from "../util/Observable";
import type { URLString } from "../util/util";

// Interface for authentication methods that use web pages, i.e. OWA and oAuth2.
export abstract class WebBasedAuth extends Observable {
  account: Account;
  authDoneURL: URLString;
  accessToken?: string;
  constructor(account: Account) {
    super();
    this.account = account;
  }
  abstract setTokenURLPasswordAuth(url: string | null | undefined): void;
  abstract get authorizationHeader(): string;
  abstract login(interactive: boolean): Promise<string>;
  abstract loginWithUI(): Promise<string>;
  abstract abort(): void;
  abstract logout(): Promise<void>;
  abstract reset(): Promise<void>;
  abstract get isLoggedIn(): boolean;
  abstract getAccessTokenFromAuthCode(authCode: string): Promise<string>;
  abstract getAuthURL(doneURL?: URLString): Promise<URLString>;
  abstract isAuthDoneURL(url: URLString): Promise<boolean>;
  abstract getAuthCodeFromDoneURL(url: URLString): string;
  abstract toConfigJSON(): any;
}
