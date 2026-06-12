import { ChatRoomEvent } from "../RoomEvent";
import type { MatrixRoom } from "./MatrixRoom";

export class MatrixRoomEvent extends ChatRoomEvent {
  constructor(chatRoom: MatrixRoom) {
    super(chatRoom);
  }
  get chatRoom(): MatrixRoom {
    return this.to as MatrixRoom;
  }

  /**
   * Take a raw message from the server, interpret it, and set the values of this object.
   */
  fromMatrix(json: any): void {
    // TODO implement
    // Don't forget to sanitize.foo() everything
  }
}
