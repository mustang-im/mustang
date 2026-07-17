/** A 1:1 Signal conversation with a single contact. Mirrors `XMPP1to1Chat`. */
import { SignalChatRoom } from "./SignalChatRoom";
import { SignalContact } from "./SignalContact";
import type { ServiceId } from "./ServiceId";

export class Signal1to1ChatRoom extends SignalChatRoom {
  declare contact: SignalContact;

  recipients(): ServiceId[] {
    return this.contact?.serviceId ? [this.contact.serviceId] : [];
  }

  async listMembers(): Promise<void> {
    await this.listMembers1to1();
  }
}
