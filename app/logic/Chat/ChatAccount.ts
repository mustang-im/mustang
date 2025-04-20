import { TCPAccount } from "../Abstract/TCPAccount";
import type { ChatPerson } from "./Person";
import type { Group } from "../Abstract/Group";
import { Chat } from "./Chat";
import type { ChatMessage } from "./Message";
import { appGlobal } from "../app";
import { AbstractFunction } from "../util/util";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from 'svelte-collections';

export class ChatAccount extends TCPAccount {
  readonly protocol: string = "chat";
  @notifyChangedProperty
  storage: ChatAccountStorage;

  readonly persons = new ArrayColl<ChatPerson>();
  readonly chats = new MapColl<ChatPerson | Group, Chat>;

  @notifyChangedProperty
  isOnline = false;

  async listChats(): Promise<void> {
    throw new AbstractFunction();
  }

  newChat(): Chat {
    return new Chat(this);
  }

  async save(): Promise<void> {
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await this.storage?.deleteAccount(this);
    appGlobal.chatAccounts.remove(this);
  }
}

export interface ChatAccountStorage {
  saveMessage(message: ChatMessage): Promise<void>;
  saveChat(chat: Chat): Promise<void>;
  saveAccount(account: ChatAccount): Promise<void>;
  deleteAccount(account: ChatAccount): Promise<void>;
}
