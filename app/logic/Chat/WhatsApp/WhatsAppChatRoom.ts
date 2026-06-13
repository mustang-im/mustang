import { ChatRoom } from "../ChatRoom";
import { ChatPerson } from "../ChatPerson";
import type { PersonUID } from "../../Abstract/PersonUID";
import { Person } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { SQLChatMessage } from "../SQL/SQLChatMessage";
import { WhatsAppMessage } from "./WhatsAppMessage";
import type { WhatsAppAccount } from "./WhatsAppAccount";
import type { WANode } from "./Binary/WANode";
import { JID } from "./Binary/JID";
import { ProtocolMessageType, type WAMessage, type ReactionMessage, type WebMessageInfo, type MessageKey } from "./Proto/schema";
import { appGlobal } from "../../app";
import { gt } from "../../../l10n/l10n";

/** A WhatsApp chat room — either a 1:1 conversation or a group. Both use the
 * same message machinery; group-vs-1:1 differences (member source, sender
 * attribution) branch on whether `contact` is a Group. */
export class WhatsAppChatRoom extends ChatRoom {
  declare account: WhatsAppAccount;

  newMessage(): WhatsAppMessage {
    return new WhatsAppMessage(this);
  }

  async listMembers(): Promise<void> {
    let persons = this.contact instanceof Group
      ? this.contact.participants.contents
      : [this.contact as any as Person];
    this.members.replaceAll(persons.map(person => chatPersonFor(person)));
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
  protected historySender(key: MessageKey): PersonUID | Person | Group {
    if (this.contact instanceof Group && key.participant) {
      return this.contactForSender(JID.parse(key.participant));
    }
    return this.contact as any as Person;
  }

  protected async reactToMessage(reaction: ReactionMessage, sender: JID): Promise<void> {
    let target = this.messages.find(msg => msg.id == reaction.key?.id);
    if (!target) {
      return;
    }
    let person = this.contactForSender(sender);
    if (reaction.text) {
      target.reactions.set(person as PersonUID, reaction.text);
    } else {
      target.reactions.delete(person as PersonUID); // empty emoji removes the reaction
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
  protected contactForSender(sender: JID): PersonUID | Person | Group {
    if (!(this.contact instanceof Group)) {
      return this.contact;
    }
    let person = appGlobal.persons.find(p =>
      p.chatAccounts.some(e => e.protocol == "whatsapp" && JID.parse(e.value).user == sender.user));
    return person ?? new ChatPerson("whatsapp", sender.toString());
  }

  protected updateLastMessage() {
    this.lastMessage = this.messages.contents
      .reduce((last, msg) => !last || msg.sent > last.sent ? msg : last, null);
  }

  /** Sending is not wired yet: it needs the live connection plus per-device
   * Signal session encryption (and sender keys for groups). */
  async sendMessage(): Promise<void> {
    throw new Error("Sending WhatsApp messages is not enabled yet");
  }
}

function chatPersonFor(person: Person): ChatPerson {
  let chatID = person.chatAccounts.find(e => e.protocol == "whatsapp")?.value;
  let chatPerson = new ChatPerson("whatsapp", chatID, person.name);
  chatPerson.person = person;
  chatPerson.picture = person.picture;
  return chatPerson;
}
