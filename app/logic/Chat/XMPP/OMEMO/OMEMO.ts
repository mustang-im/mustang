/** XEP-0384 OMEMO end-to-end encryption for an XMPP account.
 *
 * OMEMO is the Signal protocol (X3DH + Double Ratchet) carried over XMPP: each
 * message is encrypted once per recipient *device*. We reuse our Signal stack
 * (shared with WhatsApp, under Chat/WhatsApp/Crypto) unchanged except for an
 * opt-out of WhatsApp's extra padding — OMEMO uses plain libsignal framing.
 *
 * We speak the legacy `eu.siacs.conversations.axolotl` ("OMEMO 0.3") format,
 * which is what Conversations and the other popular clients interoperate on, and
 * which the `stanza` library serializes for us (so this class only does the
 * crypto and PEP, not the XML). Wire details and intentional deviations from the
 * XEP are in XMPP-deviations.md.
 *
 * Whether to encrypt a given message is the chat room's decision; this class
 * only does the crypto. */
import type { XMPPAccount } from "../XMPPAccount";
import { OMEMODevice } from "./OMEMODevice";
import { SignalStore } from "../../WhatsApp/Crypto/Signal/Store";
import { PreKeyBundle } from "../../WhatsApp/Crypto/Signal/Identity";
import { initiateSession, encrypt as signalEncrypt, decryptSignalMessage, decryptPreKeyMessage } from "../../WhatsApp/Crypto/Signal/SessionCipher";
import { djbEncode, djbDecode } from "../../WhatsApp/Crypto/curve";
import { aesGCMEncrypt, aesGCMDecrypt, randomBytes, concatBytes } from "../../WhatsApp/Crypto/primitives";
import { NS_OMEMO_AXOLOTL_DEVICELIST, NS_OMEMO_AXOLOTL_BUNDLES, NS_OMEMO_AXOLOTL_BUNDLE } from "stanza/Namespaces";
import { Buffer } from "stanza/platform";
import type { OMEMO as OMEMOEncrypted, OMEMODevice as OMEMOBundle, OMEMODeviceList } from "stanza/protocol";

export class OMEMO {
  readonly account: XMPPAccount;
  /** Our long-term identity, prekeys, and per-device sessions. */
  store: SignalStore;
  /** Our own OMEMO device ID, announced in our device list. */
  deviceID: number;
  /** Known devices per bare JID (ours included). Refreshed from PEP. */
  protected readonly devicesByJID = new Map<string, OMEMODevice[]>();
  protected saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(account: XMPPAccount) {
    this.account = account;
  }

  protected get client() {
    return this.account.client;
  }
  /** Our own bare JID */
  protected get jid(): string {
    return this.account.jid;
  }

  /** Creates our identity and prekeys on first use. */
  generateKeys(): void {
    this.store = SignalStore.createNew();
    this.deviceID = generateDeviceID();
  }

  /** After login: make sure our device and bundle are published, so others can
   * encrypt to us. */
  async publishOwnKeys(): Promise<void> {
    if (!this.store) {
      this.generateKeys();
    }
    await this.publishDeviceList();
    await this.publishBundle();
    this.save();
  }

  // --- encryption ---

  /** Encrypts `plaintext` for every device of every recipient, plus our own
   * other devices (so they can show what we sent). With `includePayload` false
   * this is a key-transport message (no body), used to set up sessions.
   * @param recipientJIDs bare JIDs */
  async encrypt(recipientJIDs: string[], plaintext: Uint8Array, includePayload = true): Promise<OMEMOEncrypted> {
    let aesKey = randomBytes(16);
    let iv = randomBytes(12);
    let payload: Uint8Array | undefined;
    let keyMaterial: Uint8Array;
    if (includePayload) {
      let encrypted = await aesGCMEncrypt(aesKey, iv, plaintext); // ciphertext || 16-byte tag
      payload = encrypted.subarray(0, encrypted.length - 16);
      let tag = encrypted.subarray(encrypted.length - 16);
      keyMaterial = concatBytes(aesKey, tag); // the 32 bytes each device gets
    } else {
      keyMaterial = randomBytes(32);
    }

    let recipients = new Set([...recipientJIDs.map(jid => this.account.bareJID(jid)), this.jid]);
    let keys: OMEMOEncrypted["header"]["keys"] = [];
    for (let jid of recipients) {
      for (let device of await this.knownDevices(jid)) {
        if (device.broken || (device.jid == this.jid && device.id == this.deviceID)) {
          continue; // skip unusable devices and our own current device
        }
        try {
          await this.ensureSession(device);
          let signal = await signalEncrypt(this.store, device.address, keyMaterial, false);
          // stanza only base64-encodes Buffers (a Uint8Array would be stringified)
          keys.push({ rid: device.id, value: Buffer.from(signal.body), preKey: signal.type == "pkmsg" || undefined });
        } catch (ex) {
          device.broken = true; // can't reach this device; encrypt to the others
          this.account.errorCallback(ex);
        }
      }
    }
    if (!keys.length) {
      throw new Error("No OMEMO devices to encrypt to");
    }
    this.save();
    return { header: { sid: this.deviceID, iv: Buffer.from(iv), keys }, payload: payload && Buffer.from(payload) };
  }

