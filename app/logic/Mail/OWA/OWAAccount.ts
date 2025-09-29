import { MailAccount } from "../MailAccount";
import { AuthMethod } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import type { EMail } from "../EMail";
import { OWAFolder } from "./OWAFolder";
import { OWAError } from "./OWAError";
import type { OWANotifications } from "./Notification/OWANotifications";
import { OWAExchangeNotifications } from "./Notification/OWAExchangeNotifications";
import { OWAOffice365Notifications } from "./Notification/OWAOffice365Notifications";
import { newAddressbookForProtocol } from "../../Contacts/AccountsList/Addressbooks";
import type { OWAAddressbook } from "../../Contacts/OWA/OWAAddressbook";
import { newCalendarForProtocol} from "../../Calendar/AccountsList/Calendars";
import type { OWACalendar } from "../../Calendar/OWA/OWACalendar";
import { OWACreateItemRequest } from "./Request/OWACreateItemRequest";
import { OWASubscribeToNotificationRequest } from "./Request/OWASubscribeToNotificationRequest";
import { owaCreateNewTopLevelFolderRequest, owaFindFoldersRequest, owaSharedFolderRequest } from "./Request/OWAFolderRequests";
import { OWALoginBackground } from "./Login/OWALoginBackground";
import type { PersonUID } from "../../Abstract/PersonUID";
import type { OAuth2 } from "../../Auth/OAuth2";
import { OAuth2UIMethod } from "../../Auth/UI/OAuth2UIMethod";
import { OWAAuth } from "../../Auth/OWAAuth";
import { ContentDisposition } from "../../Abstract/Attachment";
import { LoginError } from "../../Abstract/Account";
import { ensureLicensed } from "../../util/LicenseClient";
import { appGlobal } from "../../app";
import { Semaphore } from "../../util/Semaphore";
import { Throttle } from "../../util/Throttle";
import { notifyChangedProperty } from "../../util/Observable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, blobToBase64, NotSupported } from "../../util/util";
import { gt } from "../../../l10n/l10n";

export class OWAAccount extends MailAccount {
  readonly protocol: string = "owa";
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  readonly canSendInvitations: boolean = false;
  readonly folderMap = new Map<string, OWAFolder>;
  /**
   * We get notifications for folders we're not interested in.
   * We filter them out by checking that the parent exists.
   * But we have to special-case the root folder,
   * since Mustang doesn't use a dedicated root folder object.
   */
  msgFolderRootID: string | undefined;
  @notifyChangedProperty
  hasLoggedIn = false;
  protected notifications: OWANotifications;
  throttle = new Throttle(50, 1);
  semaphore = new Semaphore(20);

  constructor() {
    super();
    assert(appGlobal.remoteApp.OWA, "OWA: Need backend");
  }

  newFolder(): OWAFolder {
    return new OWAFolder(this);
  }

  /**
   * The cookie jar used for OWA requests. This allows you to have
   * multiple OWA accounts for the same host.
   */
  get partition(): string {
    return 'persist:' + this.webSessionID;
  }

  // See below as to why this doesn't use OAuth2.
  get isLoggedIn(): boolean {
    return this.hasLoggedIn;
  }

  async testLoggedIn(): Promise<boolean> {
    assert(!this.hasLoggedIn, "Only for use during login");
    let url = this.url + 'service.svc';
    let options = { headers: { Action: "FindFolder" } };
    let bodyJSON = Object.assign({}, owaFindFoldersRequest(false)); // Remove class before JPC, not needed for JSON
    let  response = await appGlobal.remoteApp.OWA.fetchJSON(this.partition, url, options, bodyJSON);
    if ([401, 440].includes(response.status)) {
      return false;
    }
    if (!response.json && response.url != url && response.contentType?.toLowerCase().split(";")[0].trim() == "text/html") {
      return false;
    }
    return true;
  }

  async verifyLogin(): Promise<void> {
    await this.loginCommon(true);
  }

