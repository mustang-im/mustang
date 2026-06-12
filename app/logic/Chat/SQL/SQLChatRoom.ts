import { ChatRoom } from "../ChatRoom";
import type { ChatAccount } from "../ChatAccount";
import type { Account } from "../../Abstract/Account";
import { ContactEntry, Person } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { SQLPerson } from "../../Contacts/SQL/SQLPerson";
import { SQLGroup } from "../../Contacts/SQL/SQLGroup";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import sql from "../../../../lib/rs-sqlite";

export class SQLChatRoom extends ChatRoom {
  static async save(chat: ChatRoom) {
    assert(chat.account, "Need chat account to save chat");
    assert(chat.account?.dbID, "Need chat account DB ID to save chat");
    // Contacts in the chat account's own address book are
    // deliberately not in the contacts DB, e.g. group chat rooms.
    if (!chat.contact.dbID && (chat.contact as any).addressbook?.dbID) {
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
    // contactID alone is ambiguous, because Person and Group have separate ID spaces
    let jsonStr = JSON.stringify({
      contactType: chat.contact instanceof Group ? "group" : "person",
    });
    let membersJSON = SQLChatRoom.saveMembers(chat);
    let contactID = chat.contact.dbID ?? 0; // 0 = not in the contacts DB
    if (!chat.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO chat (
          accountID, idStr, name, contactID, syncState, json, members
        ) VALUES(
          ${chat.account.dbID}, ${chat.id}, ${chat.name}, ${contactID}, ${chat.syncState}, ${jsonStr}, ${membersJSON}
        )`);
      chat.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE chat SET
          idStr = ${chat.id},
          name = ${chat.name},
          contactID = ${contactID},
          syncState = ${chat.syncState},
          json = ${jsonStr},
          members = ${membersJSON}
        WHERE id = ${chat.dbID}
        `);
    }
  }

  /** The group members, with the user ID (e.g. JID) from
   * the contact entry for the chat protocol */
  protected static saveMembers(chat: ChatRoom): string | null {
    if (!(chat.contact instanceof Group)) {
      return null;
    }
    let members = chat.contact.participants.contents.map(person => ({
      name: person.name,
      userID: person.chatAccounts.find(e => e.protocol == chat.account.protocol)?.value ??
        person.chatAccounts.first?.value ?? null,
    }));
    return JSON.stringify(members, null, 2);
  }

  /** Re-creates the group members in the chat account's own address book.
   * The same person is reused across rooms. */
  protected static readMembers(chat: ChatRoom, membersJSON: string | null): void {
    if (!(chat.contact instanceof Group) || chat.contact.participants.hasItems) {
      return;
    }
    let account = chat.account as ChatAccount;
    let members = sanitize.array(sanitize.json(membersJSON, []), []) as any[];
    for (let member of members) {
      try {
        let name = sanitize.label(member.name, null);
        let userID = sanitize.string(member.userID, null);
        let person: Person;
        if (userID) {
          person = account.getPerson(userID, name);
        } else {
          person = account.addressbook.newPerson();
          person.name = name;
          account.addressbook.persons.add(person);
        }
        chat.contact.participants.add(person);
      } catch (ex) {
        chat.account.errorCallback(ex);
      }
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
          accountID, idStr, name, contactID, syncState, json, members
        FROM chat
        WHERE id = ${dbID}
        `) as any;
    }
    chat.dbID = sanitize.integer(dbID);
    chat.id = sanitize.string(row.idStr);
    chat.syncState = sanitize.string(row.syncState, null);
    let accountID = sanitize.integer(row.accountID);
    chat.account = appGlobal.chatAccounts.find(acc => acc.dbID == accountID) as any as Account;
    assert(chat.account, `Account ${accountID} not yet loaded`);
    let json = sanitize.json(row.json, {}) as any;
    let contactID = sanitize.integer(row.contactID, 0);
    if (json.contactType == "group") {
      chat.contact = (contactID ? findGroup(contactID) : null) ??
        newAccountGroup(chat, sanitize.label(row.name, null));
      SQLChatRoom.readMembers(chat, sanitize.string(row.members, null));
    } else {
      chat.contact = appGlobal.persons.find(p => p.dbID == contactID) ?? findGroup(contactID);
    }
    assert(chat.contact, "Contact not found");
    chat.name = sanitize.label(row.name, chat.contact.name);
    return chat;
  }

  static async readAll(account: ChatAccount): Promise<void> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id,
        accountID, idStr, name, contactID, syncState, json, members
      FROM chat
      WHERE accountID = ${account.dbID}
      `) as any;
    let newChats = new ArrayColl<ChatRoom>();
    for (let row of rows) {
      try {
        let chat = account.rooms.find(chat => chat.dbID == row.id);
        if (chat) {
          await SQLChatRoom.read(row.id, chat); // TODO needed?
        } else {
          let json = sanitize.json(row.json, {}) as any;
          chat = account.newRoom(json.contactType == "group");
          await SQLChatRoom.read(row.id, chat, row);
          newChats.add(chat);
        }
      } catch (ex) {
        account.errorCallback(ex);
      }
    }
    account.rooms.addAll(newChats);
  }
}

function findGroup(dbID: number): Group | null {
  for (let ab of appGlobal.addressbooks) {
    let group = ab.groups.find(g => g.dbID == dbID);
    if (group) {
      return group;
    }
  }
  return null;
}

/** Group chat rooms live in the chat account's own address book,
 * not in the contacts DB. */
function newAccountGroup(chat: ChatRoom, name: string | null): Group {
  let group = (chat.account as ChatAccount).addressbook.newGroup();
  group.name = name ?? chat.id;
  return group;
}
