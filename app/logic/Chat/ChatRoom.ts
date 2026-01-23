import { ChatMessage, DeliveryStatus, UserChatMessage } from "./Message";
import type { ChatAccount } from "./ChatAccount";
import type { ChatPerson } from "./ChatPerson";
import { Group } from "../Abstract/Group";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { AbstractFunction } from "../util/util";
import { ArrayColl } from 'svelte-collections';

export class ChatRoom extends Observable {
  /** Protocol-specific ID. For Matrix, it's the event_id */
  id: string;
  dbID: number;
  account: ChatAccount;
  /** If `contact` is a `Group`, then this is a chat room with multiple people.
   * If `contact` is a `ChatPerson` or `Person`, this is a 1:1 conversation
   * between our user and one other person/account. */
  @notifyChangedProperty
  contact: ChatContact;
  /** Chat room name/title. Only used for Groups.
   * For 1:1 conversations, this is the name of the other person. */
  @notifyChangedProperty
  _name: string;
  /** For groups, this is a longer description of the room's purpose and scope.
   * It may contain URLs to resources which new members should read first.
   * Contains sanitized HTML. Must be sanitized *before* setting it here. */
  @notifyChangedProperty
  descriptionHTML: string;
  /** The people in this chat room.
   * If this is a 1:1 chat, contains only 1.
   * Not including our own user. */
  readonly members = new ArrayColl<ChatPerson>();
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
    return this.contact instanceof Group && this._name
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

  async listMembers(): Promise<void> {
    throw new AbstractFunction();
  }

  async listMessages(): Promise<void> {
    throw new AbstractFunction();
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

  async save(): Promise<void> {
    await this.account.storage.saveChat(this);
  }
}

export type ChatContact = ChatPerson | Group;
