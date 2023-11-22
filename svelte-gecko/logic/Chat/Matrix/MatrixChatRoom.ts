import { Chat } from "../Chat";
import type { MatrixAccount } from "./MatrixAccount";
import { DeliveryStatus, UserChatMessage } from "../Message";

export class MatrixChatRoom extends Chat {
  account: MatrixAccount;
  constructor(account: MatrixAccount) {
    super();
    this.account = account;
  }
  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    console.log("Sending " + message.text + " to " + this.name);
    await this.account.client.sendHtmlMessage(this.id, message.text, message.html);
    //this.account.client.encryptAndSendToDevices();
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.add(message);
  }
}
