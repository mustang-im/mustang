import { TCPAccount } from "../Abstract/TCPAccount";
import type { ChatPersonUID } from "./ChatPersonUID";
import { ContactEntry, type Person } from "../Abstract/Person";
import type { Group } from "../Abstract/Group";
import { ChatRoom } from "./ChatRoom";
import type { RoomMessage } from "./Message";
import { SQLChatRoom } from "./SQL/SQLChatRoom";
import { Addressbook } from "../Contacts/Addressbook";
import { DummyAddressbookStorage } from "../Contacts/SQL/DummyAddressbookStorage";
import { appGlobal } from "../app";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from 'svelte-collections';

export class ChatAccount extends TCPAccount {
  readonly protocol: string = "chat";
  @notifyChangedProperty
  storage: ChatAccountStorage;

  readonly persons = new ArrayColl<ChatPersonUID>();
  readonly rooms = new MapColl<ChatPersonUID | Group, ChatRoom>;
  /** Contacts of this chat account which should *not* appear in the
   * user's address books, e.g. group chat rooms and their members.
   * Deliberately not in `appGlobal.addressbooks`, and not saved.
   * In contrast, roster contacts (1:1 chats) go into the
   * personal address book. */
  readonly addressbook = newChatAddressbook();

  @notifyChangedProperty
  isOnline = false;

  async listRooms(): Promise<void> {
    if (!this.dbID) {
      await this.save();
    }
    if (this.rooms.isEmpty) {
      await SQLChatRoom.readAll(this);
    }
  }

  /** @param isGroup true = chat with a `Group`, false = 1:1 chat.
   * Protocols with separate classes for them return the right one. */
  newRoom(isGroup = false): ChatRoom {
    return new ChatRoom(this);
  }

  /** Gets the contact for this user ID in this account's own
   * address book, e.g. a group chat room member.
   * The same person is reused across rooms, so that one can see
   * which rooms a person is in.
   * @param userID e.g. the JID
   * @param name Used only when the person is not known yet */
  getPerson(userID: string, name?: string): Person {
    let person =
      appGlobal.persons.find(p =>
        p.chatAccounts.some(e => e.value == userID)) ??
      this.addressbook.persons.find(p =>
        p.chatAccounts.some(e => e.value == userID));
    if (person) {
      return person;
    }
    person = this.addressbook.newPerson();
    person.name = name ?? userID;
    person.chatAccounts.add(new ContactEntry(userID, null, this.protocol));
    this.addressbook.persons.add(person);
    return person;
  }

  async save(): Promise<void> {
    await super.save();
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteAccount(this);
    appGlobal.chatAccounts.remove(this);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    if (!appGlobal.me.name && this.realname) {
      appGlobal.me.name = this.realname;
    }
  }
}

function newChatAddressbook(): Addressbook {
  let addressbook = new Addressbook();
  addressbook.name = "Chat contacts";
  addressbook.storage = new DummyAddressbookStorage();
  return addressbook;
}

export interface ChatAccountStorage {
  saveMessage(message: RoomMessage): Promise<void>;
  saveRoom(room: ChatRoom): Promise<void>;
  saveAccount(account: ChatAccount): Promise<void>;
  deleteAccount(account: ChatAccount): Promise<void>;
}
