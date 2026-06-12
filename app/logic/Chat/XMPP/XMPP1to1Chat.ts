import { XMPPChat } from "./XMPPChat";
import { ChatPerson } from "../ChatPerson";
import { Person } from "../../Abstract/Person";

export class XMPP1to1Chat extends XMPPChat {
  async listMembers(): Promise<void> {
    if (!(this.contact instanceof Person)) {
      return;
    }
    let chatPerson = new ChatPerson("xmpp", this.id, this.contact.name);
    chatPerson.person = this.contact;
    chatPerson.picture = this.contact.picture;
    this.members.replaceAll([chatPerson]);
  }
}
