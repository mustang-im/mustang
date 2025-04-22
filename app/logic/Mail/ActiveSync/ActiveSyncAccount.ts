import { MailAccount } from "../MailAccount";
import { AuthMethod } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import type { EMail } from "../EMail";
import type { Folder } from "../Folder";
import { kMaxCount, ActiveSyncFolder, FolderType } from "./ActiveSyncFolder";
import { ActiveSyncError } from "./ActiveSyncError";
import { CreateMIME } from "../SMTP/CreateMIME";
import { newAddressbookForProtocol} from "../../Contacts/AccountsList/Addressbooks";
import { ActiveSyncAddressbook } from "../../Contacts/ActiveSync/ActiveSyncAddressbook";
import { newCalendarForProtocol} from "../../Calendar/AccountsList/Calendars";
import { ActiveSyncCalendar } from "../../Calendar/ActiveSync/ActiveSyncCalendar";
import { OAuth2 } from "../../Auth/OAuth2";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import { request2WBXML, WBXML2JSON } from "./WBXML";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { ensureLicensed } from "../../util/LicenseClient";
import { appGlobal } from "../../app";
import { Throttle } from "../../util/Throttle";
import { Semaphore } from "../../util/Semaphore";
import { ensureArray, assert, NotSupported, sleep } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

const kFolderSyncKeyError = "9";

export interface ActiveSyncPingable {
  // (async) Callback for when the ActiveSync mentions this in a Ping response.
  ping(): Promise<void>;
  // The pingable's ActiveSync ID.
  readonly serverID: string;
  // The pingable's ActiveSync class name.
  readonly folderClass: "Email" | "Calendar" | "Contacts" | "Tasks";
}

export class ActiveSyncAccount extends MailAccount {
  readonly protocol: string = "activesync";
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  readonly canSendInvitations: boolean = false;
  readonly pingsMRU = new ArrayColl<ActiveSyncPingable>();
  heartbeat = 60;
  maxPings = kMaxCount;
  listening = false;
  policyKey: Promise<string> | string;
  syncKeyBusy: Promise<any> | null;
  protocolVersion: string;
  throttle = new Throttle(50, 1);
  semaphore = new Semaphore(20);
  retries = 0;

  constructor() {
    super();
    this.policyKey = this.getStorageItem("policy_key");
    assert(appGlobal.remoteApp.optionsHTTP, "ActiveSync: Need backend");
  }

  newFolder(): ActiveSyncFolder {
    return new ActiveSyncFolder(this);
  }

  /**
   * Currently storing the folder sync key, protocol version and policy key
   * (if any) in local storage. Should this migrate to configJSON?
   */
  getStorageItem(key) {
    return localStorage.getItem(`mail.${this.id}.${key}`);
  }

  setStorageItem(key, value) {
    localStorage.setItem(`mail.${this.id}.${key}`, value);
  }

  get isLoggedIn(): boolean {
    return this.authMethod != AuthMethod.OAuth2 || this.oAuth2?.isLoggedIn;
  }

  async login(interactive: boolean): Promise<void> {
    await ensureLicensed();
    await super.login(interactive);
    if (this.authMethod == AuthMethod.OAuth2) {
      let urls = OAuth2URLs.find(a => a.hostnames.includes(this.hostname));
      this.oAuth2 = new OAuth2(this, urls.tokenURL, urls.authURL, urls.authDoneURL, urls.scope, urls.clientID, urls.clientSecret, urls.doPKCE);
      this.oAuth2.setTokenURLPasswordAuth(urls.tokenURLPasswordAuth);
      this.oAuth2.subscribe(() => this.notifyObservers());
      await this.oAuth2.login(interactive);
    }
    this.protocolVersion = this.getStorageItem("protocolVersion");
    if (this.protocolVersion == "14.0") {
      let request = {
        DeviceInformation: {
          Set: {
            Model: "Computer",
          },
        },
      };
      let response = await this.callEAS("Settings", request);
      if (response.DeviceInformation.Status != "1") {
        throw new ActiveSyncError("Settings", response.DeviceInformation.Status, this);
      }
    }

    await this.listFolders();

    // `listFolders` will subscribe to new user-added address books and calendars
    for (let account of this.dependentAccounts()) {
      if (account instanceof ActiveSyncAddressbook) {
        account.listContacts();
      } else if (account instanceof ActiveSyncCalendar) {
        account.listEvents();
      }
    }

    // ActiveSync doesn't have streaming notifications, instead it
    // provides the Ping operation which will tell us when a pingable
    // has gone out of sync. This only makes sense once the pingable
    // is in sync, so each pingable registers with the account when
    // it's ready to be specified in the Ping operation.
  }

