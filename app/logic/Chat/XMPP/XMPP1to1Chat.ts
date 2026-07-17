import { XMPPChat } from "./XMPPChat";

/** A one-to-one conversation with a single other person.
 * All message handling is inherited from XMPPChat. */
export class XMPP1to1Chat extends XMPPChat {
  async listMembers(): Promise<void> {
    await this.listMembers1to1();
  }
}
