import { XMPPChat } from "./XMPPChat";
import { ChatPersonUID } from "../ChatPersonUID";

/** A one-to-one conversation with a single other person.
 * History sync and all message handling are inherited from XMPPChat; the only
 * 1:1-specific part is that the sole member is the chat partner. */
export class XMPP1to1Chat extends XMPPChat {
  async listMembers(): Promise<void> {
    if (this.contact instanceof ChatPersonUID) {
      this.members.replaceAll([this.contact]);
    }
  }
}
