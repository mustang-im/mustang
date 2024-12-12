import { AuthMethod, MailAccount, TLSSocketType } from "../MailAccount";
import type { EMail } from "../EMail";
import { kMaxCount, ActiveSyncFolder, FolderType } from "./ActiveSyncFolder";
import { ActiveSyncError } from "./ActiveSyncError";
import { SMTPAccount } from "../SMTP/SMTPAccount";
import { newAddressbookForProtocol} from "../../Contacts/AccountsList/Addressbooks";
import type { ActiveSyncAddressbook } from "../../Contacts/ActiveSync/ActiveSyncAddressbook";
import { newCalendarForProtocol} from "../../Calendar/AccountsList/Calendars";
import type { ActiveSyncCalendar } from "../../Calendar/ActiveSync/ActiveSyncCalendar";
import { OAuth2 } from "../../Auth/OAuth2";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import { request2WBXML, WBXML2JSON } from "./WBXML";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { ensureArray, assert, NotSupported } from "../../util/util";
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
  readonly pingsMRU = new ArrayColl<ActiveSyncPingable>();
  heartbeat = 60;
  maxPings = kMaxCount;
  listening = false;
  policyKey: Promise<string> | string;
  syncKeyBusy: Promise<any> | null;
  protocolVersion: string;

  constructor() {
    super();
    this.policyKey = this.getStorageItem("policy_key");
    assert(appGlobal.remoteApp.optionsHTTP, "ActiveSync: Need backend");
  }

  newFolder(): ActiveSyncFolder {
    return new ActiveSyncFolder(this);
  }

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
        throw new ActiveSyncError("Settings", response.DeviceInformation.Status);
      }
    }

    await this.listFolders();

    for (let addressbook of appGlobal.addressbooks) {
      if (addressbook.protocol == "addressbook-activesync" && addressbook.url.startsWith(this.url + "?") && addressbook.username == this.username) {
        (addressbook as ActiveSyncAddressbook).account = this;
        await (addressbook as ActiveSyncAddressbook).listContacts();
      }
    }

    for (let calendar of appGlobal.calendars) {
      if (calendar.protocol == "calendar-activesync" && calendar.url.startsWith(this.url + "?") && calendar.username == this.username) {
        (calendar as ActiveSyncCalendar).account = this;
        await (calendar as ActiveSyncCalendar).listEvents();
      }
    }
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
      Mime: await SMTPAccount.getMIME(email),
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
        this.protocolVersion = "14.1";
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
      if (this.oAuth2) {
        this.oAuth2.reset();
        await this.oAuth2.login(false); // will throw error, if interactive login is needed
        return await this.verifyLogin(); // repeat the call
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

  async callEAS(aCommand: string, aRequest: any, heartbeat = 0): Promise<any> {
    let url = new URL(this.url);
    url.searchParams.append("Cmd", aCommand);
    url.searchParams.append("User", this.username);
    url.searchParams.append("DeviceID", this.getDeviceID());
    url.searchParams.append("DeviceType", "UniversalOutlook");
    let options: any = {
      throwHttpErrors: false,
      headers: {
        "Content-Type": "application/vnd.ms-sync.wbxml",
        "MS-ASProtocolVersion": this.protocolVersion,
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
    let response = await appGlobal.remoteApp.postHTTP(String(url), wbxml, "arrayBuffer", options);
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
      throw new ActiveSyncError(aCommand, wbxmljs.Status);
    }
    if (response.status == 401) {
      if (this.oAuth2) {
        this.oAuth2.reset();
        await this.oAuth2.login(false); // will throw error, if interactive login is needed
        return await this.callEAS(aCommand, aRequest); // repeat the call
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
      throw new ActiveSyncError("Provision", policy.Policies.Policy.Status);
    }
    delete request.DeviceInformation;
    request.Policies.Policy.PolicyKey = policy.Policies.Policy.PolicyKey;
    request.Policies.Policy.Status = "1";
    policy = await this.callEAS("Provision", request);
    if (policy.Policies.Policy.Status != "1") {
      throw new ActiveSyncError("Provision", policy.Policies.Policy.Status);
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
      let response = await this.callEAS(command, Object.assign({ SyncKey: this.getStorageItem("sync_key") || "0" }, request));
      await callback?.(response);
      this.setStorageItem("sync_key", response.SyncKey);
      return response;
    } catch (ex) {
      if (callback && ex.code == kFolderSyncKeyError) {
        // Try to resync from start.
        let response = await this.callEAS(command, { SyncKey: "0" });
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

    await this.queuedRequest("FolderSync", {}, async response => {
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
            break;
          case FolderType.Tasks:
          case FolderType.UserTasks:
            // Mustang doesn't support tasks yet, fortunately.
            break;
          case FolderType.Calendar:
          case FolderType.UserCalendar:
            let calendar = appGlobal.calendars.find((calendar: ActiveSyncCalendar) => calendar.protocol == "addressbook-activesync" && calendar.url == url.toString() && calendar.username == this.username) as ActiveSyncCalendar | void;
            if (calendar) {
              calendar.name = change.DisplayName;
            } else {
              calendar = newCalendarForProtocol("calendar-activesync") as ActiveSyncCalendar;
              calendar.name = change.DisplayName;
              calendar.url = url.toString();
              calendar.username = this.emailAddress;
              calendar.workspace = this.workspace;
              appGlobal.calendars.add(calendar);
            }
            break;
          case FolderType.Contacts:
          case FolderType.UserContacts:
            let addressbook = appGlobal.addressbooks.find((addressbook: ActiveSyncAddressbook) => addressbook.protocol == "addressbook-activesync" && addressbook.url == url.toString() && addressbook.username == this.username) as ActiveSyncAddressbook | void;
            if (addressbook) {
              addressbook.name = change.DisplayName;
            } else {
              addressbook = newAddressbookForProtocol("addressbook-activesync") as ActiveSyncAddressbook;
              addressbook.name = change.DisplayName;
              addressbook.url = url.toString();
              addressbook.username = this.emailAddress;
              addressbook.workspace = this.workspace;
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
        let response = await this.callEAS("Ping", request, this.heartbeat);
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
        default:
          throw new ActiveSyncError("Ping", response.Status);
        }
      }
    } catch (ex) {
      this.errorCallback(ex);
    } finally {
      this.listening = false;
    }
  }
}
