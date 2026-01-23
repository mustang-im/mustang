import { ChatRoom } from "../ChatRoom";
import type { ChatAccount } from "../ChatAccount";
import { Account } from "../../Abstract/Account";
import { Person } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { SQLPerson } from "../../Contacts/SQL/SQLPerson";
import { SQLGroup } from "../../Contacts/SQL/SQLGroup";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import sql from "../../../../lib/rs-sqlite";

export class SQLChat extends ChatRoom {
  static async save(chat: ChatRoom) {
    assert(chat.account, "Need chat account to save chat");
    assert(chat.account?.dbID, "Need chat account DB ID to save chat");
    if (!chat.contact.dbID) {
      if (chat.contact instanceof Person) {
        await SQLPerson.save(chat.contact);
      } else if (chat.contact instanceof Group) {
        await SQLGroup.save(chat.contact);
      }
    }

    if (!chat.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM chat
        WHERE
          idStr = ${chat.id} AND
          accountID = ${chat.account.dbID}
        `) as any;
      if (existing?.id) {
        chat.dbID = existing.id;
      }
    }
    if (!chat.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO chat (
          accountID, idStr, name, contactID, syncState
        ) VALUES(
          ${chat.account.dbID}, ${chat.id}, ${chat.name}, ${chat.contact.dbID}, ${chat.syncState}
        )`);
      chat.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE chat SET
          idStr = ${chat.id},
          name = ${chat.name},
          contactID = ${chat.contact.dbID},
          syncState = ${chat.syncState}
        WHERE id = ${chat.dbID}
        `);
    }
  }

  /** Also deletes all messages in this chat */
  static async deleteIt(chat: ChatRoom) {
    assert(chat.dbID, "Need chat DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM chat
      WHERE id = ${chat.dbID}
      `);
  }

  static async read(dbID: number, chat: ChatRoom, row?: any): Promise<ChatRoom> {
    assert(dbID, "Need message DB ID to read it");
    if (!row) {
      row = await (await getDatabase()).get(sql`
        SELECT
          accountID, idStr, name, contactID, syncState
        FROM chat
        WHERE id = ${dbID}
        `) as any;
    }
    chat.dbID = sanitize.integer(dbID);
    chat.id = sanitize.string(row.idStr);
    chat.syncState = sanitize.string(row.syncState, null);
    let contactID = sanitize.integer(row.contactID);
    chat.contact = appGlobal.persons.find(p => p.dbID == contactID);
    // TODO Group
    assert(chat.contact, "Contact not found");
    chat.name = sanitize.label(row.name, chat.contact.name);
    let accountID = sanitize.integer(row.accountID);
    chat.account = appGlobal.chatAccounts.find(acc => acc.dbID == accountID) as any as Account;
    assert(chat.account, `Account ${accountID} not yet loaded`);
    return chat;
  }

  static async readAll(account: ChatAccount): Promise<void> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id,
        accountID, idStr, name, contactID, syncState
      FROM chat
      WHERE accountID = ${account.dbID}
      `) as any;
    let newChats = new ArrayColl<ChatRoom>();
    for (let row of rows) {
      try {
        let chat = account.chats.find(chat => chat.dbID == row.id);
        if (chat) {
          await SQLChat.read(row.id, chat); // TODO needed?
        } else {
          chat = account.newChat();
          await SQLChat.read(row.id, chat, row);
          newChats.add(chat);
        }
      } catch (ex) {
        account.errorCallback(ex);
      }
    }
    account.chats.addAll(newChats);
  }
}
