import type { ChatMessage } from "../Message";
import type { Chat } from "../Chat";
import type { Person } from "../../Abstract/Person";
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
  }

  static async read(dbID: number, msg: ChatMessage, row?: any): Promise<void> {
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
    msg.inReplyTo = sanitize.string(row.parentMsgID, null);
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
      msg.contact = msg.to.contact;
      assert(msg.to.dbID == chatID, "Wrong chat");
      assert(msg.contact.dbID == fromPersonID, "TODO Chat rooms with multiple participants");
    } else {
      // TODO msg.to = chat
    }
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

  static async readAll(chat: Chat): Promise<void> {
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
    let newMsgs = new ArrayColl<ChatMessage>();
    for (let row of rows) {
      try {
        let msg = chat.messages.find(msg => msg.dbID == row.id);
        if (msg) {
          await SQLChatMessage.read(row.id, msg as any as ChatMessage); // TODO needed?
        } else {
          msg = chat.newMessage();
          await SQLChatMessage.read(row.id, msg as any as ChatMessage, row);
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
