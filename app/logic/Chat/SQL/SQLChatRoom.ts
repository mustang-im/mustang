import { ChatRoom } from "../ChatRoom";
import type { ChatAccount } from "../ChatAccount";
import { ChatPersonUID } from "../ChatPersonUID";
import { Group } from "../../Abstract/Group";
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
    // For a group, the saved `Group` in the contacts DB (rare).
    // For a 1:1, the address-book `Person` the contact resolved to, if any.
    let personID: number | null = null;
    if (chat.contact instanceof Group) {
      let group = chat.contact;
      if (!group.dbID && group.addressbook?.dbID) {
        await SQLGroup.save(group);
      }
      personID = group.dbID ?? null;
    } else if (chat.contact instanceof ChatPersonUID) {
      personID = chat.contact.person?.dbID ?? null;
    }

    if (!chat.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM chatRoom
        WHERE
          idStr = ${chat.id} AND
          accountID = ${chat.account.dbID}
        `) as any;
      if (existing?.id) {
        chat.dbID = existing.id;
      }
    }
    // personID alone is ambiguous, because Person and Group have separate ID spaces.
    // Merge any protocol-specific room state (e.g. Signal's group masterKey/revision).
    let jsonStr = JSON.stringify({
      contactType: chat.contact instanceof Group ? "group" : "person",
      ...chat.toExtraJSON(),
    });
    if (!chat.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO chatRoom (
          accountID, idStr, name, personID, syncState, json
        ) VALUES(
          ${chat.account.dbID}, ${chat.id}, ${chat.name}, ${personID}, ${chat.syncState}, ${jsonStr}
        )`);
      chat.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE chatRoom SET
          idStr = ${chat.id},
          name = ${chat.name},
          personID = ${personID},
          syncState = ${chat.syncState},
          json = ${jsonStr}
        WHERE id = ${chat.dbID}
        `);
    }
    // A 1:1 room's contact must also be a member, so it persists in chatContact
    // and `read()` can reconstruct the room (which needs `members.first`). The
    // protocols set `members` via `listMembers()`, but room creation
    // (getNewChat / getOrCreateRoom) saves before that runs.
    if (chat.contact instanceof ChatPersonUID && !chat.members.includes(chat.contact)) {
      chat.members.add(chat.contact);
    }
    await SQLChatRoom.saveMembers(chat);
  }

  /** Room members are deliberately not in the contacts DB, to not pollute the user's addressbook */
  protected static async saveMembers(chat: ChatRoom): Promise<void> {
    let db = await getDatabase();
    let existingRows = await db.all(sql`
      SELECT id, idStr, name, personID, avatarURL FROM chatContact WHERE chatRoomID = ${chat.dbID}
      `) as any[];
    let existingByID = new Map<string, any>(existingRows.map(row => [row.idStr, row]));
    for (let member of chat.members) {
      let idStr = member.chatID;
      if (!idStr) {
        continue;
      }
      let name = member.name ?? idStr;
      let personID = member.person?.dbID ?? null;
      let avatarURL = member.picture ?? null;
      let existing = existingByID.get(idStr);
      if (existing) {
        existingByID.delete(idStr);
        if (existing.name != name || existing.personID != personID || existing.avatarURL != avatarURL) {
          await db.run(sql`
            UPDATE chatContact SET
              name = ${name}, personID = ${personID}, avatarURL = ${avatarURL}
            WHERE id = ${existing.id}
            `);
        }
      } else {
        await db.run(sql`
          INSERT INTO chatContact (
            chatRoomID, idStr, name, personID, avatarURL
          ) VALUES (
            ${chat.dbID}, ${idStr}, ${name}, ${personID}, ${avatarURL}
          )`);
      }
    }
    let goneIDs = [...existingByID.values()].map(row => row.id); // members that left
    if (goneIDs.length) { // `IN ()` would be a SQLite syntax error
      await db.run(sql`DELETE FROM chatContact WHERE id IN ${goneIDs}`);
    }
  }

  protected static async readMembers(chat: ChatRoom): Promise<void> {
    let account = chat.account as ChatAccount;
    let rows = await (await getDatabase()).all(sql`
      SELECT idStr, name, personID, avatarURL FROM chatContact WHERE chatRoomID = ${chat.dbID}
      `) as any[];
    let members = new ArrayColl<ChatPersonUID>();
    for (let row of rows) {
      try {
        let userID = sanitize.nonemptystring(row.idStr);
        let name = sanitize.label(row.name, null);
        let member = account.getPersonUID(userID, name);
        let avatarURL = sanitize.string(row.avatarURL, null);
        if (avatarURL) {
          member.picture ??= avatarURL;
        }
        let personID = sanitize.integer(row.personID, null);
        if (personID) {
          member.person ??= appGlobal.persons.find(p => p.dbID == personID);
        }
        members.add(member);
      } catch (ex) {
        chat.account.errorCallback(ex);
      }
    }
    chat.members.replaceAll(members);
  }

  /** Also deletes all messages in this chat */
  static async deleteIt(chat: ChatRoom) {
    assert(chat.dbID, "Need chat DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM chatRoom
      WHERE id = ${chat.dbID}
      `);
  }

  static async read(dbID: number, chat: ChatRoom, row?: any): Promise<ChatRoom> {
    assert(dbID, "Need message DB ID to read it");
    if (!row) {
      row = await (await getDatabase()).get(sql`
        SELECT
          accountID, idStr, name, personID, syncState, json
        FROM chatRoom
        WHERE id = ${dbID}
        `) as any;
    }
    chat.dbID = sanitize.integer(dbID);
    chat.id = sanitize.string(row.idStr);
    chat.syncState = sanitize.string(row.syncState, null);
    let accountID = sanitize.integer(row.accountID);
    let account = appGlobal.chatAccounts.find(acc => acc.dbID == accountID);
    assert(account, `Account ${accountID} not yet loaded`);
    chat.account = account;
    let json = sanitize.json(row.json, {}) as any;
    let personID = sanitize.integer(row.personID, null);
    await SQLChatRoom.readMembers(chat);
    if (json.contactType == "group") {
      // An addressbook group (personID set) is loaded from the contacts DB.
      // Most ChatRooms with multiple participants get a transient `Group` with name/avatar
      // Its members live in `chat.members`, not `group.participants`.
      chat.contact = (personID ? findGroup(personID) ?? await loadGroup(personID) : null);
      if (!chat.contact) {
        let group = new Group();
        group.name = sanitize.label(row.name, null) ?? chat.id;
        chat.contact = group;
      }
    } else {
      // 1:1: the single member is the chat partner, and a roster contact. Rooms
      // saved before the member was persisted fall back to a contact keyed by the
      // room ID (the partner's protocol ID for a 1:1 chat), instead of being lost.
      let member = chat.members.first ?? account.getPersonUID(chat.id);
      if (chat.members.isEmpty) {
        chat.members.add(member);
      }
      chat.contact = member;
      if (!account.roster.includes(member)) {
        account.roster.add(member);
      }
    }
    chat.name = sanitize.label(row.name, chat.contact.name);
    chat.fromExtraJSON(json); // protocol-specific room state (e.g. Signal group masterKey)
    return chat;
  }

  static async readAll(account: ChatAccount): Promise<void> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id,
        accountID, idStr, name, personID, syncState, json
      FROM chatRoom
      WHERE accountID = ${account.dbID}
      `) as any;
    for (let row of rows) {
      try {
        let chat = account.rooms.find(chat => chat.dbID == row.id);
        if (chat) {
          await SQLChatRoom.read(row.id, chat); // TODO needed?
        } else {
          let json = sanitize.json(row.json, {}) as any;
          chat = account.newRoom(json.contactType == "group");
          await SQLChatRoom.read(row.id, chat, row);
          account.rooms.set(chat.contact, chat);
        }
      } catch (ex) {
        account.errorCallback(ex);
      }
    }
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
