import { MailAccount, AuthMethod, DeleteStrategy } from "../MailAccount";
import { GraphFolder } from "./GraphFolder";
import type { TGraphFolder } from "./GraphTypes";
import type { EMail } from "../EMail";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { appName, appVersion } from "../../build";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, blobToBase64 } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, MapColl } from "svelte-collections";
import { CreateMIME } from "../SMTP/CreateMIME";

export class GraphAccount extends MailAccount {
  readonly protocol: string = "graph";
  accountID: string;
  allFolders = new MapColl<string, GraphFolder>();
  deleteStrategy: DeleteStrategy = DeleteStrategy.MoveToTrash;
  /** if polling is enabled, how often to poll.
   * In minutes. 0 or null = polling disabled */
  pollIntervalMinutes = 10;
  logging = true;

  constructor() {
    super();
    assert(appGlobal.remoteApp.kyCreate, "Graph: Need backend");
  }

  get isLoggedIn(): boolean {
    return this.oAuth2?.isLoggedIn;
  }

  async login(interactive: boolean): Promise<void> {
    super.login(interactive);
    if (!this.dbID) {
      await this.storage.saveAccount(this);
    }
    await this.storage.readFolderHierarchy(this);
    assert([AuthMethod.OAuth2].includes(this.authMethod), "MS Graph supports only OAuth2");

    await this.loginOAuth2(interactive);
    await this.listFolders();
    let inbox = this.inbox as GraphFolder;
    assert(inbox, "Inbox not found");
    inbox.startPolling();
  }

  async verifyLogin(): Promise<void> {
    await this.loginOAuth2(true);
    await this.graphGet1("mailFolders");
    await this.logout();
  }

  protected async loginOAuth2(interactive: boolean): Promise<void> {
    assert(this.oAuth2, this.name + `: ` + gt`Need OAuth2 configuration`);
    if (!this.oAuth2.isLoggedIn) {
      await this.oAuth2.login(interactive);
      assert(this.oAuth2.isLoggedIn, this.name + `: ` + gt`OAuth2: Login failed`);
    }
  }

  /**
   * @param path The function and object to call. This is the part of the URL path *after* the user.
   * @param args URL query parameters. Will be appended after "?"
   * @returns The single object that the server returned in `.value`, or null
   */
  async graphGet1(path: string, args?: Record<string, any>): Promise<Record<string, any> | null> {
    let responses = await this.graphGet(path, args);
    assert(responses.length > 1, this.name + ": " + `${path} returned multiple results, but only 1 was expected`);
    return responses[0];
  }

  /**
   * @param path The function and object to call. This is the part of the URL path *after* the user.
   * @param args URL query parameters. Will be appended after "?". Optional.
   * @param options @see graphCall()
   * @returns The list of objects that the server returned in `.value`, as array
   *   If not the entire list was returned, `.next` contains the URL to retrieve the next batch
   *
   */
  async graphGet(path: string, args?: Record<string, any>, options?: any): Promise<Record<string, any>[]> {
    args ??= {};
    args["$top"] ??= kMaxFetchCount;
    options ??= {};
    options.searchParams = args;
    let responses = await this.graphCall(path, options);
    let array = responses.value;
    assert(Array.isArray(array), this.name + ": " + `${path} did not return a result`);
    let extra = array as any;
    extra.nextURL = responses["@odata.nextLink"];
    extra.deltaURL = responses["@odata.deltaLink"];
    return array;
  }

  /**
   * @param path The function and object to call. This is the part of the URL path *after* the user.
   * @param sendJSON HTTP request body, as JSON
   * @param options @see graphCall()
   * @returns JSON result
   */
  async graphPost(path: string, sendJSON: any, options?: any): Promise<any> {
    options ??= {};
    options.method = "post";
    options.json = sendJSON;
    return await this.graphCall(path, options);
  }

  /**
   * @param path The function and object to call. This is the part of the URL path *after* the user.
   * @param sendJSON HTTP request body, as JSON
   * @param options @see graphCall()
   * @returns JSON result
   */
  async graphPatch(path: string, sendJSON: any, options?: any): Promise<any> {
    options ??= {};
    options.method = "patch";
    options.json = sendJSON;
    return await this.graphCall(path, options);
  }

  async graphDelete(path: string): Promise<any> {
    return await this.graphCall(path, { method: "delete" });
  }

  /**
   * @param path The function and object to call. This is the part of the URL path *after* the user.
   * @param options {
   *   user: string - ID of other user to access the resource of. Optional, defaults to self (logged-in user).
   *   beta: boolean - Use the beta API of MS Graph. Needed for some functions. Optional, defaults to production version (1.0).
   *   // from @see httpCall()
   *   json: any, // send JSON as HTTP request body
   *   body: any, // send binary as HTTP request body
   *   method: string = "get", // "post", "patch", "put", "head", ...
   *   result: string = "json", // "text", "..."
   * }
   * @returns JSON result
   */
  async graphCall(path: string, options?: any): Promise<any> {
    let user = options?.user ? "user/" + options.user : "me";
    let version = options?.beta ? "beta" : "v1.0";
    return await this.httpCall(`${this.url}/${version}/${user}/${path}`, options);
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

    // Auth
    assert(this.oAuth2?.isLoggedIn, this.name + `: ` + gt`OAuth: Need login`);
    headers.Authorization = this.oAuth2.authorizationHeader;
    // console.log("Headers", headers);

    return appGlobal.remoteApp.kyCreate({
    // return ky.create({
      result: options.result ?? "json",
      headers: headers,
      timeout: 3000,
    });
  }

