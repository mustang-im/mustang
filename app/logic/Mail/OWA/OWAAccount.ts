import { MailAccount, TLSSocketType } from "../MailAccount";
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

  async login(interactive: boolean): Promise<void> {
    await this.listFolders(interactive);
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
    let sessionData = await appGlobal.remoteApp.OWA.fetchSessionData(this.partition, this.url, interactive, autoFillLoginPage(this.emailAddress, this.password));
    if (!sessionData) {
      throw new Error("Authentication window was closed by user");
    }
    this.url = sessionData.owaURL ?? this.url;
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

function autoFillLoginPage(username: string = "", password: string = "") {
  return `
    function waitForMutation() {
      let observer = new MutationObserver(function(mutations) {
        observer.disconnect();
        // Wait for mutations to finish before rechecking for widgets.
        setTimeout(checkForWidgets, 100);
      });
      observer.observe(document.body, { subtree: true, childList: true });
    }

    function checkForWidgets() {
      // Hotmail sometimes uses submit buttons.
      let inputs = [...document.querySelectorAll("input, button")];
      let user = inputs.filter(input => input.type == "text" || input.type == "email");
      let pass = inputs.filter(input => input.type == "password");
      let submit = inputs.filter(input => input.type == "submit");
      let button = inputs.filter(input => input.type == "button");
      let accept = document.getElementById("acceptButton");
      let decline = document.getElementById("declineButton");

      switch (sessionStorage.getItem("AutoLoginStep")) {
      // New login attempt, no step saved yet.
      case null:
        // Maybe we're trying to sign in to a personal account.
        for (let link of document.links) {
          if (link.dataset.m) {
            try {
              if (JSON.parse(link.dataset.m).cN == "SIGNIN") {
                sessionStorage.setItem("AutoLoginStep", "OtherUser");
                link.click();
                return;
              }
            } catch (ex) {
              console.error(ex);
            }
          }
        }
        // No sign in link? Fall through to try the "Other User" element.

      case "OtherUser":
        let otherTile = document.getElementById("otherTile");
        if (otherTile) {
          sessionStorage.setItem("AutoLoginStep", "Username");
          otherTile.click();
          // This click doesn't load a new page. Instead,
          // the form to input the user name is created by script.
          waitForMutation();
          return;
        }
        // No "Other User" element? Fall through to try the username.

      case "Username":
        if (user.length == 1 && pass.length == 1 && submit.length == 1 &&
            document.activeElement == user[0]) {
          // The page is prompting us for the email address.
          sessionStorage.setItem("AutoLoginStep", "Password");
          user[0].value = ${JSON.stringify(username)};
          user[0].dispatchEvent(new Event("change"));
          pass[0].value = ${JSON.stringify(password)};
          pass[0].dispatchEvent(new Event("change"));
          submit[0].focus();
          submit[0].click();
          // This click doesn't load a new page. Instead,
          // the form to input the password is manipulated by script.
          waitForMutation();
          return;
        }

      // Try the password
      case "Password":
        // Office 365 keeps the user input, Hotmail does not.
        if (user.length <= 1 && pass.length == 1 && submit.length == 1 &&
            document.activeElement == pass[0]) {
          // The page is prompting us for the password.
          sessionStorage.setItem("AutoLoginStep", "CheckPassword");
          // Hotmail: "[x] Keep me signed in" (may be obsolete)
          let keep = inputs.filter(input => input.type == "checkbox");
          if (keep.length == 1 && keep[0].name == "KMSI" && !keep[0].checked) {
            keep[0].click();
          }
          // Simply setting the value does not work for Hotmail,
          // apparently because it overwrites the value setter.
          // Call the original one from the prototype instead.
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(pass[0], ${JSON.stringify(password)});
          pass[0].dispatchEvent(new Event("change", { bubbles: true }));
          submit[0].focus();
          submit[0].click();
          return;
        }

      case "CheckPassword":
        let passwordError = document.getElementById("passwordError");
        let passwordErrorMessage = passwordError && passwordError.textContent.trim();
        if (passwordErrorMessage) {
          sessionStorage.setItem("AutoLoginStep", "PasswordError");
          // TODO Notify the UI in some way
          return;
        }

      // Try the "Stay signed in" prompt
      case "StaySignedIn":
        if (user.length == 0 && pass.length == 0 && submit.length == 1 &&
            button.length == 1 && button[0].value) {
          // The page is prompting us to stay logged in.
          sessionStorage.setItem("AutoLoginStep", "Complete");
          // submit = yes, button = no
          submit[0].focus();
          submit[0].click();
          return;
        } else if (accept && decline) {
          // The page is prompting us to stay logged in.
          sessionStorage.setItem("AutoLoginStep", "Complete");
          accept.focus();
          accept.click();
          return;
        } else {
          // Page might not be ready yet. Try again after the DOM has updated.
          waitForMutation();
        }
        break;

      case "PasswordError":
        return; // Mute. Let user handle it.

      case "Complete":
        break; // nothing to do here
      }
    };

    checkForWidgets();
  `;
}
