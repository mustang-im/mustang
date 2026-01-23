import { TCPAccount } from "../Abstract/TCPAccount";
import type { ChatPerson } from "./ChatPerson";
import type { Group } from "../Abstract/Group";
import { ChatRoom } from "./ChatRoom";
import type { ChatMessage } from "./Message";
import { SQLChat } from "./SQL/SQLChat";
import { appGlobal } from "../app";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from 'svelte-collections';

export class ChatAccount extends TCPAccount {
  readonly protocol: string = "chat";
  @notifyChangedProperty
  storage: ChatAccountStorage;

  readonly persons = new ArrayColl<ChatPerson>();
  readonly chats = new MapColl<ChatPerson | Group, ChatRoom>;

  @notifyChangedProperty
  isOnline = false;

  async listChats(): Promise<void> {
    if (!this.dbID) {
      await this.save();
    }
    if (this.chats.isEmpty) {
      SQLChat.readAll(this);
    }
  }

  newChat(): ChatRoom {
    return new ChatRoom(this);
  }

  async save(): Promise<void> {
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

export interface ChatAccountStorage {
  saveMessage(message: ChatMessage): Promise<void>;
  saveChat(chat: ChatRoom): Promise<void>;
  saveAccount(account: ChatAccount): Promise<void>;
  deleteAccount(account: ChatAccount): Promise<void>;
}
