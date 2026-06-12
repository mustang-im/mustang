import { ChatAccount } from "../ChatAccount";
import { WhatsAppChatRoom } from "./WhatsAppChatRoom";
import { KeyPair } from "./Crypto/KeyPair";
import { SignalStore } from "./Crypto/Signal/Store";
import { decryptPreKeyMessage, decryptSignalMessage } from "./Crypto/Signal/SessionCipher";
import { groupDecrypt } from "./Crypto/Signal/GroupCipher";
import { base64Encode, base64Decode } from "./Crypto/primitives";
import { WhatsAppConnection, kWhatsAppLiveEnabled, type WhatsAppTransport } from "./WhatsAppConnection";
import { WhatsAppPairing } from "./WhatsAppPairing";
import { deferred, type Deferred, stanzaErrorText } from "./util";
import { getLoginPayload } from "./clientInfo";
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

  /** Signal identity, registration id and prekeys. Set at pairing or restored
   * from config. (Session/sender-key ratchet state is runtime-only for now.) */
  signalStore: SignalStore | null = null;
  /** Noise static key — our handshake identity; the server tied it to us when we
   * paired. Distinct from the Signal identity key. */
  noiseKey: KeyPair | null = null;
  /** The secret shared with the phone during pairing (kept for re-pairing checks). */
  advSecret: Uint8Array | null = null;
  /** Our device address, e.g. `491701234567:32@s.whatsapp.net`. */
  deviceJID: JID | null = null;
  connection: WhatsAppConnection | null = null;
  /** Voice/video calls run through this dependent Meet account. */
  meetAccount: WhatsAppMeetAccount | null = null;
  /** The in-progress QR pairing, while {@link startPairing} runs (for cancel). */
  protected pairing: WhatsAppPairing | null = null;
  /** Resolves/rejects the in-flight login once `<success>`/`<failure>` arrives. */
  protected loginResult: Deferred<void> | null = null;

  newRoom(): WhatsAppChatRoom {
    return new WhatsAppChatRoom(this);
  }

  get isLoggedIn(): boolean {
    return this.isOnline;
  }

  async startup(): Promise<void> {
    await this.listRooms();
    // The live connection is intentionally not started on startup yet.
  }

  async login(interactive: boolean): Promise<void> {
    await super.login(interactive);
    await this.connect();
  }

  /** Drives the "Link a device" QR flow, then logs in with the new device.
   * @param onQR called with each QR payload string to render (it rotates as
   *   refs expire). Resolves once paired and logged in. */
  async startPairing(onQR: (qr: string) => void, transport?: WhatsAppTransport): Promise<void> {
    let pairing = new WhatsAppPairing();
    pairing.onQR = onQR;
    this.pairing = pairing;
    try {
      let jid = await pairing.register(transport);
      this.noiseKey = pairing.creds.noiseKey;
      this.signalStore = pairing.creds.signalStore;
      this.advSecret = pairing.creds.advSecret;
      this.deviceJID = jid;
      this.username = jid.toString();
      this.realname ||= jid.user;
      await pairing.connection.disconnect();
      await this.connect(transport);
    } finally {
      this.pairing = null;
    }
  }

  /** Aborts an in-progress {@link startPairing}. */
  cancelPairing(): void {
    this.pairing?.cancel();
  }

  /** Connects to the WhatsApp servers as the paired companion device and logs
   * in. Gated: does nothing until the live path is enabled (or a test transport
   * is injected) and the account is paired. */
  async connect(transport?: WhatsAppTransport): Promise<void> {
    if (!this.signalStore || !this.noiseKey || !this.deviceJID) {
      return;
    }
    if (!transport && !kWhatsAppLiveEnabled) {
      return;
    }
    this.connection = this.createConnection();
    this.connection.onStanza = node => this.onStanza(node);
    this.setupMeetAccount();
    this.loginResult = deferred<void>();
    await this.connection.connect(() =>
      getLoginPayload(Number(this.deviceJID!.user), this.deviceJID!.device), transport);
    await this.loginResult.promise;
    this.isOnline = true;
  }

  /** The live connection for {@link connect}. A seam so tests can substitute a
   * connection that trusts a test root certificate. */
  protected createConnection(): WhatsAppConnection {
    return new WhatsAppConnection({ noiseKey: this.noiseKey! });
  }

  async disconnect(): Promise<void> {
    this.isOnline = false;
    this.loginResult?.reject(new Error("Disconnected"));
    this.loginResult = null;
    await this.connection?.disconnect();
    this.connection = null;
  }

  /** Routes a received stanza to the right handler. */
  protected onStanza(node: WANode) {
    if (node.tag == "success") {
      this.loginResult?.resolve();
      this.loginResult = null;
    } else if (node.tag == "failure" || node.tag == "stream:error") {
      this.loginResult?.reject(new Error(`WhatsApp login failed${stanzaErrorText(node)}`));
      this.loginResult = null;
    } else if (node.tag == "message") {
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

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    let wa = json.whatsapp;
    if (wa?.noiseKey && wa?.deviceJID && wa?.signalStore) {
      this.noiseKey = KeyPair.fromPrivate(base64Decode(wa.noiseKey));
      this.advSecret = wa.advSecret ? base64Decode(wa.advSecret) : null;
      this.deviceJID = JID.parse(wa.deviceJID);
      this.signalStore = SignalStore.fromJSON(wa.signalStore);
    }
  }

  toConfigJSON(): any {
    let json = super.toConfigJSON();
    if (this.noiseKey && this.signalStore && this.deviceJID && this.advSecret) {
      // The durable pairing credentials, enough to log in again without
      // re-scanning. Session/sender-key ratchet state stays runtime-only (TODO).
      json.whatsapp = {
        noiseKey: base64Encode(this.noiseKey.privateKey),
        advSecret: base64Encode(this.advSecret),
        deviceJID: this.deviceJID.toString(),
        signalStore: this.signalStore.toJSON(),
      };
    }
    return json;
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
