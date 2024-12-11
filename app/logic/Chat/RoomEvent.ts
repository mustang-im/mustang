// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { VideoConfMeeting } from "../Meet/VideoConfMeeting";
import { notifyChangedProperty } from "../util/Observable";
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
