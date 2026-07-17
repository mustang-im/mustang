import { ChatRoomEvent } from "../RoomEvent";
import type { WhatsAppChatRoom } from "./WhatsAppChatRoom";

export class WhatsAppRoomEvent extends ChatRoomEvent {
  constructor(chatRoom: WhatsAppChatRoom) {
    super(chatRoom);
  }
  get chatRoom(): WhatsAppChatRoom {
    return this.to as WhatsAppChatRoom;
  }

  /**
   * Take a raw message from the server, interpret it, and set the values of this object.
   */
  fromWhatsApp(protobuf: any): void {
    // TODO implement
    // Don't forget to sanitize.foo() everything
  }
}
