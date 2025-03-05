import { Account } from "../Abstract/Account";
import type { ChatPerson } from "./Person";
import type { Group } from "../Abstract/Group";
import { Chat } from "./Chat";
import type { ChatMessage } from "./Message";
import { TLSSocketType } from "../Mail/MailAccount";
import { appGlobal } from "../app";
import { AbstractFunction } from "../util/util";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from 'svelte-collections';

export class ChatAccount extends Account {
  readonly protocol: string = "chat";
  @notifyChangedProperty
  hostname: string | null = null; /** only for some account types */
  @notifyChangedProperty
  port: number | null = null;
  @notifyChangedProperty
  tls = TLSSocketType.Unknown;
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
