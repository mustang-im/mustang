import { Account } from "../Abstract/Account";
import type { ChatPerson } from "./Person";
import type { Group } from "../Abstract/Group";
import { Chat } from "./Chat";
import type { ChatMessage } from "./Message";
import { TLSSocketType } from "../Mail/MailAccount";
import { appGlobal } from "../app";
import { ArrayColl, MapColl } from 'svelte-collections';
import { notifyChangedProperty } from "../util/Observable";

export class ChatAccount extends Account {
  readonly protocol = "chat";
  @notifyChangedProperty
  hostname: string | null = null; /** only for some account types */
  @notifyChangedProperty
  port: number | null = null;
  @notifyChangedProperty
  tls = TLSSocketType.Unknown;
  @notifyChangedProperty
  password: string | null = null;
  storage: ChatAccountStorage;

  readonly persons = new ArrayColl<ChatPerson>();
  readonly chats = new MapColl<ChatPerson | Group, Chat>;

  @notifyChangedProperty
  isOnline = false;

  newChat(): Chat {
    return new Chat(this);
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
