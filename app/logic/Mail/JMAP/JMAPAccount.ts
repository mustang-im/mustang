import { MailAccount, AuthMethod, DeleteStrategy } from "../MailAccount";
import { JMAPFolder } from "./JMAPFolder";
import type { TJMAPAPIErrorResponse, TJMAPAPIRequest, TJMAPAPIResponse, TJMAPChangeResponse, TJMAPFolder, TJMAPGetResponse, TJMAPIdentity, TJMAPMethodResponse, TJMAPSession } from "./JMAPTypes";
import type { EMail } from "../EMail";
import type { PersonUID } from "../../Abstract/PersonUID";
import { CreateMIME } from "../SMTP/CreateMIME";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { SpecialFolder } from "../Folder";
import { appGlobal } from "../../app";
import { appName, appVersion } from "../../build";
import { basicAuth } from "../../Auth/httpAuth";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../util/Observable";
import { Lock } from "../../util/Lock";
import { assert, SpecificError } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, MapColl } from "svelte-collections";

export class JMAPAccount extends MailAccount {
  readonly protocol: string = "jmap";
  @notifyChangedProperty
  session: TJMAPSession;
  accountID: string;
  allFolders = new MapColl<string, JMAPFolder>();
  deleteStrategy: DeleteStrategy = DeleteStrategy.MoveToTrash;
  /** if polling is enabled, how often to poll.
   * In minutes. 0 or null = polling disabled */
  pollIntervalMinutes = 10;
  syncState: string | null = null; /** JMAP state is account-global. Use stateLock. */
  stateLock = new Lock(); /** Protects syncState */
  logging = true;

  constructor() {
    super();
    assert(appGlobal.remoteApp.kyCreate, "JMAP: Need backend");
  }

  get isLoggedIn(): boolean {
    return this.session &&
      (this.authMethod != AuthMethod.OAuth2 || this.oAuth2?.isLoggedIn);
  }

  async login(interactive: boolean): Promise<void> {
    super.login(interactive);
    if (!this.dbID) {
      await this.storage.saveAccount(this);
    }
    await this.storage.readFolderHierarchy(this);

    await this.loginOAuth2(interactive);
    await this.getSession();
    await this.listFolders();
    let inbox = this.inbox as JMAPFolder;
    assert(inbox, "Inbox not found");
    inbox.startPolling();
  }

  async verifyLogin(): Promise<void> {
    await this.loginOAuth2(true);
    await this.getSession();
    await this.logout();
  }

  protected async loginOAuth2(interactive: boolean): Promise<void> {
    let useOAuth2 = [AuthMethod.OAuth2].includes(this.authMethod);
    if (useOAuth2) {
      assert(this.oAuth2, this.name + `: ` + gt`Need OAuth2 configuration`);
      if (!this.oAuth2.isLoggedIn) {
        await this.oAuth2.login(interactive);
        assert(this.oAuth2.isLoggedIn, this.name + `: ` + gt`OAuth2: Login failed`);
      }
    }
  }

  async getSession(): Promise<void> {
    let session: TJMAPSession = await this.httpGet(this.url);
    if (this.logging) {
      console.log("JMAP session", session);
    }
    assert(session.capabilities, "Need capabilities in session");
    assert(session.accounts, "Need accounts list in session");
    assert(session.primaryAccounts, "Need primaryAccount ID in session");
    assert(sanitize.url(session.apiUrl), "Need apiUrl in session");
    assert(sanitize.url(session.downloadUrl), "Need downloadUrl in session");
    assert(sanitize.url(session.uploadUrl), "Need uploadUrl in session");
    assert(sanitize.url(session.eventSourceUrl), "Need eventSourceUrl in session");
    this.accountID = session.primaryAccounts["urn:ietf:params:jmap:mail"];
    assert(this.accountID, "JMAP Session: No primary mail account");
    let mailAccount = session.accounts[this.accountID];
    assert(mailAccount, "JMAP Session: Account not found");

    this.session = session;
  }

  /** A single API call, with a single result */
  async makeSingleCall(method: string, argumentsJSON: Record<string, any>): Promise<Record<string, any>> {
    let responses = await this.makeCalls([[ method, argumentsJSON ]]);
    let response = responses[0];
    assert(response[0] == method, "Method in response does not match");
    return response[1];
  }

  /** Make multiple calls in one request, and return only the last result.
   * @calls Array of calls.
   *   Each call is an array with 3 entries:
   *   0: Method name
   *   1: Aguments
   *   2: Call name
   *   E.g. `[ "Email/get", { arg1: "value1", arg2: true, arg3: 45 }, "list" ]`
   * @returns Object with the last result for each call. The key is the "Call name" from the input.
   *   E.g. {
   *     list: [ { id: "", subject: "" }, ... ]
   *   }
   *   If a call returns multiple results, only the last result of that call is returned. */
  async makeCombinedCall(calls: [string, Record<string, any>, string?][]): Promise<Record<string, any>> {
    let responses = await this.makeCalls(calls);
    let results = {};
    for (let response of responses) {
      results[response[2]] = response[1];
    }
    return results;
  }

