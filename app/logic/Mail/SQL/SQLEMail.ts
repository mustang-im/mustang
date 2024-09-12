import type { EMail } from "../EMail";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import type { Folder } from "../Folder";
import { Attachment, ContentDisposition } from "../Attachment";
import { getTagByName, Tag } from "../Tag";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { assert, fileExtensionForMIMEType } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import sql from "../../../../lib/rs-sqlite";

let filesDir: string = null;

export class SQLEMail {
  /**
   * Save only fully downloaded emails
   */
  static async save(email: EMail) {
    assert(!(email.downloadComplete && email.rawText == null && email.rawHTMLDangerous == null), "An email without body is not complete");
    if (!email.folder.dbID) {
      await email.folder.save();
    }
    if (!email.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM email
        WHERE
          messageID = ${email.id} AND
          pID = ${email.pID} AND
          folderID = ${email.folder.dbID}
        `) as any;
      if (existing?.id) {
        email.dbID = existing.id;
      }
    }
    if (!email.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO email (
          messageID, folderID, pID, parentMsgID,
          size, dateSent, dateReceived,
          outgoing,
          subject, plaintext, html
        ) VALUES (
          ${email.id}, ${email.folder.dbID}, ${email.pID}, ${email.inReplyTo},
          ${email.size}, ${email.sent.getTime() / 1000}, ${email.received.getTime() / 1000},
          ${email.outgoing ? 1 : 0},
          ${email.subject}, ${email.rawText}, ${email.rawHTMLDangerous}
        )`);
      // -- contactEmail, contactName, myEmail
      email.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE email SET
          messageID = ${email.id},
          folderID = ${email.folder.dbID},
          pID = ${email.pID},
          parentMsgID = ${email.inReplyTo},
          size = ${email.size},
          dateSent = ${email.sent.getTime() / 1000},
          dateReceived = ${email.received.getTime() / 1000},
          outgoing = ${email.outgoing ? 1 : 0},
          subject = ${email.subject},
          plaintext = ${email.rawText},
          html = ${email.rawHTMLDangerous}
        WHERE id = ${email.dbID}
      `);
    }
    await this.saveWritableProps(email);
    await this.saveRecipients(email);
    await this.saveAttachments(email);
    await this.saveTags(email);
  }

  static async saveWritableProps(email: EMail) {
    assert(email.dbID, "Need Email DB ID to save props");
    await (await getDatabase()).run(sql`
      UPDATE email SET
        isRead = ${email.isRead ? 1 : 0},
        isStarred = ${email.isStarred ? 1 : 0},
        isReplied = ${email.isReplied ? 1 : 0},
        isSpam = ${email.isSpam ? 1 : 0},
        isDraft = ${email.isDraft ? 1 : 0},
        threadID = ${email.threadID},
        downloadComplete = ${email.downloadComplete ? 1 : 0}
      WHERE id = ${email.dbID}
      `);

    await this.saveTags(email);
  }

  protected static async saveRecipients(email: EMail) {
    assert(email.dbID, "Need Email DB ID");
    // See comment in `saveAttachments()` below
    await (await getDatabase()).run(sql`
      DELETE FROM emailPersonRel
      WHERE emailID = ${email.dbID}
      `);

    await this.saveRecipient(email, email.from, 1);
    await this.saveRecipientsOfType(email, email.to, 2);
    await this.saveRecipientsOfType(email, email.cc, 3);
    await this.saveRecipientsOfType(email, email.bcc, 4);
    if (email.replyTo?.emailAddress) {
      await this.saveRecipient(email, email.replyTo, 5);
    }
  }

  protected static async saveRecipientsOfType(email: EMail, recipients: ArrayColl<PersonUID>, recipientsType: number) {
    for (let recipient of recipients) {
      await this.saveRecipient(email, recipient, recipientsType);
    }
  }

  protected static async saveRecipient(email: EMail, puid: PersonUID, recipientType: number) {
    let exists = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM emailPerson
        WHERE
          emailAddress = ${puid.emailAddress} AND
          name = ${puid.name}
      `) as any;
    let personID = exists?.id;
    if (!personID) {
      let insert = await (await getDatabase()).run(sql`
      INSERT OR IGNORE INTO emailPerson (
        name, emailAddress, personID
      ) VALUES (
        ${puid.name}, ${puid.emailAddress}, ${puid.person?.dbID}
      )`);
      personID = insert.lastInsertRowid;
    }
    await (await getDatabase()).run(sql`
      INSERT INTO emailPersonRel (
        emailID, emailPersonID, recipientType
      ) VALUES (
        ${email.dbID}, ${personID}, ${recipientType}
      )`);
  }

  protected static async saveAttachments(email: EMail) {
    assert(email.dbID, "Need Email DB ID");
    /** Problem: We might be saving the same email multiple times, because:
     * a) We save only the msg list of the folder, so we have only partial emails,
     *     and we don't know the attachments yet.
     * b) the full email might be saved multiple times.
     *
     * Solution: To avoid that we're adding the same attachments multiple times
     * in the 1:n table, delete existing records before adding them here.
     * Same problem in `saveRecipients()` above.
     *
     * Alternatives: Yes, it's ugly. Better solutions?
     * `INSERT OR IGNORE` alone doesn't help.
     * We wouldn't have that problem with a
     * JSON-based record-is-a-document NoSQL database. */
    await (await getDatabase()).run(sql`
      DELETE FROM emailAttachment
      WHERE emailID = ${email.dbID}
      `);

    for (let attachment of email.attachments) {
      await this.saveAttachment(email, attachment);
    }
  }

  protected static async saveAttachment(email: EMail, a: Attachment) {
    assert(email.dbID, "Need to save email before attachment");
    filesDir ??= await appGlobal.remoteApp.getFilesDir();
    let filepath = a.filepathLocal?.replace(filesDir + "/", "");
    await (await getDatabase()).run(sql`
      INSERT OR IGNORE INTO emailAttachment (
        emailID, filename, filepathLocal, mimeType, size, contentID, disposition, related
      ) VALUES (
        ${email.dbID}, ${a.filename}, ${filepath}, ${a.mimeType}, ${a.size},
        ${a.contentID}, ${a.disposition}, ${a.related ? 1 : 0}
      )`);
  }

  /** After downloading and saving the attachment file locally, or moving it on disk,
   * save its local disk location. */
  static async saveAttachmentFile(email: EMail, a: Attachment) {
    assert(email.dbID, "Need to save email before attachment");
    filesDir ??= await appGlobal.remoteApp.getFilesDir();
    let filepath = a.filepathLocal?.replace(filesDir + "/", "");
    await (await getDatabase()).run(sql`
      UPDATE emailAttachment SET
        filepathLocal = ${filepath}
      WHERE emailID = ${email.dbID}
        AND filename = ${a.filename}
        AND contentID = ${a.contentID}
      `);
  }

  static async saveTags(email: EMail) {
    assert(email.dbID, "Need Email DB ID");
    await (await getDatabase()).run(sql`
      DELETE FROM emailTag
      WHERE emailID = ${email.dbID}
      `);

    for (let tag of email.tags) {
      await this.saveTag(email, tag);
    }
  }

  protected static async saveTag(email: EMail, tag: Tag) {
    assert(email.dbID, "Need to save email before tags");
    await (await getDatabase()).run(sql`
      INSERT OR IGNORE INTO emailTag (
        emailID, tagName
      ) VALUES (
        ${email.dbID}, ${tag.name}
      )`);
  }

  static async read(dbID: number, email: EMail, row?: any, recipientRows?: any[], attachmentRows?: any[], tagRows?: any[]): Promise<EMail> {
    if (!row) {
      // <copied to="readAll()" />
      row = await (await getDatabase()).get(sql`
      SELECT
        pID, messageID, parentMsgID,
        size, dateSent, dateReceived,
        outgoing,
        subject, plaintext, html,
        threadID, downloadComplete,
        isRead, isStarred, isReplied, isDraft, isSpam
      FROM email
      WHERE id = ${dbID}
      `) as any;
      // contactEmail, contactName, myEmail
    }
    email.dbID = sanitize.integer(dbID);
    email.pID = typeof(row.pID) == "number"
      ? sanitize.integer(row.pID, null)
      : sanitize.string(row.pID, null);
    email.id = sanitize.nonemptystring(row.messageID, "");
    email.inReplyTo = sanitize.string(row.parentMsgID, null);
    email.size = sanitize.integer(row.size, null);
    email.received = sanitize.date(row.dateReceived * 1000, new Date());
    email.sent = sanitize.date(row.dateSent * 1000, email.received);
    email.outgoing = sanitize.boolean(!!row.outgoing);
    email.subject = sanitize.string(row.subject, null);
    if (row.plaintext != null || row.html != null) {
      email.needToLoadBody = false;
      email.text = sanitize.string(row.plaintext, null);
      let html = sanitize.string(row.html, null);
      if (html) {
        email.html = html;
      }
    }
    this.readWritableProps(email, row);
    await this.readRecipients(email, recipientRows);
    await this.readAttachments(email, attachmentRows);
    await this.readTags(email, tagRows);
    email.contact = email.outgoing ? email.to.first : email.from;
    return email;
  }

  /** Read only the most important properties for the msg list view. */
  static async readMainProperties(dbID: number, email: EMail, row: any): Promise<void> {
    email.dbID = sanitize.integer(dbID);
    email.pID = typeof (row.pID) == "number"
      ? sanitize.integer(row.pID, null)
      : sanitize.string(row.pID, null);
    email.id = sanitize.nonemptystring(row.messageID, "");
    email.inReplyTo = sanitize.string(row.parentMsgID, null);
    email.size = sanitize.integer(row.size, null);
    email.sent = sanitize.date(row.dateSent * 1000, new Date());
    email.received = sanitize.date(row.dateReceived * 1000, new Date());
    email.outgoing = sanitize.boolean(!!row.outgoing);
    email.subject = sanitize.string(row.subject, null);

    email.isRead = sanitize.boolean(!!row.isRead);
    email.isStarred = sanitize.boolean(!!row.isStarred);
    email.isReplied = sanitize.boolean(!!row.isReplied);
    email.isSpam = sanitize.boolean(!!row.isSpam);
    email.threadID = sanitize.string(row.threadID ?? row.parentMsgID, null);
    email.downloadComplete = sanitize.boolean(!!row.downloadComplete);

    email.contact = findOrCreatePersonUID("foo45@example.com", sanitize.label(row.contactName, null));
  }

  static async readWritableProps(email: EMail, row?: any) {
    if (!row) {
      row = await (await getDatabase()).get(sql`
      SELECT
        isRead, isStarred, isReplied, isDraft, isSpam, threadID, downloadComplete
      FROM email
      WHERE id = ${email.dbID}
      `) as any;
    }
    if (!row) {
      return;
    }
    email.isRead = sanitize.boolean(!!row.isRead);
    email.isStarred = sanitize.boolean(!!row.isStarred);
    email.isReplied = sanitize.boolean(!!row.isReplied);
    email.isDraft = sanitize.boolean(!!row.isDraft);
    email.isSpam = sanitize.boolean(!!row.isSpam);
    email.threadID = sanitize.string(row.threadID ?? row.parentMsgID, null);
    email.downloadComplete = sanitize.boolean(!!row.downloadComplete);

    await this.readTags(email);
  }

  static async deleteIt(email: EMail) {
    if (!email.dbID) {
      return;
    }
    assert(email.dbID, "Need Email DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM email
      WHERE id = ${email.dbID}
      `);
    email.dbID = null;
  }

  protected static async readRecipients(email: EMail, recipientRows?: any[]) {
    if (!recipientRows) {
      // <copied to="readAll()" />
      recipientRows = await (await getDatabase()).all(sql`
        SELECT
          name, emailAddress, recipientType
        FROM emailPersonRel
          LEFT JOIN emailPerson ON (emailPersonRel.emailPersonID = emailPerson.id)
        WHERE emailID = ${email.dbID}
      `) as any;
    }
    email.to.clear();
    email.cc.clear();
    email.bcc.clear();
    email.replyTo = null;
    for (let row of recipientRows) {
      try {
        let addr = sanitize.emailAddress(row.emailAddress, "unknown@invalid");
        let name = sanitize.label(row.name, null);
        let uid = findOrCreatePersonUID(addr, name);
        if (row.recipientType == 1) {
          email.from = uid;
          continue;
        } else if (row.recipientType == 5) {
          email.replyTo = uid;
          continue;
        }
        if (row.recipientType == 2) {
          email.to.add(uid);
        } else if (row.recipientType == 3) {
          email.cc.add(uid);
        } else if (row.recipientType == 4) {
          email.bcc.add(uid);
        }
      } catch (ex) {
        email.folder.account.errorCallback(ex);
      }
    }
  }

  protected static async readAttachments(email: EMail, attachmentRows?: any[]) {
    if (!attachmentRows) {
      // <copied to="readAll()" />
      attachmentRows = await (await getDatabase()).all(sql`
        SELECT
          filename, filepathLocal, mimeType, size, contentID, disposition, related
        FROM emailAttachment
        WHERE emailID = ${email.dbID}
      `) as any;
    }
    let fallbackID = 0;
    filesDir ??= await appGlobal.remoteApp.getFilesDir();
    email.attachments.clear();
    for (let row of attachmentRows) {
      try {
        let a = new Attachment();
        a.mimeType = sanitize.nonemptystring(row.mimeType, "application/octet-stream");
        a.contentID = sanitize.nonemptystring(row.contentID, "" + ++fallbackID);
        a.filename = sanitize.nonemptystring(row.filename, "attachment-" + fallbackID + "." + fileExtensionForMIMEType(a.mimeType));
        let filepath = sanitize.string(row.filepathLocal, null);
        a.filepathLocal = filepath ? filesDir + "/" + filepath : null;
        a.size = sanitize.integer(row.size, -1);
        a.disposition = sanitize.translate(row.disposition, {
          attachment: ContentDisposition.attachment,
          inline: ContentDisposition.inline,
        }, ContentDisposition.unknown);
        a.related = sanitize.boolean(!!row.related);
        email.attachments.add(a);
      } catch (ex) {
        email.folder.account.errorCallback(ex);
      }
    }
  }

  protected static async readTags(email: EMail, tagRows?: any[]) {
    if (!tagRows) {
      // <copied to="readAll()" />
      tagRows = await (await getDatabase()).all(sql`
        SELECT
          tagName
        FROM emailTag
        WHERE emailID = ${email.dbID}
      `) as any;
    }
    email.tags.clear();
    for (let row of tagRows) {
      try {
        let name = sanitize.nonemptystring(row.tagName);
        let tag = getTagByName(name);
        email.tags.add(tag);
      } catch (ex) {
        email.folder.account.errorCallback(ex);
      }
    }
  }

  static async readBody(email: EMail): Promise<void> {
    assert(email.dbID, "Need to read email metadata from database first");
    let row = await (await getDatabase()).get(sql`
      SELECT
        plaintext, html
      FROM email
      WHERE id = ${email.dbID}
    `) as any;
    assert(row, "Email DB ID " + email.dbID + " not found in DB");
    let text = sanitize.string(row.plaintext, null)
    if (text) {
      email.text = text;
    }
    let html = sanitize.string(row.html, null);
    if (html) {
      email.html = html;
    }
    email.needToLoadBody = text == null && html == null;
  }

  /**
   * @param limit Max number of results (optional, default all)
   * @param startWith Do not return the first `startWith` results (optional, default all)
   *
   * Adds the new emails to the folder, and updates existing emails.
   */
  static async readAll(folder: Folder, limit?: number, startWith?: number): Promise<void> {
    if (startWith && !limit) {
      limit = -1;
    }
    // <copied from="read()" />
    let emailRows = await (await getDatabase()).all(sql`
      SELECT
        id, pID, messageID, parentMsgID,
        size, dateSent, dateReceived,
        outgoing,
        subject,
        threadID, downloadComplete,
        isRead, isStarred, isReplied, isDraft, isSpam
      FROM email
      WHERE folderID = ${folder.dbID}
      ORDER BY dateSent DESC
      $${limit ? sql` LIMIT ${limit} ` : sql``}
      $${startWith ? sql` OFFSET ${startWith} ` : sql``}
    `) as any;
    //console.time("sql read emails");
    // plaintext, html, -- 10x slower, so do this later or on demand
    //console.timeEnd("sql read emails");
    // <copied from="readRecipients()" />
    let folderRecipientRows = await (await getDatabase()).all(sql`
      SELECT
        emailID, name, emailAddress, recipientType
      FROM emailPersonRel
        LEFT JOIN emailPerson ON (emailPersonRel.emailPersonID = emailPerson.id)
        LEFT JOIN email ON (emailID = email.id)
      WHERE folderID = ${folder.dbID}
    `) as any;
    // <copied from="readAttachments()" />
    let folderAttachmentRows = await (await getDatabase()).all(sql`
      SELECT
        emailID, filename, filepathLocal, mimeType, emailAttachment.size as size, contentID, disposition, related
      FROM emailAttachment
      LEFT JOIN email ON (emailID = email.id)
      WHERE folderID = ${folder.dbID}
    `) as any;
    let folderTagRows = await (await getDatabase()).all(sql`
        SELECT
          tagName
        FROM emailTag
        LEFT JOIN email ON (emailID = email.id)
        WHERE folderID = ${folder.dbID}
      `) as any;
    let newEmails = new ArrayColl<EMail>();
    for (let row of emailRows) {
      let email = folder.messages.find(email => email.dbID == row.id);
      if (email) {
        await SQLEMail.readWritableProps(email, row); // TODO needed?
      } else {
        email = folder.newEMail();
        let emailRecipientRows = folderRecipientRows.filter(r => r.emailID == row.id);
        let emailAttachmentRows = folderAttachmentRows.filter(r => r.emailID == row.id);
        let emailTagRows = folderTagRows.filter(r => r.emailID == row.id);
        await SQLEMail.read(row.id, email, row, emailRecipientRows, emailAttachmentRows, emailTagRows);
        newEmails.add(email);
      }
    }
    folder.messages.addAll(newEmails);
  }

  /**
   * @param limit Max number of results (optional, default all)
   * @param startWith Do not return the first `startWith` results (optional, default all)
   *
   * Reads only the date, subject, read status and maybe the first sender and recipient
   */
  static async readAllMainProperties(folder: Folder, limit?: number, startWith?: number): Promise<void> {
    if (startWith && !limit) {
      limit = -1;
    }
    // <copied from="read()" />
    let emailRows = await (await getDatabase()).all(sql`
      SELECT
        id, pID, messageID, parentMsgID,
        size, dateSent, dateReceived,
        outgoing,
        subject,
        threadID, downloadComplete,
        isRead, isStarred, isReplied, isSpam,
        (SELECT name
         FROM emailPersonRel
           LEFT JOIN emailPerson ON (emailPersonRel.emailPersonID = emailPerson.id)
         WHERE emailID = email.id AND recipientType =
          (CASE WHEN outgoing THEN 2 ELSE 1 END)
         ORDER BY emailPersonRel.ROWID ASC LIMIT 1)
         AS contactName
      FROM email
      WHERE folderID = ${folder.dbID}
      ORDER BY dateSent DESC
      $${limit ? sql` LIMIT ${limit} ` : sql``}
      $${startWith ? sql` OFFSET ${startWith} ` : sql``}
    `) as any;
    let newEmails = new ArrayColl<EMail>();
    for (let row of emailRows) {
      let email = folder.messages.find(email => email.dbID == row.id);
      if (email) {
        continue;
      }
      email = folder.newEMail();
      await SQLEMail.readMainProperties(row.id, email, row);
      newEmails.add(email);
    }
    folder.messages.addAll(newEmails);
  }
}
