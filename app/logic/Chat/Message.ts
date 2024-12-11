// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { Message } from "../Abstract/Message";
import { notifyChangedProperty } from "../util/Observable";
import type { Chat } from "./Chat";

export class ChatMessage extends Message {
  @notifyChangedProperty
  to: Chat;
  @notifyChangedProperty
  deliveryStatus = DeliveryStatus.Unknown;

  constructor(chat: Chat) {
    super();
    this.to = chat;
  }
}

/**
 * A human-language message from a human to other humans.
 */
export class UserChatMessage extends ChatMessage {
}

export enum DeliveryStatus {
  Unknown = "unknown",
  Sending = "sending",
  Server = "server",
  User = "user",
  Seen = "seen",
}