  async logout(): Promise<void> {
    this.oAuth2?.logout();
  }

  async send(email: EMail): Promise<void> {
    if (email.bcc.hasItems) {
      throw new NotSupported("ActiveSync does not support BCC");
    }
    let request = {
      ClientId: await this.nextClientID(),
      SaveInSentItems: {},
      Mime: await CreateMIME.getMIME(email),
    };
    await this.callEAS("SendMail", request);
  }

  /**
   * As per ActiveSync documentation, the ClientID can be a simple counter
   * incremented for each new message. (Except that everything is a string in
   * ActiveSync of course.)
   */
  nextClientID(): string {
    let clientID = String(1 + Number(localStorage.getItem("active_sync.client_id")));
    localStorage.setItem("active_sync.client_id", clientID);
    return clientID;
  }

  /**
   * Performs an OPTIONS request to check the server's ActiveSync version.
   */
  async verifyLogin() {
    let options: any = {
      throwHttpErrors: false,
      headers: {
        Cookie: `DefaultAnchorMailbox=${encodeURI(this.emailAddress)}`, // required for v14.0
      },
    };
    if (this.authMethod == AuthMethod.OAuth2) {
      if (!this.oAuth2) {
        let urls = OAuth2URLs.find(a => a.hostnames.includes(this.hostname));
        assert(urls, gt`Could not find OAuth2 config for ${this.hostname}`);
        this.oAuth2 = new OAuth2(this, urls.tokenURL, urls.authURL, urls.authDoneURL, urls.scope, urls.clientID, urls.clientSecret, urls.doPKCE);
        this.oAuth2.setTokenURLPasswordAuth(urls.tokenURLPasswordAuth);
      }
      await this.oAuth2.login(true);
      options.headers.Authorization = this.oAuth2.authorizationHeader;
    } else {
      options.headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(`${this.username}:${this.password}`)))}`;
    }
    let response = await appGlobal.remoteApp.optionsHTTP(this.url, options);
    if (response.ok) {
      let versions = (response.MSASProtocolVersions || "").split(",");
      if (versions.includes("14.1")) {
        this.protocolVersion = versions.includes("16.1") ? "16.1" : "14.1";
        this.setStorageItem("protocolVersion", this.protocolVersion);
        return;
      } else if (versions.includes("14.0")) {
        this.protocolVersion = "14.0";
        this.setStorageItem("protocolVersion", this.protocolVersion);
        return;
      }
      throw new Error(`ActiveSync version(s) ${response.MSASProtocolVersions} not supported`);
    }
    if (response.status == 401) {
      const repeat = async () => {
        this.retries++;
        let result = await this.verifyLogin(); // repeat the call
        this.retries = 0;
        return result;
      }
      if (this.retries) {
        let ex = Error(`HTTP ${response.status} ${response.statusText}`);
        throw new LoginError(ex, gt`Login failed`);
      } else if (this.oAuth2) {
        this.oAuth2.reset();
        await this.oAuth2.login(false); // will throw error, if interactive login is needed
        return repeat();
      } else if (!/\bBasic\b/.test(response.WWWAuthenticate)) {
        throw this.fatalError = new ConnectError(null,
          "Unsupported authentication protocol(s): " + response.WWWAuthenticate);
      } else {
        throw this.fatalError = new LoginError(null,
          "Password incorrect");
      }
    }
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  /**
   * The device ID only needs to be unique per device,
   * so we only have to generate it once.
   */
  getDeviceID(): string {
    let deviceID = localStorage.getItem("active_sync.device_id");
    if (deviceID) {
      return deviceID;
    }
    let array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    deviceID = Array.from(array, value => value.toString(16).padStart(8, "0")).join("");
    localStorage.setItem("active_sync.device_id", deviceID);
    return deviceID;
  }

  /**
   * Make HTTP call to server
   * @param aOptions.allowV16 Don't auto-downgrade 16.1 to 14.1
   * @returns JSON returned from the server
   */
  async callEAS(aCommand: string, aRequest: any, aOptions: any = {}): Promise<any> {
    let url = new URL(this.url);
    url.searchParams.append("Cmd", aCommand);
    url.searchParams.append("User", this.username);
    url.searchParams.append("DeviceID", this.getDeviceID());
    url.searchParams.append("DeviceType", "UniversalOutlook");
    let heartbeat = aOptions.heartbeat ?? 0;
    let options: any = {
      throwHttpErrors: false,
      headers: {
        "Content-Type": "application/vnd.ms-sync.wbxml",
        "MS-ASProtocolVersion": this.protocolVersion == "16.1" && !aOptions.allowV16 ? "14.1" : this.protocolVersion,
        Cookie: `DefaultAnchorMailbox=${encodeURI(this.emailAddress)}`, // required for 14.0
      },
      timeout: heartbeat * 1000 + 10000, // extra timeout for Ping commands
    };
    if (this.oAuth2) {
      options.headers.Authorization = this.oAuth2.authorizationHeader;
    } else {
      options.headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(`${this.username}:${this.password}`)))}`;
    }
    if (await this.policyKey) {
      options.headers["X-MS-PolicyKey"] = await this.policyKey;
    }
    let wbxml = await request2WBXML({ [aCommand]: aRequest });
    await this.throttle.throttle();
    let lock = await this.semaphore.lock();
    let response: any;
    try {
      response = await appGlobal.remoteApp.postHTTP(String(url), wbxml, "arrayBuffer", options);
    } finally {
      lock.release();
    }
    this.fatalError = null;
    if (response.ok) {
      // ActiveSync short cut for when there are no changes to sync
      if (!response.data.length) {
        return null;
      }
      let wbxmljs = WBXML2JSON(response.data);
      if (wbxmljs.Status > 140 && wbxmljs.Status < 145 && aCommand != "Provision") {
        // We need to provision (or re-provision). Use a Promise so that
        // parallel calls wait for it too.
        this.policyKey = this.provision();
        options.headers["X-MS-PolicyKey"] = await this.policyKey;
        response = appGlobal.remoteApp.postHTTP(String(url), wbxml, "arrayBuffer", options);
        if (!response.data.length) {
          return null;
        }
        wbxmljs = WBXML2JSON(response.data);
      }
      // The Ping command has its own status codes for some reason.
      if (!wbxmljs.Status || wbxmljs.Status == "1" || aCommand == "Ping") {
        return wbxmljs;
      }
      if (this.isThrottleError(wbxmljs.Status)) {
        aOptions.heartbeat = heartbeat;
        return await this.callEAS(aCommand, aRequest, aOptions);
      }
      this.throttle.waitForSecond(1);
      throw new ActiveSyncError(aCommand, wbxmljs.Status, this);
    }
    if (response.status == 401) {
      const repeat = async () => {
        aOptions.isRepeating = true;
        return await this.callEAS(aCommand, aRequest, aOptions); // repeat the call
      }
      if (aOptions.isRepeating) {
        let ex = Error(`HTTP ${response.status} ${response.statusText}`);
        throw new LoginError(ex, gt`Login failed`);
      } else if (this.oAuth2) {
        this.oAuth2.reset();
        await this.oAuth2.login(false); // will throw error, if interactive login is needed
        return repeat();
      } else if (!/\bBasic\b/.test(response.WWWAuthenticate)) {
        throw this.fatalError = new ConnectError(null,
          "Unsupported authentication protocol(s): " + response.WWWAuthenticate);
      } else {
        throw this.fatalError = new LoginError(null,
          "Password incorrect");
      }
    }
    this.throttle.waitForSecond(1);
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  isThrottleError(status: string): boolean {
    if (status == "111") { // Retryable server error
      if (++this.retries > 5) {
        return false;
      }
      this.throttle.waitForSecond(5);
      return true;
    }
    this.retries = 0;
    return false;
  }

  /**
   * Obtain a new policy key.
   */
  async provision(): Promise<string> {
    let request: any = {
      DeviceInformation: {
        Set: {
          Model: "Computer",
        },
      },
      Policies: {
        Policy: {
          PolicyType: "MS-EAS-Provisioning-WBXML",
        },
      },
    };
    if (this.protocolVersion == "14.0") {
      delete request.DeviceInformation;
    }
    let policy = await this.callEAS("Provision", request);
    if (policy.Policies.Policy.Status != "1") {
      throw new ActiveSyncError("Provision", policy.Policies.Policy.Status, this);
    }
    delete request.DeviceInformation;
    request.Policies.Policy.PolicyKey = policy.Policies.Policy.PolicyKey;
    request.Policies.Policy.Status = "1";
    policy = await this.callEAS("Provision", request);
    if (policy.Policies.Policy.Status != "1") {
      throw new ActiveSyncError("Provision", policy.Policies.Policy.Status, this);
    }
    let policyKey = policy.Policies.Policy.PolicyKey;
    this.setStorageItem("policy_key", policyKey);
    return policyKey;
  }

  /**
   * Perform a folder request (discovery or modification).
   * Each request changes the global sync key, so they must be queued in turn.
   */
  async queuedRequest(command: string, request: any, callback?: (response: any) => Promise<void>): Promise<any> {
    while (this.syncKeyBusy) try {
      await this.syncKeyBusy;
    } catch (ex) {
      // If the function currently holding the sync key throws, we don't care.
    }
    try {
      this.syncKeyBusy = this.makeRequest(command, request, callback);
      return await this.syncKeyBusy;
    } finally {
      this.syncKeyBusy = null;
    }
  }

  protected async makeRequest(command: string, request: any, callback?: (response: any) => Promise<void>): Promise<any> {
    try {
      // The SyncKey must be the first element of the request.
      request = Object.assign({ SyncKey: this.getStorageItem("sync_key") || "0" }, request);
      let response = await this.callEAS(command, request);
      await callback?.(response);
      this.setStorageItem("sync_key", response.SyncKey);
      return response;
    } catch (ex) {
      if (callback && ex.code == kFolderSyncKeyError) {
        // Try to resync from start.
        let response = await this.callEAS(command, { SyncKey: "0" });
        response.errorCode = ex.code;
        await callback(response);
        this.setStorageItem("sync_key", response.SyncKey);
        return response;
      }
      throw ex;
    }
  }

  async listFolders(): Promise<void> {
    await this.storage.readFolderHierarchy(this);
    if (this.rootFolders.isEmpty) {
      this.setStorageItem("sync_key", "0");
    }

    let missingFolders = new ArrayColl<Folder>();
    await this.queuedRequest("FolderSync", {}, async response => {
      if (response.errorCode == kFolderSyncKeyError) {
        // We're syncing from scratch, so we may have stale folders.
        missingFolders = this.getAllFolders();
      }
      let url = new URL(this.url);
      for (let change of ensureArray(response.Changes?.Add).concat(ensureArray(response.Changes?.Update))) {
        try {
          url.searchParams.set("serverID", change.ServerId);
          switch (change.Type) {
          case FolderType.OtherSpecialFolder:
          case FolderType.Inbox:
          case FolderType.Drafts:
          case FolderType.Trash:
          case FolderType.Sent:
          case FolderType.Outbox:
          case FolderType.UserFolder:
            let folder = this.findFolderById(change.ServerId) || this.newFolder();
            folder.fromWBXML(change);
            let parent = this.findFolderById(change.ParentId);
            if (parent != folder.parent) {
              folder.removeFromParent();
              folder.parent = parent;
            }
            folder.addToParent();
            await folder.save();
            missingFolders.remove(folder);
            break;
          case FolderType.Tasks:
          case FolderType.UserTasks:
            // Mustang doesn't support tasks yet, fortunately.
            break;
          case FolderType.Calendar:
          case FolderType.UserCalendar:
            // TODO compare calendar ID
            let calendar = appGlobal.calendars.find((calendar: ActiveSyncCalendar) => calendar.mainAccount == this) as ActiveSyncCalendar | null;
            console.log("found the ActS cal again", calendar?.name);
            if (calendar) {
              calendar.name = change.DisplayName;
            } else {
              calendar = newCalendarForProtocol("calendar-activesync") as ActiveSyncCalendar;
              calendar.name = change.DisplayName;
              calendar.url = url.toString();
              calendar.username = this.username;
              calendar.workspace = this.workspace;
              calendar.mainAccount = this;
              appGlobal.calendars.add(calendar);
            }
            break;
          case FolderType.Contacts:
          case FolderType.UserContacts:
            // TODO compare addressbook ID
            let addressbook = appGlobal.addressbooks.find((addressbook: ActiveSyncAddressbook) => addressbook.mainAccount == this) as ActiveSyncAddressbook | null;
            console.log("found the ActS AB again", addressbook?.name);
            if (addressbook) {
              addressbook.name = change.DisplayName;
            } else {
              addressbook = newAddressbookForProtocol("addressbook-activesync") as ActiveSyncAddressbook;
              addressbook.name = change.DisplayName;
              addressbook.url = url.toString();
              addressbook.username = this.username;
              addressbook.workspace = this.workspace;
              addressbook.mainAccount = this;
              appGlobal.addressbooks.add(addressbook);
            }
            break;
          }
        } catch (ex) {
          this.errorCallback(ex);
        }
      }
      for (let deletion of ensureArray(response.Changes.Delete)) {
        try {
          let folder = this.findFolderById(deletion.ServerId);
          if (folder) {
            this.removePingable(folder);
            await this.storage.deleteFolder(folder);
            folder.removeFromParent();
          }
          let url = new URL(this.url);
          url.searchParams.set("serverID", deletion.ServerId);
          let addressbook = appGlobal.addressbooks.find((addressbook: ActiveSyncAddressbook) => addressbook.protocol == "addressbook-activesync" && addressbook.url == url.toString() && addressbook.username == this.username) as ActiveSyncAddressbook | void;
          if (addressbook) {
            this.removePingable(addressbook);
            addressbook.deleteIt();
          }
          let calendar = appGlobal.calendars.find((calendar: ActiveSyncCalendar) => calendar.protocol == "calendar-activesync" && calendar.url == url.toString() && calendar.username == this.username) as ActiveSyncCalendar | void;
          if (calendar) {
            this.removePingable(calendar);
            calendar.deleteIt();
          }
        } catch (ex) {
          this.errorCallback(ex);
        }
      }
    });
    // Iterate from deepest to shallowest
    for (let folder of missingFolders.reverse()) {
      await folder.deleteItLocally();
    }
  }

  findFolderById(id: string): ActiveSyncFolder | null {
    return this.findFolder(folder => folder.id == id) as ActiveSyncFolder | null;
  }

  addPingable(pingable: ActiveSyncPingable) {
    // Make this the most recent pingable.
    this.pingsMRU.remove(pingable);
    this.pingsMRU.add(pingable);
    if (!this.listening) {
      this.listenForPings();
    }
  }

  removePingable(pingable: ActiveSyncPingable) {
    this.pingsMRU.remove(pingable);
  }

  trimPings() {
    while (this.pingsMRU.length > this.maxPings) {
      this.removePingable(this.pingsMRU.find(pingable => pingable.folderClass == "Email"));
    }
  }

  async listenForPings() {
    try {
      this.listening = true;
      while (this.pingsMRU.hasItems) {
        let request = {
          HeartbeatInterval: String(this.heartbeat),
          Folders: {
            Folder: this.pingsMRU.contents.map(pingable => ({ Id: pingable.serverID, Class: pingable.folderClass })),
          },
        };
        let response = await this.callEAS("Ping", request, { heartbeat: this.heartbeat });
        switch (response.Status) {
        case "1":
          continue;
        case "2":
          for (let serverID of ensureArray(response.Folders.Folder)) {
            let pingable = this.pingsMRU.find(pingable => pingable.serverID == serverID);
            pingable?.ping();
          }
          continue;
        case "5":
          this.heartbeat = sanitize.integer(response.HeartbeatInterval);
          continue;
        case "6":
          this.maxPings = sanitize.integer(response.MaxFolders);
          this.trimPings();
          continue;
        case "7":
          await this.listFolders();
          continue;
        default:
          throw new ActiveSyncError("Ping", response.Status, this);
        }
      }
    } catch (ex) {
      this.errorCallback(ex);
    } finally {
      this.listening = false;
    }
  }

  isOffice365(): boolean {
    let hostname = new URL(this.url).hostname;
    return hostname == "outlook.office365.com";
  }

  async createToplevelFolder(name: string): Promise<ActiveSyncFolder> {
    let request = {
      ParentId: "0",
      DisplayName: name,
      Type: "1",
    };
    let result = await this.queuedRequest("FolderCreate", request);
    // We're required to sync the folder hierarchy after creating a folder.
    // This would normally perform the folder creation steps for us,
    // but unfortunately the API wants us to return the new folder,
    // even though nobody ever uses it, so we have to jump through hoops.
    let folder = await super.createToplevelFolder(name) as ActiveSyncFolder;
    folder.id = sanitize.nonemptystring(result.ServerId);
    await this.listFolders();
    return folder;
  }
}
