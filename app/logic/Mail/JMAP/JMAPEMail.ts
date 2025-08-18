import { EMail } from "../EMail";
import type { JMAPFolder } from "./JMAPFolder";
import type { JMAPAccount } from "./JMAPAccount";
import { SpecialFolder } from "../Folder";
import { DeleteStrategy } from "../MailAccount";
import { getTagByName, type Tag } from "../../Abstract/Tag";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import type { TJMAPEmailAddress, TJMAPEmailBodyPart, TJMAPEMailHeaders, TJMAPGetResponse, TJMAPPerson } from "./JMAPTypes";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, NotReached } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import type { ArrayColl, Collection } from "svelte-collections";

export class JMAPEMail extends EMail {
  pID: string | null = null;
  folder: JMAPFolder;
  mimeBlobId: string | null = null; // TODO Save in DB
  protected flagsChanging = false;

  constructor(folder: JMAPFolder) {
    super(folder);
  }

  fromJMAP(json: TJMAPEMailHeaders) {
    this.setFlagsLocal(json.keywords);
    // <https://www.rfc-editor.org/rfc/rfc8621.html#section-4.2.1>
    this.pID = sanitize.nonemptystring(json.id, null);
    if (this.downloadComplete) {
      return;
    }
    this.id = sanitize.nonemptystring(json.messageId, this.pID);
    this.subject = sanitize.string(json.subject, null);
    this.received = sanitize.date(json.receivedAt, this.received ?? new Date());
    this.sent = sanitize.date(json.sentAt, this.received);
    this.inReplyTo = sanitize.string(json.inReplyTo, null);
    this.threadID = sanitize.string(json.threadId, null);
    this.from = getPersonUID(json.from[0]);
    setPersons(this.to, json.to);
    setPersons(this.cc, json.cc);
    setPersons(this.bcc, json.bcc);
    this.outgoing = this.folder?.account.identities.some(id => id.isEMailAddress(this.from.emailAddress));
    this.contact = this.outgoing ? this.to.first : this.from;
    this.size = sanitize.integer(json.size, null);
    this.mimeBlobId = sanitize.string(json.blobId, null);
    //assert(!json.source || json.source instanceof Uint8Array, "MIME source needs to be a buffer");
    // this.mime = json.source;
  }

  setFlagsLocal(flags: Record<string, boolean>) {
    if (!(flags && flags instanceof Object) || this.flagsChanging) {
      return;
    }
    // <https://www.rfc-editor.org/rfc/rfc8621.html#section-4.1.1>
    // isNewArrived not supported
    this.isRead = sanitize.boolean(flags["$seen"], true);
    this.isStarred = sanitize.boolean(flags["$flagged"], false);
    this.isReplied = sanitize.boolean(flags["$answered"], false);
    this.isDraft = sanitize.boolean(flags["$draft"], false);
    this.isSpam = sanitize.boolean(flags["$junk"], false);

    for (let customTag in flags) {
      if (!customTag ||
          customTag.startsWith("$") ||
          ["nonjunk", "junk"].includes(customTag.toLowerCase())) {
        continue;
      }
      this.tags.add(getTagByName(sanitize.string(customTag)));
    }
  }

  static getJMAPFlags(email: EMail): Record<string, boolean> {
    let flags = {};
    flags["$seen"] = email.isRead ? true : null;
    flags["$flagged"] = email.isStarred ? true : null;
    flags["$answered"] = email.isReplied ? true : null;
    flags["$draft"] = email.isDraft ? true : null;
    flags["$junk"] = email.isSpam ? true : null;
    for (let tag of email.tags) {
      flags[tag.name] = true;
    }
    return flags;
  }

  protected static getJMAPEmailAddress(puid: PersonUID): TJMAPEmailAddress {
    return {
      name: puid.name,
      email: puid.emailAddress,
    };
  }
  protected static getJMAPEmailAddresses(puids: Collection<PersonUID>): TJMAPEmailAddress[] | undefined {
    let emails = puids.contents.map(r => JMAPEMail.getJMAPEmailAddress(r));
    return emails.length ? emails : undefined;
  }

  protected static async uploadEmailBodyPart(blob: Buffer, mimeType: string, filename: string = null, account: JMAPAccount): Promise<TJMAPEmailBodyPart> {
    let upload = await account.uploadBlob(blob, mimeType, filename);
    return {
      blobId: upload.blobId,
      size: upload.size,
      type: mimeType,
      name: filename,
      charset: mimeType.startsWith("text/") ? "utf-8" : null,
    };
  }

