import { Account } from "../../Abstract/Account";
import type { MailAccount } from "../MailAccount";
import type { MailIdentity } from "../MailIdentity";
import { notifyChangedProperty } from "../../util/Observable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, type Json, type URLString } from "../../util/util";

export class SMLHTTPAccount extends Account {
  //////////////////////
  // Login

  @notifyChangedProperty
  protected accessToken: string | null = null;
  protected mailAccount: MailAccount;

  get emailAddress(): string | null {
    return this.username;
  };
  set emailAddress(val: string) {
    this.username = sanitize.emailAddress(val);
  };
  get isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  // TODO store the access token and URL in the email account `toConfigJSON()`, and read it back from there

  /**
   * Registers with the server, which sends us an email.
   * This will wait for the email to arrive.
   * `RegisterSMLProcessor` will process it automatically.
   *
   * @warning This will easily take minutes, or even likely hang entirely.
   */
  async login(): Promise<void> {
    this.accessToken = null;
    console.log("Registering", this.emailAddress, "for SML HTTP");
    fetch(this.url + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        name: this.realname,
        emailAddress: this.emailAddress,
      }, null, 2),
    });
    // The server sends us a registration email, which we then process automatically.
    // Control continues in `RegisterSMLProcessor`, which will set `this.accessToken`.
    return new Promise(resolve => {
      let poller = this.pollForNewEMails();
      let unsubscribe = this.subscribe(() => {
        if (this.accessToken) {
          unsubscribe();
          if (poller) {
            clearInterval(poller);
          }
          resolve();
          console.log("SML HTTP registration for", this.emailAddress, "completed automatically");
        }
      });
    });
  }

  protected pollForNewEMails(): NodeJS.Timeout | null {
    if (!this.mailAccount) {
      return null;
    }
    const pollFrequencyInSeconds = 5;
    const maxPollTimeInMinutes = 10;
    let pollLimit = Math.floor(maxPollTimeInMinutes * 60 / pollFrequencyInSeconds);
    let poller = setInterval(() => {
      if (pollLimit-- <= 0) {
        clearInterval(poller);
      }
      this.checkForNewEMails()
        .catch(console.error);
    }, pollFrequencyInSeconds * 1000);
    return poller;
  }
  protected async checkForNewEMails() {
    console.log("Check messages for", this.mailAccount.name, "for registration");
    let newMessages = await this.mailAccount.inbox.listMessages();
    for (let msg of newMessages) {
      await msg.download();
    }
  }
  setAccessToken(val: string) {
    this.accessToken = val;
  }

  //////////////////////
  // Resources

  /**
   * Creates a new resource on the server.
   * You have to be authenticated.
   * @param bundleID
   *   if null, create a new bundle.
   *   if passed, create or update a subresource below this bundle.
   *     You must own this bundle, otherwise the write will fail.
   * @param resourceID
   *   if null, create a new resource within the bundle.
   *   if passed, update an existing subresource within the bundle.
   *     You must either own the bundle, or the resource is writable to all who know the URL.
   * @param writable Whether everybody who has the URL is allowed to change the content.
   *   This should be used when you send the recipient a custom email with a URL only for that recipient.
   *   The recipient can then update that URL, and only he knows the URL.
   *   That presumes that you generate a different email for each recipient.
   * @param json {JSON} the content of the resource that you want to write to the server
   * @returns The resourceURL where others can HTTP GET the content that you pushed.
   */
  async saveResource(
    bundleID: string | null = null,
    resourceID: string | null = null,
    writable: boolean,
    json: Json
  ): Promise<{
    bundleID: string,
    resourceID: string,
    resourceURL: URLString
  }> {
    bundleID ??= crypto.randomUUID();
    resourceID ??= crypto.randomUUID();
    let resourceURL = this.url + "/r/" + bundleID + "/" + resourceID;
    await fetch(resourceURL, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + this.accessToken,
        "Content-Type": "application/json",
        "Public-Access": writable ? "write" : "read",
      },
      body: JSON.stringify(json, null, 2),
    });
    return { bundleID, resourceID, resourceURL };
  }

  /**
   * Saves an update of an existing resource on the server.
   * You are not authenticated. The resource has to be marked world-writable by its creator.
   * @param url The absolute URL of the resource
   * @param json {JSON} the content of the resource that you want to write to the server
   */
  static async saveURL(url: URLString, json: Json): Promise<void> {
    let response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json, null, 2),
    });
    let result = await response.json();
    if (typeof (result.error) == "string") {
      throw new Error(result.error);
    }
  }

  /**
   * Gets the content of the resource.
   * @param bundleID
   * @param resourceID
   * @param withAuth Whether you make the call authenticated.
   */
  async getResource(bundleID: string, resourceID: string, withAuth = false): Promise<any> {
    let resourceURL = this.url + "/r/" + bundleID + "/" + resourceID;
    return await SMLHTTPAccount.getURL(resourceURL, withAuth ? this.accessToken : undefined);
  }

  /**
   * Gets the content of the resource.
   * @param url The absolute URL of the resource
   * @param withAuth Whether you make the call authenticated.
   */
  async getURL(url: URLString, withAuth = false): Promise<any> {
    return await SMLHTTPAccount.getURL(url, withAuth ? this.accessToken : undefined);
  }

  /**
   * Gets the content of the resource.
   * You are not authenticated. The resource has to be marked world-readable or world-writable by its creator.
   * @param url The absolute URL of the resource
   * @param accessToken_internal Do not set this, only for internal use by this.getURL()/getResource().
   */
  protected static async getURL(url: URLString, accessToken_internal?: string): Promise<any> {
    let response = await fetch(url, {
      headers: {
        "Authorization": accessToken_internal ? "Bearer " + accessToken_internal : undefined,
        "Content-Type": "application/json",
      },
    });
    let result = await response.json();
    if (typeof (result.error) == "string") {
      throw new Error(result.error);
    }
    return result;
  }

  async save() {
    // `MailIdentity.smlAccount == this`, and `MailIdentity.toConfigJSON()` saves it to DB
    await this.mailAccount.save();
  }

  toJSON(): any {
    let json = {} as any;
    json.url = this.url;
    json.emailAddress = this.emailAddress;
    json.accessToken = this.accessToken;
    return json;
  }
  static fromJSON(json: any, identity: MailIdentity): SMLHTTPAccount | null {
    if (!json || !Object.keys(json).length) {
      return null;
    }
    let thiss = new SMLHTTPAccount();
    thiss.url = sanitize.url(json.url);
    thiss.emailAddress = sanitize.emailAddress(json.emailAddress);
    thiss.accessToken = sanitize.nonemptystring(json.accessToken, null);
    thiss.mailAccount = identity.account;
    return thiss;
  }

  //////////////////////
  // Accounts management
  // SML accounts are in `MailIdentity.smlAccount` and saved in DB with the `MailAccount`

  static async getOrCreateAccount(identity: MailIdentity): Promise<SMLHTTPAccount> {
    return identity.smlAccount ?? await SMLHTTPAccount.createAccount(identity);
  }
  protected static async createAccount(identity: MailIdentity): Promise<SMLHTTPAccount> {
    assert(!identity.smlAccount, "Already have an SML account");
    let acc = new SMLHTTPAccount();
    // TODO Support provider servers in Autoconfig file
    acc.url = "https://sml.mustang.im";
    acc.emailAddress = identity.emailAddress;
    acc.realname = identity.realname;
    acc.mailAccount = identity.account;
    identity.smlAccount = acc;
    await acc.save();
    return acc;
  }
}
