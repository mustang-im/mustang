import type { EMail } from "../EMail";
import { PersonUID, findOrCreatePersonUID, kDummyPerson } from "../../Abstract/PersonUID";
import { Attachment, ContentDisposition } from "../../Abstract/Attachment";
import { getTagByName } from "../../Abstract/Tag";
import { getFilesDir } from "../../../logic/util/backend-wrapper";
import { EMailProcessorList } from "../EMailProcessor";
import { assert, fileExtensionForMIMEType, ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { logError } from "../../../frontend/Util/error";
import type { ArrayColl } from "svelte-collections";

export class JSONEMail {
  static filesDir: string | null = null;
  static async init() {
    this.filesDir ??= await getFilesDir();
  }

  /**
   * Save only fully downloaded emails
   */
  static save(email: EMail): any {
    let json: any = {};
    json.id = email.id;
    json.folderID = email.folder.id;
    json.pID = email.pID;
    json.inReplyTo = email.inReplyTo;
    json.size = email.size;
    json.sent = email.sent.getTime() / 1000;
    json.received = email.received.getTime() / 1000;
    json.outgoing = email.outgoing;
    json.subject = email.subject;
    json.plaintext = email.rawText;
    json.html = email.rawHTMLDangerous;

    this.saveWritableProps(email, json);
    this.saveRecipients(email, json);
    json.attachments = this.saveAttachments(email);
    json.tags = this.saveTags(email);
    return json;
  }

  static saveWritableProps(email: EMail, json: any) {
    json.isRead = email.isRead;
    json.isStarred = email.isStarred;
    json.isReplied = email.isReplied;
    json.isSpam = email.isSpam;
    json.isDraft = email.isDraft;
    json.threadID = email.threadID;
    json.downloadComplete = email.downloadComplete;
    this.saveExtraData(email, json);
  }

  static saveExtraData(email: EMail, json: any) {
    if (email.invitationMessage) {
      json.invitationMessage = email.invitationMessage;
    }
    let extraDataJSON = [];
    email.extraData.forEach((extraData, type) => {
      let json = extraData.toJSON() as any;
      if (json == null) {
        return;
      }
      json.type = type;
      extraDataJSON.push(json);
    });
    if (extraDataJSON.length) {
      json.extraData = extraDataJSON;
    }
  }

  protected static saveRecipients(email: EMail, json: any) {
    json.from = this.saveRecipient(email.from);
    json.to = this.saveRecipientsOfType(email.to);
    json.cc = this.saveRecipientsOfType(email.cc);
    json.bcc = this.saveRecipientsOfType(email.bcc);
    if (email.replyTo?.emailAddress) {
      json.replyTo = this.saveRecipient(email.replyTo);
    }
  }

  protected static saveRecipientsOfType(recipients: ArrayColl<PersonUID>): any[] {
    return recipients.contents.map(r => this.saveRecipient(r));
  }

  protected static saveRecipient(puid: PersonUID): any {
    let json: any = {};
    json.name = puid.name;
    json.emailAddress = puid.emailAddress;
    json.personID = puid.person?.dbID;
    return json;
  }

  static saveAttachments(email: EMail): any[] {
    return email.attachments.contents.map(a => this.saveAttachment(email, a));
  }

  static saveAttachment(email: EMail, a: Attachment): any {
    assert(this.filesDir, "Please call init() first");
    let json: any = {};
    json.filename = a.filename;
    json.filepathLocal = a.filepathLocal?.replace(this.filesDir + "/", "");
    json.mimeType = a.mimeType;
    json.size = a.size;
    json.contentID = a.contentID;
    json.disposition = a.disposition;
    json.related = a.related;
    return json;
  }

  static saveTags(email: EMail): any[] {
    return email.tags.contents.map(tag => tag.name);
  }

  static read(dbID: number | string, email: EMail, json: any): EMail {
    email.dbID = typeof (dbID) == "number"
      ? sanitize.integer(dbID, null)
      : sanitize.string(dbID, null);
    email.pID = typeof(json.pID) == "number"
      ? sanitize.integer(json.pID, null)
      : sanitize.string(json.pID, null);
    email.id = sanitize.nonemptystring(json.id, "");
    // .folder is set by caller when doing `email = folder.newEMail()`
    email.inReplyTo = sanitize.string(json.inReplyTo, null);
    email.size = sanitize.integer(json.size, null);
    email.received = sanitize.date(json.received * 1000, new Date());
    email.sent = sanitize.date(json.sent * 1000, email.received);
    email.outgoing = sanitize.boolean(json.outgoing, false);
    email.subject = sanitize.string(json.subject, null);
    if (json.plaintext != null || json.html != null) {
      email.text = sanitize.string(json.plaintext, null);
      let html = sanitize.string(json.html, null);
      if (html) {
        email.html = html;
      }
    }
    this.readWritableProps(email, json);
    this.readRecipients(email, json);
    this.readAttachments(email, json);
    this.readExtraData(email, json);
    this.readTags(email, json);
    email.contact = email.outgoing ? email.to.first : email.from;
    return email;
  }

  /** Read only the most important properties for the msg list view. */
  static readMainProperties(dbID: number | string, email: EMail, json: any): void {
    email.dbID = typeof (dbID) == "number"
      ? sanitize.integer(dbID, null)
      : sanitize.string(dbID, null);
    email.pID = typeof (json.pID) == "number"
      ? sanitize.integer(json.pID, null)
      : sanitize.string(json.pID, null);
    email.id = sanitize.nonemptystring(json.id, "");
    email.inReplyTo = sanitize.string(json.inReplyTo, null);
    email.size = sanitize.integer(json.size, null);
    email.sent = sanitize.date(json.sent * 1000, new Date());
    email.received = sanitize.date(json.received * 1000, new Date());
    email.outgoing = sanitize.boolean(json.outgoing, false);
    email.subject = sanitize.string(json.subject, null);

    email.isRead = sanitize.boolean(json.isRead, false);
    email.isStarred = sanitize.boolean(json.isStarred, false);
    email.isReplied = sanitize.boolean(json.isReplied, false);
    email.isSpam = sanitize.boolean(json.isSpam, false);
    email.threadID = sanitize.string(json.threadID ?? json.inReplyTo, null);
    email.downloadComplete = sanitize.boolean(json.downloadComplete);

    // email.contact = findOrCreatePersonUID("foo45@example.com", sanitize.label(json.contactName, null));
  }

  static readWritableProps(email: EMail, json: any): void {
    email.isRead = sanitize.boolean(json.isRead, false);
    email.isStarred = sanitize.boolean(json.isStarred, false);
    email.isReplied = sanitize.boolean(json.isReplied, false);
    email.isDraft = sanitize.boolean(json.isDraft, false);
    email.isSpam = sanitize.boolean(json.isSpam, false);
    email.threadID = sanitize.string(json.threadID ?? json.inReplyTo, null);
    email.downloadComplete = sanitize.boolean(json.downloadComplete, false);
    this.readTags(email, json);
  }

  static readExtraData(email: EMail, json: any): void {
    email.invitationMessage = sanitize.integer(json.invitationMessage, 0);
    if (json.extraData) {
      for (let extra of json.extraData) {
        try {
          let type = sanitize.alphanumdash(extra.type);
          let ExtraDataSubclass = EMailProcessorList.extraDataTypes.get(type);
          let data = new ExtraDataSubclass();
          data.fromJSON(extra);
          email.extraData.set(type, data);
        } catch (ex) {
          logError(ex);
        }
      }
    }
  }

  static readRecipients(email: EMail, json: any): void {
    email.to.clear();
    email.cc.clear();
    email.bcc.clear();
    email.from = this.readRecipient(json.from) ?? kDummyPerson;
    email.replyTo = this.readRecipient(json.replyTo);
    email.to.addAll(this.readRecipientsOfType(json.to));
    email.cc.addAll(this.readRecipientsOfType(json.cc));
    email.bcc.addAll(this.readRecipientsOfType(json.bcc));
  }

  protected static readRecipientsOfType(recipientsJSON: any[]): PersonUID[] {
    if (!recipientsJSON) {
      return [];
    }
    return recipientsJSON.map(r => this.readRecipient(r)).filter(r => r);
  }

  protected static readRecipient(json: any): PersonUID | null {
    if (!json) {
      return null;
    }
    let addr = sanitize.emailAddress(json.emailAddress, kDummyPerson.emailAddress);
    let name = sanitize.label(json.name, null);
    return findOrCreatePersonUID(addr, name);
  }

  protected static readAttachments(email: EMail, emailJSON: any): void {
    if (!emailJSON.attachments) {
      return;
    }
    assert(this.filesDir, "Please call init() first");
    let fallbackID = 0;
    email.attachments.clear();
    for (let row of emailJSON.attachments) {
      this.readAttachment(email, row, ++fallbackID);
    }
  }

  protected static readAttachment(email: EMail, json: any, fallbackID): Attachment | null {
    try {
      let a = new Attachment();
      a.mimeType = sanitize.nonemptystring(json.mimeType, "application/octet-stream");
      a.contentID = sanitize.nonemptystring(json.contentID, "" + fallbackID);
      a.filename = sanitize.nonemptystring(json.filename, "attachment-" + fallbackID + "." + fileExtensionForMIMEType(a.mimeType));
      let filepathLocal = sanitize.string(json.filepathLocal, null)
      if (filepathLocal) {
        a.filepathLocal = this.filesDir + "/" + filepathLocal;
      }
      a.size = sanitize.integer(json.size, -1);
      a.disposition = sanitize.translate(json.disposition, {
        attachment: ContentDisposition.attachment,
        inline: ContentDisposition.inline,
      }, ContentDisposition.unknown);
      a.related = sanitize.boolean(json.related, false);
      email.attachments.add(a);
      return a;
    } catch (ex) {
      email.folder.account.errorCallback(ex);
      return null;
    }
  }

  static readTags(email: EMail, emailJSON: any): void {
    if (!emailJSON.tags) {
      return;
    }
    email.tags.clear();
    for (let tag of ensureArray(emailJSON.tags)) {
      this.readTag(email, tag);
    }
  }

  protected static readTag(email: EMail, json: any): void {
    try {
      if (!json) {
        return;
      }
      let name = sanitize.nonemptystring(json);
      let tag = getTagByName(name);
      email.tags.add(tag);
    } catch (ex) {
      email.folder.account.errorCallback(ex);
    }
  }

  static readBody(email: EMail, json: any): void {
    let text = sanitize.string(json.plaintext, null)
    if (text) {
      email.text = text;
    }
    let html = sanitize.string(json.html, null);
    if (html) {
      email.html = html;
    }
  }
}
