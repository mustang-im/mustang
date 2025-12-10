import { MailAccount } from "../MailAccount";
import { MailIdentity } from "../MailIdentity";
import { AuthMethod } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import type { EMail } from "../EMail";
import { EWSFolder, getEWSItem } from "./EWSFolder";
import { EWSCreateItemRequest } from "./Request/EWSCreateItemRequest";
import type { EWSDeleteItemRequest } from "./Request/EWSDeleteItemRequest";
import type { EWSUpdateItemRequest } from "./Request/EWSUpdateItemRequest";
import { EWSError, EWSItemError } from "./EWSError";
import type { EWSAddressbook } from "../../Contacts/EWS/EWSAddressbook";
import type { EWSCalendar } from "../../Calendar/EWS/EWSCalendar";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { newAddressbookForProtocol } from "../../Contacts/AccountsList/Addressbooks";
import { newCalendarForProtocol} from "../../Calendar/AccountsList/Calendars";
import type { PersonUID } from "../../Abstract/PersonUID";
import { OAuth2 } from "../../Auth/OAuth2";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import { ContentDisposition } from "../../Abstract/Attachment";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { XML2JSON, type Json, JSON2XML } from "./XML2JSON";
import { ensureLicensed } from "../../util/LicenseClient";
import { Throttle } from "../../util/Throttle";
import { Semaphore } from "../../util/Semaphore";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, blobToBase64, ensureArray, NotReached, NotSupported } from "../../util/util";
import { gt } from "../../../l10n/l10n";

export class EWSAccount extends MailAccount {
  readonly protocol: string = "ews";
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  readonly canSendInvitations: boolean = false;
  readonly folderMap = new Map<string, EWSFolder>;
  throttle = new Throttle(50, 1);
  semaphore = new Semaphore(20);
  // null: if this is our account
  // msgfolderroot: if this is an account shared with us
  // inbox: if this is an inbox shared with us
  sharedFolderRoot: "msgfolderroot" | "inbox" | null;

  constructor() {
    super();
    assert(appGlobal.remoteApp.postHTTP, "EWS: Need backend");
  }

  newFolder(): EWSFolder {
    return new EWSFolder(this);
  }

  get isLoggedIn(): boolean {
    if (this.mainAccount) {
      return this.mainAccount.isLoggedIn;
    }
    return this.authMethod != AuthMethod.OAuth2 || this.oAuth2?.isLoggedIn;
  }

  async verifyLogin(): Promise<void> {
    if (this.mainAccount) {
      throw new NotReached();
    }
    await this.loginCommon(true);

    let query = {
      m$FindFolder: {
        Traversal: "Shallow",
        m$FolderShape: {
          t$BaseShape: "IdOnly",
        },
        m$ParentFolderIds: {
          t$DistinguishedFolderId: [{
            Id: "msgfolderroot",
          }],
        },
      },
    };
    await this.callEWS(query);
  }

  protected async loginCommon(interactive: boolean): Promise<void> {
    if (this.authMethod == AuthMethod.OAuth2) {
      if (!this.oAuth2) {
        let urls = OAuth2URLs.find(a => a.hostnames.includes(this.hostname));
        assert(urls, gt`Could not find OAuth2 config for ${this.hostname}`);
        this.oAuth2 = new OAuth2(this, urls.tokenURL, urls.authURL, urls.authDoneURL, urls.scope, urls.clientID, urls.clientSecret, urls.doPKCE);
        this.oAuth2.setTokenURLPasswordAuth(urls.tokenURLPasswordAuth);
      }
      this.oAuth2.subscribe(() => this.notifyObservers());
      await this.oAuth2.login(interactive);
    }
  }

  async login(interactive: boolean): Promise<void> {
    if (this.mainAccount) {
      await this.mainAccount.login(interactive);
      return;
    }
    await ensureLicensed(); // Not in generic `Account`, to keep license code in the proprietary parts
    await super.login(interactive);
    await this.loginCommon(interactive);

    await this.listFolders();

    // `listFolders()` will subscribe to new user-added addressbooks and calendars

    for (let addressbook of appGlobal.addressbooks) {
      if (addressbook.mainAccount == this) {
        addressbook.listContacts()
          .then(() => addressbook.username != this.username && this.streamNotifications((addressbook as EWSAddressbook).folderID))
          .catch(this.errorCallback);
      }
    }
    for (let calendar of appGlobal.calendars) {
      if (calendar.mainAccount == this) {
        calendar.listEvents()
          .then(() => calendar.username != this.username && this.streamNotifications((calendar as EWSCalendar).folderID))
          .catch(this.errorCallback);
      }
    }

    await this.streamNotifications();
  }

