import { ChatRoom } from "../ChatRoom";
import type { XMPPAccount } from "./XMPPAccount";
import { XMPPChatMessage } from "./XMPPChatMessage";
import { UserChatMessage, DeliveryStatus } from "../Message";
import { assert } from "../../util/util";
import type { Message, Forward } from "stanza/protocol";

export class XMPPChat extends ChatRoom {
  declare account: XMPPAccount;

  /** Adds the message to this chat, unless it's already known
   * (e.g. from our DB) or it's not a user message.
   * @param wrapper The MAM/carbon envelope, if from the archive
   * @param archiveID The MAM archive ID, if from the archive */
  addMessage(json: Message, wrapper?: Forward, archiveID?: string): XMPPChatMessage | null {
    if (!json?.body && !json?.html?.body) {
      return null; // typing notification, read receipt etc.
    }
    let id = json.id ?? archiveID;
    if (id && this.messages.some(msg => msg.id == id)) {
      return null;
    }
    let msg = new XMPPChatMessage(this);
    msg.fromStanzaJS(json, wrapper, archiveID);
    this.messages.add(msg);
    return msg;
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage): Promise<void> {
    assert(this.account.isLoggedIn, "Chat account is not logged in");
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.add(message);
    message.id = this.account.client.sendMessage({
      to: this.id,
      type: "chat",
      body: message.text,
      // stanza accepts a string here, wraps it in <body xmlns="http://www.w3.org/1999/xhtml">, and sanitizes it
      html: message.hasHTML ? { body: message.rawHTMLDangerous as any } : undefined,
    });
    message.sent = new Date();
    message.received = new Date();
    message.deliveryStatus = DeliveryStatus.Server;
    this.lastMessage = message;
    await this.saveNewMessages([message]);
  }

  /** Saves new messages to our DB */
  async saveNewMessages(messages: UserChatMessage[]): Promise<void> {
    if (!this.account.storage) {
      return;
    }
    if (!this.dbID) {
      await this.save();
    }
    for (let msg of messages) {
      try {
        await this.account.storage.saveMessage(msg);
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }
}
