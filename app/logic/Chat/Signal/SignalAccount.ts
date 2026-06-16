import { ChatAccount } from "../ChatAccount";
import type { ChatRoom } from "../ChatRoom";
import { ChatPersonUID } from "../ChatPersonUID";
import type { Group } from "../../Abstract/Group";
import { SignalChatRoom } from "./SignalChatRoom";
import { Signal1to1ChatRoom } from "./Signal1to1ChatRoom";
import { SignalGroupChatRoom } from "./SignalGroupChatRoom";
import { SignalContact } from "./SignalContact";
import { SignalMedia } from "./SignalMedia";
import { ServiceId } from "./ServiceId";
import { SignalWebSocket } from "./Connection/SignalWebSocket";
import { SignalApi, SignalHosts, type Credentials } from "./Connection/SignalApi";
import { SignalStore } from "./Crypto/Store";
import { KeyPair } from "./Crypto/KeyPair";
import { generateRegistrationID, generateSignedPreKey, PreKeyBundle } from "./Crypto/Identity";
import { xeddsaSign, djbEncode } from "./Crypto/curve";
import { KyberKeyPair } from "./Encryption/kyber";
import { encryptDeviceName } from "./Encryption/DeviceNameCipher";
import {
  ecSignedPreKeyJSON, ecPreKeyJSON, kemSignedPreKeyJSON, base64NoPad,
  type ECSignedPreKeyJSON, type ECPreKeyJSON, type KEMSignedPreKeyJSON,
} from "./Connection/keysJSON";
import { signalServerPublicParams } from "./Connection/serverParams";
import { registerNewAccount, type KyberLastResort } from "./Connection/Registration";
import { receiveAuthCredentialWithPniZkc, type AuthCredentialWithPni, type ServerPublicParams } from "./Encryption/ZKGroup/credentials";
import { KyberPreKeyBundle } from "./Encryption/pqxdh";
import { SignalSessions } from "./Encryption/SignalSession";
import { padContent, unpadContent } from "./Proto/contentPadding";
import { sealedSenderDecrypt, CiphertextType } from "./Encryption/SealedSender";
import { kSignalTrustRoot } from "./Encryption/trustRoot";
import { deriveStorageKey, deriveMasterKeyFromAEP } from "./Encryption/StorageCipher";
import { SignalStorageService } from "./Profile/StorageService";
import { SignalProfile } from "./Profile/Profile";
import { Provisioning } from "./Connection/Provisioning";
import type { ProvisionMessage } from "./Proto/provisioning";
import { base64Encode, base64Decode, randomBytes } from "./Crypto/primitives";
import { uuidToBytes } from "./ServiceId";
import { encode, decode } from "./Proto/codec";
import { Envelope, EnvelopeType, Content, type Content as ContentType } from "./Proto/signalService";
import { SignalGroup } from "./Groups/Group";
import { SignalMeetAccount } from "../../Meet/Signal/SignalMeetAccount";
import { bytesToHex, hexToBytes } from "@noble/curves/utils.js";
import { appGlobal } from "../../app";
import { ArrayColl, MapColl } from "svelte-collections";

/**
 * A Signal account. Orchestrates the protocol like `WhatsAppAccount`: identity +
 * Signal keys, the chat-service WebSocket, routing inbound Envelopes to rooms, and
 * config persistence so a restart resumes without re-handshaking.
 *
 * Two ways in (Docs/02): linking as a companion device (the default — scan the QR
 * from the user's phone) and registering a brand-new account (phone verification).
 * Both populate `aci`, `pni`, `deviceId`, the credentials and the Signal store.
 */
export class SignalAccount extends ChatAccount {
  readonly protocol: string = "signal";
  declare readonly rooms: MapColl<ChatPersonUID | Group, SignalChatRoom>;
  declare readonly roster: ArrayColl<SignalContact>;
  declare protected readonly allPersonsCached: MapColl<string, WeakRef<SignalContact>>;
  declare getPersonUID: (userID: string, name?: string) => SignalContact;

  /** Our account identifier (ACI), phone-number identity (PNI), number, device id. */
  aci: ServiceId | null = null;
  pni: ServiceId | null = null;
  e164: string | null = null;
  deviceID = 1;
  /** The password established at registration/linking, used for Basic auth. */
  servicePassword: string | null = null;
  /** Our 32-byte profile key (derives the unidentified-access key for sealed sender). */
  profileKey: Uint8Array | null = null;
  /** The 32-byte storage-service master key (root of the storage key chain,
   * Docs/06 §1). Sourced from the linking ProvisionMessage (its AccountEntropyPool,
   * or — for older accounts — a `Keys` SyncMessage; ⚠️ see fromProvisionMessage). */
  masterKey: Uint8Array | null = null;

  /** Last-synced storage-service manifest version (0 = never synced). */
  storageManifestVersion = 0;
  /** Hex of every storage-record id seen at the last sync, to diff cheaply. */
  storageKnownIds = new Set<string>();
  /** Group master keys learned from the storage service (GroupV2Record), hex-keyed. */
  readonly groupMasterKeys = new Map<string, Uint8Array>();

  /** masterKey → storage service key (derived once, cached). */
  get storageKey(): Uint8Array | null {
    if (!this.masterKey) {
      return null;
    }
    return this._storageKey ??= deriveStorageKey(this.masterKey);
  }
  protected _storageKey: Uint8Array | null = null;

  /** Signal protocol store for our ACI identity: EC identity key, registration id,
   * signed + one-time prekeys, pairwise sessions, sender keys. (Shared crypto.) */
  aciStore: SignalStore | null = null;
  /** Our ACI Kyber (ML-KEM-1024) last-resort prekey for PQXDH. */
  kyberLastResort: KyberLastResort | null = null;

  /** Signal protocol store for our PNI identity (separate identity key + signed
   * prekey + one-time prekeys + registration id). Built at link/registration from
   * the PNI identity key; its keys are published under `/v2/keys?identity=pni`. */
  pniStore: SignalStore | null = null;
  /** Our PNI Kyber last-resort prekey (signed with the PNI identity key). */
  pniKyberLastResort: KyberLastResort | null = null;

  /** The triple-ratchet message layer (PQXDH + Double Ratchet + SPQR), per
   * peer-device address. Lazily built from `aciStore` + `kyberLastResort`. The
   * SPQR halves persist via config JSON; the Double-Ratchet sessions via the store. */
  protected sessions: SignalSessions | null = null;
  /** Restored SPQR session JSON, applied once `sessions` is first built. */
  protected sessionsJSON: any = null;

  readonly media = new SignalMedia(this);
  connection: SignalWebSocket | null = null;
  /** The in-progress device-linking flow, so the setup UI can cancel it. */
  protected provisioning: Provisioning | null = null;
  protected ownContact: SignalContact | null = null;
  /** Voice/video calls run through this dependent Meet account. */
  meetAccount: SignalMeetAccount | null = null;

  get isLoggedIn(): boolean {
    return !!this.connection?.isConnected;
  }

  newRoom(isGroup = false): ChatRoom {
    return isGroup ? new SignalGroupChatRoom(this) : new Signal1to1ChatRoom(this);
  }

