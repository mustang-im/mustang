import { ChatRoom } from "../ChatRoom";
import { getJID, type XMPPAccount } from "./XMPPAccount";
import { XMPPChatMessage } from "./XMPPChatMessage";
import { UserChatMessage, DeliveryStatus } from "../Message";
import { ChatPerson } from "../ChatPerson";
import { logError } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import type { Message, Forward } from "stanza/protocol";

export class XMPPChat extends ChatRoom {
  declare account: XMPPAccount;
  lastMessage: XMPPChatMessage;
  constructor(account: XMPPAccount, jid: string) {
    super(account);
    jid = getJID(jid);
    this.id = jid;
    this.contact = new ChatPerson("xmpp", jid, jid);
    this.account.rooms.set(this.contact, this);
  }

  addMessage(json: Message, wrapper: Forward = null, isLast: boolean = true): XMPPChatMessage | null {
    let jid = getJID(json.id);
    if (!jid || this.messages.find(msg => msg.id == jid)) {
      return null;
    }
    let msg = new XMPPChatMessage(this);
    try {
      msg.fromStanzaJS(json, wrapper);
    } catch (ex) {
      logError(ex);
      return null;
    }
    this.messages.add(msg);
    if (isLast) {
      this.lastMessage = msg;
    }
    return msg;
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    const { JXT } = await import("stanza");
    assert(message.contact instanceof ChatPerson && message.contact.chatID && message.contact.protocol == "xmpp", "Need contact with Jabber User ID");
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.add(message);
    //console.log("Sending", message.text, "to", this.name);
    let xhtmlIM;
    if (message.html) {
      xhtmlIM = JXT.parse(
        `<html xmlns='http://jabber.org/protocol/xhtml-im'>
            <body xmlns='http://www.w3.org/1999/xhtml'>${message.html}</body>
        </html>`);
    }
    message.id = this.account.client.sendMessage({
      to: message.contact.id,
      html: xhtmlIM,
      body: message.text,
    });
    // this.messages.remove(message);
  }
}