  async logout(): Promise<void> {
    if (this.mainAccount) {
      await this.mainAccount.logout();
      return;
    }
    await this.oAuth2?.logout();
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
    let request = new EWSCreateItemRequest({ m$SavedItemFolderId: { t$FolderId: { Id: email.folder.id } }, MessageDisposition: "SendAndSaveCopy" });
    request.addField("Message", "ItemClass", "IPM.Note", "item:ItemClass");
    request.addField("Message", "Subject", email.subject, "item:Subject");
    request.addField("Message", "Body", {
      BodyType: email.html ? "HTML" : "Text",
      _TextContent_: email.html || email.text,
    }, "item:Body");
    if (email.attachments.hasItems) {
      request.addField("Message", "Attachments", {
        t$FileAttachment: await Promise.all(email.attachments.contents.map(async attachment => ({
          t$Name: attachment.filename,
          t$ContentType: attachment.mimeType,
          t$ContentID: attachment.contentID,
          t$Size: attachment.size,
          t$IsInline: attachment.disposition == ContentDisposition.inline,
          t$Content: await blobToBase64(attachment.content),
        }))),
      }, "item:Attachments");
    }
    if (email.headers.hasItems) {
      request.addField("Message", "ExtendedProperty", [...email.headers.entries()].map(([header, value]) => ({
        t$ExtendedFieldURI: {
          PropertyName: header,
          DistinguishedPropertySetId: "InternetHeaders",
          PropertyType: "String",
          // TODO Sends header names as all-lowercase. Should preserve casing.
        },
        t$Value: value,
      })), null);
    }
    if (email.inReplyTo) {
      request.addField("Message", "InReplyTo", email.inReplyTo, "item:InReplyTo");
    }
    if (email.replyTo) {
      addRecipients(request, "ReplyTo", [email.replyTo]);
    }
    addRecipients(request, "From", [email.from]);
    addRecipients(request, "ToRecipients", email.to.contents);
    addRecipients(request, "CcReipients", email.cc.contents);
    addRecipients(request, "BccRecipients", email.bcc.contents);
    await this.callEWS(request);
  }

  request2XML(aRequest: JsonRequest): string {
    let xml = document.implementation.createDocument("http://schemas.xmlsoap.org/soap/envelope/", "s:Envelope");
    xml.documentElement.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:s", "http://schemas.xmlsoap.org/soap/envelope/");
    xml.documentElement.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:m", "http://schemas.microsoft.com/exchange/services/2006/messages");
    xml.documentElement.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:t", "http://schemas.microsoft.com/exchange/services/2006/types");
    JSON2XML({
      t$RequestServerVersion: {
        Version: "Exchange2013",
      },
      t$TimeZoneContext: {
        t$TimeZoneDefinition: {
          Id: "UTC",
        },
      },
    }, xml.documentElement, "http://schemas.xmlsoap.org/soap/envelope/", "s:Header");
    JSON2XML(aRequest, xml.documentElement, "http://schemas.xmlsoap.org/soap/envelope/", "s:Body");
    return new XMLSerializer().serializeToString(xml);
  }

  checkResponse(aResponse: Record<string, any>, aRequest: JsonRequest): Json {
    let responseXML = aResponse.responseXML as XMLDocument;
    if (!responseXML) {
      throw new EWSError(aResponse, aRequest);
    }
    // Free/Busy is a special snowflake and has its own element.
    let freebusy = responseXML.querySelector("FreeBusyResponseArray");
    if (freebusy) {
      return ensureArray(getEWSItem(XML2JSON(freebusy)));
    }
    let messages = responseXML.querySelector("ResponseMessages");
    if (!messages) {
      throw new EWSError(aResponse, aRequest);
    }
    let message = Object.values(XML2JSON(messages))[0];
    if (message.ResponseClass == "Error") {
      throw new EWSItemError(message, aRequest);
    }
    return message;
  }

