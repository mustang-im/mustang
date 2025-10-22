import { Chat } from "../Chat";
import type { MatrixAccount } from "./MatrixAccount";
import { DeliveryStatus, UserChatMessage } from "../Message";

export class MatrixChatRoom extends Chat {
  declare account: MatrixAccount;
  constructor(account: MatrixAccount) {
    super();
    this.account = account;
  }
  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.add(message);
    //console.log("Sending", message.text, "to", this.name);
    //this.account.client.encryptAndSendToDevices();
    let response = await this.account.client.sendHtmlMessage(this.id, message.text, message.html);
    message.id = response.event_id;
    // By the time send() returns async, the server already sent us the message to the room
    this.messages.remove(message);
  }
}
