import { ChatRoom } from "../ChatRoom";
import { WhatsAppMessage } from "./WhatsAppMessage";
import { WhatsAppRoomEvent } from "./WhatsAppRoomEvent";
import { type ChatRoomEvent, RoomEventKind } from "../RoomEvent";
import { WhatsAppContact } from "./WhatsAppContact";
import { DeliveryStatus } from "../Message";
import { Group } from "../../Abstract/Group";
import type { Person } from "../../Abstract/Person";
import { SQLChatMessage } from "../SQL/SQLChatMessage";
import type { WhatsAppAccount } from "./WhatsAppAccount";
import type { WANode } from "./Binary/WANode";
import { JID } from "./Binary/JID";
import { ProtocolMessageType, type WAMessage, type ReactionMessage, type WebMessageInfo, type MessageKey } from "../Signal/Proto/schema";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import type { ArrayColl } from "svelte-collections";

/** A WhatsApp chat room — either a 1:1 conversation or a group. Both use the
 * same message machinery; group-vs-1:1 differences (member source, sender
 * attribution) branch on whether `contact` is a Group. */
export class WhatsAppChatRoom extends ChatRoom {
  declare account: WhatsAppAccount;
  declare readonly members: ArrayColl<WhatsAppContact>;
  declare contact: WhatsAppContact | Group;

  async listMembers(): Promise<void> {
    // 1:1: the sole member is the chat partner.
    // Group from backup: participants
    // Group live: Not wired yet, starts empty
    if (this.contact instanceof WhatsAppContact) {
      this.members.replaceAll([this.contact]);
    } else if (this.contact instanceof Group) {
      this.members.replaceAll(this.contact.participants.contents
        .map(person => contactForPerson(this.account, person))
        .filter(Boolean));
    }
  }

  async listMessages(): Promise<void> {
    if (this.messages.hasItems) {
      return;
    }
    await SQLChatMessage.readAll(this);
    this.updateLastMessage();
  }

  /** Integrates an incoming decrypted message into this room: stores new content,
   * or applies a reaction / edit / deletion to the message it targets. */
  async receiveMessage(stanza: WANode, rawPayload: WAMessage, sender: JID, outgoing = false): Promise<void> {
    let payload = WhatsAppMessage.unwrap(rawPayload);
    if (payload.reactionMessage) {
      await this.reactToMessage(payload.reactionMessage, sender);
    } else if (payload.protocolMessage?.type == ProtocolMessageType.Revoke) {
      await this.deleteMessageByID(payload.protocolMessage.key?.id);
    } else if (payload.protocolMessage?.type == ProtocolMessageType.MessageEdit && payload.protocolMessage.editedMessage) {
      await this.editMessage(payload.protocolMessage.key?.id, payload.protocolMessage.editedMessage);
    } else if (!payload.protocolMessage) {
      await this.addMessage(stanza, payload, sender, outgoing);
    }
  }

  /** Adds a newly received content message to this room (mirrors XMPPChat.addMessage).
   * `outgoing` messages (sent by us from another device) are attributed to the
   * account owner; incoming ones to the sender. */
  protected async addMessage(stanza: WANode, payload: WAMessage, sender: JID, outgoing: boolean): Promise<void> {
    let id = stanza.attrs.id;
    if (!id || this.messages.some(msg => msg.id == id)) {
      return; // missing id or already have it
    }
    let message = this.newMessage();
    let contact = outgoing ? await this.account.getOwnContact() : this.contactForSender(sender);
    if (!message.fromWAMessage(stanza, payload, contact as any, outgoing)) {
      return; // a type we cannot display (call, poll, …)
    }
    this.messages.add(message);
    this.lastMessage = message;
    await this.account.storage.saveMessage(message);
  }

  /** Adds a stored message from history sync (a WebMessageInfo) to this room.
   * Mirrors addMessage(), but the id/time/sender come from the stored key
   * instead of a live stanza. @returns whether a displayable message was added. */
  async addHistoryMessage(info: WebMessageInfo): Promise<boolean> {
    let id = info.key?.id;
    if (!id || !info.message || this.messages.some(msg => msg.id == id)) {
      return false;
    }
    let message = this.newMessage();
    message.id = id;
    message.outgoing = !!info.key.fromMe;
    message.sent = new Date(Number(info.messageTimestamp ?? 0) * 1000);
    message.received = message.sent;
    message.isRead = true;
    message.contact = info.key.fromMe
      ? await this.account.getOwnContact()
      : this.historySender(info.key);
    if (!message.readContent(WhatsAppMessage.unwrap(info.message))) {
      return false; // a type we cannot display (call, poll, system event, …)
    }
    this.messages.add(message);
    if (!this.lastMessage || message.sent > this.lastMessage.sent) {
      this.lastMessage = message;
    }
    await this.account.storage.saveMessage(message);
    return true;
  }

