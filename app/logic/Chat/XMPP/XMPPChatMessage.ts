import { ChatMessage } from "../Message";
import type { XMPPChat } from "./XMPPChat";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import type { Message, Forward } from "stanza/protocol";
import type { JSONElement } from "stanza/jxt";

export class XMPPChatMessage extends ChatMessage {
  constructor(chatRoom: XMPPChat) {
    super(chatRoom);
  }
  get chatRoom(): XMPPChat {
    return this.to as XMPPChat;
  }

  /**
   * Take a raw message from the server, interpret it, and set the values of this object.
   *
   * If from the archive:
   * @param wrapper The MAM/carbon envelope
   * @param archiveID The MAM archive ID
   */
  fromStanzaJS(json: Message, wrapper?: Forward, archiveID?: string): void {
    assert(json, "Need message");
    this.id = sanitize.nonemptystring(json.id, null) ??
      sanitize.nonemptystring(archiveID, null) ?? crypto.randomUUID();
    this.sent = sanitize.date(wrapper?.delay?.timestamp ?? json.delay?.timestamp, new Date());
    this.received = new Date(this.sent); // copy: callers may mutate dates in place
    this.chatRoom.fillSender(this, json.from);
    let subject = sanitize.nonemptylabel(json.subject, null);
    if (json.hasSubject && subject) {
      this.subject = subject;
    }
    this.text = sanitize.string(json.body, "");
    let html = json.html?.body ? jsonElementToXML(json.html.body as JSONElement) : null;
    if (html) {
      this.html = html; // .html getter sanitizes
    }
  }
}

/** Serializes a XEP-0071 XHTML body back to an HTML string.
 * stanza gives us parsed `JSONElement`s, not XML text.
 *
 * TODO Find Stanza API to get the raw HTML in the msg. */
function jsonElementToXML(el: JSONElement | string): string {
  if (typeof el == "string") {
    return escapeXMLText(el);
  }
  let attrs = Object.entries(el.attributes ?? {})
    .filter(([_name, value]) => value !== undefined && value !== null)
    .map(([name, value]) => ` ${name}="${escapeXMLAttribute(value)}"`)
    .join("");
  let children = (el.children ?? []).map(jsonElementToXML).join("");
  return `<${el.name}${attrs}>${children}</${el.name}>`;
}

function escapeXMLText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXMLAttribute(text: string): string {
  return escapeXMLText(text).replace(/"/g, "&quot;");
}
