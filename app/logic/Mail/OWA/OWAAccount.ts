import { MailAccount, TLSSocketType } from "../MailAccount";
import type { EMail } from "../EMail";
import { OWAFolder } from "./OWAFolder";
import OWACreateItemRequest from "./OWACreateItemRequest";
import type { PersonUID } from "../../Abstract/PersonUID";
import { ContentDisposition } from "../Attachment";
import { appGlobal } from "../../app";
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
  hasLoggedIn = false;

  constructor() {
    super();
    assert(appGlobal.remoteApp.OWA, "OWA: Need backend");
  }

  newFolder(): OWAFolder {
    return new OWAFolder(this);
  }

  get isLoggedIn(): boolean {
    return this.hasLoggedIn;
  }

  async login(interactive: boolean): Promise<void> {
    await this.listFolders(interactive);
    this.hasLoggedIn = true;
  }

  async logout(): Promise<void> {
    this.hasLoggedIn = false;
    return appGlobal.remoteApp.OWA.clearStorageData(this.emailAddress);
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
    let url = this.url + 'service.svc';
    // Need to ensure the request gets passed as a regular object
    let response = await appGlobal.remoteApp.OWA.fetchJSON(this.emailAddress, url, Object.assign({}, aRequest));
    if ([401, 440].includes(response.status)) {
      await this.logout();
      throw new Error("Please login");
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
    let sessionData = await appGlobal.remoteApp.OWA.fetchSessionData(this.emailAddress, this.url, interactive);
    if (!sessionData) {
      throw new Error("Authentication window was closed by user");
    }
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
