import { ChatAccount } from '../ChatAccount';
import type { GraphAccount } from '../../Mail/Graph/GraphAccount';
import { GraphChatRoom } from './GraphChatRoom';
import type { TGraphChat } from './TGraphChat';
import type { Group } from '../../Abstract/Group';
import type { ChatPerson } from '../ChatPerson';
import { MapColl } from 'svelte-collections';

export class GraphChatAccount extends ChatAccount {
  readonly protocol: string = "chat-graph";
  readonly rooms = new MapColl<ChatPerson | Group, GraphChatRoom>;

  get account(): GraphAccount {
    return this.mainAccount as GraphAccount;
  }

  /** Login to this account on the server. Opens network connection.
   * You must call this after creating the object and having set its properties.
   * This will populate `persons` and `chats`. */
  async login(interactive: boolean) {
    await super.login(interactive);
    if (!this.account.isLoggedIn) {
      await this.account.login(interactive);
    }
    await this.afterConnect();
    await this.listRooms();
  };
  protected async afterConnect() {
  }

  async listRooms(): Promise<void> {
    await super.listRooms();
    let chatsJSON = await this.account.graphGetAll<TGraphChat>("chats", { top: 50 });
    for (let chatJSON of chatsJSON) {
      let room = this.newRoom();
      room.fromGraph(chatJSON);
      await room.listMembers();
      this.rooms.set(room.contact, room);
    }
  }

  newRoom(): GraphChatRoom {
    return new GraphChatRoom(this);
  }
}
