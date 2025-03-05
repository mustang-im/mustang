import { ChatMessage, DeliveryStatus, UserChatMessage } from "./Message";
import type { ChatAccount } from "./ChatAccount";
import type { Contact } from "../Abstract/Contact";
import { Group } from "../Abstract/Group";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl } from 'svelte-collections';

export class Chat extends Observable {
  /** Protocol-specific ID. For Matrix, it's the event_id */
  id: string;
  dbID: number;
  account: ChatAccount;
  @notifyChangedProperty
  contact: Contact;
  @notifyChangedProperty
  _name: string;
  /** The messages in this chat room.
   * This is also used for the MailChat view, so this may also contain EMails */
  readonly messages = new ArrayColl<ChatMessage>();
  @notifyChangedProperty
  lastMessage: ChatMessage = null; // Calculating this would be very slow
  /** Message that our user is currently composing, to this chat room */
  @notifyChangedProperty
  draftMessage: string;
  syncState: string | null = null;

  constructor(account: ChatAccount) {
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

  newMessage(): ChatMessage {
    return new ChatMessage(this);
  }
}