  /** Make multiple calls in one request
   * @calls Array of calls.
   *   Each call is an array with 3 entries:
   *   0: Method name
   *   1: Aguments
   *   2: Call number (Optional)
   *   E.g. `[ "methodName", { arg1: "value1", arg2: true, arg3: 45 }, "firstCall" ]`
   * @returns Results from the calls.
   *   One call may return multiple results, so the results array may be longer than the number of calls.
   *   The results will in the same order as the calls, though. */
  async makeCalls(calls: [ string, Record<string, any>, string? ][]): Promise<TJMAPMethodResponse[]> {
    let requestJSON: TJMAPAPIRequest = {
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [],
    };
    let callCounter = 0;
    for (let call of calls) {
      call[2] ??= `c${++callCounter}`;
      requestJSON.methodCalls.push([call[0], call[1], call[2]]);
    }
    let log: any[] = [ "Calling" ];
    for (let method of requestJSON?.methodCalls) {
      log.push(method[0], method[1], method[2]);
    }

    let responsesJSON: TJMAPAPIResponse | TJMAPAPIErrorResponse;
    try {
      responsesJSON = await this.httpPost(this.session.apiUrl, requestJSON) as TJMAPAPIResponse;
    } catch (ex) {
      if ((ex as any).httpCode) { // HTTPFetchError from backend.ts
        console.error("POST", this.session.apiUrl, "with payload\n" + JSON.stringify(requestJSON, null, 2), "\nfailed with error", JSON.stringify(responsesJSON, null, 2), "while", ...log);
        let errorJSON = responsesJSON as TJMAPAPIErrorResponse;
        ex.message = errorJSON?.detail ?? ex.message;
        ex.code = errorJSON?.type;
        throw ex;
      }
      console.error("Error", ex?.message ?? ex, ...log);
      throw ex;
    }
    log.push("Response");
    for (let method of responsesJSON?.methodResponses) {
      log.push(method[0], method[1], method[2]);
    }
    if (this.logging) {
      console.log(...log);
    }
    let errorResult = responsesJSON?.methodResponses.find(method => method[0] == "error");
    if (errorResult) {
      let error = errorResult[1];
      let ex = new Error(error.description) as any;
      ex.code = error.type;
      ex.call = requestJSON;
      ex.response = responsesJSON?.methodResponses;
      ex.debug = log.join(" ");
      throw ex;
    }
    responsesJSON = responsesJSON as TJMAPAPIResponse;

    let callNumbers = requestJSON.methodCalls.map(call => call[2]);
    for (let resp of responsesJSON.methodResponses) {
      assert(callNumbers.includes(resp[2]), "Method in response does not match");
      if (resp[0] == "error") {
        let ex = new Error(resp[1] as any);
        (ex as any).debug = {
          requests: calls,
          responses: responsesJSON.methodResponses,
        };
        throw ex;
      }
    }
    return responsesJSON.methodResponses;
  }

  protected async ky(options: Record<string, any> = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": `${appName}/${appVersion}`,
    };
    for (let name in options.headers) {
      headers[name] = options.headers[name];
    }

    // Auth method
    let usePassword = [AuthMethod.Password].includes(this.authMethod);
    let useOAuth2 = [AuthMethod.OAuth2].includes(this.authMethod);
    if (usePassword) {
      headers.Authorization = basicAuth(this.username, this.password);
    } else if (useOAuth2) {
      assert(this.oAuth2?.isLoggedIn, this.name + `: ` + gt`OAuth: Need login`);
      headers.Authorization = this.oAuth2.authorizationHeader;
    }
    // console.log("JMAP headers", headers);