  /** Decrypts an incoming `<encrypted>` addressed to us.
   * @returns the plaintext, or null if it isn't for our device or carries no
   * body (a key-transport / session-setup message). */
  async decrypt(message: OMEMOEncrypted, fromJID: string): Promise<Uint8Array | null> {
    if (!this.store) {
      this.generateKeys();
    }
    let ourKey = message.header.keys.find(key => key.rid == this.deviceID);
    if (!ourKey) {
      return null; // not encrypted for this device
    }
    let sender = new OMEMODevice(this.account.bareJID(fromJID), message.header.sid);
    this.rememberDevice(sender);
    let keyMaterial = ourKey.preKey
      ? await decryptPreKeyMessage(this.store, sender.address, ourKey.value, false)
      : await decryptSignalMessage(this.store, sender.address, ourKey.value, false);
    if (ourKey.preKey) {
      // The sender consumed one of our one-time prekeys; mint a replacement.
      this.replenishBundle().catch(ex => this.account.errorCallback(ex));
    }
    this.save();
    if (!message.payload) {
      return null; // key-transport message: session is now set up, nothing to show
    }
    // Standard (Conversations et al.): the 16-byte GCM tag is appended to the AES
    // key in the key material, and the payload is the tag-less ciphertext. Some
    // clients instead leave the tag on the payload (key material is just the
    // 16-byte AES key); GCM wants `ciphertext || tag`, so reassemble accordingly.
    let aesKey: Uint8Array, ciphertext: Uint8Array;
    if (keyMaterial.length == 16) {
      aesKey = keyMaterial;
      ciphertext = message.payload;
    } else {
      aesKey = keyMaterial.subarray(0, keyMaterial.length - 16);
      ciphertext = concatBytes(message.payload, keyMaterial.subarray(keyMaterial.length - 16));
    }
    return new Uint8Array(await aesGCMDecrypt(aesKey, message.header.iv, ciphertext));
  }

  // --- sessions and devices ---

  protected async ensureSession(device: OMEMODevice): Promise<void> {
    if (this.store.sessions.has(device.address)) {
      return;
    }
    let bundle = await this.fetchBundle(device);
    initiateSession(this.store, device.address, toPreKeyBundle(bundle));
  }

  /** All OMEMO device IDs of a user, from their PEP device list (cached). */
  async knownDevices(jid: string): Promise<OMEMODevice[]> {
    jid = this.account.bareJID(jid);
    let cached = this.devicesByJID.get(jid);
    if (cached) {
      return cached;
    }
    let devices = (await this.fetchDeviceIDs(jid)).map(id => new OMEMODevice(jid, id));
    this.devicesByJID.set(jid, devices);
    return devices;
  }

  /** A contact (or our own account) published a new device list. */
  onDeviceListChanged(jid: string, deviceIDs: number[]): void {
    jid = this.account.bareJID(jid);
    let existing = this.devicesByJID.get(jid) ?? [];
    let devices = deviceIDs.map(id =>
      existing.find(device => device.id == id) ?? new OMEMODevice(jid, id));
    this.devicesByJID.set(jid, devices);
  }

  protected rememberDevice(device: OMEMODevice): void {
    let devices = this.devicesByJID.get(device.jid);
    if (!devices) {
      this.devicesByJID.set(device.jid, [device]);
    } else if (!devices.some(d => d.id == device.id)) {
      devices.push(device);
    }
  }

