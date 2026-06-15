import { ChatAccount } from "../ChatAccount";
import { WhatsAppChatRoom } from "./WhatsAppChatRoom";
import { WhatsAppMessage } from "./WhatsAppMessage";
import { WhatsAppSender } from "./WhatsAppSend";
import { WhatsAppHistorySync } from "./WhatsAppHistorySync";
import { KeyPair } from "../Signal/Crypto/KeyPair";
import { SignalStore } from "../Signal/Crypto/Store";
import { decryptPreKeyMessage, decryptSignalMessage } from "../Signal/Crypto/SessionCipher";
import { groupDecrypt, processDistributionMessage } from "../Signal/Crypto/GroupCipher";
import { base64Encode, base64Decode } from "../Signal/Crypto/primitives";
import { WhatsAppConnection, isWhatsAppLiveAvailable, type WhatsAppTransport } from "./WhatsAppConnection";
import { WhatsAppPairing } from "./WhatsAppPairing";
import { deferred, type Deferred, stanzaErrorText, bigEndian, waLog, nodePreview, waDebugState } from "./util";
import { kDjbType } from "../Signal/Crypto/curve";
import { getLoginPayload } from "./clientInfo";
import { decodeWAMessage, type WAMessage } from "../Signal/Proto/schema";
import { WANode } from "./Binary/WANode";
import { JID, kServerUser } from "./Binary/JID";
import { WhatsAppContact } from "./WhatsAppContact";
import { WhatsAppMeetAccount } from "../../Meet/WhatsApp/WhatsAppMeetAccount";
import { ChatPersonUID } from "../ChatPersonUID";
import { Group } from "../../Abstract/Group";
import { appGlobal } from "../../app";
import { gt } from "../../../l10n/l10n";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl, MapColl } from "svelte-collections";

/**
 * A WhatsApp account, paired as a companion device of the user's own phone.
 *
 * Orchestrates the whole protocol: identity and Signal keys, the server
 * connection (Noise handshake + binary XMPP, see Connection/), and routing of
 * incoming stanzas to the chat rooms. Calls run through a dependent
 * WhatsAppMeetAccount.
 *
 * Two ways in: importing an encrypted backup (Import/, fully working) and the
 * live multi-device protocol (unit-tested under Crypto/, Binary/, Proto/). The
 * live path runs only when the desktop backend's TCP socket factory is
 * available (see isWhatsAppLiveAvailable()); web builds and unit tests have no
 * such socket, so the live connection stays off there.
 */
export class WhatsAppAccount extends ChatAccount {
  readonly protocol: string = "whatsapp";
  declare readonly rooms: MapColl<WhatsAppContact | Group, WhatsAppChatRoom>;
  declare readonly roster: ArrayColl<WhatsAppContact>;
  declare protected readonly allPersonsCached: MapColl<string, WeakRef<WhatsAppContact>>;
  declare getPersonUID: (userID: string, name?: string) => WhatsAppContact;