  parseXML(aXMLasText: string): Document {
    let cleanText = aXMLasText.replace(/&#x([0-8BCEF]|1[0-9A-F]|D[89A-F][0-9A-F][0-9A-F]|FFF[EF]);/gi, "");
    let document = new DOMParser().parseFromString(cleanText, "text/xml");
    return document.getElementsByTagName('parsererror').length ? null : document;
  }

  isThrottleError(ex: EWSItemError): boolean {
    if (ex.type != "ErrorServerBusy") {
      return false;
    }
    // Check whether the ConcurrentSyncCalls policy was exceeded.
    if (/'ConcurrentSyncCalls'.*'(\d+)'.*'Ews'/.test(ex.message) && Number(RegExp.$1) < this.throttle.maxTasks) {
      this.throttle.maxTasks = Number(RegExp.$1);
      console.log(`Server busy, reduced max concurrency to ${this.throttle.maxTasks}`);
    }
    let milliseconds = Number(ex.error.MessageXml?.Value?.Value);
    if (!milliseconds) {
      // Server isn't asking us to back off, so give up.
      throw ex;
    }
    if (milliseconds > 20000) {
      milliseconds = 20000; // Sensible upper limit
    }
    console.log(`Server busy, using ${milliseconds}ms backoff time`);
    this.throttle.waitForSecond(milliseconds / 1000);
    return true;
  }

  /** @returns `Authorization` HTTP request header - usable only for a single call */
  async loginWithNTLM(): Promise<string> {
    assert(this.username && this.password, gt`Need username and password`);
    let response = await appGlobal.remoteApp.postHTTP(this.url, "", "text", this.createRequestOptions(await appGlobal.remoteApp.createType1Message()));
    assert(/\bNTLM\b/.test(response.WWWAuthenticate), gt`Your account is configured to use ${"NTLM"} authentication, but your server does not support it. Please change your account settings or set up the account again.`);
    return await appGlobal.remoteApp.createType3MessageFromType2Message(response.WWWAuthenticate, this.username, this.password);
  }

  createRequestOptions(authorizationHeader?: string): any {
    let options: any = {
      throwHttpErrors: false,
      headers: {
        'Content-Type': "text/xml; charset=utf-8",
      },
    };
    if (this.authMethod == AuthMethod.OAuth2) {
      options.headers.Authorization = this.oAuth2.authorizationHeader;
    } else if (this.authMethod == AuthMethod.NTLM) {
      if (authorizationHeader) {
        options.headers.Authorization = authorizationHeader;
      }
    } else if (this.authMethod == AuthMethod.Password) {
      options.headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(`${this.username}:${this.password}`)))}`;
    } else if (this.authMethod == AuthMethod.Unknown) {
      // triggers 401, which gives us WWWAuthenticate HTTP response header, which lists the login methods supported by the server
    } else {
      throw new NotReached(`Unknown authentication method ${this.authMethod}`);
    }
    return options;
  }

  /**
   * Make a HTTP call to the server.
   * @param options for internal use only
   * @returns XML2JSON = XML as JSON. What the server returned.
   */
  async callEWS(aRequest: JsonRequest, options?: any): Promise<any> {
    if (this.mainAccount) {
      return await (this.mainAccount as EWSAccount).callEWS(aRequest, options);
    }
    await this.throttle.throttle();
    let lock = await this.semaphore.lock();
    let response: any;
    try {
      response = await appGlobal.remoteApp.postHTTP(this.url, this.request2XML(aRequest), "text", this.createRequestOptions(options?.authorizationHeader));
    } finally {
      lock.release();
    }
    response.responseXML = this.parseXML(response.data);
    this.fatalError = null;
    if (response.status == 200) {
      try {
        return this.checkResponse(response, aRequest);
      } catch (ex) {
        if (this.isThrottleError(ex)) {
          return await this.callEWS(aRequest);
        } else {
          this.throttle.waitForSecond(1);
          throw ex;
        }
      }
    }
    if (response.status == 401) {
      const repeat = async (options: any = {}) => {
        options.isRepeating = true;
        return await this.callEWS(aRequest, options); // repeat the call
      }
      if (options?.isRepeating) {
        let ex = new EWSError(response, aRequest);
        throw new LoginError(ex, gt`Login failed`);
      } else if (this.oAuth2) {
        await this.oAuth2.reset();
        await this.oAuth2.login(false); // will throw error, if interactive login is needed
        return repeat();
      } else if (this.authMethod == AuthMethod.NTLM) {
        let authorizationHeader = await this.loginWithNTLM();
        return repeat({ authorizationHeader });
      } else if (this.authMethod == AuthMethod.Password) {
        assert(/\bBasic\b/.test(response.WWWAuthenticate), gt`Your account is configured to use ${gt`Password`} authentication, but your server does not support it. Please change your account settings or set up the account again.`);
        throw this.fatalError = new LoginError(null, gt`Password incorrect`);
      } else if (this.authMethod == AuthMethod.Unknown) {
        if (/\bBasic\b/.test(response.WWWAuthenticate)) {
          this.authMethod = AuthMethod.Password;
        } else if (/\bNTLM\b/.test(response.WWWAuthenticate)) {
          this.authMethod = AuthMethod.NTLM;
        } else {
          throw this.fatalError = new ConnectError(null,
            gt`Unsupported authentication protocol(s): ${response.WWWAuthenticate}`);
        }
        return repeat();
      } else {
        throw this.fatalError = new ConnectError(null,
          gt`Server supports authentication protocol(s): ${response.WWWAuthenticate}. Please check your account configuration.`);
      }
    } else {
      this.throttle.waitForSecond(1);
      throw new EWSError(response, aRequest);
    }
  }

  async callStream(request: Json, responseCallback: (message: Record<string, any>) => Promise<void>) {
    let lastAttempt;
    do {
      try {
        lastAttempt = Date.now();
        const endEnvelope = "</Envelope>";
        let requestXML = this.request2XML(request);
        let data = "";
        let response = await appGlobal.remoteApp.streamHTTP(this.url, requestXML, this.createRequestOptions());
        if (this.authMethod == AuthMethod.NTLM && response.status == 401) {
          let authorizationHeader = await this.loginWithNTLM();
          response = await appGlobal.remoteApp.streamHTTP(this.url, requestXML, this.createRequestOptions(authorizationHeader)); // Repeat the call
        }
        if (!response.ok) {
          console.error(`streamHTTP failed with HTTP ${response.status} ${response.statusText}`);
          return;
        }
        for await (let chunk of response.body) {
          data += chunk;
          while (data.includes(endEnvelope)) {
            let pos = data.indexOf(endEnvelope) + endEnvelope.length;
            chunk = data.slice(0, pos);
            data = data.slice(pos);
            try {
              let document = this.parseXML(chunk);
              if (!document) {
                continue;
              }
              let messages = document.querySelector("ResponseMessages");
              if (!messages) {
                continue;
              }
              let message = Object.values(XML2JSON(messages))[0];
              if (message.ResponseClass == "Error") {
                throw new EWSItemError(message, request);
              }
              if (message.ConnectionStatus == "Closed") {
                continue; // Re-open connection
              }
              responseCallback(message);
            } catch (ex) {
              this.errorCallback(ex);
            }
          }
        }
      } catch (ex) {
        if (ex?.message == "terminated") {
          // Connection broke down, which is normal after a while.
          // Loop and re-open the connection.
          continue;
        }
        this.errorCallback(ex);
        break;
      }
    } while (Date.now() - lastAttempt > 10000) // quit when last failure < 10 seconds ago. TODO throw? But don't show error to user.
  }

  async streamNotifications(folderID?: string) {
    let subscribe = folderID
    ? {
      m$Subscribe: {
        m$StreamingSubscriptionRequest: {
          t$FolderIds: {
            t$FolderId: {
              Id: folderID,
            },
          },
          t$EventTypes: {
            t$EventType: [
              "CopiedEvent",
              "CreatedEvent",
              "DeletedEvent",
              "ModifiedEvent",
              "MovedEvent",
            ],
          },
        },
      },
    }
    : {
      m$Subscribe: {
        m$StreamingSubscriptionRequest: {
          t$EventTypes: {
            t$EventType: [
              "CopiedEvent",
              "CreatedEvent",
              "DeletedEvent",
              "ModifiedEvent",
              "MovedEvent",
              "NewMailEvent",
            ],
          },
          SubscribeToAllFolders: true,
        },
      },
    };
    let response = await this.callEWS(subscribe);
    let streamRequest = {
      m$GetStreamingEvents: {
        m$SubscriptionIds: {
          t$SubscriptionId: response.SubscriptionId,
        },
        // Maximum number of minutes to keep a stream open.
        // In minutes, between 1 and 30, inclusive.
        m$ConnectionTimeout: 29, // minutes
      },
    };
    // Now, connect and wait for the notifications. Runs 29 minutes long, so don't `await` it.
    this.callStream(streamRequest, async message => {
      for (let notification of ensureArray(message.Notifications?.Notification)) {
        await this.processNotification(notification);
      }
    }).catch(this.errorCallback);
  }

  async processNotification(notification: Record<string, any>) {
    let hierarchyChanged = false;
    let folderIDs = new Set<string>();
    for (let copiedEvent of ensureArray(notification.CopiedEvent)) {
      if (copiedEvent.ItemId) {
        folderIDs.add(copiedEvent.ParentFolderId.Id);
      } else if (copiedEvent.FolderId) {
        hierarchyChanged = true;
      } else {
        this.errorCallback(new Error("CopiedEvent did not conform to schema"));
      }
    }
    for (let createdEvent of ensureArray(notification.CreatedEvent)) {
      if (createdEvent.ItemId) {
        folderIDs.add(createdEvent.ParentFolderId.Id);
      } else if (createdEvent.FolderId) {
        hierarchyChanged = true;
      } else {
        this.errorCallback(new Error("CreatedEvent did not conform to schema"));
      }
    }
    for (let deletedEvent of ensureArray(notification.DeletedEvent)) {
      if (deletedEvent.ItemId) {
        folderIDs.add(deletedEvent.ParentFolderId.Id);
      } else if (deletedEvent.FolderId) {
        hierarchyChanged = true;
      } else {
        this.errorCallback(new Error("DeletedEvent did not conform to schema"));
      }
    }
    for (let modifiedEvent of ensureArray(notification.ModifiedEvent)) {
      if (modifiedEvent.ItemId) {
        folderIDs.add(modifiedEvent.ParentFolderId.Id);
      } else if (modifiedEvent.FolderId) {
        hierarchyChanged = true;
      } else {
        this.errorCallback(new Error("ModifiedEvent did not conform to schema"));
      }
    }
    for (let movedEvent of ensureArray(notification.MovedEvent)) {
      if (movedEvent.ItemId) {
        folderIDs.add(movedEvent.OldParentFolderId.Id);
        folderIDs.add(movedEvent.ParentFolderId.Id);
      } else if (movedEvent.FolderId) {
        hierarchyChanged = true;
      } else {
        this.errorCallback(new Error("MovedEvent did not conform to schema"));
      }
    }
    for (let newMailEvent of ensureArray(notification.NewMailEvent)) {
      folderIDs.add(newMailEvent.ParentFolderId.Id);
    }
    if (hierarchyChanged) {
      try {
        await this.listFolders();
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
    for (let folderID of folderIDs) {
      try {
        let mailFolder = this.folderMap.get(folderID);
        if (mailFolder) {
          await mailFolder.updateChangedMessages();
          continue;
        }
        let addressbook = appGlobal.addressbooks.find((addressbook: EWSAddressbook) => addressbook.mainAccount == this && addressbook.folderID == folderID) as EWSAddressbook | null;
        if (addressbook) {
          await addressbook.listContacts();
          continue;
        }
        let calendar = appGlobal.calendars.find((calendar: EWSCalendar) => calendar.mainAccount == this && calendar.folderID == folderID) as EWSCalendar | null;
        if (calendar) {
          await calendar.listEvents();
          continue;
        }
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
  }

  async listFolders(): Promise<void> {
    let query = {
      m$FindFolder: {
        Traversal: "Deep",
        m$FolderShape: {
          t$BaseShape: "Default",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "folder:FolderClass",
            }, {
              FieldURI: "folder:ParentFolderId",
            }, {
              FieldURI: "folder:DistinguishedFolderId",
            }],
          },
        },
        m$ParentFolderIds: {
          t$DistinguishedFolderId: this.sharedFolderRoot
          ? {
            Id: this.sharedFolderRoot,
            t$Mailbox: {
              t$EmailAddress: this.username,
            },
          }
          : {
            Id: "msgfolderroot",
          },
        },
      },
    };
    let result = await this.callEWS(query);
    let folders = ensureArray(result.RootFolder.Folders.Folder);
    this.folderMap.clear();
    if (this.sharedFolderRoot == "inbox") {
      let request = {
        m$GetFolder: {
          m$FolderShape: {
            t$BaseShape: "Default",
            t$AdditionalProperties: {
              t$FieldURI: [{
                FieldURI: "folder:FolderClass",
              }, {
                FieldURI: "folder:ParentFolderId",
              }, {
                FieldURI: "folder:DistinguishedFolderId",
              }],
            },
          },
          m$FolderIds: {
            t$DistinguishedFolderId: {
              Id: "inbox",
              t$Mailbox: {
                t$EmailAddress: this.username,
              },
            },
          },
        },
      };
      let response = await this.callEWS(request);
      folders.unshift(response.Folders.Folder);
    }
    for (let folder of folders) {
      if (!folder.FolderClass || folder.FolderClass == "IPF.Note" || folder.FolderClass.startsWith("IPF.Note.")) {
        let parent = this.folderMap.get(folder.ParentFolderId.Id);
        let parentFolders = parent ? parent.subFolders : this.rootFolders;
        let ewsFolder = parentFolders.find(ewsFolder => ewsFolder.id == folder.FolderId.Id) as EWSFolder;
        if (!ewsFolder) {
          ewsFolder = this.findFolder(ewsFolder => ewsFolder.id == folder.FolderId.Id) as EWSFolder
            ?? this.newFolder();
          let oldParentFolders = ewsFolder.parent?.subFolders || this.rootFolders;
          oldParentFolders.remove(ewsFolder);
          ewsFolder.parent = parent || null;
          parentFolders.push(ewsFolder);
        }
        ewsFolder.fromXML(folder);
        this.folderMap.set(folder.FolderId.Id, ewsFolder);
      }
    }
    // Iterate from deepest to shallowest
    for (let folder of this.getAllFolders().reverse()) {
      if (!this.folderMap.has(folder.id)) {
        await folder.deleteItLocally();
      }
    }
    if (this.sharedFolderRoot) {
      return; // Don't automatically add shared addressbook or calendar.
    }
    let haveAddressbook = appGlobal.addressbooks.some(addressbook => addressbook.mainAccount == this);
    if (!haveAddressbook) {
      for (let folder of ensureArray(result.RootFolder.Folders.ContactsFolder)) {
        /* EWS has some internal contacts folders that we don't want to display.
           Fortunately, they all have distinguished folder IDs,
           so we are only interested in the primary user address book ("contacts")
           or a additional user-created address books (which have no distinguished ID). */
        if (folder.FolderClass == "IPF.Contact" && [undefined, "contacts"].includes(folder.DistinguishedFolderId)) {
          let addressbook = newAddressbookForProtocol("addressbook-ews") as EWSAddressbook;
          addressbook.initFromMainAccount(this);
          let isMainAddressbook = folder.DistinguishedFolderId == "contacts";
          if (!isMainAddressbook && folder.DisplayName) {
            addressbook.name = `${this.name} ${folder.DisplayName}`;
          }
          addressbook.folderID = sanitize.nonemptystring(folder.FolderId.Id);
          await addressbook.save();
          appGlobal.addressbooks.add(addressbook);
        }
      }
    }
    let haveCalendar = appGlobal.calendars.some(calendar => calendar.mainAccount == this);
    if (!haveCalendar) {
      for (let folder of ensureArray(result.RootFolder.Folders.CalendarFolder)) {
        if (folder.FolderClass == "IPF.Appointment") {
          let calendar = newCalendarForProtocol("calendar-ews") as EWSCalendar;
          calendar.initFromMainAccount(this);
          let isMainCalendar = folder.DistinguishedFolderId == "calendar";
          if (isMainCalendar) {
            calendar.useForInvitations = true;
          } else if (folder.DisplayName) {
            calendar.name = `${this.name} ${folder.DisplayName}`;
          }
          calendar.folderID = sanitize.nonemptystring(folder.FolderId.Id);
          await calendar.save();
          appGlobal.calendars.add(calendar);
        }
      }
    }
  }

  isOffice365(): boolean {
    let hostname = new URL(this.url).hostname;
    return hostname == "outlook.office365.com";
  }

  async createToplevelFolder(name: string): Promise<EWSFolder> {
    if (this.sharedFolderRoot == "inbox") {
      throw new Error(gt`You only have access to the Inbox of these shared folders`);
    }
    let request = {
      m$CreateFolder: {
        m$ParentFolderId: {
          t$DistinguishedFolderId: this.sharedFolderRoot
          ? {
            Id: "msgfolderroot",
            t$Mailbox: {
              t$EmailAddress: this.username,
            },
          }
          : {
            Id: "msgfolderroot",
          },
        },
        m$Folders: {
          t$Folder: {
            t$FolderClass: "IPF.Note",
            t$DisplayName: name,
          },
        },
      },
    };
    let result = await this.callEWS(request);
    let folder = await super.createToplevelFolder(name) as EWSFolder;
    folder.id = sanitize.nonemptystring(result.Folders.Folder.FolderId.Id);
    return folder;
  }

  async findNamedFolders(person: PersonUID, names: string[]): Promise<string[]> {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let request = {
      m$GetFolder: {
        m$FolderShape: {
          t$BaseShape: "IdOnly",
          t$AdditionalProperties: {
            t$FieldURI: {
              FieldURI: "folder:DistinguishedFolderId",
            },
          },
        },
        m$FolderIds: {
          t$DistinguishedFolderId: names.map(name => ({
            Id: name,
            t$Mailbox: {
              t$EmailAddress: person.emailAddress,
            },
          })),
        },
      },
    };
    try {
      let result = await this.callEWS(request);
      return result.filter(folder => folder.ResponseClass == "Success").map(folder => getEWSItem(folder.Folders).DistinguishedFolderId);
    } catch (ex) {
      return [];
    }
  }

  async addSharedFolders(person: PersonUID, sharedFolderRoot: "msgfolderroot" | "inbox") {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let account = newAccountForProtocol("ews") as EWSAccount;
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
  }

  async addSharedAddressbook(person: PersonUID) {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let request = {
      m$GetFolder: {
        m$FolderShape: {
          t$BaseShape: "Default",
        },
        m$FolderIds: {
          t$DistinguishedFolderId: {
            Id: "contacts",
            t$Mailbox: {
              t$EmailAddress: person.emailAddress,
            },
          },
        },
      },
    };
    let result = await this.callEWS(request);
    let folder = result.Folders.ContactsFolder;
    let addressbook = newAddressbookForProtocol("addressbook-ews") as EWSAddressbook;
    addressbook.initFromMainAccount(this);
    addressbook.name = `${person.name} ${folder.DisplayName}`;
    addressbook.username = person.emailAddress;
    addressbook.folderID = folder.FolderId.Id;
    appGlobal.addressbooks.add(addressbook);
    await addressbook.listContacts();
    await this.streamNotifications(folder.FolderId.Id);
  }

  async addSharedCalendar(person: PersonUID) {
    if (this.mainAccount) {
      throw new NotReached();
    }
    let request = {
      m$GetFolder: {
        m$FolderShape: {
          t$BaseShape: "Default",
        },
        m$FolderIds: {
          t$DistinguishedFolderId: {
            Id: "calendar",
            t$Mailbox: {
              t$EmailAddress: person.emailAddress,
            },
          },
        },
      },
    };
    let result = await this.callEWS(request);
    let folder = result.Folders.CalendarFolder;
    let calendar = newCalendarForProtocol("calendar-ews") as EWSCalendar;
    calendar.initFromMainAccount(this);
    calendar.name = `${person.name} ${folder.DisplayName}`;
    calendar.username = person.emailAddress;
    calendar.folderID = folder.FolderId.Id;
    appGlobal.calendars.add(calendar);
    await calendar.listEvents();
    await this.streamNotifications(folder.FolderId.Id);
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


export type JsonRequest = Json | EWSCreateItemRequest | EWSDeleteItemRequest | EWSUpdateItemRequest;

function addRecipients(aRequest: any, aType: string, aRecipients: PersonUID[]): void {
  if (!aRecipients.length) {
    return;
  }
  aRequest.addField("Message", aType, {
    t$Mailbox: aRecipients.map(recipient => ({
      t$Name: recipient.name,
      t$EmailAddress: recipient.emailAddress,
    })),
  }, "message:" + aType);
}
