import { ChatMessage } from "../Message";
import type { XMPPChat } from "./XMPPChat";
import { Attachment, ContentDisposition } from "../../Abstract/Attachment";
import { fileExtensions } from "../../Files/FileType/MIMETypes";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import type { Message, Forward } from "stanza/protocol";
import type { JSONElement } from "stanza/jxt";

export class XMPPChatMessage extends ChatMessage {
  /** Server/room-assigned ID (XEP-0359), referenced by reactions etc. in MUCs */
  stanzaID: string | null = null;
  /** This message arrived OMEMO-encrypted (XEP-0384) */
  encrypted = false;
  /** The sender deleted this message again (XEP-0424) */
  retracted = false;
  /** The sender edited this message after sending (XEP-0308) */
  edited = false;

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
    this.stanzaID = json.stanzaIds?.find(stanzaID => stanzaID.id)?.id ?? null;
    this.sent = sanitize.date(wrapper?.delay?.timestamp ?? json.delay?.timestamp, new Date());
    this.received = new Date(this.sent); // copy: callers may mutate dates in place
    // The chat resolves the sender (the chat partner for 1:1, the occupant for MUC)
    this.chatRoom.fillSender(this, json.from);
    let subject = sanitize.nonemptylabel(json.subject, null);
    if (json.hasSubject && subject) {
      this.subject = subject;
    }
    this.text = sanitize.string(json.body, "");
    if (json.html?.body) {
      this.fromHTML(json.html.body as JSONElement);
    }
    if (json.reply?.id) {
      this.inReplyTo = json.reply.id; // XEP-0461
    }
  }

  /** Creates an attachment for a shared-file URL (XEP-0363 / OMEMO media) and
   * downloads it — decrypting an aesgcm:// URL — in the background. */
  addMediaFromURL(url: string): void {
    // The filename is derived from a peer-supplied URL, so decode it (it may be
    // percent-encoded) and sanitize away path separators and the like.
    let path = url.split("#")[0].split("?")[0].split("/").pop() || "";
    let decoded: string;
    try {
      decoded = decodeURIComponent(path);
    } catch (ex) {
      decoded = path; // malformed %-escape: keep the raw form for sanitizing
    }
    let filename = sanitize.filename(decoded, gt`File`);
    let extension = filename.split(".").pop()?.toLowerCase() ?? "";
    let attachment = new Attachment();
    attachment.filename = filename;
    attachment.mimeType = (fileExtensions as Record<string, string>)[extension] ?? "application/octet-stream";
    attachment.disposition = attachment.mimeType.startsWith("image/")
      ? ContentDisposition.inline
      : ContentDisposition.attachment;
    this.attachments.add(attachment);
    this.chatRoom.account.media.download(url)
      .then(data => {
        attachment.content = new File([new Uint8Array(data)], filename, { type: attachment.mimeType });
        attachment.size = data.length;
      })
      .catch(ex => this.chatRoom.account.errorCallback(ex));
  }

  /** Sets our HTML from a XEP-0071 XHTML body. stanza gives us a parsed
   * `JSONElement`, not XML text, so we serialize it back ourselves. */
  fromHTML(htmlBody: JSONElement | string): void {
    let html = jsonElementToXML(htmlBody);
    if (html) {
      this.html = html; // the .html getter sanitizes
    }
  }
}

/** Serializes a XEP-0071 XHTML body back to an HTML string. */
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