  /** Set `WhatsAppAccount.enableDebug = true` to trace the stanzas we send and
   * receive to the console (off by default; errors are always logged). */
  static get enableDebug(): boolean {
    return waDebugState.enabled;
  }
  static set enableDebug(on: boolean) {
    waDebugState.enabled = on;
  }

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
  /** Our account-signed `ADVSignedDeviceIdentity` from pairing — attached as
   * `<device-identity>` to outgoing `pkmsg` stanzas so a recipient can verify our
   * new session is from a device the user's account authorized. */
  deviceIdentityBytes: Uint8Array | null = null;
  /** Our device address, e.g. `491701234567:32@s.whatsapp.net`. */
  deviceJID: JID | null = null;
  /** Our own "LID" identity (e.g. `29850727395377@lid`), from the `<success>`
   * stanza. Modern accounts address us and our contacts by LID, so messages we
   * sent from the phone arrive `from` this — used to recognise them as outgoing. */
  ownLID: JID | null = null;
  /** Cached user ID for the account owner {@link getOwnContact} */
  protected ownContact: WhatsAppContact | null = null;
  connection: WhatsAppConnection | null = null;
  /** Voice/video calls run through this dependent Meet account. */
  meetAccount: WhatsAppMeetAccount | null = null;
  /** Fetches the chat list and old messages the phone sends after linking. */
  readonly historySync = new WhatsAppHistorySync(this);
  /** Builds, encrypts and sends our outgoing messages (per-device Signal). */
  readonly sender = new WhatsAppSender(this);
  /** Recently sent payloads, keyed by message id, so a `<receipt type="retry">`
   * for one can be re-encrypted and re-sent. Bounded; old entries are evicted. */
  protected recentSends = new Map<string, WAMessage>();
  /** The in-progress QR pairing, while {@link startPairing} runs (for cancel). */
  protected pairing: WhatsAppPairing | null = null;
  /** Resolves/rejects the in-flight login once `<success>`/`<failure>` arrives. */
  protected loginResult: Deferred<void> | null = null;
  /** Periodic ping that keeps the connection alive (the server drops idle ones). */
  protected keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  newRoom(): WhatsAppChatRoom {
    return new WhatsAppChatRoom(this);
  }

  get isLoggedIn(): boolean {
    return this.isOnline;
  }

  async startup(): Promise<void> {
    await this.listRooms();
  }

  async login(interactive: boolean): Promise<void> {
    await super.login(interactive);
    await this.connect();
  }

