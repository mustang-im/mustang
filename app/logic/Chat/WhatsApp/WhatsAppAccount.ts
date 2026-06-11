import { ChatAccount } from "../ChatAccount";
import { WhatsAppChatRoom } from "./WhatsAppChatRoom";
import { SignalStore } from "./Crypto/Signal/Store";
import { decryptPreKeyMessage, decryptSignalMessage } from "./Crypto/Signal/SessionCipher";
import { groupDecrypt } from "./Crypto/Signal/GroupCipher";
import { WhatsAppConnection, kWhatsAppLiveEnabled } from "./WhatsAppConnection";
import { buildLoginPayload } from "./clientInfo";
import { decodeWAMessage } from "./Proto/schema";
import { WANode } from "./Binary/WANode";
import { JID } from "./Binary/JID";
import { WhatsAppMeetAccount } from "../../Meet/WhatsApp/WhatsAppMeetAccount";
import { appGlobal } from "../../app";

/**
 * A WhatsApp account, paired as a companion device of the user's own phone.
 *
 * Orchestrates the whole protocol: identity and Signal keys, the server
 * connection (Noise handshake + binary XMPP, see Connection/), and routing of
 * incoming stanzas to the chat rooms. Calls run through a dependent
 * WhatsAppMeetAccount.
 *
 * Two ways in: importing an encrypted backup (Import/, fully working) and the
 * live multi-device protocol (unit-tested under Crypto/, Binary/, Proto/, but
 * gated off — kWhatsAppLiveEnabled — until validated against the real server).
 */
export class WhatsAppAccount extends ChatAccount {
  readonly protocol: string = "whatsapp";

  /** State of the setup wizard. Set only during setup and import. Not saved. */
  setup: WhatsAppSetup | null = null;

  /** Signal keys for the live protocol. Created at pairing; persistence TODO. */
  signalStore: SignalStore | null = null;
  connection: WhatsAppConnection | null = null;
  /** Voice/video calls run through this dependent Meet account. */
  meetAccount: WhatsAppMeetAccount | null = null;

  newRoom(): WhatsAppChatRoom {
    return new WhatsAppChatRoom(this);
  }

  async startup(): Promise<void> {
    await this.listRooms();
    // The live connection is intentionally not started on startup yet.
  }

  /** Connects to the WhatsApp servers as the paired companion device.
   * Gated: does nothing until the live path is enabled and the account is paired. */
  async connect(): Promise<void> {
    if (!kWhatsAppLiveEnabled || !this.signalStore) {
      return;
    }
    this.connection = new WhatsAppConnection({ noiseKey: this.signalStore.identityKeyPair });
    this.connection.onStanza = node => this.onStanza(node);
    this.setupMeetAccount();
    // The login payload advertises us as the WhatsApp Android client. The phone
    // number / device id come from the paired JID (0 until pairing is wired).
    await this.connection.connect(() => buildLoginPayload(0, 0));
  }

  /** Routes a received stanza to the right handler. */
  protected onStanza(node: WANode) {
    if (node.tag == "message") {
      this.receiveMessageStanza(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "call") {
      this.meetAccount?.handleCallStanza(node);
    }
    // Other stanzas (receipt, iq, notification, ib) belong to the live dialogue,
    // which is not wired yet.
  }

  protected async receiveMessageStanza(node: WANode): Promise<void> {
    let from = node.jidAttr("from");
    let id = node.attrs.id;
    if (!from || !id) {
      return;
    }
    let sender = from.isGroup ? node.jidAttr("participant") ?? from : from;
    let payloadBytes = await this.decryptStanza(node, from, sender);
    if (!payloadBytes) {
      return;
    }
    let room = this.roomForChat(from);
    if (!room) {
      return; // creating rooms from a live roster is part of the unwired path
    }
    await room.receiveMessage(node, decodeWAMessage(payloadBytes), sender);
    // A delivery <receipt> would be sent here in the live dialogue.
  }

  /** Decrypts the first usable `<enc>` of a message stanza via the matching
   * Signal primitive (1:1 prekey/session, or the group sender key). */
  protected async decryptStanza(node: WANode, chat: JID, sender: JID): Promise<Uint8Array | null> {
    let address = `${sender.user}.${sender.device}`;
    for (let enc of node.children("enc")) {
      let bytes = enc.contentBytes;
      if (!bytes) {
        continue;
      }
      let type = enc.attrs.type;
      if (type == "pkmsg") {
        return await decryptPreKeyMessage(this.signalStore!, address, bytes);
      }
      if (type == "msg") {
        return await decryptSignalMessage(this.signalStore!, address, bytes);
      }
      if (type == "skmsg") {
        let senderKey = this.signalStore!.senderKeys.get(`${chat.toString()}|${address}`);
        if (senderKey) {
          return await groupDecrypt(senderKey, bytes);
        }
      }
    }
    return null;
  }

  protected roomForChat(jid: JID): WhatsAppChatRoom | undefined {
    let id = jid.toNonDevice().toString();
    return this.rooms.contents.find(room => room.id == id) as WhatsAppChatRoom | undefined;
  }

  /** Creates (or reuses) the dependent Meet account that handles WhatsApp calls. */
  protected setupMeetAccount() {
    this.meetAccount ??= appGlobal.meetAccounts.find(
      acc => acc instanceof WhatsAppMeetAccount && acc.mainAccount == this) as WhatsAppMeetAccount;
    if (this.meetAccount) {
      return;
    }
    this.meetAccount = new WhatsAppMeetAccount();
    this.meetAccount.mainAccount = this; // chatAccount derives from this
    this.meetAccount.name = this.name;
    appGlobal.meetAccounts.add(this.meetAccount);
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
