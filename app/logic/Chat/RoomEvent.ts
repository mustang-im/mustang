import { ChatMessage } from "./Message";

/**
 * Information about what happens in the chat room,
 * which is *not* a message written by a human,
 * but e.g. a person joining or leaving, the room title changing,
 * and similar events.
 */
export class ChatRoomEvent extends ChatMessage {
}

export class JoinLeave extends ChatRoomEvent {
  /** true = the contact joined the chat room.
   * false = the contact left the chat room. */
  join: boolean;
  invite: boolean;
}

export class Invite extends ChatRoomEvent {
}

export class RoomNameChange extends ChatRoomEvent {
  /** The new name of the room. */
  name: string;
}
