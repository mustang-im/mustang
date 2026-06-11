import { ChatAccount } from "../ChatAccount";
import { WhatsAppChatRoom } from "./WhatsAppChatRoom";

/**
 * WhatsApp chat account
 */
export class WhatsAppAccount extends ChatAccount {
  readonly protocol: string = "whatsapp";

  /** State of the setup wizard. Set only during setup and import. Not saved. */
  setup: WhatsAppSetup | null = null;

  newRoom(): WhatsAppChatRoom {
    return new WhatsAppChatRoom(this);
  }

  async startup(): Promise<void> {
    await this.listRooms();
  }
}

export class WhatsAppSetup {
  /** The 64-digit hexadecimal backup encryption key */
  decryptKeyAsHex: string | null = null;
  /** msgstore.db.crypt15: the encrypted messages */
  msgStore: File | null = null;
  /** wa.db.crypt15: the encrypted contact names */
  waDB: File | null = null;
}
