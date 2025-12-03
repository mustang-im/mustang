import { ChatAccount } from '../ChatAccount';
import type { GraphAccount } from '../../Mail/Graph/GraphAccount';
import { GraphChatRoom } from './GraphChatRoom';
import type { TGraphChat } from './TGraphChat';
import type { Group } from '../../Abstract/Group';
import type { ChatPerson } from '../Person';
import { MapColl } from 'svelte-collections';

export class GraphChatAccount extends ChatAccount {
  readonly protocol: string = "chat-graph";
  account: GraphAccount;
  readonly chats = new MapColl<ChatPerson | Group, GraphChatRoom>;

  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login(interactive: boolean) {
    await super.login(interactive);
    if (!this.account.isLoggedIn) {
      await this.account.login(interactive);
    }
    await this.afterConnect();
    await this.listChats();
  };
  protected async afterConnect() {
  }

  async listChats(): Promise<void> {
    let chatsJSON = await this.account.graphGetAll<TGraphChat>("chats", { top: 50 });
    for (let chatJSON of chatsJSON) {
      let chat = this.newChat();
      chat.fromGraph(chatJSON);
      await chat.listMembers();
      this.chats.set(chat.contact, chat);
    }
  }

  newChat(): GraphChatRoom {
    return new GraphChatRoom(this);
  }
}
