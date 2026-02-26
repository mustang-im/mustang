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

  async startup() {
    await this.listRooms();
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
