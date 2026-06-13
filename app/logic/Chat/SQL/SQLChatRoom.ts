import { ChatRoom } from "../ChatRoom";
import type { ChatAccount } from "../ChatAccount";
import type { Account } from "../../Abstract/Account";
import { Person } from "../../Abstract/Person";
import { ContactBase } from "../../Abstract/Contact";
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
    let contactID: number | null = null;
    if (chat.contact instanceof ContactBase) {
      let contact = chat.contact;
      // Don't save room members in the contacts DB, we save authors in each message
      if (!contact.dbID && contact.addressbook?.dbID) {
        if (contact instanceof Person) {
          await SQLPerson.save(contact);
        } else if (contact instanceof Group) {
          await SQLGroup.save(contact);
        }
      }
      contactID = contact.dbID ?? null; // null = not in the contacts DB
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
    })).filter(p => p.userID);
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
        let userID = sanitize.nonemptystring(member.userID);
        let name = sanitize.label(member.name, null);
        let person = account.getPerson(userID, name);
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
    let contactID = sanitize.integer(row.contactID, null);
    if (json.contactType == "group") {
      // A saved group (contactID set) is loaded from the contacts DB.
      // A group chat room kept only in the chat account's own address book
      // (contactID null) is re-created and its members restored.
      // TODO Fix data model
      chat.contact = (contactID ? findGroup(contactID) ?? await loadGroup(contactID) : null);
      if (!chat.contact) {
        let group = chat.account.addressbook.newGroup();
        group.name = sanitize.label(row.name, null) ?? chat.id;
        chat.contact = group;
      }
      SQLChatRoom.readMembers(chat, sanitize.string(row.members, null));
    } else {
      chat.contact = appGlobal.persons.find(p => p.dbID == contactID)
        ?? await loadPerson(contactID);
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

/** Loads a single person from the DB by its dbID, and registers it in its
 * addressbook so it shows up in `appGlobal.persons` (and the later bulk load
 * dedups against it). Returns null if there is no such person. */
async function loadPerson(dbID: number): Promise<Person | null> {
  if (!dbID) {
    return null;
  }
  try {
    let person = new Person();
    await SQLPerson.read(dbID, person);
    let addressbook = person.addressbook;
    if (addressbook && !addressbook.persons.some(p => p.dbID == dbID)) {
      addressbook.persons.add(person);
    }
    return person;
  } catch (ex) {
    return null;
  }
}

async function loadGroup(dbID: number): Promise<Group | null> {
  if (!dbID) {
    return null;
  }
  try {
    let group = new Group();
    await SQLGroup.read(dbID, group);
    let addressbook = group.addressbook;
    if (addressbook && !addressbook.groups.some(g => g.dbID == dbID)) {
      addressbook.groups.add(group);
    }
    return group;
  } catch (ex) {
    return null;
  }
}