  /** The person an incoming stored message is from: the group member who sent it,
   * else the room contact (the 1:1 partner). Our own messages are attributed via
   * {@link WhatsAppAccount.getOwnContact} instead. */
  protected historySender(key: MessageKey): WhatsAppContact | Group {
    if (this.contact instanceof Group) {
      return key.participant ? this.contactForSender(JID.parse(key.participant)) : this.contact;
    }
    return this.contact;
  }

  protected async reactToMessage(reaction: ReactionMessage, sender: JID): Promise<void> {
    let target = this.messages.find(msg => msg.id == reaction.key?.id);
    if (!target) {
      return;
    }
    let person = this.contactForSender(sender);
    if (reaction.text) {
      target.reactions.set(person, reaction.text);
    } else {
      target.reactions.delete(person); // empty emoji removes the reaction
    }
    await this.account.storage.saveMessage(target);
  }

  protected async editMessage(targetID: string | undefined, edited: WAMessage): Promise<void> {
    let target = this.messages.find(msg => msg.id == targetID) as WhatsAppMessage;
    if (!target) {
      return;
    }
    target.text = "";
    target.attachments.clear();
    target.readContent(WhatsAppMessage.unwrap(edited));
    await this.account.storage.saveMessage(target);
  }

  protected async deleteMessageByID(targetID: string | undefined): Promise<void> {
    let target = this.messages.find(msg => msg.id == targetID);
    if (!target) {
      return;
    }
    target.text = gt`This message was deleted`;
    await this.account.storage.saveMessage(target);
  }

  /** Who a message is from: in 1:1 it's the chat partner; in a group, the member. */
  protected contactForSender(sender: JID): WhatsAppContact {
    if (this.contact instanceof WhatsAppContact) {
      return this.contact;
    }
    return this.account.getContact(sender);
  }

  protected updateLastMessage() {
    this.lastMessage = this.messages.contents
      .filter((msg): msg is WhatsAppMessage => msg instanceof WhatsAppMessage)
      .reduce((last, msg) => !last || msg.sent > last.sent ? msg : last, null);
  }

  /** Sends our user's message to this chat: encrypts it per recipient device and
   * publishes it (see {@link WhatsAppSender}), then shows it as outgoing. Mirrors
   * XMPPChat.sendMessage — recipient/text come from the message object. Groups are
   * not supported yet (they need sender-key distribution). */
  async sendMessage(message: WhatsAppMessage): Promise<void> {
    if (this.contact instanceof Group) {
      throw new Error("Sending to WhatsApp groups is not supported yet");
    }
    let text = message.text;
    assert(text || message.attachments.hasItems, `Message is empty`);
    assert(message.attachments.every(att => att.content), gt`Attachment is empty`);
    message.outgoing = true;
    message.contact = await this.account.getOwnContact() as any;
    message.sent ??= new Date();
    message.received ??= message.sent; // outgoing: "received" = when we sent it (the DB column is non-null)
    message.deliveryStatus = DeliveryStatus.Sending;
    let chat = JID.parse(this.id);
    if (message.attachments.hasItems) {
      // Each file is its own WhatsApp media message; the text rides as the caption
      // of the first one, since WhatsApp has no combined text + media message.
      let first = true;
      for (let attachment of message.attachments) {
        message.id = await this.account.sender.sendMedia(chat, attachment, first ? text : undefined);
        first = false;
      }
    } else {
      message.id = await this.account.sender.sendText(chat, text);
    }
    if (!this.messages.some(msg => msg.id == message.id)) {
      this.messages.add(message);
    }
    this.lastMessage = message;
    message.deliveryStatus = DeliveryStatus.Server;
    await this.account.storage.saveMessage(message);
  }

  newMessage(): WhatsAppMessage {
    return new WhatsAppMessage(this);
  }

  newRoomEvent(kind?: RoomEventKind): ChatRoomEvent {
    if (kind && kind != RoomEventKind.Generic) {
      return super.newRoomEvent(kind);
    }
    return new WhatsAppRoomEvent(this);
  }
}

/** A group participant (an address-book `Person`) as a `WhatsAppContact`, reused
 * from the account cache and linked back to the `Person`.
 * @returns null if the person has no WhatsApp ID */
function contactForPerson(account: WhatsAppAccount, person: Person): WhatsAppContact | null {
  let jid = person.chatAccounts.find(e => e.protocol == "whatsapp")?.value;
  if (!jid) {
    return null;
  }
  let contact = account.getPersonUID(jid, person.name);
  contact.person = person;
  contact.picture ??= person.picture;
  return contact;
}
