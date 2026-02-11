import { MailAccount } from "../MailAccount";
import { MailIdentity } from "../MailIdentity";
import { AuthMethod } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import type { EMail } from "../EMail";
import type { Folder, MailShareCombinedPermissions, MailShareIndividualPermissions } from "../Folder";
import { OWAFolder } from "./OWAFolder";
import { OWAError } from "./OWAError";
import type { OWANotifications } from "./Notification/OWANotifications";
import { OWAExchangeNotifications } from "./Notification/OWAExchangeNotifications";
import { OWAOffice365Notifications } from "./Notification/OWAOffice365Notifications";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { newAddressbookForProtocol } from "../../Contacts/AccountsList/Addressbooks";
import type { OWAAddressbook } from "../../Contacts/OWA/OWAAddressbook";
import { newCalendarForProtocol} from "../../Calendar/AccountsList/Calendars";
import type { OWACalendar } from "../../Calendar/OWA/OWACalendar";
import { OWACreateItemRequest } from "./Request/OWACreateItemRequest";
import { OWASubscribeToNotificationRequest } from "./Request/OWASubscribeToNotificationRequest";
import { owaCreateNewTopLevelFolderRequest, owaFindFoldersRequest, owaSharedFolderRequest } from "./Request/OWAFolderRequests";
import { OWALoginBackground } from "./Login/OWALoginBackground";
import { deleteExchangePermissions, setExchangePermissions } from "../EWS/EWSFolder";
import type { PersonUID } from "../../Abstract/PersonUID";
import { OWAAuth } from "../../Auth/OWAAuth";
import { ContentDisposition } from "../../Abstract/Attachment";
import { LoginError } from "../../Abstract/Account";
import { ensureLicensed } from "../../util/LicenseClient";
import { appGlobal } from "../../app";
import { Semaphore } from "../../util/flow/Semaphore";
import { Throttle } from "../../util/flow/Throttle";
import { notifyChangedProperty } from "../../util/Observable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, blobToBase64, NotSupported, NotReached } from "../../util/util";
import { ArrayColl } from "svelte-collections";
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
  /**
   * OAuth2 authorization header for Hotmail or Office 365 environments.
   * In future it might be possible to perform requests from the front end?
   */
  authorizationHeader: string | undefined;
  @notifyChangedProperty
  hasLoggedIn = false;
  protected notifications: OWANotifications;
  throttle = new Throttle(50, 1);
  semaphore = new Semaphore(20);
  // null: if this is our account
  // msgfolderroot: if this is an account shared with us
  // inbox: if this is an inbox shared with us
  sharedFolderRoot: "msgfolderroot" | "inbox" | null;

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
    if (this.mainAccount) {
      return this.mainAccount.isLoggedIn;
    }
    return this.hasLoggedIn;
  }

  async testLoggedIn(): Promise<boolean> {
    if (this.mainAccount) {
      throw new NotReached();
    }
    assert(!this.hasLoggedIn, "Only for use during login");
    this.authorizationHeader = await appGlobal.remoteApp.OWA.getAnyScrapedAuth(this.partition);
    let url = this.url + 'service.svc';
    let options = {
      body: JSON.stringify(owaFindFoldersRequest(false)),
      headers: {
        Action: "FindFolder",
        Authorization: this.authorizationHeader,
        "Content-Type": "application/json",
        "x-anchormailbox": this.emailAddress,
        "x-customowascenariodata": "MailboxAccess:SharedMailbox,ExplicitLogon",
        "x-owa-explicitlogonuser": this.emailAddress,
      },
      method: "POST",
    };
    if (this.authorizationHeader) {
      let response = await fetch(url, options);
      if ([401, 440].includes(response.status)) {
        return false;
      }
      try {
        await response.json();
        return true;
      } catch (ex) {
        return false;
      }
    }
    let response = await appGlobal.remoteApp.OWA.fetchJSON(this.partition, url, options);
    if ([401, 440].includes(response.status)) {
      return false;
    }
    if (!response.json && response.url != url && response.contentType?.toLowerCase().split(";")[0].trim() == "text/html") {
      return false;
    }
    return true;
  }

  async verifyLogin(): Promise<void> {
    if (this.mainAccount) {
      throw new NotReached();
    }
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
    if (this.mainAccount) {
      await this.mainAccount.login(interactive);
      await this.listFolders();
      return;
    }
    await ensureLicensed();
    await super.login(interactive);
    await this.loginCommon(interactive);
    this.authorizationHeader = await appGlobal.remoteApp.OWA.getAnyScrapedAuth(this.partition);
    this.hasLoggedIn = true;
    await this.listFolders();

    // `listFolders()` will subscribe to new user-added calendars

    let haveAddressbook = appGlobal.addressbooks.some(addressbook => addressbook.mainAccount == this);
    if (!haveAddressbook) {
      let isMainAB = true;
      let response = await this.callOWA(new OWAGetPeopleFiltersRequest());
      for (let ab of response) {
        // Exclude internal contacts folders.
        if (ab.IsReadOnly || !ab.FolderId?.Id) {
          continue;
        }
        let addressbook = newAddressbookForProtocol("addressbook-owa") as OWAAddressbook;
        addressbook.initFromMainAccount(this);
        if (!isMainAB) {
          addressbook.name = `${this.name} ${ab.DisplayName}`;
        }
        addressbook.folderID = ab.FolderId.Id;
        appGlobal.addressbooks.add(addressbook);
        addressbook.save();
        isMainAB = false;
      }
    }

    for (let addressbook of appGlobal.addressbooks) {
      if (addressbook.mainAccount == this) {
        addressbook.listContacts()
          .catch(this.errorCallback);
      }
    }
    for (let calendar of appGlobal.calendars) {
      if (calendar.mainAccount == this) {
        calendar.listEvents()
          .catch(this.errorCallback);
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
    if (this.mainAccount) {
      await this.mainAccount.logout();
      return;
    }
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

  async callOWA(aRequest: any, { mailbox = null } = {}): Promise<any> {
    if (this.mainAccount) {
      let mainAccount = this.mainAccount as OWAAccount;
      return await mainAccount.callOWA(aRequest, { mailbox: this.username });
    }
    if (!this.hasLoggedIn) {
      throw new LoginError(null, "Please login");
    }
    let url = this.url + 'service.svc';
    let options = {
      body: JSON.stringify(aRequest),
      headers: {
        Action: aRequest.action,
        Authorization: this.authorizationHeader,
        "Content-Type": "application/json",
        "x-anchormailbox": mailbox ?? this.emailAddress,
        "x-customowascenariodata": "MailboxAccess:SharedMailbox,ExplicitLogon",
        "x-owa-explicitlogonuser": mailbox ?? this.emailAddress,
      },
      method: "POST",
    };
    await this.throttle.throttle();
    let lock = await this.semaphore.lock();
    let response: any;
    try {
      if (this.authorizationHeader) {
        let result = await fetch(url, options);
        response = {
          ok: result.ok,
          status: result.status,
          statusText: result.statusText,
          url: result.url,
          contentType: result.headers.get('Content-Type'),
          text: await result.text(),
        };
        try {
          response.json = JSON.parse(response.text);
        } catch (ex) {
          response.ok = false;
          response.statusText = ex.message;
        }
      } else {
        response = await appGlobal.remoteApp.OWA.fetchJSON(this.partition, url, options);
      }
    } finally {
      lock.release();
    }
    if ([401, 440].includes(response.status)) {
      await this.logout();
      throw new LoginError(null, "Please login");
    }
    if (!response.ok) {
      this.throttle.waitForSecond(1);
      if (!response.json && response.url != url && response.contentType?.toLowerCase().split(";")[0].trim() == "text/html") {
        await this.logout();
        throw new Error(response.statusText);
      }
      throw new OWAError(response);
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
    let result = await this.callOWA(owaFindFoldersRequest(true, this.sharedFolderRoot, this.username));
    if (this.sharedFolderRoot == "inbox") {
      let response = await this.callOWA(owaSharedFolderRequest(["inbox"], this.username));
      result.RootFolder.Folders.unshift(response.Folders[0]);
      result.RootFolder.ParentFolder = response.Folders[0];
    }
    this.msgFolderRootID = result.RootFolder.ParentFolder.FolderId.Id;
    let haveCalendar = this.sharedFolderRoot != null || appGlobal.calendars.some(calendar => calendar.mainAccount == this);
    this.folderMap.clear();
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
      } else if (folder.FolderClass == "IPF.Appointment" && !haveCalendar) {
        let calendar = newCalendarForProtocol("calendar-owa") as OWACalendar;
        calendar.initFromMainAccount(this);
        if (folder.DistinguishedFolderId == "calendar") {
          calendar.useForInvitations = true;
        } else {
          calendar.name = `${this.name} ${folder.DisplayName}`;
        }
        calendar.folderID = folder.FolderId.Id;
        appGlobal.calendars.add(calendar);
        await calendar.save();
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
    return this.authorizationHeader != null;
  }

  async createToplevelFolder(name: string): Promise<OWAFolder> {
    if (this.sharedFolderRoot == "inbox") {
      throw new Error(gt`You only have access to the Inbox of this shared account`);
    }
    let result = await this.callOWA(owaCreateNewTopLevelFolderRequest(name, this.sharedFolderRoot && this.username));
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

  /**
   * Used by the sharing UI to identify whether this user has access to any of
   * the specified known folders of another user given their email address,
   * for example, msgfolderroot (entire mailbox), inbox, calendar, contacts.
   */
  async findSharedFolders(person: PersonUID, distinguishedIDs: string[]): Promise<string[]> {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let result = await this.callOWA(owaSharedFolderRequest(distinguishedIDs, person.emailAddress));
    return result.ResponseMessages.Items.filter(folder => folder.ResponseClass == "Success").map(folder => folder.Folders[0].DistinguishedFolderId);
  }

  /**
   * Used by the sharing UI to add another user's mailbox or inbox as an account
   */
  async addSharedFolders(person: PersonUID, sharedFolderRoot: "msgfolderroot" | "inbox"): Promise<OWAAccount> {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let account = newAccountForProtocol("owa") as OWAAccount;
    account.initFromMainAccount(this);
    account.name = person.name;
    account.username = person.emailAddress;
    account.emailAddress = person.emailAddress;
    account.sharedFolderRoot = sharedFolderRoot;
    let identity = new MailIdentity(account);
    identity.realname = person.name;
    identity.emailAddress = person.emailAddress;
    account.identities.add(identity);
    account.save();
    appGlobal.emailAccounts.add(account);
    await account.listFolders();
    return account;
  }

  /**
   * Used by the sharing UI to add another user's addressbook as an account.
   * Only the default addressbook is supported.
   */
  async addSharedAddressbook(person: PersonUID): Promise<OWAAddressbook> {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let result = await this.callOWA(owaSharedFolderRequest(["contacts"], person.emailAddress));
    let folder = result.Folders[0];
    let addressbook = newAddressbookForProtocol("addressbook-owa") as OWAAddressbook;
    addressbook.initFromMainAccount(this);
    addressbook.name = `${person.name} ${folder.DisplayName}`;
    addressbook.username = person.emailAddress;
    addressbook.folderID = folder.FolderId.Id;
    appGlobal.addressbooks.add(addressbook);
    await addressbook.listContacts();
    return addressbook;
  }

  /**
   * Used by the sharing UI to add another user's calendar as an account.
   * Only the default calendar is supported.
   */
  async addSharedCalendar(person: PersonUID): Promise<OWACalendar> {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let result = await this.callOWA(owaSharedFolderRequest(["calendar"], person.emailAddress));
    let folder = result.Folders[0];
    let calendar = newCalendarForProtocol("calendar-owa") as OWACalendar;
    calendar.initFromMainAccount(this);
    calendar.name = `${person.name} ${folder.DisplayName}`;
    calendar.username = person.emailAddress;
    calendar.folderID = folder.FolderId.Id;
    appGlobal.calendars.add(calendar);
    await calendar.listEvents();
    return calendar;
  }

  canShareWithPersons(): boolean {
    return true;
  }

  async getSharedPersons(): Promise<ArrayColl<PersonUID>> {
    // well, some of them at least...
    return await (this.inbox as OWAFolder).getSharedPersons();
  }

  async deleteSharedPerson(otherPerson: PersonUID) {
    for (let folder of this.getAllFolders()) {
      await deleteExchangePermissions(folder as OWAFolder, otherPerson);
    }
  }

  async addSharedPerson(otherPerson: PersonUID, mailFolder: OWAFolder | null, includeSubfolders: boolean, access: MailShareCombinedPermissions, ...permissions: MailShareIndividualPermissions[]) {
    // XXX Need root folder to share all mail
    let foldersToShare = (!mailFolder ? this.getAllFolders() : includeSubfolders ? mailFolder.getInclusiveDescendants() : new ArrayColl<Folder>([mailFolder]));
    for (let folder of foldersToShare) {
      await setExchangePermissions(folder as OWAFolder, otherPerson, access, ...permissions);
    }
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.sharedFolderRoot = sanitize.enum(json.sharedFolderRoot, ["msgfolderroot", "inbox"], null);
  }

  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.sharedFolderRoot = this.sharedFolderRoot;
    return json;
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
