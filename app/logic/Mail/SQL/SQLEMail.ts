import type { EMail, PersonEmailAddress } from "../EMail";
import type { Folder } from "../Folder";
import { Attachment, ContentDisposition } from "../Attachment";
import { findOrCreatePerson, findOrCreatePersonEmailAddress } from "../Person";
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
          outgoing, -- contactEmail, contactName, myEmail
          subject, plaintext, html
        ) VALUES (
          ${email.id}, ${email.folder.dbID}, ${(email as any as IMAPEMail).uid}, ${email.inReplyTo},
          ${email.size}, ${email.sent.getTime() / 1000}, ${email.received.getTime() / 1000},
          ${email.outgoing ? 1 : 0},
          ${email.subject}, ${email.text}, ${email.html}
        )`);
      email.dbID = insert.lastInsertRowid;
      await this.saveRecipient(email, email.from, 1);
      await this.saveRecipients(email, email.to, 2);
      await this.saveRecipients(email, email.cc, 3);
      await this.saveRecipients(email, email.bcc, 4);
      if (email.replyTo?.emailAddress) {
        await this.saveRecipient(email, email.replyTo.name, email.replyTo.emailAddress, 5);
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
          html = ${email.html}
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

  static async saveRecipients(email: EMail, recipients: ArrayColl<PersonEmailAddress>, recipientsType: number) {
    for (let recipient of recipients) {
      await this.saveRecipient(email, recipient, recipientsType);
    }
  }

  static async saveRecipient(email: EMail, pe: PersonEmailAddress, recipientType: number) {
    let exists = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM emailPerson
        WHERE
          emailAddress = ${pe.emailAddress} AND
          name = ${pe.name}
        `) as any;
    let personID = exists?.id;
    if (!personID) {
      let insert = await (await getDatabase()).run(sql`
      INSERT OR IGNORE INTO emailPerson (
        name, emailAddress, personID
      ) VALUES (
        ${pe.name}, ${pe.emailAddress}, ${pe.person?.dbID}
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

  static async read(dbID: number, email: EMail): Promise<EMail> {
    let row = await (await getDatabase()).get(sql`
      SELECT
        uid, messageID, parentMsgID,
        size, dateSent, dateReceived,
        outgoing, -- contactEmail, contactName, myEmail
        subject, plaintext, html,
        threadID, downloadComplete,
        isRead, isStarred, isReplied, isDraft, isSpam
      FROM email
      WHERE id = ${dbID}
      `) as any;
    email.dbID = sanitize.integer(dbID);
    (email as any as IMAPEMail).uid = sanitize.integer(row.uid, null);
    email.id = sanitize.nonemptystring(row.messageID);
    email.inReplyTo = sanitize.string(row.parentMsgID, null);
    email.size = sanitize.integer(row.size, null);
    email.sent = sanitize.date(row.dateSent * 1000, new Date());
    email.received = sanitize.date(row.dateReceived * 1000, new Date());
    email.outgoing = sanitize.boolean(!!row.outgoing);
    email.subject = sanitize.string(row.subject, null);
    email.text = sanitize.string(row.plaintext, "");
    let html = sanitize.string(row.html, null);
    if (html) {
      email.html = html;
    }
    this.readWritablePropsFromResult(email, row);
    await this.readRecipients(email);
    await this.readAttachments(email);
    return email;
  }

  static async readWritableProps(email: EMail) {
    let row = await (await getDatabase()).get(sql`
      SELECT
        isRead, isStarred, isReplied, isDraft, isSpam, threadID, downloadComplete
      FROM email
      WHERE id = ${email.dbID}
      `) as any;
    this.readWritablePropsFromResult(email, row);
  }

  protected static readWritablePropsFromResult(email: EMail, row) {
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

  protected static async readRecipients(email: EMail) {
    let recipientRows = await (await getDatabase()).all(sql`
      SELECT
        name, emailAddress, recipientType
      FROM emailPersonRel LEFT JOIN emailPerson ON (emailPersonRel.emailPersonID = emailPerson.id)
      WHERE emailID = ${email.dbID}
      `) as any;
    for (let row of recipientRows) {
      try {
        let addr = sanitize.emailAddress(row.emailAddress, "unknown@invalid");
        let name = sanitize.label(row.name, null);
        let pe = findOrCreatePersonEmailAddress(addr, name);
        if (row.recipientType == 1) {
          email.from = pe;
          if (!email.outgoing) {
            email.contact = findOrCreatePerson(addr, name);
          }
          continue;
        } else if (row.recipientType == 5) {
          email.replyTo.emailAddress = addr;
          email.replyTo.name = name;
          continue;
        }
        if (row.recipientType == 2) {
          email.to.add(pe);
          if (email.outgoing && !email.contact) {
            email.contact = findOrCreatePerson(addr, name);
          }
        } else if (row.recipientType == 3) {
          email.cc.add(pe);
        } else if (row.recipientType == 4) {
          email.bcc.add(pe);
        }
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }

  protected static async readAttachments(email: EMail) {
    let attachmentRows = await (await getDatabase()).all(sql`
      SELECT
        filename, filepathLocal, mimeType, size, contentID, disposition, related
      FROM emailAttachment
      WHERE emailID = ${email.dbID}
      `) as any;
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

  static async readAll(folder: Folder): Promise<void> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id
      FROM email
      WHERE folderID = ${folder.dbID}
      `) as any;
    let newEmails = new ArrayColl<EMail>();
    for (let row of rows) {
      let email = folder.messages.find(email => email.dbID == row.id);
      if (email) {
        await SQLEMail.readWritableProps(email); // TODO needed?
      } else {
        email = folder.newEMail();
        await SQLEMail.read(row.id, email); // TODO: Get metadata with query above first, then the email contents?
        newEmails.add(email);
      }
    }
    folder.messages.addAll(newEmails);
  }
}