  protected newPersonUID(userID: string, name?: string): SignalContact {
    return new SignalContact(ServiceId.parse(userID), name);
  }

  // --- API + auth ---

  api(host: string = SignalHosts.chat): SignalApi {
    return new SignalApi(host);
  }

  /** Basic-auth credentials: username = `<aci>.<deviceId>` (libsignal form). */
  authCredentials(): Credentials {
    if (!this.aci || !this.servicePassword) {
      throw new Error("Signal account not set up");
    }
    return { username: `${this.aci.uuidString()}.${this.deviceID}`, password: this.servicePassword };
  }

  // --- login / connection ---

  async startup(): Promise<void> {
    await this.listRooms();
  }

  async login(interactive: boolean): Promise<void> {
    await super.login(interactive);
    await Promise.all(appGlobal.addressbooks.contents.map(ab => ab.readContactsFromDB()));
    await this.listRooms();
    if (this.aciStore && this.servicePassword) {
      await this.connect();
    }
  }

  /** Register a brand-new account as a primary device (Docs/02 §A). Generates fresh
   * ACI + PNI identity keypairs, registration ids, signed/last-resort prekeys and a
   * profile key; runs the phone-verification session state machine (the callbacks
   * supply the captcha token + SMS code); POSTs `/v1/registration`; then connects.
   * The one-time prekeys are published afterward via `uploadPreKeys` (afterLogin). */
  async registerNewAccount(e164: string, getCaptcha: () => Promise<string>, getSmsCode: () => Promise<string>): Promise<void> {
    this.e164 = e164;
    this.profileKey = randomBytes(32);
    let aciIdentity = KeyPair.generate();
    let pniIdentity = KeyPair.generate();
    this.aciStore = this.buildIdentityStore(aciIdentity);
    this.kyberLastResort = this.generateKyberLastResort(aciIdentity);
    this.pniStore = this.buildIdentityStore(pniIdentity);
    this.pniKyberLastResort = this.generateKyberLastResort(pniIdentity);
    this.servicePassword = base64Encode(randomBytes(18)); // primary device password

    let res = await registerNewAccount(e164, this.servicePassword, {
      aciIdentity, pniIdentity,
      aciSignedPreKey: this.aciStore.signedPreKeys.get(1)!,
      pniSignedPreKey: this.pniStore.signedPreKeys.get(1)!,
      aciKyberLastResort: this.kyberLastResort,
      pniKyberLastResort: this.pniKyberLastResort,
      aciRegistrationId: this.aciStore.registrationID,
      pniRegistrationId: this.pniStore.registrationID,
      profileKey: this.profileKey,
    }, kSignalCapabilities, { getCaptcha, getSmsCode });

    this.aci = ServiceId.aci(uuidToBytes(res.uuid));
    this.pni = ServiceId.pni(uuidToBytes(res.pni));
    this.e164 = res.number ?? e164;
    this.deviceID = 1; // a primary device is always device 1
    this.realname ||= res.number ?? this.aci.uuidString();

    await this.save();
    await this.connect();
  }

  /** Link this app as a companion device (the default setup, Docs/02). Shows the
   * QR for the user's phone to scan, receives the encrypted ProvisionMessage,
   * builds our Signal store from the primary's ACI identity key, registers as a
   * new device, and connects. @param onQR render this string as a QR code. */
  async linkDevice(onQR: (qr: string) => void): Promise<void> {
    let provisioning = this.provisioning = new Provisioning();
    provisioning.onQR = onQR;
    let message: ProvisionMessage;
    try {
      message = (await provisioning.run()).message;
    } finally {
      this.provisioning = null;
    }
    this.aci = ServiceId.aci(message.aciBinary ?? uuidToBytes(message.aci!));
    this.pni = message.pniBinary ? ServiceId.pni(message.pniBinary)
      : message.pni ? ServiceId.parse(message.pni) : null;
    this.e164 = message.number ?? null;
    this.profileKey = message.profileKey ?? null;
    this.masterKey = this.masterKeyFromProvision(message);
    this.realname ||= message.number ?? this.aci.uuidString();

    // Our Signal store uses the ACI identity key the primary device shared, so our
    // sessions chain to the user's real identity. Fresh registration id + prekeys.
    // The PNI side gets its own identity store from the shared PNI identity key.
    this.aciStore = this.buildIdentityStore(KeyPair.fromPrivate(message.aciIdentityKeyPrivate!));
    this.kyberLastResort = this.generateKyberLastResort(this.aciStore.identityKeyPair);
    if (message.pniIdentityKeyPrivate?.length) {
      this.pniStore = this.buildIdentityStore(KeyPair.fromPrivate(message.pniIdentityKeyPrivate));
      this.pniKyberLastResort = this.generateKyberLastResort(this.pniStore.identityKeyPair);
    }

    await this.finishLink(message);
    await this.save();
    await this.connect();
  }

  /** Cancel an in-progress {@link linkDevice} (e.g. the setup window was closed). */
  cancelLinking(): void {
    this.provisioning?.cancel();
    this.provisioning = null;
  }

  /** A fresh Signal store wrapping an identity keypair: new registration id, one
   * signed prekey, 100 one-time prekeys (mirrors `SignalStore.createNew` but keeps
   * the supplied identity key instead of minting one). */
  protected buildIdentityStore(identityKey: KeyPair): SignalStore {
    let store = new SignalStore();
    store.identityKeyPair = identityKey;
    store.registrationID = generateRegistrationID();
    store.signedPreKeys.set(1, generateSignedPreKey(identityKey, 1));
    store.generateMorePreKeys(100);
    return store;
  }

  /** A Kyber (ML-KEM-1024) last-resort prekey, its public key signed by the
   * identity key (XEdDSA), for PQXDH (Docs/02). The stored signature is over the
   * raw 1568-byte key (the PQXDH path); the wire upload re-signs the 1569-byte
   * serialized form (keysJSON.ts). */
  protected generateKyberLastResort(identityKey: KeyPair): KyberLastResort {
    let keyPair = KyberKeyPair.generate();
    return { keyID: 1, keyPair, signature: xeddsaSign(identityKey.privateKey, keyPair.publicKey) };
  }

  /** Register this device with the server (PUT /v1/devices/link, Docs/02 §B.5): a
   * client-chosen password, the device attributes, and the ACI + PNI signed prekeys
   * and Kyber last-resort prekeys (signed with the received identity keys). The
   * response assigns our deviceId and confirms the account's ACI/PNI. One-time
   * prekeys are uploaded afterward via `/v2/keys` (uploadPreKeys). */
  protected async finishLink(message: ProvisionMessage): Promise<void> {
    if (!this.aci || !this.aciStore || !this.kyberLastResort || !this.pniStore || !this.pniKyberLastResort) {
      throw new Error("Signal: link not set up (missing ACI/PNI stores)");
    }
    this.servicePassword = base64Encode(randomBytes(18)); // fresh device password
    let body = {
      verificationCode: message.provisioningCode,
      accountAttributes: this.deviceAttributes(encryptDeviceName(this.deviceName(), this.aciStore.identityKeyPair)),
      ...this.signedPreKeyBody(),
    };

    // ⚠️ Docs/02 §B.4: the server finds the account via verificationCode and takes the
    // CONFIRMED against the live server: the Basic-auth username is the ACI (the
    // server finds the account by verificationCode and takes the password from the
    // header). The link request body shape above is accepted as-is.
    let creds = { username: this.aci.uuidString(), password: this.servicePassword };
    let res = await this.api().json<LinkDeviceResponse>("PUT", "/v1/devices/link", body, creds);

    this.deviceID = res.deviceId;
    if (res.uuid) {
      this.aci = ServiceId.aci(uuidToBytes(res.uuid));
    }
    if (res.pni) {
      this.pni = ServiceId.pni(uuidToBytes(res.pni));
    }
  }

