import { ChatRoomEvent } from "../RoomEvent";
import type { GraphChatRoom } from "./GraphChatRoom";

export class GraphRoomEvent extends ChatRoomEvent {
  constructor(chatRoom: GraphChatRoom) {
    super(chatRoom);
  }
  get chatRoom(): GraphChatRoom {
    return this.to as GraphChatRoom;
  }

  /**
   * Take a raw message from the server, interpret it, and set the values of this object.
   */
  fromGraph(json: any): void {
    // TODO implement
    // Don't forget to sanitize.foo() everything
  }
}