  static async getJMAPEmailObject(email: EMail, account: JMAPAccount): Promise<any> {
    assert(email.folder.id, "need folder");
    let doHTML = getLocalStorage("mail.send.format", "html").value == "html";
    let e = {
      subject: email.subject,
      messageId: [email.messageID],
      from: [JMAPEMail.getJMAPEmailAddress(email.from)],
      replyTo: email.replyTo ? [JMAPEMail.getJMAPEmailAddress(email.replyTo)] : undefined,
      inReplyTo: email.inReplyTo ? [email.inReplyTo] : undefined,
      references: email.references ?? undefined,
      to: JMAPEMail.getJMAPEmailAddresses(email.to),
      cc: JMAPEMail.getJMAPEmailAddresses(email.cc),
      bcc: JMAPEMail.getJMAPEmailAddresses(email.bcc),
      textBody: [await JMAPEMail.uploadEmailBodyPart(Buffer.from(email.text), "text/plain", null, account)],
      htmlBody: doHTML ? [await JMAPEMail.uploadEmailBodyPart(Buffer.from(email.html), "text/html", null, account)] : null,
      attachments: [],
      sentAt: email.sent?.toISOString(),
      receivedAt: email.received?.toISOString(),
      keywords: JMAPEMail.getJMAPFlags(email),
      mailboxIds: {
        [email.folder.id]: true,
      },
    };
    for (let name of email.headers.contentKeys()) {
      e["header:" + name] = email.headers.get(name);
    }
    for (let attachment of email.attachments) {
      e.attachments.push(await JMAPEMail.uploadEmailBodyPart(
        Buffer.from(await attachment.content.arrayBuffer()),
        attachment.mimeType,
        attachment.filename, account));
    }
    return e;
  }

  async download() {
    let account = this.folder.account;
    if (!this.mimeBlobId) {
      let response = await account.makeSingleCall(
        "Email/get", {
        accountId: account.accountID,
        "ids": [this.pID],
        properties: ["blobId"],
      },
      ) as TJMAPGetResponse<TJMAPEMailHeaders>;
      let json = response.list[0];
      assert(json, "JMAP: EMail no longer on server");
      this.mimeBlobId = sanitize.string(json.blobId);
    }

    let url = account.session.downloadUrl;
    url = url
      .replace("{accountId}", account.accountID)
      .replace("{blobId}", this.mimeBlobId)
      .replace("{name}", "email")
      .replace("{type}", "message/rfc822");
    let response = await account.httpGet(url, {
      headers: {
        "Accept": "message/rfc822",
        "Content-Type": undefined, // override
      },
      result: "blob",
    });
    this.mime = new Uint8Array(await response.arrayBuffer());
    await this.parseMIME();
    await this.saveCompleteMessage();
  }

  async markRead(read = true) {
    await super.markRead(read);
    await this.setFlagServer("$seen", read);
  }

  async markStarred(starred = true) {
    await super.markStarred(starred);
    await this.setFlagServer("$flagged", starred);
  }

  async markSpam(spam = true) {
    await super.markSpam(spam);
    await this.setFlagServer("$junk", spam);
  }

  async markReplied() {
    await super.markReplied();
    await this.setFlagServer("$answered", true);
  }

  async markDraft(isDraft = true) {
    await super.markDraft(isDraft);
    await this.setFlagServer("$draft", isDraft);
  }

  /**
   * Set read/starred etc. flag on the message
   *
   * @param name -- the flag, e.g. "\Seen", "\Recent", "$Junk" etc., or a user-set tag
   * @param set -- true = add the flag, false = remove the flag
   */
  async setFlagServer(name: string, set: boolean) {
    this.flagsChanging = true;
    await this.folder.account.makeSingleCall("Email/set", {
      accountId: this.folder.account.accountID,
      update: {
        [this.pID]: {
          [`keywords/${name}`]: set ? true : null,
        },
      },
    });
    this.flagsChanging = false;
  }

  async addTagOnServer(tag: Tag) {
    await this.setFlagServer(tag.name, true);
  }

  async removeTagOnServer(tag: Tag) {
    await this.setFlagServer(tag.name, false);
  }

  async deleteMessageOnServer() {
    try {
      this.folder.deletions.add(this.pID);
      let strategy = this.folder.account.deleteStrategy;
      if (strategy == DeleteStrategy.DeleteImmediately || this.folder.specialFolder == SpecialFolder.Trash) {
        await this.folder.account.makeSingleCall("Email/set", {
          accountId: this.folder.account.accountID,
          destroy: [ this.pID ],
        });
      } else if (strategy == DeleteStrategy.MoveToTrash || strategy == DeleteStrategy.Flag) {
        let trash = this.folder.account.getSpecialFolder(SpecialFolder.Trash);
        assert(trash, gt`Trash folder is not set. Cannot delete the email. Please go to folder properties and set Use As: Trash.`);
        trash.moveMessageHere(this);
      } else {
        throw new NotReached("Unknown delete strategy");
      }
    } finally {
      this.folder.deletions.delete(this.pID);
    }
  }
}

function setPersons(targetList: ArrayColl<PersonUID>, personList: TJMAPPerson[]): void {
  targetList.clear();
  if (!personList?.length) {
    return;
  }
  targetList.addAll(personList.map(p => getPersonUID(p)));
}

function getPersonUID(p: TJMAPPerson): PersonUID {
  return findOrCreatePersonUID(sanitize.string(p.email, null), sanitize.label(p.name, null));
}
