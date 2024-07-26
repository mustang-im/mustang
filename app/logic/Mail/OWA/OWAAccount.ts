import { AuthMethod, MailAccount, TLSSocketType } from "../MailAccount";
import type { EMail } from "../EMail";
import { OWAFolder } from "./OWAFolder";
import OWACreateItemRequest from "./OWACreateItemRequest";
import { OWAAddressbook } from "../../Contacts/OWA/OWAAddressbook";
import { OWACalendar } from "../../Calendar/OWA/OWACalendar";
import type { PersonUID } from "../../Abstract/PersonUID";
import { ContentDisposition } from "../Attachment";
import { LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { notifyChangedProperty } from "../../util/Observable";
import { blobToBase64 } from "../../util/util";
import { assert } from "../../util/util";

type LoginFormElements = {
  url: string,
  form: HTMLFormElement,
  username: HTMLInputElement,
  password: HTMLInputElement,
}

class OWAError extends Error {
  constructor(response) {
    let message = response.message || `HTTP ${response.status} ${response.statusText}`;
    if (response.json) {
      let body = response.json.Body || response.json;
      if (body.FaultMessage) {
        message = body.FaultMessage;
      }
      if (body.ResponseMessages?.Items?.[0]) {
        body = body.ResponseMessages.Items[0];
      }
      if (body.MessageText) {
        message = body.MessageText;
      }
    }
    super(message);
  }
}

export class OWAAccount extends MailAccount {
  readonly protocol: string = "owa";
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  readonly folderMap = new Map<string, OWAFolder>;
  /**
   * We get notifications for folders we're not interested in.
   * We filter them out by checking that the parent exists.
   * But we have to special-case the root folder,
   * since Mustang doesn't use a dedicated root folder object.
   */
  msgFolderRootID: string | void;
  @notifyChangedProperty
  hasLoggedIn = false;

  constructor() {
    super();
    assert(appGlobal.remoteApp.OWA, "OWA: Need backend");
  }

  newFolder(): OWAFolder {
    return new OWAFolder(this);
  }

  get partition(): string {
    return 'persist:login:' + this.id;
  }

  get isLoggedIn(): boolean {
    return this.hasLoggedIn;
  }

  async findLoginElements(): Promise<LoginFormElements> {
    let response = await appGlobal.remoteApp.OWA.fetchText(this.partition, this.url);
    let elements = null;
    if (await response.ok) {
      let url = await response.url;
      let text = await response.text;
      let dom = new DOMParser().parseFromString(text, "text/html");
      for (let form of dom.forms) {
        if (!/^\//.test(form.getAttribute("action"))) {
          continue;
        }
        let username = null;
        let password = null;
        for (let e of form.elements) {
          let element = e as HTMLInputElement;
          if (element.style.display == "none") {
            continue;
          }
          if (element.type == "text" || element.type == "email") {
            if (username) {
              username = null;
              break;
            }
            username = element;
          }
          if (element.type == "password") {
            if (password) {
              password = null;
              break;
            }
            password = element;
          }
        }
        if (username && password) {
          if (elements) {
            elements = null;
            break;
          }
          elements = { url, form, username, password };
        }
      }
    }
    return elements;
  }

  async submitLoginForm(elements: LoginFormElements) {
    elements.username.value = this.emailAddress;
    elements.password.value = this.password;
    if ("flags" in elements.form.elements) {
      (elements.form.elements.flags as any).value |= 1;
    }
    if ("trusted" in elements.form.elements) {
      (elements.form.elements.trusted as any).checked = true;
    }
    let url = new URL(elements.form.getAttribute("action"), elements.url).toString();
    let data = Object.fromEntries(new FormData(elements.form));
    return await appGlobal.remoteApp.OWA.fetchText(this.partition, url, data);
  }

  async login(interactive: boolean): Promise<void> {
    if (this.authMethod == AuthMethod.OAuth2) {
      await this.listFolders(interactive);
    } else try {
      await this.listFolders();
    } catch (ex) {
      if (!/^HTTP (401|440)/.test(ex.message)) {
        throw ex;
      }
      let elements = await this.findLoginElements();
      if (!elements) {
        throw new Error("Could not find login form");
      }
      let response = await this.submitLoginForm(elements);
      let formURL = new URL(elements.url);
      let responseURL = new URL(response.url);
      if (response.status == 401 || responseURL.origin == formURL.origin && responseURL.pathname == formURL.pathname && responseURL.searchParams.get("reason") == "2") {
        throw new LoginError(null, "Password incorrect");
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      await this.listFolders();
    }
    this.hasLoggedIn = true;

    let addressbook = appGlobal.addressbooks.find((addressbook: OWAAddressbook) => addressbook.protocol == "addressbook-owa" && addressbook.url == this.url && addressbook.username == this.emailAddress) as OWAAddressbook | void;
    if (!addressbook) {
      addressbook = new OWAAddressbook();
      addressbook.url = this.url;
      addressbook.username = this.emailAddress;
      addressbook.workspace = this.workspace;
      appGlobal.addressbooks.add(addressbook);
    }
    addressbook.account = this;
    await addressbook.listContacts();

    let calendar = appGlobal.calendars.find((calendar: OWACalendar) => calendar.protocol == "calendar-owa" && calendar.url == this.url && calendar.username == this.emailAddress) as OWACalendar | void;
    if (!calendar) {
      calendar = new OWACalendar();
      calendar.name = this.name;
      calendar.url = this.url;
      calendar.username = this.emailAddress;
      calendar.workspace = this.workspace;
      appGlobal.calendars.add(calendar);
    }
    calendar.account = this;
    await calendar.listEvents();

    this.listenForEvents();
    let request = new OWASubscribeToNotificationRequest();
    this.callOWA(request);
  }

  async logout(): Promise<void> {
    this.hasLoggedIn = false;
    return appGlobal.remoteApp.OWA.clearStorageData(this.partition);
  }

  async send(email: EMail): Promise<void> {
    let request = new OWACreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
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

  async callOWA(aRequest: any): Promise<any> {
    if (!this.hasLoggedIn) {
      throw new LoginError(null, "Please login");
    }
    let url = this.url + 'service.svc';
    // Need to ensure the request gets passed as a regular object
    let response = await appGlobal.remoteApp.OWA.fetchJSON(this.partition, url, aRequest.type || aRequest.__type.slice(0, -21), Object.assign({}, aRequest));
    if ([401, 440].includes(response.status)) {
      await this.logout();
      throw new LoginError(null, "Please login");
    }
    if (!response.json && response.url != url && response.contentType.toLowerCase().split(";")[0].trim() == "text/html") {
      await this.logout();
      throw new Error(response.message);
    }
    if (!response.ok) {
      throw new OWAError(response);
    }
    let result = response.json;
    if (result.Body) {
      result = result.Body;
    }
    if (result.ResponseMessages?.Items?.length == 1) {
      result = result.ResponseMessages.Items[0];
    }
    if (result.MessageText) {
      throw new OWAError(response);
    }
    return result;
  }

  async listFolders(interactive?: boolean): Promise<void> {
    let sessionData = await appGlobal.remoteApp.OWA.fetchSessionData(this.partition, this.url, interactive);
    if (!sessionData) {
      throw new Error("Authentication window was closed by user");
    }
    this.msgFolderRootID = sessionData.findFolders.Body.ResponseMessages.Items[0].RootFolder.ParentFolder.FolderId.Id;
    for (let folder of sessionData.findFolders.Body.ResponseMessages.Items[0].RootFolder.Folders) {
      if (!folder.FolderClass || folder.FolderClass == "IPF.Note" || folder.FolderClass.startsWith("IPF.Note.")) {
        let parent = this.folderMap.get(folder.ParentFolderId.Id);
        let parentFolders = parent ? parent.subFolders : this.rootFolders;
        let owaFolder = parentFolders.find(owaFolder => owaFolder.id == folder.FolderId.Id) as OWAFolder;
        if (!owaFolder) {
          owaFolder = this.newFolder();
          owaFolder.parent = parent || null;
          parentFolders.push(owaFolder);
        }
        owaFolder.fromJSON(folder);
        this.folderMap.set(folder.FolderId.Id, owaFolder);
      }
    }
  }

  async listenForEvents() {
    try {
      let url = this.url + "ev.owa2?ns=PendingRequest&ev=FinishNotificationRequest&UA=0";
      let response = await appGlobal.remoteApp.OWA.fetchJSON(this.partition, url);
      let cid = response.json.cid;
      // This loop only ends by exception (e.g. logout) or app shutdown.
      while (true) {
        url = this.url + "ev.owa2?ns=PendingRequest&ev=PendingNotificationRequest&UA=0&cid=" + cid + "&X-OWA-CANARY=";
        let stream = await appGlobal.remoteApp.OWA.streamJSON(this.partition, url);
        if (!stream.ok) {
          console.error(`streamJSON failed with HTTP {stream.status} {stream.statusText}`);
          break;
        }
        for await (let chunk of stream.body) {
          // Avoid racing with ourselves, if we caused the notification.
          await new Promise(resolve => setTimeout(resolve, 100));
          let matches = chunk.match(/<script>.*?<\/script>/g);
          if (matches) {
            let newMessageIDs: string[] = [];
            for (let match of matches) {
              let script = match.slice(8, -9);
              if (script.startsWith("[")) {
                for (let notification of JSON.parse(script)) {
                  switch (notification.id) {
                  case "HierarchyNotification":
                    this.handleHierarchyNotification(notification);
                    break;
                  case "NewMailNotification":
                    newMessageIDs.push(notification.ItemId);
                    break;
                  }
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
        }
      }
    } catch (ex) {
      this.errorCallback(ex);
    }
  }

  handleHierarchyNotification(notification: any) {
    try {
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
    } catch (ex) {
      this.errorCallback(ex);
    }
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

class OWASubscribeToNotificationRequest {
  readonly request = {
    __type: "NotificationSubscribeJsonRequest:#Exchange",
    Header: {
      __type: "JsonRequestHeaders:#Exchange",
      RequestServerVersion: "Exchange2013",
    },
  };
  readonly subscriptionData = [{
    __type: "SubscriptionData:#Exchange",
    SubscriptionId: "HierarchyNotification",
    Parameters: {
      __type: "SubscriptionParameters:#Exchange",
      NotificationType: "HierarchyNotification",
    },
  }, {
    __type: "SubscriptionData:#Exchange",
    SubscriptionId: "NewMailNotification",
    Parameters: {
      __type: "SubscriptionParameters:#Exchange",
      NotificationType: "NewMailNotification",
    },
  }];

  get type() {
    return "SubscribeToNotification";
  }
}