  protected async fetchDeviceIDs(jid: string): Promise<number[]> {
    try {
      let result = await this.client.getItems<OMEMODeviceList>(jid, NS_OMEMO_AXOLOTL_DEVICELIST);
      return result.items?.[0]?.content?.devices ?? [];
    } catch (ex) {
      return []; // no device list = contact doesn't use OMEMO
    }
  }

  protected async fetchBundle(device: OMEMODevice): Promise<OMEMOBundle> {
    let result = await this.client.getItems<OMEMOBundle>(device.jid, NS_OMEMO_AXOLOTL_BUNDLE(String(device.id)));
    let bundle = result.items?.[0]?.content;
    if (!bundle) {
      throw new Error(`No OMEMO bundle for ${device.address}`);
    }
    return bundle;
  }

  // --- publishing our own keys ---

  protected async publishDeviceList(): Promise<void> {
    let ids = await this.fetchDeviceIDs(this.jid);
    if (!ids.includes(this.deviceID)) {
      ids.push(this.deviceID); // add ourselves without clobbering our other devices
    }
    await this.client.publish<OMEMODeviceList>("", NS_OMEMO_AXOLOTL_DEVICELIST,
      { itemType: NS_OMEMO_AXOLOTL_DEVICELIST, devices: ids }, "current");
  }

  protected async publishBundle(): Promise<void> {
    await this.client.publish<OMEMOBundle>("", NS_OMEMO_AXOLOTL_BUNDLE(String(this.deviceID)),
      this.buildOwnBundle(), "current");
  }

  /** Tops our one-time prekeys back up and republishes the bundle, after peers
   * consumed some. */
  protected async replenishBundle(): Promise<void> {
    this.store.replenishPreKeys();
    await this.publishBundle();
    this.save();
  }

  protected buildOwnBundle(): OMEMOBundle {
    let signed = [...this.store.signedPreKeys.values()][0];
    return {
      itemType: NS_OMEMO_AXOLOTL_BUNDLES,
      identityKey: Buffer.from(djbEncode(this.store.identityKeyPair.publicKey)),
      signedPreKeyPublic: { id: signed.keyID, value: Buffer.from(djbEncode(signed.keyPair.publicKey)) },
      signedPreKeySignature: Buffer.from(signed.signature),
      preKeys: [...this.store.preKeys.values()].map(preKey => ({
        id: preKey.keyID,
        value: Buffer.from(djbEncode(preKey.keyPair.publicKey)),
      })),
    } as OMEMOBundle;
  }

  // --- persistence (in the account config JSON) ---

  /** Debounced: persist our keys and ratchet state after they change. */
  protected save(): void {
    if (this.saveTimer) {
      return;
    }
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.account.save().catch(ex => this.account.errorCallback(ex));
    }, 2000);
  }

  toJSON(): any {
    return {
      deviceID: this.deviceID,
      store: this.store?.toJSON(),
    };
  }

  fromJSON(json: any): void {
    if (!json?.store) {
      return;
    }
    this.deviceID = json.deviceID;
    this.store = SignalStore.fromJSON(json.store);
  }
}

/** Picks one of the published one-time prekeys at random (per XEP-0384, to avoid
 * everyone grabbing the same one) and builds the libsignal bundle to start a
 * session with this device. The published keys are in the 33-byte `0x05 || key`
 * form; `djbDecode()` strips that to the 32-byte form our Signal code uses. */
function toPreKeyBundle(bundle: OMEMOBundle): PreKeyBundle {
  let result = new PreKeyBundle();
  result.registrationID = 0; // OMEMO bundles don't carry a registration id
  result.identityKey = djbDecode(new Uint8Array(bundle.identityKey));
  result.signedPreKeyID = bundle.signedPreKeyPublic.id;
  result.signedPreKeyPublic = djbDecode(new Uint8Array(bundle.signedPreKeyPublic.value));
  result.signedPreKeySignature = new Uint8Array(bundle.signedPreKeySignature);
  let preKeys = bundle.preKeys ?? [];
  if (preKeys.length) {
    let preKey = preKeys[Math.floor(Math.random() * preKeys.length)];
    result.preKeyID = preKey.id;
    result.preKeyPublic = djbDecode(new Uint8Array(preKey.value));
  }
  return result;
}

/** A random positive 31-bit integer, per XEP-0384. */
function generateDeviceID(): number {
  let bytes = randomBytes(4);
  let id = ((bytes[0] & 0x7F) << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  return id || 1;
}
