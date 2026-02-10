import { ChatRoom } from "../../../logic/Chat/ChatRoom";
import type { UserChatMessage } from "../../../logic/Chat/Message";
import type { EMail } from "../../../logic/Mail/EMail";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { randomID } from "../../../logic/util/util";
import type { Collection } from "svelte-collections";

export class MailChatRoom extends ChatRoom {
  declare account: MailAccount;
  constructor(account: MailAccount, person: PersonUID, messages: Collection<EMail>) {
    super(account);
    this.id = randomID();
    this.contact = person;
    this.messages.addAll(messages);
    this.lastMessage = messages.last;
  }
  async sendMessage(message: UserChatMessage): Promise<void> {
    this.account.send(message);
  }
}