  /**
   * OWA full page login resembles OAuth2, so we label it as such,
   * although it's actually Office 365 itself doing its own OAuth2.
   */
  protected async loginCommon(interactive: boolean): Promise<void> {
    if (this.authMethod == AuthMethod.OAuth2) {
      if (!this.oAuth2) {
        this.oAuth2 = new OWAAuth(this);
      }
      await this.oAuth2.login(interactive);
    } else if (!await this.testLoggedIn()) {
      let elements = await OWALoginBackground.findLoginElements(this.url, this.partition);
      if (!elements) {
        throw new Error(gt`Could not find login form`);
      }
      let response = await OWALoginBackground.submitLoginForm(this.username, this.password, this.partition, elements);
      let formURL = new URL(elements.url);
      let responseURL = new URL(response.url);
      if (response.status == 401 || responseURL.origin == formURL.origin && responseURL.pathname == formURL.pathname && responseURL.searchParams.get("reason") == "2") {
        throw new LoginError(null, gt`Password incorrect`);
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      if (!await this.testLoggedIn()) {
        throw new LoginError(null, `Login check failed`);
      }
    }
  }

  async login(interactive: boolean): Promise<void> {
    await ensureLicensed();
    await super.login(interactive);
    await this.loginCommon(interactive);
    this.hasLoggedIn = true;
    await this.listFolders();

    let response = await this.callOWA(new OWAGetPeopleFiltersRequest());
    for (let filter of response) {
      if (filter.IsReadOnly) {
        continue;
      }
      let addressbook = appGlobal.addressbooks.find((addressbook: OWAAddressbook) => addressbook.mainAccount == this && addressbook.folderID == filter.FolderId.Id) as OWAAddressbook | undefined;
      if (!addressbook) {
        addressbook = newAddressbookForProtocol("addressbook-owa") as OWAAddressbook;
        addressbook.name = `${this.name} ${filter.DisplayName}`;
        addressbook.url = this.url;
        addressbook.username = this.username;
        addressbook.workspace = this.workspace;
        addressbook.icon = this.icon;
        addressbook.color = this.color;
        addressbook.folderID = filter.FolderId.Id;
        addressbook.mainAccount = this;
        appGlobal.addressbooks.add(addressbook);
      }
      addressbook.icon ??= this.icon; // Migration, remove later
      addressbook.color ??= this.color;
      addressbook.save();
      await addressbook.listContacts();
    }

    for (let calendar of appGlobal.calendars) {
      if (calendar.mainAccount == this) {
        await calendar.listEvents();
      }
    }

    await this.callOWA(new OWASubscribeToNotificationRequest());

    this.notifications = this.isOffice365()
      ? new OWAOffice365Notifications(this)
      : new OWAExchangeNotifications(this);
    this.notifications.start()
      .catch(this.errorCallback);
  }

  async logout(): Promise<void> {
    this.hasLoggedIn = false;
    if (this.oAuth2) {
      await this.oAuth2.logout();
    } else {
      await appGlobal.remoteApp.OWA.clearStorageData(this.partition);
    }
  }

  needsLicense(): boolean {
    return true;
  }

  /**
   * This uses Exchange to construct the message rather than
   * building the MIME ourselves.
   */
  async send(email: EMail): Promise<void> {
    if (email.iCalMethod) {
      throw new NotSupported("Please use Exchange APIs to send iMIP messages");
    }
    assert(email.folder?.id, "Need folder to save the sent email in");
    let request = new OWACreateItemRequest({ SavedItemFolderId: { __type: "TargetFolderId:#Exchange", BaseFolderId: { __type: "FolderId:#Exchange", Id: email.folder.id } }, MessageDisposition: "SendAndSaveCopy" });
    request.addField("Message", "ItemClass", "IPM.Note", "item:ItemClass");
    request.addField("Message", "Subject", email.subject, "item:Subject");
    request.addField("Message", "Body", {
      __type: "BodyContentType:#Exchange",
      BodyType: email.html ? "HTML" : "Text",
      Value: email.html || email.text,
    }, "item:Body");
    if (email.attachments.hasItems) {
      request.addField("Message", "Attachments", await Promise.all(email.attachments.contents.map(async attachment => ({
        __type: "FileAttachment:#Exchange",
        Name: attachment.filename,
        ContentType: attachment.mimeType,
        ContentID: attachment.contentID,
        Size: attachment.size,
        IsInline: attachment.disposition == ContentDisposition.inline,
        Content: await blobToBase64(attachment.content),
      }))), "item:Attachments");
    }
    if (email.headers.hasItems) {
      request.addField("Message", "ExtendedProperty", [...email.headers.entries()].map(([header, value]) => ({
        ExtendedFieldURI: {
          PropertyName: header,
          DistinguishedPropertySetId: "InternetHeaders",
          PropertyType: "String",
        },
        Value: value,
      })), null);
    }
    if (email.inReplyTo) {
      request.addField("Message", "InReplyTo", email.inReplyTo, "item:InReplyTo");
    }
    if (email.replyTo) {
      addRecipients(request, "ReplyTo", [email.replyTo]);
    }
    request.addField("Message", "From", { Name: email.from.name, EmailAddress: email.from.emailAddress }, "message:From");
    addRecipients(request, "ToRecipients", email.to.contents);
    addRecipients(request, "CcReipients", email.cc.contents);
    addRecipients(request, "BccRecipients", email.bcc.contents);
    await this.callOWA(request);
  }

  async callOWA(aRequest: any, aMailbox?: string): Promise<any> {
    if (!this.hasLoggedIn) {
      throw new LoginError(null, "Please login");
    }
    let url = this.url + 'service.svc';
    let options = {
      headers: aMailbox ? {
        Action: aRequest.action,
        "x-anchormailbox": aMailbox,
        "x-customowascenariodata": "MailboxAccess:SharedMailbox,ExplicitLogon",
        "x-owa-explicitlogonuser": aMailbox,
      } : {
        Action: aRequest.action,
      },
    };
    // Body needs to get passed via JPC as a regular object, not an object instance
    let bodyJSON = Object.assign({}, aRequest);
    await this.throttle.throttle();
    let lock = await this.semaphore.lock();
    let response: any;
    try {
      response = await appGlobal.remoteApp.OWA.fetchJSON(this.partition, url, options, bodyJSON);
    } finally {
      lock.release();
    }
    if ([401, 440].includes(response.status)) {
      await this.logout();
      throw new LoginError(null, "Please login");
    }
    if (!response.ok) {
      this.throttle.waitForSecond(1);
      throw new OWAError(response);
    }
    if (!response.json && response.url != url && response.contentType?.toLowerCase().split(";")[0].trim() == "text/html") {
      await this.logout();
      throw new Error(response.message);
    }
    let result = response.json;
    if (result.Body) {
      result = result.Body;
    }
    if (result.ResponseMessages?.Items?.length == 1) {
      result = result.ResponseMessages.Items[0];
    }
    if (this.isThrottleError(result)) {
      return await this.callOWA(aRequest);
    }
    if (result.MessageText) {
      this.throttle.waitForSecond(1);
      throw new OWAError(response);
    }
    return result;
  }

  async listFolders(): Promise<void> {
    await this.throttle.throttle();
    let result = await this.callOWA(owaFindFoldersRequest(true));
    this.folderMap.clear();
    this.msgFolderRootID = result.RootFolder.ParentFolder.FolderId.Id;
    for (let folder of result.RootFolder.Folders) {
      if (!folder.FolderClass || folder.FolderClass == "IPF.Note" || folder.FolderClass.startsWith("IPF.Note.")) {
        let parent = this.folderMap.get(folder.ParentFolderId.Id);
        let parentFolders = parent ? parent.subFolders : this.rootFolders;
        let owaFolder = parentFolders.find(owaFolder => owaFolder.id == folder.FolderId.Id) as OWAFolder;
        if (!owaFolder) {
          owaFolder = this.findFolder(owaFolder => owaFolder.id == folder.FolderId.Id) as OWAFolder
            ?? this.newFolder();
          let oldParentFolders = owaFolder.parent?.subFolders || this.rootFolders;
          oldParentFolders.remove(owaFolder);
          owaFolder.parent = parent || null;
          parentFolders.push(owaFolder);
        }
        owaFolder.fromJSON(folder);
        this.folderMap.set(folder.FolderId.Id, owaFolder);
      } else if (folder.FolderClass == "IPF.Appointment") {
        let calendar = appGlobal.calendars.find((calendar: OWACalendar) => calendar.mainAccount == this && calendar.folderID == folder.FolderId.Id) as OWACalendar | undefined;
        if (!calendar) {
          calendar = newCalendarForProtocol("calendar-owa") as OWACalendar;
          calendar.name = `${this.name} ${folder.DisplayName}`;
          calendar.url = this.url;
          calendar.username = this.username;
          calendar.workspace = this.workspace;
          calendar.icon = this.icon;
          calendar.color = this.color;
          calendar.folderID = folder.FolderId.Id;
          calendar.mainAccount = this;
          appGlobal.calendars.add(calendar);
        }
        calendar.icon ??= this.icon; // Migration, remove later
        calendar.color ??= this.color;
        await calendar.save();
        calendar.isInvitationCalendar = folder.DistinguishedFolderId == "calendar";
      }
    }
    // Iterate from deepest to shallowest
    for (let folder of this.getAllFolders().reverse()) {
      if (!this.folderMap.has(folder.id)) {
        await folder.deleteItLocally();
      }
    }
  }

  protected isThrottleError(result: any): boolean {
    if (result.MessageText &&
        (result.ResponseCode == "OverBudgetException" ||
         result.ResponseCode == "ErrorTooManyObjectsOpened")) {
      let match = result.MessageText.match(/'MaxConcurrency'.*'(\d+)'.*'Owa'/);
      let maxConcurrency = match ? Number(match[1]) : this.semaphore.countRunning + 1;
      if (maxConcurrency < this.semaphore.maxParallel) {
        const minConcurrency = 3;
        this.semaphore.maxParallel = Math.max(maxConcurrency, minConcurrency);
        console.log(`Server busy, reduced max concurrency to ${this.semaphore.maxParallel}`);
      }
      this.throttle.waitForSecond(5);
      return true;
    }
    return false;
  }

  isOffice365(): boolean {
    let hostname = new URL(this.url).hostname;
    return hostname == "outlook.office.com" || hostname == "outlook.live.com";
  }

  async createToplevelFolder(name: string): Promise<OWAFolder> {
    let result = await this.callOWA(owaCreateNewTopLevelFolderRequest(name));
    let folder = await super.createToplevelFolder(name) as OWAFolder;
    folder.id = sanitize.nonemptystring(result.Folders[0].FolderId.Id);
    this.folderMap.set(folder.id, folder);
    return folder;
  }

  async onNotificationMessages(messages: any[][]) {
    let newMessageIDs: string[] = [];
    for (let message of messages) {
      for (let notification of message) {
        switch (notification.id) {
        case "HierarchyNotification":
          this.handleHierarchyNotification(notification);
          break;
        case "NewMailNotification":
          newMessageIDs.push(notification.ItemId);
          break;
        default:
          //console.log(notification);
          break;
        }
      }
    }
    if (newMessageIDs.length) {
      let inbox = this.inbox as OWAFolder;
      let newMessages = await inbox.getNewMessageHeaders(newMessageIDs);
      inbox.messages.addAll(newMessages);
      inbox.downloadMessages(newMessages);
      inbox.dirty = false; // probably
    }
  }

  protected handleHierarchyNotification(notification: any) {
    try {
      let addressbook = appGlobal.addressbooks.find((addressbook: OWAAddressbook) => addressbook.mainAccount == this && addressbook.folderID == notification.folderId) as OWAAddressbook | null;
      if (addressbook) {
        addressbook.listContacts().catch(this.errorCallback);
        return;
      }
      let calendar = appGlobal.calendars.find((calendar: OWACalendar) => calendar.mainAccount == this && calendar.folderID == notification.folderId) as OWACalendar | null;
      if (calendar) {
        calendar.listEvents().catch(this.errorCallback);
        return;
      }
      let parent = this.folderMap.get(notification.parentFolderId);
      if (!parent && notification.parentFolderId != this.msgFolderRootID) {
        return;
      }
      let folder = this.folderMap.get(notification.folderId);
      if (!folder) {
        let parentFolders = parent ? parent.subFolders : this.rootFolders;
        folder = this.newFolder();
        folder.parent = parent || null;
        parentFolders.push(folder);
        this.folderMap.set(notification.folderId, folder);
      }
      folder.fromJSON({
        FolderId: { Id: notification.folderId },
        DisplayName: notification.displayName,
        TotalCount: notification.itemCount,
        UnreadCount: notification.unreadCount,
      });
      // We get hierachy notifications for e.g. flag changes,
      // so we should always refresh a folder after a notification.
      folder.dirty = true;
    } catch (ex) {
      this.errorCallback(ex);
    }
  }

  async addSharedAddressbook(person: PersonUID) {
    let result = await this.callOWA(owaSharedFolderRequest("contacts", person.emailAddress));
    let folder = result.Folders[0];
    let addressbook = newAddressbookForProtocol("addressbook-owa") as OWAAddressbook;
    addressbook.name = `${person.name} ${folder.DisplayName}`;
    addressbook.url = this.url;
    addressbook.username = person.emailAddress;
    addressbook.workspace = this.workspace;
    addressbook.icon = this.icon;
    addressbook.color = this.color;
    addressbook.folderID = folder.FolderId.Id;
    addressbook.mainAccount = this;
    appGlobal.addressbooks.add(addressbook);
    await addressbook.listContacts();
  }

  async addSharedCalendar(person: PersonUID) {
    let result = await this.callOWA(owaSharedFolderRequest("calendar", person.emailAddress));
    let folder = result.Folders[0];
    let calendar = newCalendarForProtocol("calendar-owa") as OWACalendar;
    calendar.name = `${person.name} ${folder.DisplayName}`;
    calendar.url = this.url;
    calendar.username = person.emailAddress;
    calendar.workspace = this.workspace;
    calendar.icon = this.icon;
    calendar.color = this.color;
    calendar.folderID = folder.FolderId.Id;
    calendar.mainAccount = this;
    appGlobal.calendars.add(calendar);
    await calendar.listEvents();
  }
}

function addRecipients(aRequest: any, aType: string, aRecipients: PersonUID[]): void {
  if (!aRecipients.length) {
    return;
  }
  aRequest.addField("Message", aType, aRecipients.map(recipient => ({
    Name: recipient.name,
    EmailAddress: recipient.emailAddress,
  })), "message:" + aType);
}

class OWAGetPeopleFiltersRequest {
  /** This is an empty request, but it still needs an action. */
  get action() {
    return "GetPeopleFilters";
  }
}

export const kMaxFetchCount = 50;
