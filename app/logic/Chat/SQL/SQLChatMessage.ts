import type { RoomMessage } from "../Message";
import { ChatRoomEvent, RoomEventKind } from "../RoomEvent";
import type { ChatRoom } from "../ChatRoom";
import { Person } from "../../Abstract/Person";
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
  static async save(msg: RoomMessage) {
    let contact = msg.contact as Person;
    if (!contact.dbID && contact.addressbook?.dbID) {
      await SQLPerson.save(contact);
    }
    // 0 = sender is not in the DB: Group chat room members are
    // deliberately not saved, only their name. @see read()
    let fromPersonID = contact.dbID ?? null;
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
    // A `ChatRoomEvent` is marked by its `kind` in the json column.
    let jsonStr: string | null = null;
    if (msg instanceof ChatRoomEvent) {
      jsonStr = JSON.stringify(msg.toExtraJSON(), null, 2);
    } else if (!fromPersonID) {
      jsonStr = JSON.stringify({
        senderName: contact.name,
        senderID: contact.chatAccounts.first.value,
      }, null, 2);
    }
    let reactionsJSON = await SQLChatMessage.saveReactions(msg);
    if (!msg.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO message (
          outgoing, fromPersonID, inReplyToIDStr,
          dateSent, dateReceived,
          plaintext, html, reactionsJSON,
          chatID, idStr, json
        ) VALUES (
          ${msg.outgoing ? 1 : 0}, ${fromPersonID}, ${msg.inReplyTo},
          ${msg.sent.getTime() / 1000}, ${msg.received.getTime() / 1000},
          ${msg.text}, ${msg.rawHTMLDangerous}, ${reactionsJSON},
          ${msg.to.dbID}, ${msg.id}, ${jsonStr}
        )`);
      msg.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE message SET
          fromPersonID = ${fromPersonID},
          inReplyToIDStr = ${msg.inReplyTo},
          dateSent = ${msg.sent.getTime() / 1000},
          dateReceived = ${msg.received.getTime() / 1000},
          outgoing = ${msg.outgoing ? 1 : 0},
          plaintext = ${msg.text},
          html = ${msg.rawHTMLDangerous},
          reactionsJSON = ${reactionsJSON},
          chatID = ${msg.to.dbID},
          idStr = ${msg.id},
          json = ${jsonStr}
        WHERE id = ${msg.dbID}
        `);
    }
    await SQLChatMessage.saveAttachments(msg);
  }

  /**
   * Finds the sender in the group members, which were restored
   * from the chat rooms's `members` column.
   * Because Group chat room members are not in our DB,
   * we save their ID and name in the JSON column. @see save()
   */
  protected static getGroupSender(group: Group, jsonStr: string | null): Person | null {
    let json = sanitize.json(jsonStr, null) as any;
    let senderName = sanitize.nonemptylabel(json?.senderName, null);
    if (!senderName) {
      return null;
    }
    let member = group.participants.find(p => p.name == senderName);
    if (member) {
      return member;
    }
    let person = new Person();
    person.name = senderName;
    return person;
  }

  /** Creates the message or room event for this DB row,
   * based on the `kind` saved in the json column. */
  protected static newRoomMessage(chat: ChatRoom, jsonStr: string | null): RoomMessage {
    let json = sanitize.json(jsonStr, null) as any;
    let kind = sanitize.enum(json?.kind, Object.values(RoomEventKind), null);
    if (!kind) {
      return chat.newMessage();
    }
    let event = chat.newRoomEvent(kind);
    event.fromExtraJSON(json);
    return event;
  }

  protected static async saveAttachments(msg: RoomMessage) {
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

  static async read(dbID: number, msg: RoomMessage, row?: any): Promise<void> {
    let readAttachments = !row;
    if (!row) {
      row = await (await getDatabase()).get(sql`
        SELECT
          outgoing, fromPersonID, inReplyToIDStr,
          dateSent, dateReceived,
          plaintext, html, reactionsJSON,
          chatID, idStr, json
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
        msg.contact = (fromPersonID ? appGlobal.persons.find(p => p.dbID == fromPersonID) : null) ??
          SQLChatMessage.getGroupSender(msg.to.contact, sanitize.string(row.json, null)) ??
          msg.to.contact;
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

  protected static readReactions(msg: RoomMessage, reactionsJSONStr: string | null) {
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

  protected static async saveReactions(msg: RoomMessage): Promise<string> {
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

  static async deleteIt(msg: RoomMessage) {
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
        chatID, idStr, json
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
    let newMsgs = new ArrayColl<RoomMessage>();
    for (let row of rows) {
      try {
        let msg = chat.messages.find(msg => msg.dbID == row.id);
        if (msg) {
          await SQLChatMessage.read(row.id, msg as any as RoomMessage); // TODO needed?
        } else {
          msg = SQLChatMessage.newRoomMessage(chat, sanitize.string(row.json, null));
          await SQLChatMessage.read(row.id, msg as any as RoomMessage, row);
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
