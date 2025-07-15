import { XML2JSON, type Json } from "./XML2JSON";
import type { JsonRequest } from "./EWSAccount";
import { gt } from "../../../l10n/l10n";

export class EWSError extends Error {
  readonly request: JsonRequest;
  readonly status: number;
  readonly statusText: string;
  readonly type: string;
  readonly XML: Json | undefined;
  readonly error: Json | undefined;
  readonly responseText: string | undefined;
  constructor(aResponse: any, aRequest: JsonRequest) {
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
      console.log("Could not read error response from server", ex);
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

export class EWSItemError extends Error {
  readonly request: JsonRequest;
  readonly error: any;
  readonly type: string;
  constructor(errorResponseJSON: any, aRequest: JsonRequest) {
    if (Array.isArray(errorResponseJSON.MessageXml?.Value)) {
      for (let { Name, Value } of errorResponseJSON.MessageXml.Value) {
        errorResponseJSON[Name.replace(/^InnerError/, "")] = Value;
      }
    }
    super(errorResponseJSON.MessageText);
    this.request = aRequest;
    this.error = errorResponseJSON;
    this.type = errorResponseJSON.ResponseCode;
    if (this.type == "ErrorItemNotFound") {
      this.message = gt`This was deleted on the server`;
    }
  }
}
