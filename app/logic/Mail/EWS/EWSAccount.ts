import { AuthMethod, MailAccount, TLSSocketType } from "../MailAccount";
import type { EMail } from "../EMail";
import { EWSFolder } from "./EWSFolder";
import EWSCreateItemRequest from "./Request/EWSCreateItemRequest";
import type EWSDeleteItemRequest from "./Request/EWSDeleteItemRequest";
import type EWSUpdateItemRequest from "./Request/EWSUpdateItemRequest";
import { EWSError, EWSItemError } from "./EWSError";
import type { EWSAddressbook } from "../../Contacts/EWS/EWSAddressbook";
import type { EWSCalendar } from "../../Calendar/EWS/EWSCalendar";
import { newAddressbookForProtocol } from "../../Contacts/AccountsList/Addressbooks";
import { newCalendarForProtocol} from "../../Calendar/AccountsList/Calendars";
import type { PersonUID } from "../../Abstract/PersonUID";
import { OAuth2 } from "../../Auth/OAuth2";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import { ContentDisposition } from "../../Abstract/Attachment";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { XML2JSON, type Json, JSON2XML } from "./XML2JSON";
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

  constructor() {
    super();
    assert(appGlobal.remoteApp.postHTTP, "EWS: Need backend");
  }

  newFolder(): EWSFolder {
    return new EWSFolder(this);
  }

  get isLoggedIn(): boolean {
    return this.authMethod != AuthMethod.OAuth2 || this.oAuth2?.isLoggedIn;
  }

  async login(interactive: boolean): Promise<void> {
    super.login(interactive);
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
    await this.listFolders();

    let addressbook = appGlobal.addressbooks.find((addressbook: EWSAddressbook) => addressbook.protocol == "addressbook-ews" && addressbook.url == this.url && addressbook.username == this.username) as EWSAddressbook | void;
    if (!addressbook) {
      addressbook = newAddressbookForProtocol("addressbook-ews") as EWSAddressbook;
      addressbook.name = this.name;
      addressbook.url = this.url;
      addressbook.username = this.emailAddress;
      addressbook.workspace = this.workspace;
      appGlobal.addressbooks.add(addressbook);
    }
    addressbook.account = this;
    await addressbook.listContacts();

    let calendar = appGlobal.calendars.find((calendar: EWSCalendar) => calendar.protocol == "calendar-ews" && calendar.url == this.url && calendar.username == this.username) as EWSCalendar | void;
    if (!calendar) {
      calendar = newCalendarForProtocol("calendar-ews") as EWSCalendar;
      calendar.name = this.name;
      calendar.url = this.url;
      calendar.username = this.emailAddress;
      calendar.workspace = this.workspace;
      appGlobal.calendars.add(calendar);
    }
    calendar.account = this;
    await calendar.listEvents();

    await this.streamNotifications();
  }

  async logout(): Promise<void> {
    await this.oAuth2?.logout();
  }

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

  checkResponse(aResponse, aRequest: JsonRequest): Json {
    let responseXML = aResponse.responseXML;
    if (!responseXML) {
      throw new EWSError(aResponse, aRequest);
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
        } else if (/\NTLM\b/.test(response.WWWAuthenticate)) {
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

  async callStream(request: Json, responseCallback) {
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

  async streamNotifications() {
    let subscribe = {
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

  async processNotification(notification) {
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
        let folder = this.folderMap.get(folderID);
        if (folder) {
          await folder.updateChangedMessages();
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
          t$DistinguishedFolderId: [{
            Id: "msgfolderroot",
          }],
        },
      },
    };
    let result = await this.callEWS(query);
    this.folderMap.clear();
    for (let folder of result.RootFolder.Folders.Folder) {
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
  }

  isOffice365(): boolean {
    let hostname = new URL(this.url).hostname;
    return hostname == "outlook.office365.com";
  }

  async createToplevelFolder(name: string): Promise<EWSFolder> {
    let request = {
      m$CreateFolder: {
        m$ParentFolderId: {
          t$DistinguishedFolderId: {
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
