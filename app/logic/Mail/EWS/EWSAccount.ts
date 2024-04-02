import { MailAccount, TLSSocketType } from "../MailAccount";
import { EWSFolder } from "./EWSFolder";
import { SpecialFolder } from "../Folder";
import { OAuth2MS } from "../../Auth/OAuth2MS";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";

export class EWSAccount extends MailAccount {
  readonly protocol: string = "ews";
  readonly port: number = 443;
  readonly tls = TLSSocketType.TLS;
  prefBranch: string = "";
  oAuth2: OAuth2MS | undefined;

  constructor() {
    super();
    assert(appGlobal.remoteApp.postHTTP, "EWS: Need backend");
  }

  newFolder(): EWSFolder {
    return new EWSFolder(this);
  }

  get subFolders() { // Thunderbird uses an actual root folder but we have to fake it
    return this.rootFolders;
  }

  get isLoggedIn(): boolean {
    return !this.rootFolders.isEmpty;
  }

  async login(interactive: boolean): Promise<void> {
    if (this.hostname == "outlook.office365.com") {
      this.oAuth2 = new OAuth2MS(this, interactive);
    }
    await this.listFolders();
  }

  async logout(): Promise<void> {
    // Not sure what the intention is here.
  }

  JSON2XML(aJSON: Json, aParent: Element, aNS: string, aTag: string): void {
    if (aJSON == null) {
      return;
    }
    if (Array.isArray(aJSON)) {
      for (let value of aJSON) {
        this.JSON2XML(value, aParent, aNS, aTag);
      }
      return;
    }
    let element = aParent.ownerDocument.createElementNS(aNS, aTag);
    aParent.appendChild(element);
    if (typeof aJSON != "object") {
      element.textContent = String(aJSON);
      return;
    }
    for (let key in aJSON) {
      if (key == "_TextContent_") {
        element.textContent = String(aJSON[key]);
      } else if (key.includes("$")) {
        let ns = aParent.ownerDocument.documentElement.getAttributeNS("http://www.w3.org/2000/xmlns/", key.slice(0, key.indexOf("$")));
        let tagName = key.replace("$", ":");
        this.JSON2XML(aJSON[key], element, ns, tagName);
      } else {
        element.setAttribute(key, String(aJSON[key]));
      }
    }
  }

  request2XML(aRequest: Json): string {
    let xml = document.implementation.createDocument("http://schemas.xmlsoap.org/soap/envelope/", "s:Envelope");
    xml.documentElement.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:s", "http://schemas.xmlsoap.org/soap/envelope/");
    xml.documentElement.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:m", "http://schemas.microsoft.com/exchange/services/2006/messages");
    xml.documentElement.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:t", "http://schemas.microsoft.com/exchange/services/2006/types");
    this.JSON2XML({
      t$RequestServierVersion: {
        Version: "Exchange2003",
      },
      t$TimeZoneContext: {
        t$TimeZoneDefinition: {
          Id: "UTC",
        },
      },
    }, xml.documentElement, "http://schemas.xmlsoap.org/soap/envelope/", "s:Header");
    this.JSON2XML(aRequest, xml.documentElement, "http://schemas.xmlsoap.org/soap/envelope/", "s:Body");
    return new XMLSerializer().serializeToString(xml);
  }