  /**
   *
   * @param url
   * @param options {
   *   json: any, // send JSON as HTTP request body
   *   body: any, // send binary as HTTP request body
   *   method: string = "get", // "post", "patch", "put", "head", ...
   *   result: string = "json", // "text", "..."
   * }
   * @returns
   */
  async httpCall(url: string, options?: any): Promise<any> {
    let ky = await this.ky(options);
    try {
      let method = options?.method?.toLowerCase() ?? "get";
      console.log("Calling <" + url + ">", method.toUpperCase());
      return await ky[method](url);
      // let result = options?.result ?? "json";
      // return await ky[method](url)[result](options); // e.g. await ky.get(url).json();
    } catch (ex) {
      await this.httpError(ex);
    }
  }

  /** @throws an appropriate exception (always throws) */
  protected async httpError(ex: Error) {
    if (ex.name == "HTTPError") {
      let ext = ex as any;
      let msg: string;
      let code: string;
      try {
        let json = await ext.response.json();
        msg = json.message;
        code = json.code;
      } catch (ex2) {
      }
      if (ext.status == 401) {
        throw new LoginError(ex, msg);
      } else if (ext.status && ext.status >= 400 && ext.status < 500) {
        ex.message = msg;
        ext.code = code;
        throw ex;
      } else {
        throw new ConnectError(ex, msg);
      }
    }
    throw ex;
  }

  async listFolders(): Promise<void> {
    await this.storage.readFolderHierarchy(this);
    let oldFolders = this.getAllFolders();

    this.rootFolders.addAll(await this.listSubFolders(null));

    if (this.logging) {
      console.log("All folders", this.getAllFolders().contents.map(f => f.name).join(", "));
    }
    let currentFolders = new ArrayColl(this.allFolders.contents);
    for (let oldFolder of oldFolders) {
      if (!currentFolders.includes(oldFolder as GraphFolder)) {
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

  /** List the subfolders of the given parent (or root, if null).
   * Also query all descendant folders, recursively. */
  protected async listSubFolders(parentFolder: GraphFolder | null): Promise<ArrayColl<GraphFolder>> {
    let foldersJSON = await this.graphGet(
      parentFolder.id ? `mailFolders/${parentFolder.id}/childFolders` : `mailFolders`,
      null, { beta: true }
    ) as TGraphFolder[];
    let result = new ArrayColl<GraphFolder>();
    for (let folderJSON of foldersJSON) {
      let folder = this.newFolder();
      folder.parent = parentFolder;
      folder.fromGraph(folderJSON);

      result.add(folder);
      this.allFolders.set(folder.id, folder);

      // Query decendants
      folder.children.addAll(await this.listSubFolders(folder));
    }
    return result;
  }

  getFolderByID(id: string): GraphFolder | null {
    return this.allFolders.get(id);
  }

  async createToplevelFolder(name: string): Promise<GraphFolder> {
    let newFolder = await super.createToplevelFolder(name) as GraphFolder;
    let newFolderJSON = await this.graphPost("mailFolders", {
      displayName: name,
    });
    newFolder.fromGraph(newFolderJSON);
    this.allFolders.set(newFolder.id, newFolder);
    console.log("Folder created", name);
    await newFolder.listMessages();
    return newFolder;
  }

  protected stopPolling() {
    for (let folder of this.getAllFolders()) {
      (folder as GraphFolder).stopPolling();
    }
  }

  async logout(): Promise<void> {
    this.stopPolling();
    if (this.oAuth2) {
      await this.oAuth2.logout();
    }
  }

  async send(email: EMail): Promise<void> {
    /*
    let outboxFolder = this.getSpecialFolder(SpecialFolder.Outbox) ??
      this.getSpecialFolder(SpecialFolder.Drafts);
    let sentFolder = email.folder ??
      this.getSpecialFolder(SpecialFolder.Sent);
    await outboxFolder.addMessage(email);
    */

    let mime = await CreateMIME.getMIME(email);
    let base64 = await blobToBase64(new Blob([mime]));

    let sendResponse = await this.httpCall("sendMail", {
      body: base64,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    console.log("send response", sendResponse);
  }

  async makeSingleCall(method: string, argumentsJSON: Record<string, any>): Promise<Record<string, any>> {
    return {};
  }
  async makeCombinedCall(calls: [string, Record<string, any>, string?][]): Promise<Record<string, any>> {
    return {};
  }

  fromConfigJSON(config: any) {
    super.fromConfigJSON(config);
    this.pollIntervalMinutes = sanitize.integer(config.pollIntervalMinutes, this.pollIntervalMinutes);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.pollIntervalMinutes = this.pollIntervalMinutes;
    return json;
  }

  newFolder(): GraphFolder {
    return new GraphFolder(this);
  }
}

export const kMaxFetchCount = 1000;
