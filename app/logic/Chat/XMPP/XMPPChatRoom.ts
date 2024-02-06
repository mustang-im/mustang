import { Chat } from "../Chat";
import type { XMPPAccount } from "./XMPPAccount";
import { DeliveryStatus, UserChatMessage } from "../Message";
import { xml } from '@xmpp/client';

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
    let html;
    if (message.html) {
      html = xml("html", { xmlns: 'http://jabber.org/protocol/xhtml-im' },
        xml("body", { xmlns: 'http://www.w3.org/1999/xhtml' },
          message.html),
      );
    }
    message.id = this.account.client.send(xml("message",
      { type: "chat", to: message.contact.id },
      xml("body", {}, message.text),
      html,
    ));
  }
}
