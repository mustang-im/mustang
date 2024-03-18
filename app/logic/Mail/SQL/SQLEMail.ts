import { EMail } from "../EMail";
import type { Folder } from "../Folder";
import type { Person } from "../../Abstract/Person";
import { findOrCreatePerson } from "../Person";
import { getDatabase } from "./SQLDatabase";
import { backgroundError } from "../../../frontend/Util/error";
import { ArrayColl, MapColl } from "svelte-collections";
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
          uid = ${email.uid} AND
          folderID = ${email.folder.dbID}
        `);
      if (!exists) {
        let insert = await (await getDatabase()).run(sql`
          INSERT INTO email (
            messageID, folderID, uid, parentMsgID,
            attachmentsCount, size, dateSent, dateReceived,
            outgoing, contactEmail, contactName, -- myEmail
            subject, plaintext, html
          ) VALUES (
            ${email.dbID}, ${email.id}, ${email.folder.dbID}, ${email.uid}, ${email.inReplyTo},
            ${email.attachments.length}, ${email.size}, ${email.sent.getTime()}, ${email.received.getTime()},
            ${email.outgoing},
            ${email.subject}, ${email.text}, ${email.html}
          )`);
        email.dbID = insert.lastInsertRowid;
        await this.saveRecipient(email, email.from.name, email.from.emailAddress, 1);
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
        isRead = ${email.isRead},
        isStarred = ${email.isStarred},
        isReplied = ${email.isReplied},
        isSpam = ${email.isSpam},
        isDraft = ${email.isDraft}
      WHERE id = ${email.dbID}
      `);
  }

  static async saveRecipients(email: EMail, recipients: MapColl<string, Person>, recipientsType: number) {
    for (let [ emailAddress, person ] of recipients.entries()) {
      await this.saveRecipient(email, person.name, emailAddress, recipientsType);
    }
  }

  static async saveRecipient(email: EMail, name: string, emailAddress: string, recipientsType: number) {
    let insert = await (await getDatabase()).run(sql`
      INSERT OR IGNORE INTO emailPerson (
        name, emailAddress,
      ) VALUES (
        ${name}, ${emailAddress}
      )`);
    let personID = insert.lastInsertRowid;
    await (await getDatabase()).run(sql`INSERT INTO emailPersonRel (
        emailID, emailPersonID, recipientType
      ) VALUES (
        ${email.dbID}, ${personID}, ${recipientsType}
      )`);
  }

  static async read(dbID: number, email: EMail): Promise<EMail> {
    let row = await (await getDatabase()).get(sql`
      SELECT
        uid, messageID, parentMsgID,
        attachmentsCount, size, dateSent, dateReceived,
        outgoing, -- contactEmail, contactName, myEmail
        subject, plaintext, html
      FROM email
      WHERE id = ${dbID}
      `) as any;
    email.dbID = sanitize.integer(dbID);
    email.uid = sanitize.integer(row.uid);
    email.id = sanitize.nonemptystring(row.messageID);
    email.inReplyTo = sanitize.string(row.parentMsgID);
    email.size = sanitize.integer(row.size);
    email.sent = sanitize.date(row.dateSent);
    email.received = sanitize.date(row.dateReceived);
    email.outgoing = sanitize.boolean(row.outgoing);
    email.subject = sanitize.string(row.subject);
    email.text = sanitize.string(row.plaintext);
    email.html = sanitize.string(row.html);

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
        let person = findOrCreatePerson(addr, name);
        if (row.recipientsType == 1) {
          email.from.emailAddress = addr;
          email.from.name = name;
          if (!email.outgoing) {
            email.contact = person;
          }
          continue;
        } else if (row.recipientsType == 5) {
          email.replyTo.emailAddress = addr;
          email.replyTo.name = name;
          continue;
        }
        if (row.recipientsType == 2) {
          email.to.add(person);
          if (email.outgoing && !email.contact) {
            email.contact = person;
          }
        } else if (row.recipientsType == 3) {
          email.cc.add(person);
        } else if (row.recipientsType == 4) {
          email.bcc.add(person);
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
      this.read(row.id, email);
      emails.add(email);
    }
    return emails;
  }
}
