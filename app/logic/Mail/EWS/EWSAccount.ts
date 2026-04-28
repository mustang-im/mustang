import { MailAccount } from "../MailAccount";
import { MailIdentity } from "../MailIdentity";
import { AuthMethod, type Account } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import type { EMail } from "../EMail";
import { SpecialFolder, type Folder, type MailShareCombinedPermissions, type MailShareIndividualPermissions } from "../Folder";
import { EWSFolder, deleteExchangePermissions, setExchangePermissions, getEWSItem } from "./EWSFolder";
import { EWSCreateItemRequest } from "./Request/EWSCreateItemRequest";
import type { EWSDeleteItemRequest } from "./Request/EWSDeleteItemRequest";
import type { EWSUpdateItemRequest } from "./Request/EWSUpdateItemRequest";
import { EWSError, EWSItemError } from "./EWSError";
import type { EWSAddressbook } from "../../Contacts/EWS/EWSAddressbook";
import type { EWSCalendar } from "../../Calendar/EWS/EWSCalendar";
import { EWSGAL } from "../../Contacts/EWS/EWSGAL";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { newAddressbookForProtocol } from "../../Contacts/AccountsList/Addressbooks";
import { newCalendarForProtocol} from "../../Calendar/AccountsList/Calendars";
import type { PersonUID } from "../../Abstract/PersonUID";
import { getOAuth2BuiltIn } from "../../Auth/OAuth2Util";
import { ContentDisposition } from "../../Abstract/Attachment";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { XML2JSON, JSON2XML } from "./XML2JSON";
import { ensureLicensed } from "../../util/LicenseClient";
import { Throttle } from "../../util/flow/Throttle";
import { Semaphore } from "../../util/flow/Semaphore";
import { RunOnce } from "../../util/flow/RunOnce";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, blobToBase64, ensureArray, NotReached, NotSupported, type Json } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export class EWSAccount extends MailAccount implements EWSSubscribable {
  readonly protocol: string = "ews";
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  readonly canSendInvitations: boolean = false;
  readonly folderMap = new Map<string, EWSFolder>;
  protected throttle = new Throttle(50, 1);
  protected semaphore = new Semaphore(20);
  protected loginRunOnce = new RunOnce();
  protected startupRunOnce = new RunOnce();
  /** null: if this is our account
   * msgfolderroot: if this is an account shared with us
   * inbox: if this is an inbox shared with us */
  protected sharedFolderRoot: "msgfolderroot" | "inbox" | null;
  /** AbortController for streaming notifications */
  protected notificationAbort: Record<string, AbortController> = {};
  /** SubscriptionId for unsubscribing on disconnect */
  subscriptionID?: string;

  newFolder(): EWSFolder {
    return new EWSFolder(this);
  }

  get folderID(): string {
    return this.inbox.id;
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
      this.oAuth2 ??= getOAuth2BuiltIn(this);
      assert(this.oAuth2, gt`Could not find OAuth2 config for ${this.hostname}`);
      this.oAuth2.subscribe(() => this.notifyObservers());
      await this.oAuth2.login(interactive);
    }
  }

  async login(interactive: boolean): Promise<void> {
    await this.loginRunOnce.runOnce(async () => {
      if (this.mainAccount) {
        await this.mainAccount.login(interactive);
        return;
      }
      await ensureLicensed(); // Not in generic `Account`, to keep license code in the proprietary parts
      await super.login(interactive);
      await this.loginCommon(interactive);
    });

    await this.startup();
  }

  async startup() {
    await this.startupRunOnce.runOnce(async () => {
      await super.startup();
      if (this.isDependentAccount) {
        await (this.mainAccount as EWSAccount).subscribeToNotificationsForSubaccount(this);
        return;
      }
      await this.startupDependentAccounts();

      appGlobal.searchOnlyAddressbooks.add(new EWSGAL(this));
      // `listFolders()` will subscribe to new user-added addressbooks and calendars

      await this.subscribeToNotifications();
    });
  }

  async disconnect(): Promise<void> {
    if (this.mainAccount) {
      await (this.mainAccount as EWSAccount).unsubscribeNotifications(this);
    } else {
      await this.unsubscribeAllSubscriptions();
    }

    let galAB = appGlobal.searchOnlyAddressbooks.find(ab => ab.mainAccount == this);
    if (galAB) {
      appGlobal.searchOnlyAddressbooks.remove(galAB);
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
    let folder = email.folder as EWSFolder;
    assert(folder?.id, "Need folder to save the sent email in");
    assert((folder.account.mainAccount ?? folder.account) == (this.mainAccount ?? this), "Need saved folder to have same master account");
    if (folder.account.mainAccount) {
      let mainAccount = folder.account.mainAccount as EWSAccount;
      let permissions = (await folder.getPermissions()).find(permissions => permissions.matchesEMailAddress(mainAccount.emailAddress));
      if (!permissions.exchangePermissions.CanCreateItems) {
        folder = mainAccount.getSpecialFolder(SpecialFolder.Sent) as EWSFolder;
      }
    }
    let request = new EWSCreateItemRequest({ m$SavedItemFolderId: { t$FolderId: { Id: folder.id } }, MessageDisposition: "SendAndSaveCopy" });
    if (email.sendRawMIME) {
      request.addField("Message", "MimeContent", btoa(email.sendRawMIME), "item:MimeContent");
    } else {
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
      if (email.inReplyTo) {
        request.addField("Message", "InReplyTo", email.inReplyTo, "item:InReplyTo");
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
      // Older versions of Exchange require a specific order of parameters
      addRecipients(request, "ToRecipients", email.to.contents);
      addRecipients(request, "CcReipients", email.cc.contents);
    }
    addRecipients(request, "BccRecipients", email.bcc.contents);
    addRecipients(request, "From", [email.from]);
    if (!email.sendRawMIME && email.replyTo) {
      addRecipients(request, "ReplyTo", [email.replyTo]);
    }
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
    JSON2XML(aRequest as Json, xml.documentElement, "http://schemas.xmlsoap.org/soap/envelope/", "s:Body");
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
    // GetDelegate returns a possibly missing array of responses
    let delegate = responseXML.querySelector("GetDelegateResponse");
    if (delegate?.getAttribute("ResponseClass") == "Success") {
      return [...responseXML.querySelectorAll("DelegateUser")].map(user => XML2JSON(user));
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
    let response = await fetch(this.url, this.createRequestOptions({ authorizationHeader: await appGlobal.remoteApp.createType1Message() }));
    assert(/\bNTLM\b/.test(response.headers.get("WWW-Authenticate")), gt`Your account is configured to use ${"NTLM"} authentication, but your server does not support it. Please change your account settings or set up the account again.`);
    return await appGlobal.remoteApp.createType3MessageFromType2Message(response.headers.get("WWW-Authenticate"), this.username, this.password);
  }

  createRequestOptions({ authorizationHeader, body, signal }: { authorizationHeader?: string, body?: string, signal?: AbortSignal }): any {
    let options: any = {
      body,
      headers: {
        'Content-Type': "text/xml; charset=utf-8",
      },
      method: "POST",
      signal,
    };
    if (this.authMethod == AuthMethod.OAuth2) {
      if (!this.oAuth2.isLoggedIn) {
        throw new LoginError(null, gt`Please login`);
      }
      options.headers.Authorization = this.oAuth2.authorizationHeader;
    } else if (this.authMethod == AuthMethod.NTLM) {
      if (authorizationHeader) {
        options.headers.Authorization = authorizationHeader;
      }
    } else if (this.authMethod == AuthMethod.Password) {
      options.headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(`${this.username}:${this.password}`)))}`;
    } else if (this.authMethod == AuthMethod.Unknown) {
      // triggers 401, which gives us WWW-Authenticate HTTP response header, which lists the login methods supported by the server
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

    if (this.oAuth2 && !this.oAuth2.isLoggedIn) {
      await this.oAuth2.login(false);
    }

    let response: any;
    try {
      response = await fetch(this.url, this.createRequestOptions({ authorizationHeader: options?.authorizationHeader, body: this.request2XML(aRequest) }));
    } finally {
      lock.release();
    }
    response.responseXML = this.parseXML(await response.text());
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
        assert(/\bBasic\b/.test(response.headers.get("WWW-Authenticate")), gt`Your account is configured to use ${gt`Password`} authentication, but your server does not support it. Please change your account settings or set up the account again.`);
        throw this.fatalError = new LoginError(null, gt`Password incorrect`);
      } else if (this.authMethod == AuthMethod.Unknown) {
        if (/\bBasic\b/.test(response.headers.get("WWW-Authenticate"))) {
          this.authMethod = AuthMethod.Password;
        } else if (/\bNTLM\b/.test(response.headers.get("WWW-Authenticate"))) {
          this.authMethod = AuthMethod.NTLM;
        } else {
          throw this.fatalError = new ConnectError(null,
            gt`Unsupported authentication protocol(s): ${response.headers.get("WWW-Authenticate")}`);
        }
        return repeat();
      } else {
        throw this.fatalError = new ConnectError(null,
          gt`Server supports authentication protocol(s): ${response.headers.get("WWW-Authenticate")}. Please check your account configuration.`);
      }
    } else {
      this.throttle.waitForSecond(1);
      throw new EWSError(response, aRequest);
    }
  }

  async callStream(request: Json, abort: AbortController, responseCallback: (message: Record<string, any>) => Promise<void>) {
    let lastAttempt: number;
    let signal = abort.signal;
    do {
      try {
        lastAttempt = Date.now();
        const endEnvelope = "</Envelope>";
        let body = this.request2XML(request);
        let data = "";
        let response = await fetch(this.url, this.createRequestOptions({ body, signal }));
        if (this.authMethod == AuthMethod.NTLM && response.status == 401) {
          let authorizationHeader = await this.loginWithNTLM();
          response = await fetch(this.url, this.createRequestOptions({ authorizationHeader, body, signal })); // Repeat the call
        }
        if (!response.ok) {
          console.error(`callStream failed with HTTP ${response.status} ${response.statusText}`);
          return;
        }
        for await (let chunk of response.body.pipeThrough(new TextDecoderStream())) {
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
              await responseCallback(message);
            } catch (ex) {
              this.errorCallback(ex);
            }
          }
        }
      } catch (ex) {
        if (signal.aborted) {
          // Log only for development purposes.
          console.log(signal.reason);
          break;
        }
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

  async unsubscribeAllSubscriptions() {
    for (let emailAddress in this.notificationAbort) {
      this.notificationAbort[emailAddress].abort("Disconnect requested");
    }
    this.notificationAbort = {};
    let unsubscribe = {
      m$Unsubscribe: {
        m$SubscriptionId: [this, ...this.dependentAccounts()].map(account => (account as EWSSubscribable).subscriptionID).filter(Boolean),
      },
    };
    try {
      await this.callEWS(unsubscribe);
    } catch (ex) {
      this.errorCallback(ex);
    }
    this.subscriptionID = undefined;
    for (let account of this.dependentAccounts().contents.filter((account: Account): account is EWSSubscribable => (account as EWSSubscribable).subscriptionID != undefined)) {
      account.subscriptionID = undefined;
    }
  }

  async unsubscribeNotifications(account: EWSSubscribable) {
    if (!account.subscriptionID) {
      return;
    }
    try {
      let unsubscribe = {
        m$Unsubscribe: {
          m$SubscriptionId: account.subscriptionID,
        },
      };
      await this.callEWS(unsubscribe);
      account.subscriptionID = undefined;
      await this.streamNotifications(account.username);
    } catch (ex) {
      this.errorCallback(ex);
    }
  }

  async subscribeToNotifications() {
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
    assert(!this.subscriptionID, "stream notification started twice");
    this.subscriptionID = sanitize.nonemptystring(response.SubscriptionId);
    await this.streamNotifications();
  }

  async subscribeToNotificationsForSubaccount(account: EWSSubscribable) {
    let subscribe = {
      m$Subscribe: {
        m$StreamingSubscriptionRequest: {
          t$FolderIds: {
            t$FolderId: {
              Id: account.folderID,
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
    };
    let response = await this.callEWS(subscribe);
    assert(!account.subscriptionID, "stream notification started twice");
    account.subscriptionID = sanitize.nonemptystring(response.SubscriptionId);
    await this.streamNotifications(account.username);
  }

  async streamNotifications(username = "") {
    this.notificationAbort[username]?.abort("Restarting stream due to changed subscription");
    this.notificationAbort[username] = new AbortController();
    let subscriptions = username
      ? this.dependentAccounts().contents.filter(
          (account: Account): account is EWSSubscribable => account.username == username && (account as EWSSubscribable).subscriptionID != undefined
        ).map(account => account.subscriptionID)
      : [this.subscriptionID];
    if (!subscriptions.length) {
      return;
    }
    let streamRequest = {
      m$GetStreamingEvents: {
        m$SubscriptionIds: {
          t$SubscriptionId: subscriptions,
        },
        // Maximum number of minutes to keep a stream open.
        // In minutes, between 1 and 30, inclusive.
        m$ConnectionTimeout: 29, // minutes
      },
    };
    // Now, connect and wait for the notifications. Runs 29 minutes long, so don't `await` it.
    this.callStream(streamRequest, this.notificationAbort[username], async message => {
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
        let mailFolder = this.folderMap.get(sanitize.string(folderID));
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
              t$ExtendedFieldURI: {
                PropertyTag: HiddenPidTag,
                PropertyType: "Boolean",
              },
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
        let parent = this.folderMap.get(sanitize.string(folder.ParentFolderId.Id));
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
    // Create the primary address book and calendar automatically
    let haveAddressbook = appGlobal.addressbooks.some(addressbook => addressbook.mainAccount == this);
    if (!haveAddressbook) {
      let folder = ensureArray(result.RootFolder.Folders.ContactsFolder).find(folder =>
        folder.DistinguishedFolderId == "contacts" && folder.ExtendedProperty?.Value != "true");
      let addressbook = this.createAddressbookAccount(folder);
      await addressbook.save();
      appGlobal.addressbooks.add(addressbook);
    }
    let haveCalendar = appGlobal.calendars.some(calendar => calendar.mainAccount == this);
    if (!haveCalendar) {
      let folder = ensureArray(result.RootFolder.Folders.CalendarFolder).find(folder =>
        folder.DistinguishedFolderId == "calendar");
      let calendar = this.createCalendarAccount(folder);
      await calendar.save();
      appGlobal.calendars.add(calendar);
    }
  }

  isOffice365(): boolean {
    let hostname = new URL(this.url).hostname;
    return hostname == "outlook.office365.com";
  }

  async createToplevelFolder(name: string): Promise<EWSFolder> {
    if (this.sharedFolderRoot == "inbox") {
      throw new Error(gt`You only have access to the Inbox of this shared account`);
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

  get mayHaveSubAccounts(): boolean {
    return true;
  }

  async listPossibleSubAccounts(): Promise<ArrayColl<Account>> {
    let accounts = await super.listPossibleSubAccounts();
    if (this.mainAccount) {
      return accounts;
    }
    let query = {
      m$FindFolder: {
        Traversal: "Deep",
        m$FolderShape: {
          t$BaseShape: "Default",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "folder:FolderClass",
            }, {
              FieldURI: "folder:DistinguishedFolderId",
            }],
            t$ExtendedFieldURI: {
              PropertyTag: HiddenPidTag,
              PropertyType: "Boolean",
            },
          },
        },
        m$ParentFolderIds: {
          t$DistinguishedFolderId: {
            Id: "msgfolderroot",
          },
        },
      },
    };
    let result = await this.callEWS(query);
    let addressbooks = ensureArray(result.RootFolder.Folders.ContactsFolder)
      .filter(folder => folder.ExtendedProperty?.Value != "true");
    let calendars = ensureArray(result.RootFolder.Folders.CalendarFolder)
      .filter(folder => folder.FolderClass == "IPF.Appointment");
    for (let account of this.dependentAccounts()) {
      if (account instanceof EWSAccount) {
        let request = {
          m$GetFolder: {
            m$FolderShape: {
              t$BaseShape: "Default",
              t$AdditionalProperties: {
                t$FieldURI: [{
                  FieldURI: "folder:FolderClass",
                }, {
                  FieldURI: "folder:DistinguishedFolderId",
                }],
                t$ExtendedFieldURI: {
                  PropertyTag: HiddenPidTag,
                  PropertyType: "Boolean",
                },
              },
            },
            m$FolderIds: {
              t$DistinguishedFolderId: ["contacts", "calendar"].map(folder => ({
                Id: folder,
                t$Mailbox: {
                  t$EmailAddress: account.username,
                },
              })),
            },
          },
        };
        let results = await this.callEWS(request);
        for (let result of results.filter(result => result.ResponseClass == "Success")) {
          if (result.Folders.ContactsFolder) {
            let folder = result.Folders.ContactsFolder;
            folder.account = account; // pass to createAddressbookAccount below
            addressbooks.push(folder);
          }
          if (result.Folders.CalendarFolder) {
            let folder = result.Folders.CalendarFolder;
            folder.account = account; // pass to createCalendarAccount below
            calendars.push(folder);
          }
        }
      }
    }
    accounts.addAll(addressbooks.map(ab => this.createAddressbookAccount(ab, ab.account)).filter(Boolean));
    accounts.addAll(calendars.map(cal => this.createCalendarAccount(cal, cal.account)).filter(Boolean));
    return accounts;
  }

  private createAddressbookAccount(folder: any, account?: EWSAccount): EWSAddressbook | null {
    assert(folder.ExtendedProperty?.Value != "true", "Need visible addressbook");
    if (this.dependentAccounts().find(account => account.protocol == "addressbook-ews" && (account as EWSAddressbook).folderID == folder.FolderId.Id)) {
      return null;
    }
    let addressbook = newAddressbookForProtocol("addressbook-ews") as EWSAddressbook;
    addressbook.initFromMainAccount(this);
    let isMainAddressbook = !account && folder.DistinguishedFolderId == "contacts";
    if (!isMainAddressbook && folder.DisplayName) {
      addressbook.name = `${(account || this).name} ${sanitize.nonemptylabel(folder.DisplayName)}`;
    }
    if (account) {
      addressbook.username = account.username;
    }
    addressbook.folderID = sanitize.nonemptystring(folder.FolderId.Id);
    return addressbook;
  }

  private createCalendarAccount(folder: any, account?: EWSAccount): EWSCalendar | null {
    assert(folder.FolderClass == "IPF.Appointment", "Need calendar");
    if (this.dependentAccounts().find(account => account.protocol == "calendar-ews" && (account as EWSCalendar).folderID == folder.FolderId.Id)) {
      return null;
    }
    let calendar = newCalendarForProtocol("calendar-ews") as EWSCalendar;
    calendar.initFromMainAccount(this);
    let isMainCalendar = !account && folder.DistinguishedFolderId == "calendar";
    if (isMainCalendar) {
      calendar.useForInvitations = true;
    } else if (folder.DisplayName) {
      calendar.name = `${(account || this).name} ${sanitize.nonemptylabel(folder.DisplayName)}`;
    }
    if (account) {
      calendar.username = account.username;
    }
    calendar.folderID = sanitize.nonemptystring(folder.FolderId.Id);
    return calendar;
  }

  async findSharedFolders(person: PersonUID, DistinguishedIDs: string[]): Promise<string[]> {
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
          t$DistinguishedFolderId: DistinguishedIDs.map(DistinguishedID => ({
            Id: DistinguishedID,
            t$Mailbox: {
              t$EmailAddress: person.emailAddress,
            },
          })),
        },
      },
    };
    try {
      let result = await this.callEWS(request);
      return result.filter(folder => folder.ResponseClass == "Success").map(folder => sanitize.string(getEWSItem(folder.Folders).DistinguishedFolderId));
    } catch (ex) {
      return [];
    }
  }

  async addSharedFolders(person: PersonUID, sharedFolderRoot: "msgfolderroot" | "inbox"): Promise<EWSAccount> {
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
    await account.save();
    appGlobal.emailAccounts.add(account);
    await account.startup();
    return account;
  }

  async addSharedAddressbook(person: PersonUID): Promise<EWSAddressbook> {
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
    addressbook.name = `${person.name} ${sanitize.label(folder.DisplayName)}`;
    addressbook.username = person.emailAddress;
    addressbook.folderID = sanitize.nonemptystring(folder.FolderId.Id);
    appGlobal.addressbooks.add(addressbook);
    await addressbook.startup();
    return addressbook;
  }

  async addSharedCalendar(person: PersonUID): Promise<EWSCalendar> {
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
    calendar.name = `${person.name} ${sanitize.label(folder.DisplayName)}`;
    calendar.username = person.emailAddress;
    calendar.folderID = sanitize.nonemptystring(folder.FolderId.Id);
    appGlobal.calendars.add(calendar);
    await calendar.startup();
    return calendar;
  }

  canShareWithPersons(): boolean {
    return true;
  }

  async getSharedPersons(): Promise<ArrayColl<PersonUID>> {
    // well, some of them at least...
    return await (this.inbox as EWSFolder).getSharedPersons();
  }

  async deleteSharedPerson(otherPerson: PersonUID) {
    for (let folder of this.getAllFolders()) {
      await deleteExchangePermissions(folder as EWSFolder, otherPerson);
    }
  }

  async addSharedPerson(otherPerson: PersonUID, mailFolder: EWSFolder | null, includeSubfolders: boolean, access: MailShareCombinedPermissions, ...permissions: MailShareIndividualPermissions[]) {
    // XXX Need root folder to share all mail
    let foldersToShare = (!mailFolder ? this.getAllFolders() : includeSubfolders ? mailFolder.getInclusiveDescendants() : new ArrayColl<Folder>([mailFolder]));
    for (let folder of foldersToShare) {
      await setExchangePermissions(folder as EWSFolder, otherPerson, access, ...permissions);
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

export interface EWSSubscribable extends Account {
  /** FolderId to subscribe to */
  readonly folderID: string;
  /** SubscriptionId for unsubscribing on disconnect */
  subscriptionID?: string;
}

export type JsonRequest = Json | EWSCreateItemRequest | EWSDeleteItemRequest | EWSUpdateItemRequest;

/** @see <https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxprops/01b52d3c-d194-4a8c-83ee-4ac7506339da> */
const HiddenPidTag = "0x10F4";

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