  /** A display name for this linked device (shown on the user's phone). */
  protected deviceName(): string {
    return this.name || "Mustang";
  }

  /** The `DeviceAttributes` block sent on link (Docs/02 §B.5): our own ACI + PNI
   * registration ids, the encrypted device name, and the required capabilities. */
  protected deviceAttributes(encryptedName: Uint8Array | null): DeviceAttributesJSON {
    return {
      fetchesMessages: true,
      registrationId: this.aciStore!.registrationID,
      pniRegistrationId: this.pniStore!.registrationID,
      name: encryptedName ? base64NoPad(encryptedName) : null,
      capabilities: kSignalCapabilities,
    };
  }

  /** The four signed/last-resort prekey fields shared by `/v1/devices/link` and
   * `/v1/registration` (ACI + PNI EC signed prekeys and Kyber last-resort prekeys). */
  protected signedPreKeyBody(): SignedPreKeyBody {
    return {
      aciSignedPreKey: ecSignedPreKeyJSON(this.aciStore!.signedPreKeys.get(1)!),
      pniSignedPreKey: ecSignedPreKeyJSON(this.pniStore!.signedPreKeys.get(1)!),
      aciPqLastResortPreKey: kemSignedPreKeyJSON(
        this.kyberLastResort!.keyID, this.kyberLastResort!.keyPair, this.aciStore!.identityKeyPair),
      pniPqLastResortPreKey: kemSignedPreKeyJSON(
        this.pniKyberLastResort!.keyID, this.pniKyberLastResort!.keyPair, this.pniStore!.identityKeyPair),
    };
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }
    this.setupMeetAccount();
    let connection = new SignalWebSocket();
    connection.onRequest = req => this.handleInboundRequest(req);
    connection.onClose = () => { this.isOnline = false; this.connection = null; };
    this.connection = connection;
    await connection.connect(this.authCredentials());
    this.isOnline = true;
    this.afterLogin().catch(this.errorCallback);
  }

  async disconnect(): Promise<void> {
    this.isOnline = false;
    this.connection?.disconnect();
    this.connection = null;
  }

  /** Creates (or reuses) the dependent Meet account that handles Signal calls. */
  protected setupMeetAccount(): void {
    this.meetAccount ??= appGlobal.meetAccounts.find(
      acc => acc instanceof SignalMeetAccount && acc.mainAccount == this) as SignalMeetAccount;
    if (this.meetAccount) {
      return;
    }
    this.meetAccount = new SignalMeetAccount();
    this.meetAccount.mainAccount = this; // chatAccount derives from this
    this.meetAccount.name = this.name;
    appGlobal.meetAccounts.add(this.meetAccount);
  }

  /** After connecting: top up + publish prekeys so peers can start sessions to us,
   * then sync the roster (storage service) and message history, then fetch the
   * roster's profiles (name + avatar) in the background. */
  protected async afterLogin(): Promise<void> {
    await this.uploadPreKeys().catch(this.errorCallback);
    await this.syncRoster().catch(this.errorCallback);
    for (let contact of this.roster.contents) {
      this.fetchContactProfile(contact); // background, best-effort
    }
  }

  /** Top up + publish one-time prekeys for both identities (Docs/02 §C): PUT
   * `/v2/keys?identity=aci` and `?identity=pni`, each with the identity key, signed
   * prekey, fresh one-time EC prekeys (≤100), the Kyber last-resort, and any new
   * one-time Kyber prekeys. base64-no-pad throughout (keysJSON.ts). */
  protected async uploadPreKeys(): Promise<void> {
    let replenished = false;
    if (this.aciStore && this.kyberLastResort) {
      replenished = await this.uploadIdentityPreKeys("aci", this.aciStore, this.kyberLastResort) || replenished;
    }
    if (this.pniStore && this.pniKyberLastResort) {
      replenished = await this.uploadIdentityPreKeys("pni", this.pniStore, this.pniKyberLastResort) || replenished;
    }
    if (replenished) {
      this.scheduleSave();
    }
  }

  /** PUT one identity's `/v2/keys` body. The server *replaces* its stored one-time
   * EC prekeys with whatever non-empty `preKeys` set we send (Docs/02 §C.1), so we
   * top up to the target and publish the full current set (≤100), idempotently.
   * @returns whether new prekeys were minted (to schedule a save). */
  protected async uploadIdentityPreKeys(identity: "aci" | "pni", store: SignalStore, kyber: KyberLastResort): Promise<boolean> {
    let newKeys = store.replenishPreKeys();
    let preKeys = [...store.preKeys.values()].slice(0, 100);
    let body: SetKeysRequestJSON = {
      identityKey: base64NoPad(djbEncode(store.identityKeyPair.publicKey)),
      signedPreKey: ecSignedPreKeyJSON(store.signedPreKeys.get(1)!),
      preKeys: preKeys.map(ecPreKeyJSON),
      pqLastResortPreKey: kemSignedPreKeyJSON(kyber.keyID, kyber.keyPair, store.identityKeyPair),
    };
    // CONFIRMED against the live server (ACI + PNI accepted): the Kyber-prekey
    // signature is over the 1569-byte serialized key (0x08‖key), per keysJSON.ts.
    await this.api().json("PUT", `/v2/keys?identity=${identity}`, body, this.authCredentials());
    return newKeys.length > 0;
  }

  /** Sync the contact roster from the storage service (Docs/06): pull the manifest,
   * diff, fetch + decrypt the changed records, apply them to the roster. No-op
   * without a master key (older accounts that haven't received one yet). */
  async syncRoster(): Promise<void> {
    if (!this.storageKey) {
      console.warn("Signal: no storage master key yet — skipping roster sync (Docs/06)");
      return;
    }
    await new SignalStorageService(this).sync();
  }

  /** The storage-service master key from a linking ProvisionMessage. Newer accounts
   * carry an AccountEntropyPool (field 15) the master key derives from (Docs/06 §1.4,
   * resolved: HKDF "20240801_SIGNAL_SVR_MASTER_KEY"). ⚠️ Older accounts carry the
   * raw master key only via a later `Keys` SyncMessage (Docs/03) — handled by
   * setting `this.masterKey` when that arrives; this returns null for them. */
  protected masterKeyFromProvision(message: ProvisionMessage): Uint8Array | null {
    return message.accountEntropyPool ? deriveMasterKeyFromAEP(message.accountEntropyPool) : null;
  }

  /** Note a group master key learned from the storage service (GroupV2Record), so
   * the group room can be created/shown later (Docs/04). */
  noteGroupMasterKey(masterKey: Uint8Array): void {
    this.groupMasterKeys.set(bytesToHex(masterKey), masterKey);
  }

  // --- inbound ---

  protected async handleInboundRequest(req: { verb?: string, path?: string, body?: Uint8Array }): Promise<number> {
    if (req.verb == "PUT" && req.path?.startsWith("/api/v1/message") && req.body) {
      try {
        await this.handleEnvelope(decode(Envelope, req.body));
      } catch (ex) {
        let e = ex as any;
        console.error("Signal: INBOUND PROCESSING FAILED —", e?.constructor?.name ?? typeof ex, "| msg:", e?.message ?? String(ex), "\nstack:", e?.stack);
        this.errorCallback(ex);
      }
      return 200;
    }
    return 200; // queue-empty and other notifications: just ACK
  }

  protected async handleEnvelope(envelope: Envelope): Promise<void> {
    console.log(`Signal: handleEnvelope type=${envelope.type} envSource=${envelope.sourceServiceId ?? "(none)"}.${envelope.sourceDeviceId ?? "?"} ts=${envelope.serverTimestamp ?? envelope.clientTimestamp} contentLen=${envelope.content?.length ?? 0}`);
    let decrypted = await this.decryptEnvelope(envelope); // gated on SPQR/sealed-sender
    if (!decrypted) {
      console.log("Signal: handleEnvelope — decryptEnvelope returned nothing (dropped / receipt / call); no room created");
      return;
    }
    // Use the sender from the DECRYPTED ciphertext, not the Envelope: sealed-sender
    // envelopes carry no source (the whole point), so `envelope.sourceServiceId` is empty.
    let { content, sender: senderId } = decrypted;
    // A SyncMessage is sent BY our own account from another device (SignalService.proto
    // Content.syncMessage); the sender is always us, so route on the sync payload — a
    // Sent transcript goes to the DESTINATION's room as an outgoing message.
    if (content.syncMessage) {
      console.log(`Signal: handleEnvelope — syncMessage (sent=${!!content.syncMessage.sent}, read=${content.syncMessage.read?.length ?? 0})`);
      await this.handleSyncMessage(content.syncMessage);
      this.scheduleSave();
      return;
    }
    let outgoing = !!this.aci && senderId.equals(this.aci);
    // A groupV2 context routes the message to the GROUP room (by masterKey→groupId),
    // not the 1:1 sender room (Docs/04 §7/§9).
    let masterKey = content.dataMessage?.groupV2?.masterKey;
    console.log(`Signal: handleEnvelope — routing sender=${senderId.toString()} outgoing=${outgoing} group=${masterKey?.length ? "yes" : "no"} dataMessage=${!!content.dataMessage}`);
    let room = masterKey?.length
      ? await this.getOrCreateGroupRoom(masterKey)
      : await this.getOrCreateRoom(senderId);
    console.log(`Signal: handleEnvelope — room id=${room.id} name="${room.name}" totalRooms=${this.rooms.contents.length}`);
    let msg = await room.handleContent(content, this.getContact(senderId), outgoing);
    console.log(`Signal: handleEnvelope — handleContent → message=${!!msg}${msg ? ` text=${JSON.stringify(((msg as any).text ?? "").slice(0, 40))}` : ""}`);
    if (msg) {
      room.lastMessage = msg;
      await room.saveNewMessages([msg]);
      console.log(`Signal: handleEnvelope — DONE: saved message, room "${room.name}" should now be visible`);
    }
    this.scheduleSave(); // decrypting advanced the ratchet
  }

  /** Handle an inbound SyncMessage (a message we sent/read from another linked
   * device, mirrored here). `Sent` re-creates the message we sent in the
   * destination's room as OUTGOING (from our own contact); `Read` marks our sent
   * messages as seen. SignalService.proto SyncMessage. */
  protected async handleSyncMessage(sync: NonNullable<ContentType["syncMessage"]>): Promise<void> {
    if (sync.sent) {
      await this.handleSentTranscript(sync.sent);
    }
    for (let read of sync.read ?? []) {
      this.handleSyncRead(read);
    }
  }

  /** A `SyncMessage.Sent` transcript: route the (data or edit) message we sent to
   * the destination's room as an outgoing message. The destination is a 1:1 peer
   * (destinationServiceId / …Binary) or a group (message.groupV2.masterKey). */
  protected async handleSentTranscript(sent: NonNullable<NonNullable<ContentType["syncMessage"]>["sent"]>): Promise<void> {
    let inner = sent.editMessage
      ? { editMessage: sent.editMessage } as ContentType
      : sent.message ? { dataMessage: sent.message } as ContentType : null;
    if (!inner) {
      return;
    }
    let data = sent.message ?? sent.editMessage?.dataMessage;
    let masterKey = data?.groupV2?.masterKey;
    let room: SignalChatRoom | null = masterKey?.length
      ? await this.getOrCreateGroupRoom(masterKey)
      : await this.destinationRoom(sent);
    if (!room) {
      return;
    }
    let msg = await room.handleContent(inner, this.getOwnContact(), true);
    if (msg) {
      room.lastMessage = msg;
      await room.saveNewMessages([msg]);
    }
  }

  /** The 1:1 room for a Sent transcript's destination ServiceId (binary preferred). */
  protected async destinationRoom(sent: NonNullable<NonNullable<ContentType["syncMessage"]>["sent"]>): Promise<SignalChatRoom | null> {
    let destination = sent.destinationServiceIdBinary?.length
      ? serviceIdFromBinary(sent.destinationServiceIdBinary)
      : sent.destinationServiceId ? ServiceId.parse(sent.destinationServiceId) : null;
    return destination ? await this.getOrCreateRoom(destination) : null;
  }

  /** A `SyncMessage.Read`: mark our matching sent message(s) as seen across rooms. */
  protected handleSyncRead(read: { timestamp?: number }): void {
    if (read.timestamp == null) {
      return;
    }
    for (let room of this.rooms.values()) {
      room.markSentMessageRead(read.timestamp);
    }
  }

  /** Group rooms first seen live, keyed by hex group id. Decrypted group state is
   * fetched/populated lazily; the room exists immediately so the message lands. */
  protected readonly groupRooms = new Map<string, SignalGroupChatRoom>();

  /** Find or create the group room for a 32-byte master key (like WhatsApp's
   * getOrCreateRoom for groups). Derives the group id, creates the room + Group
   * contact on first sight, then fetches + decrypts the state in the background. */
  async getOrCreateGroupRoom(masterKey: Uint8Array): Promise<SignalGroupChatRoom> {
    let signalGroup = new SignalGroup(masterKey);
    let key = bytesToHex(signalGroup.groupId);
    let existing = this.groupRooms.get(key)
      ?? this.rooms.contents.find((r): r is SignalGroupChatRoom => r instanceof SignalGroupChatRoom && r.id == key);
    if (existing) {
      this.groupRooms.set(key, existing);
      return existing;
    }
    let group = appGlobal.personalAddressbook.newGroup();
    group.name = "Signal group";
    appGlobal.personalAddressbook.groups.add(group);
    await group.save();

    let room = this.newRoom(true) as SignalGroupChatRoom;
    room.id = key;
    room.contact = group;
    room.masterKey = masterKey;
    room.groupId = signalGroup.groupId;
    room.group = signalGroup;
    room.name = group.name;
    this.groupRooms.set(key, room);
    this.rooms.set(group, room);
    await room.save();

    this.fetchGroupState(room).catch(ex => console.error("Signal: fetching group state failed:", ex));
    return room;
  }

  /** Fetch + decrypt the live group state and populate the room (subject, members).
   * Gated on the zk auth-credential machinery; the structure is in place so a
   * group first seen live shows its name + members once that is wired (Docs/04). */
  protected async fetchGroupState(room: SignalGroupChatRoom): Promise<void> {
    if (!room.group) {
      return;
    }
    let auth = await this.groupAuth();
    let decrypted = await room.group.fetch(this.api(SignalHosts.storage), auth);
    room.populate(decrypted);
    console.log(`Signal: group ${room.id} fetched → title "${decrypted.title ?? ""}", ${decrypted.members?.length ?? 0} members`);
    await room.save();
  }

  /** The zkgroup auth credential + server public params for group-cloud requests
   * (Docs/04 §2). GET a 7-day window of daily `AuthCredentialWithPniResponse`s,
   * verify today's into an `AuthCredentialWithPni`, and pair it with the production
   * server public params. Cached for the day. */
  protected async groupAuth(): Promise<import("./Groups/Group").GroupAuth> {
    if (!this.aci || !this.pni) {
      throw new Error("Signal: need both ACI and PNI for group auth");
    }
    let serverPublicParams = this.serverPublicParams();
    let today = todayRedemptionSeconds();
    if (this.cachedGroupAuth?.redemptionTime == today) {
      return { credential: this.cachedGroupAuth.credential, serverPublicParams };
    }

    let start = today;
    let end = today + 7 * kSecondsPerDay;
    let res = await this.api().json<GroupCredentialsResponse>(
      "GET", `/v1/certificate/auth/group?redemptionStartSeconds=${start}&redemptionEndSeconds=${end}`,
      undefined, this.authCredentials());
    let entry = res.credentials.find(c => c.redemptionTime == today) ?? res.credentials[0];
    if (!entry) {
      throw new Error("Signal: no group auth credentials returned");
    }
    // UNKNOWN (live-confirm): the AuthCredentialWithPniResponse JSON shape AND that
    // our production ServerPublicParams constant matches the live issuing key. If the
    // receive below throws (verification failed), one of those is off.
    console.log("Signal group-auth: response had", res.credentials?.length, "credentials; using redemptionTime",
      entry.redemptionTime, "| credential b64 len", entry.credential?.length);
    let credential: AuthCredentialWithPni;
    try {
      credential = receiveAuthCredentialWithPniZkc(
        base64Decode(entry.credential), serverPublicParams.genericCredentialPublicKey,
        this.aci, this.pni, entry.redemptionTime);
    } catch (ex) {
      console.warn("Signal group-auth: credential verification FAILED — the ServerPublicParams constant",
        "or the response layout is wrong:", (ex as any)?.message ?? ex);
      throw ex;
    }
    console.log("Signal group-auth: credential verified against ServerPublicParams ✓");
    this.cachedGroupAuth = { redemptionTime: entry.redemptionTime, credential };
    return { credential, serverPublicParams };
  }

  /** The chat server's zkgroup public params (the production constant). Overridable
   * for tests that issue credentials under a test server key. */
  protected serverPublicParams(): ServerPublicParams {
    return signalServerPublicParams();
  }

  /** Today's verified group auth credential, cached to avoid re-fetching per request. */
  protected cachedGroupAuth: { redemptionTime: number, credential: AuthCredentialWithPni } | null = null;

  protected envelopeSender(envelope: Envelope): ServiceId | null {
    if (envelope.sourceServiceIdBinary?.length) {
      return serviceIdFromBinary(envelope.sourceServiceIdBinary);
    }
    return envelope.sourceServiceId ? ServiceId.parse(envelope.sourceServiceId) : null;
  }

  /** The triple-ratchet session layer, built once from `aciStore` + our kyber
   * last-resort prekey, then reused (restoring persisted SPQR halves the first time). */
  protected getSessions(): SignalSessions {
    if (this.sessions) {
      return this.sessions;
    }
    if (!this.aciStore || !this.kyberLastResort) {
      throw new Error("Signal account not set up (no store / kyber prekey)");
    }
    this.sessions = this.sessionsJSON
      ? SignalSessions.fromJSON(this.sessionsJSON, this.aciStore, this.kyberLastResort.keyPair)
      : new SignalSessions(this.aciStore, this.kyberLastResort.keyPair);
    this.sessionsJSON = null;
    return this.sessions;
  }

  /** The peer-device address the store/session layer key on: `"<serviceId>.<deviceId>"`. */
  protected deviceAddress(serviceId: ServiceId, deviceId: number): string {
    return `${serviceId.toString()}.${deviceId}`;
  }

  /** Decrypt an Envelope's content to a `Content`. Handles sealed sender
   * (UNIDENTIFIED_SENDER → unwrap → inner type+body+sender) and the plain
   * PQXDH/Double-Ratchet/SPQR triple ratchet (DoubleRatchet=`msg`,
   * PreKeyMessage=`pkmsg`), then strips the 0x80 padding (Docs/03, 08).
   * Routes a `callMessage` to the dependent calling layer and returns null. */
  protected async decryptEnvelope(envelope: Envelope): Promise<{ content: ContentType, sender: ServiceId, deviceID: number } | null> {
    if (envelope.type == EnvelopeType.ServerDeliveryReceipt) {
      return null;
    }
    let info = this.resolveCiphertext(envelope);
    if (!info) {
      console.log(`Signal: envelope type ${envelope.type} (sealed=${envelope.type == EnvelopeType.UnidentifiedSender}) resolved to no ciphertext — DROPPED`);
      return null;
    }
    let address = this.deviceAddress(info.sender, info.deviceID);
    let padded: Uint8Array;
    try {
      padded = await this.getSessions().decryptContent(address, info.type, info.body);
    } catch (ex) {
      // UNKNOWN (live-confirm): our triple-ratchet + sealed-sender wire bytes are
      // bit-exact in offline round-trips, but a real Signal peer is their first live
      // test. A failure HERE pinpoints the remaining wire detail — log everything.
      console.warn("Signal DECRYPT FAILED:", "envelopeType", envelope.type,
        "sealedSender", envelope.type == EnvelopeType.UnidentifiedSender,
        "from", info.sender.toString(), "device", info.deviceID,
        "ciphertextType", info.type, "len", info.body.length,
        "→", (ex as any)?.message ?? ex);
      throw ex;
    }
    console.log(`Signal: decryptContent OK (${padded.length}b) from ${info.sender.toString()} — decoding Content`);
    let content = decode(Content, unpadContent(padded));
    console.log(`Signal: Content decoded — dataMessage=${!!content.dataMessage} body=${content.dataMessage?.body ? JSON.stringify(content.dataMessage.body.slice(0, 40)) : "none"} sync=${!!content.syncMessage} call=${!!content.callMessage}`);
    if (content.callMessage) {
      this.handleCallMessage(content, info.sender, info.deviceID);
      return null;
    }
    // Return the sender from the decrypted ciphertext (info.sender) — for sealed
    // sender the Envelope itself carries NO source, so the caller must use this.
    return { content, sender: info.sender, deviceID: info.deviceID };
  }

  /** Resolve an Envelope to its inner ciphertext: the sender ServiceId + device,
   * the CiphertextMessage kind (`pkmsg`/`msg`), and the ciphertext body —
   * unwrapping sealed sender (v1/v2) when present. */
  protected resolveCiphertext(envelope: Envelope):
      { sender: ServiceId, deviceID: number, type: "pkmsg" | "msg", body: Uint8Array } | null {
    if (envelope.type == EnvelopeType.UnidentifiedSender) {
      if (!envelope.content?.length || !this.aciStore) {
        console.log(`Signal: sealed-sender envelope missing content (${envelope.content?.length ?? 0}b) or no aciStore (${!!this.aciStore}) — DROPPED`);
        return null;
      }
      let result;
      try {
        result = sealedSenderDecrypt(envelope.content, this.aciStore.identityKeyPair, kSignalTrustRoot, BigInt(Date.now()));
      } catch (ex) {
        console.warn("Signal: sealed-sender unwrap FAILED:", (ex as any)?.message ?? ex);
        throw ex;
      }
      let type = result.type == CiphertextType.PreKey ? "pkmsg" as const
        : result.type == CiphertextType.Whisper ? "msg" as const : null;
      console.log(`Signal: sealed-sender from ${result.sender.senderUuid}.${result.sender.senderDeviceId} → inner type ${result.type} (${type ?? "UNHANDLED"})`);
      if (!type) {
        return null; // SenderKey (group) / Plaintext are routed elsewhere
      }
      return {
        sender: ServiceId.parse(result.sender.senderUuid),
        deviceID: result.sender.senderDeviceId,
        type, body: result.content,
      };
    }
    let sender = this.envelopeSender(envelope);
    if (!sender || !envelope.content?.length) {
      console.log(`Signal: unsealed envelope type ${envelope.type} missing sender (${!!sender}) or content (${envelope.content?.length ?? 0}b) — DROPPED`);
      return null;
    }
    let type = envelope.type == EnvelopeType.PreKeyMessage ? "pkmsg" as const
      : envelope.type == EnvelopeType.DoubleRatchet ? "msg" as const : null;
    if (!type) {
      console.log(`Signal: unsealed envelope type ${envelope.type} is not pkmsg/msg — DROPPED`);
      return null;
    }
    return { sender, deviceID: envelope.sourceDeviceId ?? 1, type, body: envelope.content };
  }

  /** Hook: a decrypted `Content.callMessage` (RingRTC signaling). Forwards the raw
   * `callMessage` bytes (field 3) to the dependent Meet account, which parses + drives
   * the call (mirrors WhatsAppAccount routing a `<call>` stanza to its Meet account). */
  protected handleCallMessage(content: ContentType, sender: ServiceId, senderDeviceID: number): void {
    if (content.callMessage?.length) {
      this.meetAccount?.handleCallMessage(content.callMessage, sender, senderDeviceID);
    }
  }

  // --- outbound ---

  /** Encrypt `content` to every device of every recipient and PUT it (Docs/01 §5,
   * Docs/03/08). The `Content` is serialized + 0x80-padded once, then triple-ratchet
   * encrypted *per device* (establishing a PQXDH session from a fetched bundle when
   * we have none) and delivered as one `/v1/messages` PUT per recipient ServiceId.
   * Sends authenticated (non-sealed) for the first cut; receive handles both. */
  async sendContent(recipients: ServiceId[], content: ContentType, timestamp: number): Promise<void> {
    let padded = padContent(encode(Content, content));
    for (let serviceId of recipients) {
      try {
        await this.sendToRecipient(serviceId, padded, timestamp);
      } catch (ex) {
        this.errorCallback(ex);
      }
    }
    this.scheduleSave(); // encrypting advanced the ratchet
  }

  /** Encrypt the padded Content to each of a recipient's devices and PUT the
   * per-device messages. Handles 409 (missing/extra devices) and 410 (stale
   * registration ids) minimally: log + re-shape the device set + one retry. */
  protected async sendToRecipient(serviceId: ServiceId, padded: Uint8Array, timestamp: number): Promise<void> {
    let deviceIDs = await this.deviceIDsFor(serviceId);
    let messages = await this.encryptForDevices(serviceId, deviceIDs, padded);
    try {
      await this.putMessages(serviceId, { messages, timestamp, online: false, urgent: true });
    } catch (ex) {
      let retry = await this.handleDeviceMismatch(serviceId, ex);
      if (!retry) {
        throw ex;
      }
      messages = await this.encryptForDevices(serviceId, retry, padded);
      await this.putMessages(serviceId, { messages, timestamp, online: false, urgent: true });
    }
  }

  /** Build one `/v1/messages` JSON entry per device, establishing a PQXDH session
   * (from a fetched prekey bundle) for any device we have no session with. */
  protected async encryptForDevices(serviceId: ServiceId, deviceIDs: number[], padded: Uint8Array): Promise<OutgoingMessage[]> {
    let sessions = this.getSessions();
    let messages: OutgoingMessage[] = [];
    for (let deviceID of deviceIDs) {
      let address = this.deviceAddress(serviceId, deviceID);
      let registrationID = this.deviceRegistrationID.get(address) ?? 0;
      if (!sessions.hasSession(address)) {
        let fetched = await this.fetchPreKeyBundle(serviceId, deviceID);
        sessions.initiate(address, fetched.bundle, fetched.kyberPreKey);
        registrationID = fetched.bundle.registrationID;
        this.deviceRegistrationID.set(address, registrationID);
      }
      let encrypted = await sessions.encryptContent(address, padded);
      messages.push({
        type: encrypted.type == "pkmsg" ? EnvelopeType.PreKeyMessage : EnvelopeType.DoubleRatchet,
        destinationDeviceId: deviceID,
        destinationRegistrationId: registrationID,
        content: base64Encode(encrypted.body),
      });
    }
    return messages;
  }

  /** Inspect a 409/410 from `/v1/messages` and return the device set to retry, or
   * null if the error isn't a recoverable device mismatch. 410 stale ⇒ drop those
   * sessions so the retry re-fetches fresh bundles (Docs/01 §5.3). */
  protected async handleDeviceMismatch(serviceId: ServiceId, ex: any): Promise<number[] | null> {
    let status = ex?.status;
    let body = ex?.body;
    if (status == 409 && body) {
      let current = await this.deviceIDsFor(serviceId);
      let missing: number[] = body.missingDevices ?? [];
      let extra: number[] = body.extraDevices ?? [];
      let next = [...new Set([...current, ...missing])].filter(id => !extra.includes(id));
      console.warn(`Signal: 409 mismatched devices for ${serviceId} — retrying with`, next);
      return next;
    }
    if (status == 410 && body?.staleDevices?.length) {
      for (let deviceID of body.staleDevices) {
        this.aciStore?.sessions.delete(this.deviceAddress(serviceId, deviceID));
      }
      console.warn(`Signal: 410 stale devices for ${serviceId} — rebuilding`, body.staleDevices);
      return await this.deviceIDsFor(serviceId);
    }
    return null;
  }

  /** Recipient device ids to target. Start with the primary device (1); a full
   * implementation learns the rest from 409 responses / the keys endpoint. */
  protected async deviceIDsFor(serviceId: ServiceId): Promise<number[]> {
    void serviceId;
    return [1];
  }

  /** Recipient device registration ids learned from fetched bundles (needed for
   * the `/v1/messages` `destinationRegistrationId`). */
  protected readonly deviceRegistrationID = new Map<string, number>();

  /** Fetch a device's prekey bundle (GET /v2/keys/{serviceId}/{deviceId}), parse
   * the JSON to a `PreKeyBundle` + its Kyber prekey (Docs/01). Overridable for tests. */
  protected async fetchPreKeyBundle(serviceId: ServiceId, deviceID: number): Promise<FetchedBundle> {
    let json = await this.api().json<PreKeyResponse>(
      "GET", `/v2/keys/${serviceId.toString()}/${deviceID}`, undefined, this.authCredentials());
    return parsePreKeyResponse(json, deviceID);
  }

  /** PUT a `/v1/messages/{serviceId}` body over the websocket REST (Docs/01 §5).
   * Throws a {@link SignalHttpError}-shaped error on 409/410. Overridable for tests. */
  protected async putMessages(serviceId: ServiceId, body: OutgoingMessageList): Promise<void> {
    if (!this.connection) {
      throw new Error("Signal not connected");
    }
    let res = await this.connection.request("PUT", `/v1/messages/${serviceId.toString()}?story=false`,
      new TextEncoder().encode(JSON.stringify(body)), ["content-type:application/json"]);
    if (res.status == 409 || res.status == 410) {
      let parsed = res.body ? JSON.parse(new TextDecoder().decode(res.body)) : undefined;
      throw { status: res.status, body: parsed };
    }
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Signal send failed: HTTP ${res.status}`);
    }
  }

  // --- contacts / rooms ---

  getContact(serviceId: ServiceId, name?: string): SignalContact {
    let contact = this.getPersonUID(serviceId.toString(), name);
    contact.serviceId = serviceId;
    return contact;
  }

  getOwnContact(): SignalContact {
    if (!this.aci) {
      throw new Error("Signal account has no ACI");
    }
    return this.ownContact ??= this.getContact(this.aci, this.realname);
  }

  async getOrCreateRoom(serviceId: ServiceId): Promise<SignalChatRoom> {
    let key = serviceId.toString();
    let existing = this.rooms.contents.find(room => room.id == key);
    if (existing) {
      return existing;
    }
    let contact = this.getContact(serviceId);
    let room = new Signal1to1ChatRoom(this);
    room.id = key;
    room.contact = contact;
    if (!this.roster.includes(contact)) {
      this.roster.add(contact);
    }
    this.rooms.set(contact, room);
    await room.save();
    this.fetchContactProfile(contact); // background, best-effort
    return room;
  }

  /** Service we lazily build for profile fetch/write (Docs/05). */
  protected profileService: SignalProfile | null = null;
  /** Contacts whose profile we've already fetched this session (avoid refetching). */
  protected readonly fetchedProfiles = new Set<string>();

  /** Fetch + apply a contact's profile (name + avatar) in the background, once per
   * session and only when connected + we have their profile key (Docs/05). Mirrors
   * how WhatsAppContact.fetch / the XMPP vCard fetch populate a contact lazily. */
  fetchContactProfile(contact: SignalContact): void {
    let key = contact.serviceId.toString();
    if (!this.isOnline || !contact.profileKey || this.fetchedProfiles.has(key)) {
      return;
    }
    this.fetchedProfiles.add(key);
    this.profileService ??= new SignalProfile(this);
    this.profileService.fetchProfile(contact).catch(ex => console.error("Signal: profile fetch failed:", ex));
  }

  // --- persistence ---

  protected saveTimer: ReturnType<typeof setTimeout> | null = null;

  /** Debounced persist of the ratchet/key state (copy of WhatsApp's pattern). */
  scheduleSave(): void {
    if (this.saveTimer) {
      return;
    }
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.save().catch(ex => console.error("Signal: failed to persist state:", ex));
    }, 5000);
    (this.saveTimer as any)?.unref?.();
  }

  fromConfigJSON(json: any): void {
    super.fromConfigJSON(json);
    let s = json?.signal;
    if (s?.aci && s?.servicePassword && s?.aciStore) {
      this.aci = ServiceId.parse(s.aci);
      this.pni = s.pni ? ServiceId.parse(s.pni) : null;
      this.e164 = s.e164 ?? null;
      this.deviceID = s.deviceID ?? 1;
      this.servicePassword = s.servicePassword;
      this.profileKey = s.profileKey ? base64Decode(s.profileKey) : null;
      this.masterKey = s.masterKey ? base64Decode(s.masterKey) : null;
      this.storageManifestVersion = s.storageManifestVersion ?? 0;
      this.storageKnownIds = new Set(s.storageKnownIds ?? []);
      for (let hex of s.groupMasterKeys ?? []) {
        this.groupMasterKeys.set(hex, hexToBytes(hex));
      }
      this.aciStore = SignalStore.fromJSON(s.aciStore);
      this.kyberLastResort = kyberFromJSON(s.kyberLastResort);
      this.pniStore = s.pniStore ? SignalStore.fromJSON(s.pniStore) : null;
      this.pniKyberLastResort = kyberFromJSON(s.pniKyberLastResort);
      // Restored on first getSessions() — needs the (also-restored) store + kyber key.
      this.sessionsJSON = s.spqrSessions ?? null;
      this.sessions = null;
      for (let entry of s.deviceRegistrationID ?? []) {
        this.deviceRegistrationID.set(entry.address, entry.registrationID);
      }
    }
  }

  toConfigJSON(): any {
    let json = super.toConfigJSON();
    if (this.aci && this.servicePassword && this.aciStore) {
      json.signal = {
        aci: this.aci.toString(),
        pni: this.pni?.toString(),
        e164: this.e164 ?? undefined,
        deviceID: this.deviceID,
        servicePassword: this.servicePassword,
        profileKey: this.profileKey ? base64Encode(this.profileKey) : undefined,
        masterKey: this.masterKey ? base64Encode(this.masterKey) : undefined,
        storageManifestVersion: this.storageManifestVersion || undefined,
        storageKnownIds: this.storageKnownIds.size ? [...this.storageKnownIds] : undefined,
        groupMasterKeys: this.groupMasterKeys.size ? [...this.groupMasterKeys.keys()] : undefined,
        aciStore: this.aciStore.toJSON(),
        kyberLastResort: kyberToJSON(this.kyberLastResort),
        pniStore: this.pniStore ? this.pniStore.toJSON() : undefined,
        pniKyberLastResort: kyberToJSON(this.pniKyberLastResort),
        // SPQR halves of the triple-ratchet sessions (Double-Ratchet sessions are
        // already inside aciStore). Keep an unbuilt session layer's restored JSON.
        spqrSessions: this.sessions ? this.sessions.toJSON() : this.sessionsJSON ?? undefined,
        deviceRegistrationID: [...this.deviceRegistrationID.entries()].map(([address, registrationID]) => ({ address, registrationID })),
      };
    }
    return json;
  }
}

/** A 17- or 16-byte service-id binary → ServiceId (0x01 prefix = PNI). */
function serviceIdFromBinary(bytes: Uint8Array): ServiceId {
  if (bytes.length == 17) {
    return new ServiceId(bytes[0] == 0x01 ? "pni" : "aci", bytes.subarray(1));
  }
  return ServiceId.aci(bytes);
}

/** Persist a Kyber last-resort prekey (seed + keyID + signature) to config JSON. */
function kyberToJSON(kyber: KyberLastResort | null): any {
  return kyber ? {
    keyID: kyber.keyID,
    seed: base64Encode(kyber.keyPair.seed),
    signature: base64Encode(kyber.signature),
  } : undefined;
}

function kyberFromJSON(json: any): KyberLastResort | null {
  return json ? {
    keyID: json.keyID,
    keyPair: KyberKeyPair.fromSeed(base64Decode(json.seed)),
    signature: base64Decode(json.signature),
  } : null;
}

/** Capabilities a new device/account must advertise (Docs/02 §A.4, §B.5; Docs/05
 * §A.6). `spqr` is required for new devices (HTTP 499 otherwise); the rest match the
 * current server set we support. */
const kSignalCapabilities: { [name: string]: boolean } = {
  spqr: true,
  storage: true,
  attachmentBackfill: true,
  profiles_v2: true,
};

const kSecondsPerDay = 86400;

/** Today's day-aligned redemption time in epoch seconds (group auth, Docs/04 §2). */
function todayRedemptionSeconds(): number {
  return Math.floor(Date.now() / 1000 / kSecondsPerDay) * kSecondsPerDay;
}

/** PUT /v1/devices/link response (Docs/02 §B.5). */
interface LinkDeviceResponse {
  uuid: string;     // the account ACI
  pni: string;      // the account PNI
  deviceId: number; // the assigned device id
}

/** The `DeviceAttributes` block on `/v1/devices/link` (Docs/02 §B.5). */
interface DeviceAttributesJSON {
  fetchesMessages: boolean;
  registrationId: number;
  pniRegistrationId: number;
  name: string | null;
  capabilities: { [name: string]: boolean };
}

/** The ACI + PNI signed/last-resort prekey fields (link + registration). */
interface SignedPreKeyBody {
  aciSignedPreKey: ECSignedPreKeyJSON;
  pniSignedPreKey: ECSignedPreKeyJSON;
  aciPqLastResortPreKey: KEMSignedPreKeyJSON;
  pniPqLastResortPreKey: KEMSignedPreKeyJSON;
}

/** PUT /v2/keys?identity=… body (Docs/02 §C.1). */
interface SetKeysRequestJSON {
  identityKey: string;
  signedPreKey: ECSignedPreKeyJSON;
  preKeys: ECPreKeyJSON[];
  pqLastResortPreKey: KEMSignedPreKeyJSON;
  pqPreKeys?: KEMSignedPreKeyJSON[];
}

/** GET /v1/certificate/auth/group response (Docs/04 §2.1). */
interface GroupCredentialsResponse {
  credentials: { credential: string, redemptionTime: number }[];
  pni?: string;
}

/** One `/v1/messages` per-device entry — the server's `IncomingMessage` entity
 * (Signal-Server entities/IncomingMessage.java): `type`, `destinationDeviceId`,
 * `destinationRegistrationId`, `content` (base64). */
interface OutgoingMessage {
  type: number; // Envelope.Type
  destinationDeviceId: number;
  destinationRegistrationId: number;
  content: string;
}
/** PUT /v1/messages/{destination} body — the server's `IncomingMessageList`
 * (entities/IncomingMessageList.java): `{messages, online, urgent, timestamp}`.
 * The destination is the URL path param, NOT a body field. */
interface OutgoingMessageList {
  messages: OutgoingMessage[];
  online: boolean;
  urgent: boolean;
  timestamp: number;
}

/** A fetched + parsed prekey bundle for one device, ready to start a PQXDH session. */
interface FetchedBundle {
  bundle: PreKeyBundle;
  kyberPreKey: KyberPreKeyBundle;
}

/** GET /v2/keys/{serviceId}/{deviceId} response (Docs/01). Keys are base64; the
 * 32-byte public keys are DJB-framed (0x05 ‖ key) on the wire. */
interface PreKeyResponse {
  identityKey: string;
  devices: PreKeyResponseDevice[];
}
interface PreKeyResponseDevice {
  deviceId: number;
  registrationId: number;
  signedPreKey: { keyId: number, publicKey: string, signature: string };
  preKey?: { keyId: number, publicKey: string };
  pqPreKey?: { keyId: number, publicKey: string, signature: string };
}

/** Strip the DJB type byte (0x05) from a 33-byte EC public key → 32 raw bytes. */
function unframeDjb(key: Uint8Array): Uint8Array {
  return key.length == 33 ? key.subarray(1) : key;
}

/** Parse a `/v2/keys` JSON response for one device into a `PreKeyBundle` + its
 * Kyber prekey, as the session layer expects (raw 32-byte EC keys). */
function parsePreKeyResponse(json: PreKeyResponse, deviceID: number): FetchedBundle {
  let device = json.devices.find(d => d.deviceId == deviceID) ?? json.devices[0];
  if (!device) {
    throw new Error("Signal: prekey response has no device");
  }
  if (!device.pqPreKey) {
    throw new Error("Signal: prekey response has no kyber prekey (PQXDH required)");
  }
  let bundle = new PreKeyBundle();
  bundle.registrationID = device.registrationId;
  bundle.identityKey = unframeDjb(base64Decode(json.identityKey));
  bundle.signedPreKeyID = device.signedPreKey.keyId;
  bundle.signedPreKeyPublic = unframeDjb(base64Decode(device.signedPreKey.publicKey));
  bundle.signedPreKeySignature = base64Decode(device.signedPreKey.signature);
  if (device.preKey) {
    bundle.preKeyID = device.preKey.keyId;
    bundle.preKeyPublic = unframeDjb(base64Decode(device.preKey.publicKey));
  }
  let kyberPreKey = new KyberPreKeyBundle(
    device.pqPreKey.keyId, base64Decode(device.pqPreKey.publicKey), base64Decode(device.pqPreKey.signature));
  return { bundle, kyberPreKey };
}
