import type { ChatMessage } from "../Message";
import type { ChatRoom } from "../ChatRoom";
import type { Person } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { Attachment, ContentDisposition } from "../../Abstract/Attachment";
import { SQLPerson } from "../../Contacts/SQL/SQLPerson";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLChatMessage {
  /**
   * Save only fully downloaded emails
   */
  static async save(msg: ChatMessage) {
    if (!msg.contact.dbID) {
      await SQLPerson.save(msg.contact as Person);
    }
    if (!msg.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM message
        WHERE
          idStr = ${msg.id} AND
          chatID = ${msg.to.dbID}
        `) as any;
      if (existing?.id) {
        msg.dbID = existing.id;
      }
    }
    let reactionsJSON = await SQLChatMessage.saveReactions(msg);
    if (!msg.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO message (
          outgoing, fromPersonID, inReplyToIDStr,
          dateSent, dateReceived,
          plaintext, html, reactionsJSON,
          chatID, idStr
        ) VALUES (
          ${msg.outgoing ? 1 : 0}, ${msg.contact.dbID}, ${msg.inReplyTo},
          ${msg.sent.getTime() / 1000}, ${msg.received.getTime() / 1000},
          ${msg.text}, ${msg.rawHTMLDangerous}, ${reactionsJSON},
          ${msg.to.dbID}, ${msg.id}
        )`);
      msg.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE message SET
          fromPersonID = ${msg.contact.dbID},
          inReplyToIDStr = ${msg.inReplyTo},
          dateSent = ${msg.sent.getTime() / 1000},
          dateReceived = ${msg.received.getTime() / 1000},
          outgoing = ${msg.outgoing ? 1 : 0},
          plaintext = ${msg.text},
          html = ${msg.rawHTMLDangerous},
          reactionsJSON = ${reactionsJSON},
          chatID = ${msg.to.dbID},
          idStr = ${msg.id}
        WHERE id = ${msg.dbID}
        `);
    }
    await SQLChatMessage.saveAttachments(msg);
  }

  protected static async saveAttachments(msg: ChatMessage) {
    for (let a of msg.attachments) {
      let existing = await (await getDatabase()).get(sql`
        SELECT id FROM chatAttachment
        WHERE messageID = ${msg.dbID} AND filename = ${a.filename}
        `) as any;
      if (existing?.id) {
        await (await getDatabase()).run(sql`
          UPDATE chatAttachment SET
            filepathLocal = ${a.filepathLocal},
            mimeType = ${a.mimeType},
            size = ${a.size},
            related = ${a.related ? 1 : 0}
          WHERE id = ${existing.id}
          `);
      } else {
        await (await getDatabase()).run(sql`
          INSERT INTO chatAttachment (
            messageID, filename, filepathLocal, mimeType, size, related
          ) VALUES (
            ${msg.dbID}, ${a.filename}, ${a.filepathLocal}, ${a.mimeType}, ${a.size}, ${a.related ? 1 : 0}
          )`);
      }
    }
  }

  static async read(dbID: number, msg: ChatMessage, row?: any): Promise<void> {
    let readAttachments = !row;
    if (!row) {
      row = await (await getDatabase()).get(sql`
        SELECT
          outgoing, fromPersonID, inReplyToIDStr,
          dateSent, dateReceived,
          plaintext, html, reactionsJSON,
          chatID, idStr
        FROM message
        WHERE id = ${dbID}
        `) as any;
    }
    msg.dbID = sanitize.integer(dbID);
    msg.id = sanitize.nonemptystring(row.idStr);
    msg.outgoing = sanitize.boolean(row.outgoing, false);
    msg.inReplyTo = sanitize.string(row.inReplyToIDStr, null);
    msg.sent = sanitize.date(row.dateSent * 1000, new Date());
    msg.received = sanitize.date(row.dateReceived * 1000, new Date());
    msg.text = sanitize.string(row.plaintext, "");
    let html = sanitize.string(row.html, null);
    if (html) {
      msg.html = html;
    }
    SQLChatMessage.readReactions(msg, sanitize.string(row.reactionsJSON, null));
    let fromPersonID = sanitize.integer(row.fromPersonID);
    let chatID = sanitize.integer(row.chatID);
    if (msg.to) {
      assert(msg.to.dbID == chatID, "Wrong chat");
      if (!msg.outgoing && msg.to.contact instanceof Group) {
        // In a group chat, the sender is one of the members
        msg.contact = appGlobal.persons.find(p => p.dbID == fromPersonID) ?? msg.to.contact;
      } else {
        msg.contact = msg.to.contact;
      }
    } else {
      // TODO msg.to = chat
    }
    if (readAttachments) {
      let attRows = await (await getDatabase()).all(sql`
        SELECT filename, filepathLocal, mimeType, size, related
        FROM chatAttachment
        WHERE messageID = ${msg.dbID}
        `) as any;
      msg.attachments.replaceAll(attRows.map(attRow => SQLChatMessage.readAttachment(attRow)));
    }
  }

  protected static readAttachment(row: any): Attachment {
    let a = new Attachment();
    a.filename = sanitize.nonemptystring(row.filename);
    a.filepathLocal = sanitize.string(row.filepathLocal, null);
    a.mimeType = sanitize.nonemptystring(row.mimeType, "application/octet-stream");
    a.size = sanitize.integer(row.size, null);
    a.related = sanitize.boolean(row.related, false);
    a.disposition = a.related ? ContentDisposition.inline : ContentDisposition.attachment;
    return a;
  }

  protected static readReactions(msg: ChatMessage, reactionsJSONStr: string | null) {
    if (!reactionsJSONStr) {
      return;
    }
    let reactions = JSON.parse(reactionsJSONStr) as ReactionJSON[];
    for (let reaction of reactions) {
      try {
        let personID = sanitize.integer(reaction.personID);
        let person = appGlobal.persons.find(p => p.dbID == personID);
        let emoji = sanitize.string(reaction.emoji);
        msg.reactions.set(person, emoji);
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }

  protected static async saveReactions(msg: ChatMessage): Promise<string> {
    let reactions: ReactionJSON[] = [];
    msg.reactions.forEach(async (emoji: string, person: Person) => {
      if (!person.dbID) {
        await SQLPerson.save(person);
      }
      reactions.push({
        personID: person.dbID,
        emoji: emoji,
      } as ReactionJSON);
    });
    return JSON.stringify(reactions);
  }

  static async deleteIt(msg: ChatMessage) {
    assert(msg.dbID, "Need chat message DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM message
      WHERE id = ${msg.dbID}
      `);
  }

  static async readAll(chat: ChatRoom): Promise<void> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id,
        outgoing, fromPersonID, inReplyToIDStr,
        dateSent, dateReceived,
        plaintext, html, reactionsJSON,
        chatID, idStr
      FROM message
      WHERE chatID = ${chat.dbID}
      `) as any;
    // Read all attachments of this chat with a single query
    let attRows = await (await getDatabase()).all(sql`
      SELECT messageID, filename, filepathLocal, mimeType, size, related
      FROM chatAttachment
      WHERE messageID IN (SELECT id FROM message WHERE chatID = ${chat.dbID})
      `) as any;
    let attsByMessage = new Map<number, Attachment[]>();
    for (let attRow of attRows) {
      try {
        let atts = attsByMessage.get(attRow.messageID);
        if (!atts) {
          attsByMessage.set(attRow.messageID, atts = []);
        }
        atts.push(SQLChatMessage.readAttachment(attRow));
      } catch (ex) {
        chat.account.errorCallback(ex);
      }
    }
    let newMsgs = new ArrayColl<ChatMessage>();
    for (let row of rows) {
      try {
        let msg = chat.messages.find(msg => msg.dbID == row.id);
        if (msg) {
          await SQLChatMessage.read(row.id, msg as any as ChatMessage); // TODO needed?
        } else {
          msg = chat.newMessage();
          await SQLChatMessage.read(row.id, msg as any as ChatMessage, row);
          let atts = attsByMessage.get(row.id);
          if (atts) {
            msg.attachments.replaceAll(atts);
          }
          newMsgs.add(msg);
        }
      } catch (ex) {
        chat.account.errorCallback(ex);
      }
    }
    chat.messages.addAll(newMsgs);
  }
}

class ReactionJSON {
  personID: number;
  emoji: string;
}