  checkResponse(aResponse, aRequest: Json): Json {
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

  async createRequestOptions(): Promise<any> {
    let options: any = {
      throwHttpErrors: false,
      responseType: 'text',
      headers: {
        'Content-Type': "text/xml; charset=utf-8",
      },
    };
    if (this.oAuth2) {
      let accessToken = await this.oAuth2.getAccessToken();
      options.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      options.headers.Authorization = `Basic ${btoa(unescape(encodeURIComponent(`${this.username}:${this.password}`)))}`;
    }
    return options;
  }

  async callEWS(aRequest: Json): Promise<any> {
    while (true) {
      let response = await appGlobal.remoteApp.postHTTP(`https://${this.hostname}/EWS/Exchange.asmx`, this.request2XML(aRequest), await this.createRequestOptions());
      response.responseXML = this.parseXML(response.data);
      if (response.status == 200) {
        return this.checkResponse(response, aRequest);
      }
      if (response.status != 401) {
        throw new EWSError(response, aRequest);
      }
      if (this.oAuth2) {
        this.oAuth2.clearAccessToken();
      } else {
        throw new Error("Password incorrect");
      }
    }
  }

  async listFolders(): Promise<void> {
    let request = {
      m$GetFolder: {
        m$FolderShape: {
          t$BaseShape: "IdOnly",
        },
        m$FolderIds: {
          t$DistinguishedFolderId: [{
            Id: "msgfolderroot",
          }],
        },
      },
    };
    let response = await this.callEWS(request);
    let rootFolderId = response.Folders.Folder.FolderId.Id;
    let folderMap = {};
    folderMap[rootFolderId] = this;
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
    for (let folder of result.RootFolder.Folders.Folder) {
      if (!folder.FolderClass || folder.FolderClass == "IPF.Note" || folder.FolderClass.startsWith("IPF.Note.")) {
        let ewsFolder = this.newFolder();
        let parent = folderMap[folder.ParentFolderId.Id];
        ewsFolder.id = folder.FolderId.Id;
        ewsFolder.name = folder.DisplayName;
        ewsFolder.parent = parent == this ? null : parent;
        ewsFolder.countTotal = folder.TotalCount;
        ewsFolder.countUnread = folder.UnreadCount;
        parent.subFolders.push(ewsFolder);
        folderMap[folder.FolderId.Id] = ewsFolder;
        switch (folder.DistinguishedFolderId) {
        case "inbox":
          ewsFolder.specialFolder = SpecialFolder.Inbox;
          this.inbox = ewsFolder;
          break;
        case "drafts":
          ewsFolder.specialFolder = SpecialFolder.Drafts;
          this.drafts = ewsFolder;
          break;
        case "sentitems":
          ewsFolder.specialFolder = SpecialFolder.Sent;
          this.sent = ewsFolder;
          break;
        case "junkemail":
          ewsFolder.specialFolder = SpecialFolder.Spam;
          this.spam = ewsFolder;
          break;
        case "deleteditems":
          ewsFolder.specialFolder = SpecialFolder.Trash;
          this.trash = ewsFolder;
          break;
        //case "outbox":
        }
      }
    }
  }
}


type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function XML2JSON(aNode: Element): Json {
  if (!aNode.children.length && !aNode.attributes.length) {
    return aNode.textContent;
  }
  let result: Json = {};
  for (let { name, value } of aNode.attributes) {
    result[name] = value;
  }
  if (aNode.childNodes.length && !aNode.children.length) {
    result.Value = aNode.textContent;
  }
  for (let child of aNode.children) {
    if (result[child.localName]) {
      if (!Array.isArray(result[child.localName])) {
        result[child.localName] = [result[child.localName]];
      }
      (result[child.localName] as Json[]).push(XML2JSON(child));
    } else {
      result[child.localName] = XML2JSON(child);
    }
  }
  return result;
}

class EWSError extends Error {
  readonly request: Json;
  readonly status: number;
  readonly statusText: string;
  readonly type: string;
  readonly XML: Json | undefined;
  readonly error: Json | undefined;
  readonly responseText: string | undefined;
  constructor(aResponse, aRequest) {
    let message = aResponse.statusText;
    try {
      let responseXML = aResponse.responseXML;
      let messageNode = responseXML.querySelector("Message");
      if (messageNode) {
        message = messageNode.textContent;
      }
      let errorNode = responseXML.querySelector("[ResponseClass=\"Error\"]");
      if (errorNode) {
        let errorResponse = XML2JSON(errorNode) as any;
        message = errorResponse.MessageText;
      }
      let innerErrorNode = responseXML.querySelector("[Name=\"InnerErrorMessageText\"]");
      if (innerErrorNode) {
        message = innerErrorNode.textContent;
      }
    } catch (ex) {
    }
    super(message);
    this.request = aRequest;
    this.status = aResponse.status;
    this.statusText = aResponse.statusText;
    this.type = 'HTTP ' + aResponse.status;
    try {
      let responseXML = aResponse.responseXML;
      let messageNode = responseXML.querySelector("Message");
      let responseCode = responseXML.querySelector("ResponseCode");
      if (responseCode) {
        this.type = responseCode.textContent;
      }
      let errorNode = responseXML.querySelector("[ResponseClass=\"Error\"]");
      if (errorNode) {
        let errorResponse = XML2JSON(errorNode) as any;
        this.type = errorResponse.ResponseCode;
      }
      let innerErrorNode = responseXML.querySelector("[Name=\"InnerErrorResponseCode\"]");
      if (innerErrorNode) {
        this.type = innerErrorNode.textContent;
      }
      let xmlNode = responseXML.querySelector("MessageXml");
      if (xmlNode) {
        // This identifies the XML element causing the error.
        this.XML = XML2JSON(xmlNode);
      }
      if (messageNode || responseCode || errorNode || xmlNode) {
        this.error = XML2JSON(responseXML.documentElement);
      }
    } catch (ex) {
      // The response wasn't XML, so we can't extract an error message.
      this.responseText = aResponse.data;
    }
  }
}

class EWSItemError extends Error {
  readonly request: Json;
  readonly error: Json;
  readonly type: string;
  constructor(errorResponseJSON: any, aRequest: Json) {
    if (Array.isArray(errorResponseJSON.MessageXml?.Value)) {
      for (let { Name, Value } of errorResponseJSON.MessageXml.Value) {
        errorResponseJSON[Name.replace(/^InnerError/, "")] = Value;
      }
    }
    super(errorResponseJSON.MessageText);
    this.request = aRequest;
    this.error = errorResponseJSON as Json;
    this.type = errorResponseJSON.ResponseCode;
  }
}
