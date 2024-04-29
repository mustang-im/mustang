import type { EMail } from "../EMail";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import type { Folder } from "../Folder";
import { Attachment, ContentDisposition } from "../Attachment";
import { getDatabase } from "./SQLDatabase";
import type { IMAPEMail } from "../IMAP/IMAPEMail";
import { backgroundError } from "../../../frontend/Util/error";
import { assert, fileExtensionForMIMEType } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import sql from "../../../../lib/rs-sqlite";

export class SQLEMail {
  /**
   * Save only fully downloaded emails
   */
  static async save(email: EMail) {
    if (!email.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM email
        WHERE
          messageID = ${email.id} AND
          uid = ${(email as any as IMAPEMail).uid} AND
          folderID = ${email.folder.dbID}
        `) as any;
      if (existing?.id) {
        email.dbID = existing.id;
      }
    }
    if (!email.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO email (
          messageID, folderID, uid, parentMsgID,
          size, dateSent, dateReceived,
          outgoing,
          subject, plaintext, html
        ) VALUES (
          ${email.id}, ${email.folder.dbID}, ${(email as any as IMAPEMail).uid}, ${email.inReplyTo},
          ${email.size}, ${email.sent.getTime() / 1000}, ${email.received.getTime() / 1000},
          ${email.outgoing ? 1 : 0},
          ${email.subject}, ${email.text}, ${email.rawHTMLDangerous}
        )`);
      // -- contactEmail, contactName, myEmail
      email.dbID = insert.lastInsertRowid;
      await this.saveRecipient(email, email.from, 1);
      await this.saveRecipients(email, email.to, 2);
      await this.saveRecipients(email, email.cc, 3);
      await this.saveRecipients(email, email.bcc, 4);
      if (email.replyTo?.emailAddress) {
        await this.saveRecipient(email, new PersonUID(email.replyTo.name, email.replyTo.emailAddress), 5);
      }
    } else {
      await (await getDatabase()).run(sql`
        UPDATE email SET
          messageID = ${email.id},
          folderID = ${email.folder.dbID},
          uid = ${(email as any as IMAPEMail).uid},
          parentMsgID = ${email.inReplyTo},
          size = ${email.size},
          dateSent = ${email.sent.getTime() / 1000},
          dateReceived = ${email.received.getTime() / 1000},
          outgoing = ${email.outgoing ? 1 : 0},
          subject = ${email.subject},
          plaintext = ${email.text},
          html = ${email.rawHTMLDangerous}
        WHERE id = ${email.dbID}
      `);
    }
    await this.saveWritableProps(email);
    for (let attachment of email.attachments) {
      await this.saveAttachment(email, attachment);
    }
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
  }

  static async saveRecipients(email: EMail, recipients: ArrayColl<PersonUID>, recipientsType: number) {
    for (let recipient of recipients) {
      await this.saveRecipient(email, recipient, recipientsType);
    }
  }

  static async saveRecipient(email: EMail, puid: PersonUID, recipientType: number) {
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
    await (await getDatabase()).run(sql`INSERT INTO emailPersonRel (
        emailID, emailPersonID, recipientType
      ) VALUES (
        ${email.dbID}, ${personID}, ${recipientType}
      )`);
  }

  static async saveAttachment(email: EMail, a: Attachment) {
    assert(email.dbID, "Need to save email before attachment");
    await (await getDatabase()).run(sql`
      INSERT OR IGNORE INTO emailAttachment (
        emailID, filename, filepathLocal, mimeType, size, contentID, disposition, related
      ) VALUES (
        ${email.dbID}, ${a.filename}, ${a.filepathLocal}, ${a.mimeType}, ${a.size},
        ${a.contentID}, ${a.disposition}, ${a.related ? 1 : 0}
      )`);
  }

  /** After downloading and saving the attachment file locally, or moving it on disk,
   * save its local disk location. */
  static async saveAttachmentFile(email: EMail, a: Attachment) {
    assert(email.dbID, "Need to save email before attachment");
    await (await getDatabase()).run(sql`
      UPDATE emailAttachment SET
        filepathLocal = ${a.filepathLocal}
      WHERE emailID = ${email.dbID}
        AND filename = ${a.filename}
        AND contentID = ${a.contentID}
      `);
  }

  static async read(dbID: number, email: EMail, row: any, recipientRows: any[], attachmentRows: any[]): Promise<EMail> {
    if (!row) {
      // <copied to="readAll()" />
      row = await (await getDatabase()).get(sql`
      SELECT
        uid, messageID, parentMsgID,
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
    (email as any as IMAPEMail).uid = sanitize.integer(row.uid, null);
    email.id = sanitize.nonemptystring(row.messageID);
    email.inReplyTo = sanitize.string(row.parentMsgID, null);
    email.size = sanitize.integer(row.size, null);
    email.sent = sanitize.date(row.dateSent * 1000, new Date());
    email.received = sanitize.date(row.dateReceived * 1000, new Date());
    email.outgoing = sanitize.boolean(!!row.outgoing);
    email.subject = sanitize.string(row.subject, null);
    if (row.plaintext == null && row.html == null) {
      email.needToLoadBody = true;
    } else {
      email.text = sanitize.string(row.plaintext, "");
      let html = sanitize.string(row.html, null);
      if (html) {
        email.html = html;
      }
    }
    this.readWritableProps(email, row);
    await this.readRecipients(email, recipientRows);
    await this.readAttachments(email, attachmentRows);
    email.contact = email.outgoing ? email.to.first : email.from;
    return email;
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
    email.threadID = sanitize.string(row.threadID, null);
    email.downloadComplete = sanitize.boolean(!!row.downloadComplete);
  }

  static async deleteIt(email: EMail) {
    assert(email.dbID, "Need Email DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM email
      WHERE id = ${email.dbID}
      `);
  }

  protected static async readRecipients(email: EMail, recipientRows: any[]) {
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
    for (let row of recipientRows) {
      try {
        let addr = sanitize.emailAddress(row.emailAddress, "unknown@invalid");
        let name = sanitize.label(row.name, null);
        let uid = findOrCreatePersonUID(addr, name);
        if (row.recipientType == 1) {
          email.from = uid;
          continue;
        } else if (row.recipientType == 5) {
          email.replyTo.emailAddress = addr;
          email.replyTo.name = name;
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
        backgroundError(ex);
      }
    }
  }

  protected static async readAttachments(email: EMail, attachmentRows: any[]) {
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
    for (let row of attachmentRows) {
      try {
        let a = new Attachment();
        a.mimeType = sanitize.nonemptystring(row.mimeType, "application/octet-stream");
        a.contentID = sanitize.nonemptystring(row.contentID, "" + ++fallbackID);
        a.filename = sanitize.nonemptystring(row.filename, "attachment-" + fallbackID + "." + fileExtensionForMIMEType(a.mimeType));
        a.filepathLocal = sanitize.string(row.filepathLocal, null);
        a.size = sanitize.integer(row.size, -1);
        a.disposition = sanitize.translate(row.disposition, {
          attachment: ContentDisposition.attachment,
          inline: ContentDisposition.inline,
        }, ContentDisposition.unknown);
        a.related = sanitize.boolean(!!row.related);
        email.attachments.add(a);
      } catch (ex) {
        backgroundError(ex);
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
    let text = sanitize.string(row.plaintext, "")
    email.text = text;
    let html = sanitize.string(row.html, null);
    if (html) {
      email.html = html;
    }
    email.needToLoadBody = text == null && html == null;
  }

  static async readAll(folder: Folder): Promise<void> {
    // <copied from="read()" />
    let emailRows = await (await getDatabase()).all(sql`
      SELECT
        id, uid, messageID, parentMsgID,
        size, dateSent, dateReceived,
        outgoing,
        subject,
        threadID, downloadComplete,
        isRead, isStarred, isReplied, isDraft, isSpam
      FROM email
      WHERE folderID = ${folder.dbID}
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
    let newEmails = new ArrayColl<EMail>();
    for (let row of emailRows) {
      let email = folder.messages.find(email => email.dbID == row.id);
      if (email) {
        await SQLEMail.readWritableProps(email, row); // TODO needed?
      } else {
        email = folder.newEMail();
        let emailRecipientRows = folderRecipientRows.filter(r => r.emailID == row.id);
        let emailAttachmentRows = folderAttachmentRows.filter(r => r.emailID == row.id);
        await SQLEMail.read(row.id, email, row, emailRecipientRows, emailAttachmentRows);
        newEmails.add(email);
      }
    }
    folder.messages.addAll(newEmails);
  }
}