    return appGlobal.remoteApp.kyCreate({
      headers: headers,
      timeout: 3000,
      result: options.result ?? "json",
    });
  }

  async httpGet(url: string, options?: any): Promise<any> {
    let ky = await this.ky(options);
    return await ky.get(url);
  }

  async httpPost(url: string, sendJSON: any): Promise<any> {
    let ky = await this.ky();
    return await ky.post(url, { json: sendJSON });
  }

  async httpPostBinary(url: string, body: any, options?: any): Promise<any> {
    let ky = await this.ky(options);
    return await ky.post(url, { body: body });
  }

  /** dummy, remove later */
  async connection(): Promise<any> {
  }

  async listFolders(): Promise<void> {
    await this.storage.readFolderHierarchy(this);
    let oldFolders = this.getAllFolders();

    let serverFoldersResponse = await this.makeSingleCall("Mailbox/get", {
      "accountId": this.accountID,
      "ids": null,
    }) as TJMAPGetResponse<TJMAPFolder>;
    for (let folderJSON of serverFoldersResponse.list) {
      let folder = this.getFolderByID(folderJSON.id) ?? this.newFolder();
      // Assumes that parent folders will be listed first
      folder.parent = folderJSON.parentId ? this.getFolderByID(folderJSON.parentId) : null;

      let parentGroup = folder.parent
        ? folder.parent.subFolders
        : this.rootFolders;
      let existing = parentGroup.find(folder => folder.id == folderJSON.id) as JMAPFolder;
      if (existing) {
        folder = existing;
      } else {
        parentGroup.add(folder);
      }
      folder.fromJMAP(folderJSON);
      this.allFolders.set(folder.id, folder);
    }

    if (this.logging) {
      // console.log("super.getAllFolders()", super.getAllFolders().contents.map(f => f.name).join(","));
      console.log("All folders", this.getAllFolders().contents.map(f => f.name).join(", "));
    }

    let currentFolders = new ArrayColl(this.allFolders.contents);
    for (let oldFolder of oldFolders) {
      if (!currentFolders.includes(oldFolder as JMAPFolder)) {
        await oldFolder.deleteItLocally();
        continue;
      }
    }
    for (let folder of currentFolders) {
      if (folder.dbID) {
        await this.storage.saveFolderProperties(folder);
      } else {
        await this.storage.saveFolder(folder);
      }
    }
  }

  getFolderByID(id: string): JMAPFolder | null {
    return this.allFolders.get(id);
  }

  async createToplevelFolder(name: string): Promise<JMAPFolder> {
    let newFolder = await super.createToplevelFolder(name) as JMAPFolder;
    let response = await this.makeSingleCall("Mailbox/set", {
      accountId: this.accountID,
      create: {
        "newFolder": {
          name: name,
          isSubscribed: true,
        },
      },
    }) as TJMAPChangeResponse;
    newFolder.id = response.created["newFolder"].id;
    this.allFolders.set(newFolder.id, newFolder);
    console.log("JMAP folder created", name);
    await this.listFolders();
    await newFolder.listMessages();
    return newFolder;
  }

  protected stopPolling() {
    for (let folder of this.getAllFolders()) {
      (folder as JMAPFolder).stopPolling();
    }
  }

  async logout(): Promise<void> {
    this.stopPolling();
    if (this.oAuth2) {
      await this.oAuth2.logout();
    }
  }

  async send(email: EMail): Promise<void> {
    let outboxFolder = this.getSpecialFolder(SpecialFolder.Outbox) ??
      this.getSpecialFolder(SpecialFolder.Drafts);
    let sentFolder = email.folder ??
      this.getSpecialFolder(SpecialFolder.Sent);

    email.mime ??= await CreateMIME.getMIME(email);
    await outboxFolder.addMessage(email);

    let recipients = new ArrayColl<PersonUID>();
    recipients.addAll(email.to);
    recipients.addAll(email.cc);
    recipients.addAll(email.bcc);
    let recipientsAddrs = recipients.map(p => ({ email: p.emailAddress })).contents;
    let identityID = await this.findIdentityOnServer(email);

    let sendResponse = await this.makeSingleCall("EmailSubmission/set", {
      accountId: this.accountID,
      create: {
        "sendMessage": {
          emailId: email.pID,
          identityId: identityID,
          envelope: {
            mailFrom: { email: email.from.emailAddress },
            rcptTo: recipientsAddrs,
          }
        },
      },
      onSuccessUpdateEmail: {
        "#sendMessage": {
          mailboxIds: {
            [sentFolder.id]: true,
            [outboxFolder.id]: false,
          },
          keywords: {
            "$draft": false,
          },
        }
      }
    });
    let error = sendResponse["notCreated"] as any;
    if (error) {
      error = error["sendMessage"];
      throw new Error("Upload of message to server failed: " + (error?.description ?? "") + " " + (error?.properties?.join(", ") ?? ""));
    }
  }

  protected async findIdentityOnServer(email: EMail): Promise<string | null> {
    assert(email.identity, `${this.name}: Please set the email identity before sending`);
    if (email.identity.pID) {
      return email.identity.pID as string;
    }

    let listResponse = await this.makeSingleCall("Identity/get", {
      accountId: this.accountID,
    }) as TJMAPGetResponse<TJMAPIdentity>;
    for (let jmapIdentity of listResponse.list) {
      if (email.from.emailAddress == jmapIdentity.email ||
          email.identity.emailAddress == jmapIdentity.email ||
          email.identity.isEMailAddress(jmapIdentity.email)) {
        return email.identity.pID = jmapIdentity.id;
      }
    }
    return null;
  }

  hasCapability(capa: string): boolean {
    if (!this.session) {
      return false;
    }
    return !!this.session.capabilities[capa];
  }

  getCapability(capa: string): Record<string, any> | null {
    if (!this.session) {
      return null;
    }
    return this.session.capabilities[capa];
  }

  fromConfigJSON(config: any) {
    super.fromConfigJSON(config);
    this.pollIntervalMinutes = sanitize.integer(config.pollIntervalMinutes, this.pollIntervalMinutes);
    this.syncState = sanitize.string(config.syncState, this.syncState);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.pollIntervalMinutes = this.pollIntervalMinutes;
    json.syncState = this.syncState;
    return json;
  }

  newFolder(): JMAPFolder {
    return new JMAPFolder(this);
  }
}

export class JMAPCommandError extends SpecificError {
}
