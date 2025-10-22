import { Chat } from "../Chat";
import { GraphChatMessage } from "./GraphChatMessage";
import { GraphChatPerson } from "./GraphChatPerson";
import type { GraphChatAccount } from "./GraphChatAccount";
import type { TGraphChat, TGraphChatMember, TGraphChatMessage } from "./GraphChatTypes";
import { DeliveryStatus, UserChatMessage } from "../Message";
import { assert } from "../../util/util";
import { ContactEntry } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class GraphChatRoom extends Chat {
  declare account: GraphChatAccount;
  info: TGraphChat;
  lastReadTime: Date;
  constructor(account: GraphChatAccount) {
    super(account);
  }

  get path(): string {
    return `chats/${this.id}`;
  }

  fromGraph(info: TGraphChat) {
    this.info = info;
    this.id = sanitize.nonemptystring(info.id);
    this._name = sanitize.label(info.topic, null);
    this.lastReadTime = sanitize.date(info.viewpoint?.lastMessageReadDateTime, null);
    this.updatedLastRead();
  }

  async listMembers(): Promise<void> {
    assert(this.info, "call fromGraph() first");
    let membersJSON = await this.account.account.graphGetAll<TGraphChatMember>(this.path + "/members");
    this.members.clear();
    for (let memberJSON of membersJSON) {
      let person = new GraphChatPerson();
      person.id = sanitize.nonemptystring(memberJSON.id);
      person.name = sanitize.label(memberJSON.displayName, null);
      if (memberJSON.email) {
        person.emailAddresses.add(new ContactEntry(sanitize.emailAddress(memberJSON.email), "main"));
      }
      this.members.add(person);
    }
    if (this.info.chatType == "oneOnOne") {
      this.contact = this.members.first;
    } else {
      let group = new Group();
      group.participants.addAll(this.members);
      group.name = sanitize.label(this.info.topic, null) ?? group.participants.contents.map(p => p.name?.split(" ")[0] ?? "*").join(", ").substring(0, 30);
      this.contact = group;
    }
  }

  async listMessages(): Promise<void> {
    assert(this.info, "call fromGraph() first");
    let messagesJSON = await this.account.account.graphGetAll<TGraphChatMessage>(this.path + "/messages");
    this.messages.clear();
    for (let messageJSON of messagesJSON) {
      if (messageJSON.messageType != "message") {
        continue;
      }
      let msg = this.newMessage();
      msg.fromGraph(messageJSON);
      msg.isRead = this.lastReadTime && msg.received && this.lastReadTime > msg.received;
      this.messages.add(msg);
    }
  }

  protected updatedLastRead() {
    for (let msg of this.messages) {
      if (!msg.isRead) {
        msg.isRead = this.lastReadTime && msg.received && this.lastReadTime > msg.received;
      }
    }
  }

  /** Our user wants to send this message out.
   * Data like recipient etc. is in the message object. */
  async sendMessage(message: UserChatMessage) {
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.add(message);
  }

  newMessage(): GraphChatMessage {
    return new GraphChatMessage(this);
  }
}
