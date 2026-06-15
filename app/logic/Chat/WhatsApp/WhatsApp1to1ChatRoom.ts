import { WhatsAppChatRoom } from "./WhatsAppChatRoom";

/** A one-to-one WhatsApp conversation with a single other person. All message
 * handling is inherited from {@link WhatsAppChatRoom}; only the member list is
 * 1:1-specific (the sole member is the chat partner). */
export class WhatsApp1to1ChatRoom extends WhatsAppChatRoom {
  async listMembers(): Promise<void> {
    await this.listMembers1to1();
  }
}
