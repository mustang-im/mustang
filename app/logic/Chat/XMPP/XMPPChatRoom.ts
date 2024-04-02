import { Chat } from "../Chat";
import type { XMPPAccount } from "./XMPPAccount";
import { DeliveryStatus, UserChatMessage } from "../Message";
import { JXT } from "stanza";

export class XMPPChatRoom extends Chat {
  account: XMPPAccount;
  constructor(account: XMPPAccount) {
    super();
    this.account = account;
  }
  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
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
