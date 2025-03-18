import { Chat } from "../Chat";
import type { XMPPAccount } from "./XMPPAccount";
import { Group } from "../../Abstract/Group";
import { DeliveryStatus, UserChatMessage } from "../Message";
import { JXT } from "stanza";
import { ChatPerson } from "../Person";

export class XMPPChatRoom extends Chat {
  account: XMPPAccount;
  constructor(account: XMPPAccount, id: string) {
    super(account);
    this.id = id;
    this.contact = new ChatPerson();
    this.contact.id = id;
    this.contact.name = id;
    this.account.chats.set(this.contact, this);
    console.log("Added room", id);
    // TODO Listen to chat messages
    /*this.account.client.on('muc:other', xmppMsg => {
      console.log("MUC other message", xmppMsg);
    });*/
  }
  async listMembers() {
    // let config = await this.account.client.getRoomConfig(room);
    let membersResult = await this.account.client.getRoomMembers(this.id);
    let members = membersResult.muc.users || [];
    let persons = await Promise.all(members
      .filter(m => m.jid && m.jid != this.account.jid)
      .map(member => this.account.getPerson(member.jid, member.nick)));
    if (persons.length <= 1) { // 1:1 chat
      this.contact = persons[0];
    } else { // group chat
      let group = new Group()
      group.participants.addAll(persons);
      this.contact = group;
    }
    this.members.addAll(persons);
  }
  async listMessages() {
    // TODO Get message history
    this.lastMessage = this.messages.get(this.messages.length - 1);
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
