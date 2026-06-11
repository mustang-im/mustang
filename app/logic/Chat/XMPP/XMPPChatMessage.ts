import { UserChatMessage } from "../Message";
import { getBareJID } from "./XMPPAccount";
import type { XMPPChat } from "./XMPPChat";
import { assert } from "../../util/util";
import type { Message, Forward } from "stanza/protocol";
import type { JSONElement } from "stanza/jxt";

export class XMPPChatMessage extends UserChatMessage {
  constructor(chatRoom: XMPPChat) {
    super(chatRoom);
  }
  get chatRoom(): XMPPChat {
    return this.to as XMPPChat;
  }
  /** @param wrapper The MAM/carbon envelope, if from the archive
   * @param archiveID The MAM archive ID, if from the archive */
  fromStanzaJS(json: Message, wrapper?: Forward, archiveID?: string): void {
    assert(json, "Need message");
    this.id = json.id ?? archiveID ?? crypto.randomUUID();
    this.sent = wrapper?.delay?.timestamp ?? json.delay?.timestamp ?? new Date();
    this.received = new Date(this.sent); // copy: callers may mutate dates in place
    let me = this.chatRoom.account.jid;
    let from = getBareJID(json.from);
    this.outgoing = !!from && from == me;
    // 1:1 chat: `contact` is the chat partner, set by the ctor.
    // For group chats, find the sender:
    if (!this.outgoing && from && from != this.chatRoom.id) {
      this.contact = this.chatRoom.account.getExistingPerson(from) ?? this.contact;
    }
    if (json.hasSubject && json.subject) {
      this.subject = json.subject;
    }
    this.text = json.body ?? "";
    let html = json.html?.body ? jsonElementToXML(json.html.body as JSONElement) : null;
    if (html) {
      this.html = html;
    }
  }
}

/** Serializes a XEP-0071 XHTML body back to an HTML string.
 * stanza gives us parsed `JSONElement`s, not XML text. */
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
