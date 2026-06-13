import { ChatAccount } from "../ChatAccount";
import { WhatsAppChatRoom } from "./WhatsAppChatRoom";
import { WhatsAppMessage } from "./WhatsAppMessage";
import { WhatsAppHistorySync } from "./WhatsAppHistorySync";
import { KeyPair } from "./Crypto/KeyPair";
import { SignalStore } from "./Crypto/Signal/Store";
import { decryptPreKeyMessage, decryptSignalMessage } from "./Crypto/Signal/SessionCipher";
import { groupDecrypt, processDistributionMessage } from "./Crypto/Signal/GroupCipher";
import { base64Encode, base64Decode } from "./Crypto/primitives";
import { WhatsAppConnection, isWhatsAppLiveAvailable, type WhatsAppTransport } from "./WhatsAppConnection";
import { WhatsAppPairing } from "./WhatsAppPairing";
import { deferred, type Deferred, stanzaErrorText, bigEndian } from "./util";
import { waDebug, nodePreview } from "./debug";
import { kDjbType } from "./Crypto/curve";
import { getLoginPayload } from "./clientInfo";
import { decodeWAMessage, type WAMessage } from "./Proto/schema";
import { WANode } from "./Binary/WANode";
import { JID, kServerUser } from "./Binary/JID";
import { phoneNumbersMatch } from "./Import/ImportBackup";
import { WhatsAppMeetAccount } from "../../Meet/WhatsApp/WhatsAppMeetAccount";
import { ContactEntry, Person } from "../../Abstract/Person";
import { Group } from "../../Abstract/Group";
import { appGlobal } from "../../app";
import { gt } from "../../../l10n/l10n";

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
  /** Our own "LID" identity (e.g. `29850727395377@lid`), from the `<success>`
   * stanza. Modern accounts address us and our contacts by LID, so messages we
   * sent from the phone arrive `from` this — used to recognise them as outgoing. */
  ownLID: JID | null = null;
  /** Cached address book person for the account owner ({@link getOwnContact}). */
  protected ownContact: Person | null = null;
  connection: WhatsAppConnection | null = null;
  /** Voice/video calls run through this dependent Meet account. */
  meetAccount: WhatsAppMeetAccount | null = null;
  /** Fetches the chat list and old messages the phone sends after linking. */
  readonly historySync = new WhatsAppHistorySync(this);
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
    waDebug("account.startup()");
    await this.listRooms();
  }

  async login(interactive: boolean): Promise<void> {
    waDebug("account.login()");
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
      this.deviceJID = jid;
      this.username = jid.toString();
      this.realname ||= jid.user;
      waDebug("startPairing: paired as", jid.toString(), "— closing register conn, opening login conn");
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
    waDebug("account.connect():", {
      paired: !!(this.signalStore && this.noiseKey && this.deviceJID),
      liveAvailable: isWhatsAppLiveAvailable(),
      deviceJID: this.deviceJID?.toString(),
    });
    if (!this.signalStore || !this.noiseKey || !this.deviceJID) {
      waDebug("account.connect(): SKIP — not paired (missing signalStore/noiseKey/deviceJID)");
      return;
    }
    if (!transport && !isWhatsAppLiveAvailable()) {
      waDebug("account.connect(): SKIP — no live backend (appGlobal.remoteApp.newTCPSocket missing)");
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
    waDebug("account.connect(): LOGGED IN, isOnline = true");
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
      waDebug("=> <success>: logged in; running post-login (prekey upload + presence)");
      if (node.attrs.lid) {
        this.ownLID = JID.parse(node.attrs.lid);
      }
      this.loginResult?.resolve();
      this.loginResult = null;
      this.afterLogin().catch(ex => { waDebug("afterLogin ERROR:", ex?.message ?? ex); this.errorCallback(ex); });
    } else if (node.tag == "failure" || node.tag == "stream:error") {
      waDebug("=> <" + node.tag + ">: login/stream failed" + stanzaErrorText(node));
      this.loginResult?.reject(new Error(`WhatsApp login failed${stanzaErrorText(node)}`));
      this.loginResult = null;
    } else if (node.tag == "message") {
      this.receiveMessageStanza(node).catch(ex => { waDebug("receiveMessage ERROR:", ex?.message ?? ex); this.errorCallback(ex); });
    } else if (node.tag == "notification") {
      this.onNotification(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "receipt") {
      this.sendAck(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "iq") {
      this.onServerIQ(node).catch(ex => this.errorCallback(ex));
    } else if (node.tag == "call") {
      this.meetAccount?.handleCallStanza(node);
    } else if (node.tag == "ib") {
      this.onInitialBootstrap(node).catch(ex => this.errorCallback(ex));
    } else {
      waDebug("=> unhandled stanza:", node.tag);
    }
  }

  /** After `<success>`: publish our prekeys so the phone (and contacts) can
   * start Signal sessions to encrypt to us — without this the phone can't send
   * us anything, so no history and no messages arrive — and announce presence
   * so the phone delivers its history sync and live messages. */
  protected async afterLogin(): Promise<void> {
    waDebug("afterLogin: uploading prekeys, then switching connection to active");
    this.startKeepAlive();
    await this.uploadPreKeys();
    await this.sendActive();
    waDebug("afterLogin: done — server should now deliver offline messages + the phone's history sync");
  }

  /** Pings the server periodically so it doesn't drop the connection as idle. */
  protected startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      this.connection?.sendIQ(new WANode("iq", { to: kServerUser, type: "get", xmlns: "w:p" }, [new WANode("ping")]))
        .then(() => waDebug("keepalive: pong"))
        .catch(ex => waDebug("keepalive: ping failed", ex?.message ?? ex));
    }, kKeepAliveMs);
    (this.keepAliveTimer as any)?.unref?.(); // don't keep the (Node/test) event loop alive
  }

  protected stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  /** We log in `passive`, so the server doesn't deliver anything until we declare
   * ourselves active. This is the step that actually starts the inbound message
   * stream (offline backlog + the phone's history sync). It must come AFTER the
   * prekey upload, so the phone can encrypt to us once it learns we're online. */
  protected async sendActive(): Promise<void> {
    if (!this.connection) {
      return;
    }
    let response = await this.connection.sendIQ(new WANode("iq",
      { to: kServerUser, xmlns: "passive", type: "set" }, [new WANode("active")]));
    waDebug("sent <active>, server replied", nodePreview(response));
  }

  /** Publishes our identity + signed prekey + one-time prekeys to the server,
   * as the WhatsApp `encrypt` IQ (raw key bytes, big-endian ids). */
  protected async uploadPreKeys(): Promise<void> {
    let store = this.signalStore;
    if (!store || !this.connection) {
      return;
    }
    let signedPreKey = store.signedPreKeys.get(1)!;
    let preKeys = [...store.preKeys.values()].map(preKey => new WANode("key", {}, [
      new WANode("id", {}, bigEndian(preKey.keyID, 3)),
      new WANode("value", {}, preKey.keyPair.publicKey),
    ]));
    waDebug("uploadPreKeys: sending", preKeys.length, "prekeys, regID", store.registrationID);
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
    waDebug("uploadPreKeys: server replied", nodePreview(response),
      response.attrs.type == "error" ? "<<< PREKEY UPLOAD REJECTED" : "(ok)");
  }

  /** Server-side events (e.g. the phone added a device, or asks us to top up our
   * prekeys). We must acknowledge them so the server keeps the session going. */
  protected async onNotification(node: WANode): Promise<void> {
    if (node.attrs.type == "encrypt") {
      await this.uploadPreKeys(); // the server is running low on our prekeys
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
    let offline = node.child("offline");
    if (offline) {
      waDebug("=> <ib> OFFLINE COUNT =", offline.attrs.count, "(messages the server has queued for us)");
    }
    for (let dirty of node.children("dirty")) {
      waDebug("=> <ib> dirty:", dirty.attrs.type, "— cleaning");
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
    waDebug("stored group sender key for", skdm.groupID, "from", address);
  }

  /** Whether a JID is one of our own identities (our phone number or our LID) — a
   * message `from` it was sent by us, from the phone or another linked device. */
  protected isOwnJID(jid: JID): boolean {
    return jid.user == this.deviceJID?.user || jid.user == this.ownLID?.user;
  }

  protected async receiveMessageStanza(node: WANode): Promise<void> {
    let from = node.jidAttr("from");
    let id = node.attrs.id;
    if (!from || !id) {
      return;
    }
    let sender = from.isGroup ? node.jidAttr("participant") ?? from : from;
    waDebug("message from", from.toString(), "id", id, "type", node.attrs.type,
      "enc:", node.children("enc").map(enc => enc.attrs.type).join(",") || "(none)");
    let payloadBytes = await this.decryptStanza(node, from, sender);
    if (!payloadBytes) {
      waDebug("  -> decrypt FAILED / no usable <enc> — message dropped");
      return;
    }
    let rawPayload = decodeWAMessage(payloadBytes);
    let payload = WhatsAppMessage.unwrap(rawPayload);
    this.processSenderKeyDistribution(payload, sender);
    let historyNotification = payload.protocolMessage?.historySyncNotification;
    if (historyNotification) {
      waDebug("  -> HISTORY SYNC notification");
      await this.historySync.handleNotification(historyNotification);
      await this.sendDeliveryReceipt(node);
      return;
    }
    // `category="peer"` messages are device-to-device sync / protocol traffic
    // (app-state, key shares, the history-sync notifications above) that the
    // phone sends our own account — NOT a conversation. Don't make a chat room
    // for them (that produced a bogus room named after our own number).
    if (node.attrs.category == "peer") {
      waDebug("  -> peer/sync message (not a chat) — acked, no room");
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
    waDebug("  ->", outgoing ? "OUTGOING" : "incoming", "message into room", room.id, "— now", room.messages.length, "messages");
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

  /** Decrypts the first usable `<enc>` of a message stanza via the matching
   * Signal primitive (1:1 prekey/session, or the group sender key). */
  protected async decryptStanza(node: WANode, chat: JID, sender: JID): Promise<Uint8Array | null> {
    let address = `${sender.user}.${sender.device}`;
    waDebug("  decryptStanza: address", address, "haveSession:", this.signalStore?.sessions.has(address));
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
          waDebug("    skmsg: no sender key yet for", `${chat.toString()}|${address}`);
        }
      } catch (ex) {
        waDebug("    decrypt", type, "ERROR:", (ex as any)?.message ?? ex);
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
      : await this.getOrCreatePerson(chat, nameHint);
    room = this.roomForChat(chat); // re-check: a concurrent message may have created it
    if (room) {
      return room;
    }
    room = this.newRoom();
    room.id = chat.toNonDevice().toString();
    room.contact = contact as any;
    if (chat.isGroup) {
      room.name = contact.name;
    }
    this.rooms.set(contact as any, room);
    await room.save();
    return room;
  }

  /** Finds the contact for a WhatsApp JID, or creates one in the personal
   * address book. Matches the importer's keys (WhatsApp ID, then phone number)
   * so live and imported chats share the same contacts.
   * @param pushName the sender's display name from the stanza, if known */
  protected async getOrCreatePerson(jid: JID, pushName?: string): Promise<Person> {
    let address = jid.toNonDevice().toString();
    let phone = jid.server == kServerUser ? "+" + jid.user : null;
    let person = appGlobal.persons.find(p =>
      p.chatAccounts.some(e => e.protocol == "whatsapp" && jidUser(e.value) == jid.user));
    if (!person && phone) {
      person = appGlobal.persons.find(p => p.phoneNumbers.some(e => phoneNumbersMatch(e.value, phone)));
    }
    let changed = false;
    if (!person) {
      person = appGlobal.personalAddressbook.newPerson();
      person.name = pushName || phone || jid.user;
      appGlobal.personalAddressbook.persons.add(person);
      changed = true;
    }
    if (!person.chatAccounts.some(e => e.protocol == "whatsapp" && jidUser(e.value) == jid.user)) {
      person.chatAccounts.add(new ContactEntry(address, "WhatsApp", "whatsapp"));
      changed = true;
    }
    if (phone && !person.phoneNumbers.some(e => phoneNumbersMatch(e.value, phone))) {
      person.phoneNumbers.add(new ContactEntry(phone, "mobile", "tel"));
      changed = true;
    }
    if (changed) {
      await person.save();
    }
    return person;
  }

  /** A persistable contact for the account owner — keyed by our own JID — used to
   * attribute the messages we sent (from the phone or another device). Unlike
   * `appGlobal.me`, this is a real address book person and so can be saved as a
   * message's sender. */
  async getOwnContact(): Promise<Person> {
    let jid = this.deviceJID ?? this.ownLID;
    if (!jid) {
      return appGlobal.me as any as Person; // unpaired (tests only); storage is a no-op there
    }
    this.ownContact ??= await this.getOrCreatePerson(jid.toNonDevice(), appGlobal.me?.name);
    return this.ownContact;
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

/** How often to ping the server to keep the connection alive. */
const kKeepAliveMs = 25 * 1000;

/** The user part (phone number digits) of a contact's stored WhatsApp value,
 * which may be a full JID or just a number. */
function jidUser(value: string): string {
  return JID.parse(value).user || value;
}

export class WhatsAppSetup {
  /** The 64-digit hexadecimal backup encryption key */
  decryptKeyAsHex: string | null = null;
  /** msgstore.db.crypt15: the encrypted messages */
  msgStore: File | null = null;
  /** wa.db.crypt15: the encrypted contact names */
  waDB: File | null = null;
}
