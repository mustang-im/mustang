// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { ChatMessage, DeliveryStatus, UserChatMessage } from "./Message";
import type { Message } from "../Abstract/Message";
import type { Contact } from "../Abstract/Contact";
import type { Account } from "../Abstract/Account";
import { Group } from "../Abstract/Group";
import { ArrayColl } from 'svelte-collections';
import { Observable, notifyChangedProperty } from "../util/Observable";

export class Chat extends Observable {
  /** Protocol-specific ID. For Matrix, it's the event_id */
  id: string;
  dbID: number;
  account: Account;
  @notifyChangedProperty
  contact: Contact;
  @notifyChangedProperty
  _name: string;
  /** The messages in this chat room.
   * This is also used for the MailChat view, so this may also contain EMails */
  readonly messages = new ArrayColl<Message>();
  @notifyChangedProperty
  lastMessage: Message = null; // Calculating this would be very slow
  /** Message that our user is currently composing, to this chat room */
  @notifyChangedProperty
  draftMessage: string;
  syncState: string | null = null;

  constructor(account: Account) {
    super();
    this.account = account;
  }

  get name(): string {
    return this.contact instanceof Group
      ? this._name
      : this.contact.name;
  }
  set name(val: string) {
    if (this.contact instanceof Group) {
      this._name = val;
    }
  }
  get picture(): string {
    return this.contact.picture;
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.push(message);
    throw new Error("not implemented for this protocol");
  }

  newMessage(): Message {
    return new ChatMessage(this);
  }
}
