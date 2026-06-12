import { Message } from "../Abstract/Message";
import type { ChatRoom } from "./ChatRoom";
import type { VideoConfMeeting } from "../Meet/VideoConfMeeting";
import { notifyChangedProperty } from "../util/Observable";

/**
 * Information about what happens in the chat room,
 * which is *not* a message written by a human,
 * but e.g. a person joining or leaving, the room title changing,
 * and similar events.
 */
export class ChatRoomEvent extends Message {
  @notifyChangedProperty
  to: ChatRoom;

  constructor(room: ChatRoom) {
    super();
    this.to = room;
    this.contact = room?.contact;
  }

  get room(): ChatRoom {
    return this.to;
  }
  set room(val: ChatRoom) {
    this.to = val;
  }
}

export class JoinLeave extends ChatRoomEvent {
  /** true = the contact joined the chat room.
   * false = the contact left the chat room. */
  @notifyChangedProperty
  join: boolean;
  @notifyChangedProperty
  invite: boolean;
}

export class Invite extends ChatRoomEvent {
}

export class RoomNameChange extends ChatRoomEvent {
  /** The new name of the room. */
  @notifyChangedProperty
  name: string;
}

export class IncomingCall extends ChatRoomEvent {
  @notifyChangedProperty
  conf: VideoConfMeeting;
  @notifyChangedProperty
  video = true;
  @notifyChangedProperty
  audio = true;
}
