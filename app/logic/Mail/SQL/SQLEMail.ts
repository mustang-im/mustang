import { EMail, PersonEmailAddress } from "../EMail";
import type { Folder } from "../Folder";
import { findOrCreatePerson, findOrCreatePersonEmailAddress } from "../Person";
import { getDatabase } from "./SQLDatabase";
import type { IMAPEMail } from "../IMAP/IMAPEMail";
import { backgroundError } from "../../../frontend/Util/error";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import sql from "../../../../lib/rs-sqlite";

export class SQLEMail {
  /**
   * Save only fully downloaded emails
   */
  static async save(email: EMail) {
    if (!email.dbID) {
      let exists = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM email
        WHERE
          messageID = ${email.id} AND
          uid = ${(email as any as IMAPEMail).uid} AND
          folderID = ${email.folder.dbID}
        `);
      if (!exists) {
        let insert = await (await getDatabase()).run(sql`
          INSERT INTO email (
            id, messageID, folderID, uid, parentMsgID,
            attachmentsCount, size, dateSent, dateReceived,
            outgoing, -- contactEmail, contactName, myEmail
            subject, plaintext, html
          ) VALUES (
            ${email.dbID}, ${email.id}, ${email.folder.dbID}, ${(email as any as IMAPEMail).uid}, ${email.inReplyTo},
            ${email.attachments.length}, ${email.size}, ${email.sent.getTime()}, ${email.received.getTime()},
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
      }
    }
    await (await getDatabase()).run(sql`
      UPDATE email SET
        isRead = ${email.isRead ? 1 : 0},
        isStarred = ${email.isStarred ? 1 : 0},
        isReplied = ${email.isReplied ? 1 : 0},
        isSpam = ${email.isSpam ? 1 : 0},
        isDraft = ${email.isDraft ? 1 : 0}
      WHERE id = ${email.dbID}
      `);
  }

  static async saveRecipients(email: EMail, recipients: ArrayColl<PersonEmailAddress>, recipientsType: number) {
    for (let recipient of recipients) {
      await this.saveRecipient(email, recipient, recipientsType);
    }
  }

  static async saveRecipient(email: EMail, pe: PersonEmailAddress, recipientType: number) {
    //console.log("  recipient", pe.emailAddress, pe.name, "recipient type", recipientType);
    let exists = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM emailPerson
        WHERE
          emailAddress = ${pe.emailAddress}
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
    //console.log("  person ID", personID, "email ID", email.dbID, "recipient type", recipientType);
    await (await getDatabase()).run(sql`INSERT INTO emailPersonRel (
        emailID, emailPersonID, recipientType
      ) VALUES (
        ${email.dbID}, ${personID}, ${recipientType}
      )`);
  }

  static async read(dbID: number, email: EMail): Promise<EMail> {
    let row = await (await getDatabase()).get(sql`
      SELECT
        uid, messageID, parentMsgID,
        attachmentsCount, size, dateSent, dateReceived,
        outgoing, -- contactEmail, contactName, myEmail
        subject, plaintext, html,
        isRead, isStarred, isReplied, isDraft, isSpam
      FROM email
      WHERE id = ${dbID}
      `) as any;
    email.dbID = sanitize.integer(dbID);
    (email as any as IMAPEMail).uid = row.uid ? sanitize.integer(row.uid) : null;
    email.id = sanitize.nonemptystring(row.messageID);
    email.inReplyTo = sanitize.string(row.parentMsgID);
    email.size = sanitize.integer(row.size);
    email.sent = sanitize.date(row.dateSent);
    email.received = sanitize.date(row.dateReceived);
    email.outgoing = sanitize.boolean(!!row.outgoing);
    email.subject = sanitize.string(row.subject);
    email.text = sanitize.string(row.plaintext);
    email.html = sanitize.string(row.html);

    email.isRead = sanitize.boolean(!!row.isRead);
    email.isStarred = sanitize.boolean(!!row.isStarred);
    email.isReplied = sanitize.boolean(!!row.isReplied);
    email.isDraft = sanitize.boolean(!!row.isDraft);
    email.isSpam = sanitize.boolean(!!row.isSpam);

    let recipientRows = await (await getDatabase()).all(sql`
      SELECT
        name, emailAddress, recipientType
      FROM emailPersonRel LEFT JOIN emailPerson ON (emailPersonRel.emailPersonID = emailPerson.id)
      WHERE emailID = ${email.dbID}
      `) as any;
    for (let row of recipientRows) {
      try {
        let addr = sanitize.emailAddress(row.emailAddress);
        let name = sanitize.label(row.name);
        let pe = findOrCreatePersonEmailAddress(addr, name);
        if (row.recipientsType == 1) {
          email.from = pe;
          if (!email.outgoing) {
            email.contact = findOrCreatePerson(addr, name);
          }
          continue;
        } else if (row.recipientsType == 5) {
          email.replyTo.emailAddress = addr;
          email.replyTo.name = name;
          continue;
        }
        if (row.recipientsType == 2) {
          email.to.add(pe);
          if (email.outgoing && !email.contact) {
            email.contact = findOrCreatePerson(addr, name);
          }
        } else if (row.recipientsType == 3) {
          email.cc.add(pe);
        } else if (row.recipientsType == 4) {
          email.bcc.add(pe);
        }
      } catch (ex) {
        backgroundError(ex);
      }
    }

    return email;
  }

  static async readAll(folder: Folder): Promise<ArrayColl<EMail>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id
      FROM email
      WHERE folderID = ${folder.dbID}
      `) as any;
    let emails = new ArrayColl<EMail>();
    for (let row of rows) {
      let email = new EMail(folder);
      await SQLEMail.read(row.id, email);
      emails.add(email);
    }
    return emails;
  }
}