  /** Drives the "Link a device" QR flow, then logs in with the new device.
   * @param onQR called with each QR payload string to render (it rotates as
   *   refs expire).
   * @param onPairing called once the QR was scanned and pairing is finishing.
   *   Resolves once paired and logged in. */
  async startPairing(onQR: (qr: string) => void, onPairing?: () => void, transport?: WhatsAppTransport): Promise<void> {
    let pairing = new WhatsAppPairing();
    pairing.onQR = onQR;
    pairing.onPairing = onPairing ?? (() => undefined);
    this.pairing = pairing;
    try {
      let jid = await pairing.register(transport);
      this.noiseKey = pairing.creds.noiseKey;
      this.signalStore = pairing.creds.signalStore;
      this.advSecret = pairing.creds.advSecret;
      this.deviceIdentityBytes = pairing.creds.deviceIdentity ?? null;
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
   * in. Gated: does nothing until the live path is available (or a test
   * transport is injected) and the account is paired. */
  async connect(transport?: WhatsAppTransport): Promise<void> {
    if (!this.signalStore || !this.noiseKey || !this.deviceJID) {
      return; // not paired yet
    }
    if (!transport && !isWhatsAppLiveAvailable()) {
      return; // no live backend (e.g. web build or unit test)
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
    this.stopKeepAlive();
    this.loginResult?.reject(new Error("Disconnected"));
    this.loginResult = null;
    await this.connection?.disconnect();
    this.connection = null;
  }

  /** Routes a received stanza to the right handler. */
  protected onStanza(node: WANode) {
    if (node.tag == "success") {
      if (node.attrs.lid) {
        this.ownLID = JID.parse(node.attrs.lid);
      }
      this.loginResult?.resolve();
      this.loginResult = null;
      this.afterLogin().catch(ex => this.errorCallback(ex));
    } else if (node.tag == "failure" || node.tag == "stream:error") {
      waLog("login/stream ended:", node.tag + stanzaErrorText(node));
      this.loginResult?.reject(new Error(`WhatsApp login failed${stanzaErrorText(node)}`));
      this.loginResult = null;
    } else if (node.tag == "message") {
      this.receiveMessageStanza(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "notification") {
      this.onNotification(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "receipt") {
      this.onReceipt(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "iq") {
      this.onServerIQ(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "call") {
      this.meetAccount?.handleCallStanza(node);
    } else if (node.tag == "ib") {
      this.onInitialBootstrap(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "ack") {
      // Server confirmed receipt of something we sent (e.g. an outgoing message).
    } else {
      waLog("unhandled stanza:", node.tag);
    }
  }

  /** After `<success>`: publish our prekeys so the phone (and contacts) can
   * start Signal sessions to encrypt to us — without this the phone can't send
   * us anything, so no history and no messages arrive — and announce presence
   * so the phone delivers its history sync and live messages. */
  protected async afterLogin(): Promise<void> {
    this.startKeepAlive();
    await this.uploadPreKeys();
    await this.sendActive();
  }

  /** Pings the server periodically so it doesn't drop the connection as idle. */
  protected startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      this.connection?.sendIQ(new WANode("iq", { to: kServerUser, type: "get", xmlns: "w:p" }, [new WANode("ping")]))
        .catch(() => undefined); // a dead connection surfaces via the transport close handler
    }, kKeepAliveMs);
    (this.keepAliveTimer as any)?.unref?.(); // don't keep the (Node/test) event loop alive
  }

  protected stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  protected saveTimer: ReturnType<typeof setTimeout> | null = null;

  /** Persists the account config (which embeds the Signal store) a short while
   * after the ratchet state last changed, coalescing a burst of messages into
   * one write. Without this the established sessions/consumed prekeys are lost on
   * restart and the phone has to re-establish every session (point 4 / Bad MAC). */
  scheduleSave(): void {
    if (this.saveTimer) {
      return;
    }
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.save().catch(ex => console.error("WhatsApp: failed to persist Signal session state:", ex));
    }, kSessionSaveMs);
    (this.saveTimer as any)?.unref?.(); // don't keep the (Node/test) event loop alive
  }

  /** We log in `passive`, so the server doesn't deliver anything until we declare
   * ourselves active. This is the step that actually starts the inbound message
   * stream (offline backlog + the phone's history sync). It must come AFTER the
   * prekey upload, so the phone can encrypt to us once it learns we're online. */
  protected async sendActive(): Promise<void> {
    if (!this.connection) {
      return;
    }
    await this.connection.sendIQ(new WANode("iq",
      { to: kServerUser, xmlns: "passive", type: "set" }, [new WANode("active")]));
  }

  /** Publishes our identity + signed prekey + one-time prekeys to the server,
   * as the WhatsApp `encrypt` IQ (raw key bytes, big-endian ids). First tops the
   * store back up to the target count (peers consume one-time prekeys as they
   * start sessions with us; the server's `<notification type=encrypt>` warns when
   * it is running low) and persists the freshly minted keys. */
  protected async uploadPreKeys(): Promise<void> {
    let store = this.signalStore;
    if (!store || !this.connection) {
      return;
    }
    if (store.replenishPreKeys().length) {
      this.scheduleSave(); // persist the new keys so a restart doesn't re-issue their ids
    }
    let signedPreKey = store.signedPreKeys.get(1)!;
    let preKeys = [...store.preKeys.values()].map(preKey => new WANode("key", {}, [
      new WANode("id", {}, bigEndian(preKey.keyID, 3)),
      new WANode("value", {}, preKey.keyPair.publicKey),
    ]));
    let response = await this.connection.sendIQ(new WANode("iq", { to: kServerUser, type: "set", xmlns: "encrypt" }, [
      new WANode("registration", {}, bigEndian(store.registrationID, 4)),
      new WANode("type", {}, new Uint8Array([kDjbType])),
      new WANode("identity", {}, store.identityKeyPair.publicKey),
      new WANode("list", {}, preKeys),
      new WANode("skey", {}, [
        new WANode("id", {}, bigEndian(signedPreKey.keyID, 3)),
        new WANode("value", {}, signedPreKey.keyPair.publicKey),
        new WANode("signature", {}, signedPreKey.signature),
      ]),
    ]));
    if (response.attrs.type == "error") {
      console.error("WhatsApp: prekey upload rejected:", nodePreview(response));
    }
  }

  /** Server-side events (e.g. the phone added a device, or asks us to top up our
   * prekeys). We must acknowledge them so the server keeps the session going. */
  protected async onNotification(node: WANode): Promise<void> {
    if (node.attrs.type == "encrypt") {
      await this.uploadPreKeys(); // the server is running low on our prekeys
    } else if (node.attrs.type == "picture") {
      // A contact changed their avatar — refetch just that one.
      await this.refetchPicture(node.jidAttr("from"))
        .catch(ex => console.error("WhatsApp: refetch picture failed:", ex));
    }
    await this.sendAck(node);
  }

  /** A server-initiated IQ (responses to ours are routed away by the connection).
   * Reply with a result so the server doesn't stall waiting on us. */
  protected async onServerIQ(node: WANode): Promise<void> {
    if (node.attrs.type == "get" || node.attrs.type == "set") {
      await this.connection?.sendNode(new WANode("iq",
        { to: node.attrs.from ?? kServerUser, type: "result", id: node.attrs.id }));
    }
  }

  /** A `<receipt>` about a message WE sent: usually a delivery/read marker we
   * just acknowledge, but `type="retry"` means a recipient device couldn't
   * decrypt it — re-encrypt and re-send to that device. We always ack so the
   * server stops repeating it. */
  protected async onReceipt(node: WANode): Promise<void> {
    if (node.attrs.type == "retry") {
      await this.sender.handleRetryReceipt(node, this.recentSends.get(node.attrs.id ?? ""))
        .catch(ex => console.error("WhatsApp: handling a retry receipt failed:", ex));
    }
    await this.sendAck(node);
  }

  /** Remembers a payload we just sent so a later retry receipt for it can
   * re-encrypt and re-send. Bounded — the oldest entry is dropped past the cap. */
  rememberSent(messageID: string, payload: WAMessage): void {
    this.recentSends.set(messageID, payload);
    if (this.recentSends.size > kRecentSendsMax) {
      this.recentSends.delete(this.recentSends.keys().next().value!);
    }
  }

  /** Sends a message to our OWN account as a `category="peer"` device-sync
   * message (encrypted to our phone). The on-demand history sync uses this to ask
   * the phone for older messages. @returns the message id. */
  async sendPeerMessage(payload: WAMessage): Promise<string> {
    return await this.sender.sendPeerMessage(payload);
  }

  /** Acknowledges a notification/receipt stanza (`<ack class=… id=… to=…>`). */
  protected async sendAck(node: WANode): Promise<void> {
    if (!this.connection || !node.attrs.id || !node.attrs.from) {
      return;
    }
    let attrs: Record<string, string> = { id: node.attrs.id, to: node.attrs.from, class: node.tag };
    if (node.attrs.participant) {
      attrs.participant = node.attrs.participant;
    }
    if (node.attrs.recipient) {
      attrs.recipient = node.attrs.recipient;
    }
    if (node.attrs.type) {
      attrs.type = node.attrs.type;
    }
    await this.connection.sendNode(new WANode("ack", attrs));
  }

  /** The server's post-login bootstrap (`<ib>`): the count of offline messages
   * queued for us, and any "dirty" state (account_sync, groups, …) we must clean
   * for the server to consider us synced and keep delivering. */
  protected async onInitialBootstrap(node: WANode): Promise<void> {
    for (let dirty of node.children("dirty")) {
      await this.cleanDirty(dirty.attrs.type, dirty.attrs.timestamp);
    }
  }

  protected async cleanDirty(type: string, timestamp?: string): Promise<void> {
    if (!type || !this.connection) {
      return;
    }
    let clean = new WANode("clean", timestamp ? { type, timestamp } : { type });
    await this.connection.sendIQ(new WANode("iq",
      { to: kServerUser, type: "set", xmlns: "urn:xmpp:whatsapp:dirty" }, [clean]));
  }

  /** A group sender ships a SenderKeyDistributionMessage inside the messages it
   * sends us over our 1:1 session; storing it lets us decrypt that sender's
   * subsequent group (skmsg) messages. Without this, group messages never
   * decrypt. */
  protected processSenderKeyDistribution(payload: WAMessage, sender: JID): void {
    let skdm = payload.senderKeyDistributionMessage;
    if (!skdm?.groupID || !skdm.axolotlSenderKeyDistributionMessage || !this.signalStore) {
      return;
    }
    let address = `${sender.user}.${sender.device}`;
    this.signalStore.senderKeys.set(`${skdm.groupID}|${address}`,
      processDistributionMessage(skdm.axolotlSenderKeyDistributionMessage));
  }

  /** Whether a JID is one of our own identities (our phone number or our LID) — a
   * message `from` it was sent by us, from the phone or another linked device. */
  isOwnJID(jid: JID): boolean {
    return jid.user == this.deviceJID?.user || jid.user == this.ownLID?.user;
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
      if (node.child("enc")) {
        // We had ciphertext but couldn't decrypt it (desynced/half-open session).
        // Ask the phone to re-send rather than silently lose the message.
        await this.sendRetryReceipt(node);
      }
      return;
    }
    this.scheduleSave(); // decrypting advanced the ratchet (and maybe consumed a prekey) — persist it
    let rawPayload = decodeWAMessage(payloadBytes);
    let payload = WhatsAppMessage.unwrap(rawPayload);
    this.processSenderKeyDistribution(payload, sender);
    let historyNotification = payload.protocolMessage?.historySyncNotification;
    if (historyNotification) {
      await this.historySync.handleNotification(historyNotification);
      await this.sendDeliveryReceipt(node);
      return;
    }
    // `category="peer"` messages are device-to-device sync / protocol traffic
    // (app-state, key shares, the history-sync notifications above) that the
    // phone sends our own account — NOT a conversation. Don't make a chat room
    // for them (that produced a bogus room named after our own number).
    if (node.attrs.category == "peer") {
      await this.sendDeliveryReceipt(node);
      return;
    }
    // A message we sent from another device (e.g. the phone) is fanned out to us:
    // it arrives `from` one of our own identities (number or LID) with the chat in
    // `recipient`, or wrapped in a deviceSentMessage carrying `destinationJID`. It
    // belongs in the *recipient's* room and is outgoing — not from the partner.
    let deviceSent = rawPayload.deviceSentMessage;
    let outgoing = !!deviceSent || this.isOwnJID(from);
    let chat = from;
    if (outgoing) {
      let dest = deviceSent?.destinationJID ?? node.attrs.recipient;
      chat = dest ? JID.parse(dest) : from;
    }
    // In a group, `notify` is the sender's name, not the group subject.
    let room = await this.getOrCreateRoom(chat, chat.isGroup ? undefined : node.attrs.notify);
    await room.receiveMessage(node, rawPayload, sender, outgoing);
    waLog(outgoing ? ">> sent (from another device) into" : "<< message into", "room", room.id,
      "— now", room.messages.length, "messages");
    await this.sendDeliveryReceipt(node);
  }

  /** Acknowledges a delivered message, so the server marks it delivered and
   * stops resending it. */
  protected async sendDeliveryReceipt(node: WANode): Promise<void> {
    let from = node.attrs.from;
    let id = node.attrs.id;
    if (!from || !id || !this.connection) {
      return;
    }
    let attrs: Record<string, string> = { to: from, id };
    let participant = node.attrs.participant;
    if (participant) {
      attrs.participant = participant;
    }
    await this.connection.sendNode(new WANode("receipt", attrs));
  }

  /** Per-message retry counter, so we escalate (and eventually give up) instead
   * of asking the phone to re-send the same undecryptable message forever. */
  protected retryCounts = new Map<string, number>();

  /** Asks the phone to re-send a message we couldn't decrypt (`<receipt
   * type="retry">`), the standard WhatsApp recovery for a desynced Signal
   * session. (The `<keys>` escalation that ships a fresh prekey bundle on
   * repeated failures is not built yet.) */
  protected async sendRetryReceipt(node: WANode): Promise<void> {
    let from = node.attrs.from;
    let id = node.attrs.id;
    if (!from || !id || !this.connection || !this.signalStore) {
      return;
    }
    let count = (this.retryCounts.get(id) ?? 0) + 1;
    if (count > 5) {
      console.error(`WhatsApp: giving up decrypting message ${id} from ${from} after ${count - 1} retries`);
      return;
    }
    this.retryCounts.set(id, count);
    let attrs: Record<string, string> = { id, type: "retry", to: from };
    if (node.attrs.participant) {
      attrs.participant = node.attrs.participant;
    }
    let retry = new WANode("retry", { count: String(count), id, t: node.attrs.t ?? "0", v: "1" });
    let registration = new WANode("registration", {}, bigEndian(this.signalStore.registrationID, 4));
    await this.connection.sendNode(new WANode("receipt", attrs, [retry, registration]));
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
      try {
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
      } catch (ex) {
        waLog("decrypt", type, "failed:", (ex as any)?.message ?? ex);
      }
    }
    return null;
  }

  protected roomForChat(jid: JID): WhatsAppChatRoom | undefined {
    let id = jid.toNonDevice().toString();
    return this.rooms.contents.find(room => room.id == id) as WhatsAppChatRoom | undefined;
  }

  /** Returns the room for this chat, creating it (and its contact) on first
   * sight of a message from it. This is how the chat list fills in live, until
   * a full roster / history sync is wired. */
  async getOrCreateRoom(chat: JID, nameHint?: string): Promise<WhatsAppChatRoom> {
    let room = this.roomForChat(chat);
    if (room) {
      return room;
    }
    let contact = chat.isGroup
      ? await this.getOrCreateGroup(chat, nameHint)
      : this.getContact(chat, nameHint);
    room = this.roomForChat(chat); // re-check: a concurrent message may have created it
    if (room) {
      return room;
    }
    room = this.newRoom();
    room.id = chat.toNonDevice().toString();
    room.contact = contact;
    if (chat.isGroup) {
      room.name = contact.name;
    } else if (contact instanceof ChatPersonUID && !this.roster.includes(contact)) {
      this.roster.add(contact);
    }
    this.rooms.set(contact, room);
    await room.save();
    return room;
  }

  /** Finds the contact for a WhatsApp JID, or creates one in the personal
   * address book. Matches the importer's keys (WhatsApp ID, then phone number)
   * so live and imported chats share the same contacts.
   * @param pushName the sender's display name from the stanza, if known */
  protected newPersonUID(userID: string, name?: string): WhatsAppContact {
    return new WhatsAppContact(JID.parse(userID), name);
  }

  /** Contacts' self-set display names ("push names") from history sync, keyed by
   * non-device JID. Used to name a 1:1 contact when nothing better is known. */
  readonly pushNames = new Map<string, string>();

  /** Records a contact's push name (from history sync) and applies it right away
   * to the contact if we already created one (from an earlier sync blob or a live
   * message). A verified business name, when we have it, still outranks it. */
  rememberPushName(jid: string | undefined, name: string | undefined): void {
    let id = sanitize.nonemptystring(jid, null);
    let pushName = sanitize.nonemptylabel(name, null);
    if (!id || !pushName) {
      return;
    }
    let address = JID.parse(id).toNonDevice().toString();
    this.pushNames.set(address, pushName);
    let contact = this.allPersonsCached.get(address)?.deref() as WhatsAppContact | undefined;
    if (contact && !contact.verifiedName) {
      contact.name = pushName;
    }
  }

  /** The ChatPersonUID for a WhatsApp JID
   * Fetches the profile (avatar, status, verified name) in the background.
   * @param name the sender's display name from the stanza, if known */
  getContact(jid: JID, name?: string): WhatsAppContact {
    let address = jid.toNonDevice().toString();
    name ??= this.pushNames.get(address); // the contact's own display name, from history sync
    let isNew = !this.allPersonsCached.get(address)?.deref();
    let contact = this.getPersonUID(address, name) as WhatsAppContact;
    if (name && !contact.verifiedName && contact.name != name) {
      contact.name = name;
    }
    if (isNew && this.connection && !jid.isGroup) {
      // Fetch avatar, status, verified name.
      // Only on first sight of this contact, not on restart, otherwise we'd floor on startup.
      // We only refetch the avatar on a `picture` notification.
      contact.fetch(this.connection)
        .catch(ex => console.error(ex));
    }
    return contact;
  }

  /** Re-fetches one contact's avatar after a `picture` notification — they
   * changed or removed it — replacing whatever we had. */
  protected async refetchPicture(jid: JID | undefined): Promise<void> {
    if (!jid || !this.connection || jid.isGroup) {
      return;
    }
    let contact = this.allPersonsCached.get(jid.toNonDevice().toString())?.deref() as WhatsAppContact | undefined;
    if (!contact) {
      return; // a picture change for someone we have no chat with
    }
    await contact.fetchPicture(this.connection);
  }

  /** The chat identity for the account owner — keyed by our own JID — used to
   * attribute the messages we sent (from the phone or another device). */
  async getOwnContact(): Promise<WhatsAppContact> {
    let jid = this.deviceJID ?? this.ownLID;
    return this.ownContact ??= this.getContact(jid.toNonDevice(), appGlobal.me?.name);
  }

  /** Creates a placeholder group for a live group chat. The real name and
   * members come from group metadata / history sync (not wired yet). */
  protected async getOrCreateGroup(jid: JID, subject?: string): Promise<Group> {
    let group = appGlobal.personalAddressbook.newGroup();
    group.name = subject || gt`WhatsApp group`;
    appGlobal.personalAddressbook.groups.add(group);
    await group.save();
    return group;
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
      this.deviceIdentityBytes = wa.deviceIdentity ? base64Decode(wa.deviceIdentity) : null;
      this.deviceJID = JID.parse(wa.deviceJID);
      this.signalStore = SignalStore.fromJSON(wa.signalStore);
    }
  }

  toConfigJSON(): any {
    let json = super.toConfigJSON();
    if (this.noiseKey && this.signalStore && this.deviceJID && this.advSecret) {
      // The durable pairing credentials (enough to log in again without
      // re-scanning) plus the live Signal session/sender-key ratchet state
      // (so we resume decrypting after a restart). {@link scheduleSave} re-writes
      // this as the ratchet advances.
      json.whatsapp = {
        noiseKey: base64Encode(this.noiseKey.privateKey),
        advSecret: base64Encode(this.advSecret),
        deviceIdentity: this.deviceIdentityBytes ? base64Encode(this.deviceIdentityBytes) : undefined,
        deviceJID: this.deviceJID.toString(),
        signalStore: this.signalStore.toJSON(),
      };
    }
    return json;
  }
}

/** How often to ping the server to keep the connection alive. */
const kKeepAliveMs = 25 * 1000;

/** Debounce before persisting Signal ratchet state after a message changes it. */
const kSessionSaveMs = 5 * 1000;

/** How many recently-sent payloads to keep for re-sending on a retry receipt. */
const kRecentSendsMax = 200;

export class WhatsAppSetup {
  /** The 64-digit hexadecimal backup encryption key */
  decryptKeyAsHex: string | null = null;
  /** msgstore.db.crypt15: the encrypted messages */
  msgStore: File | null = null;
  /** wa.db.crypt15: the encrypted contact names */
  waDB: File | null = null;
}
