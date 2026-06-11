/** Orchestrates the WhatsApp client connection: the Noise handshake, the
 * encrypted frame transport, and reading/writing binary XMPP stanzas.
 *
 * This ties together the tested lower layers (Noise, WABinary, protobuf). The
 * live network path is GATED behind kWhatsAppLiveEnabled because it cannot be
 * validated against WhatsApp's servers from the build/test environment — the
 * cryptographic and encoding pieces it depends on are unit-tested, but the full
 * end-to-end handshake against the real server still needs live iteration
 * (current app-version string, edge-routing, prekey upload, success/failure
 * handling). Enabling it also requires the backend TCP factory that
 * createWhatsAppTransport() expects. */
import { NoiseHandshake, NoiseTransport } from "./Crypto/Noise";
import { KeyPair } from "./Crypto/KeyPair";
import { xeddsaVerify } from "./Crypto/curve";
import { bytesEqual } from "./Crypto/primitives";
import { WANode } from "./Binary/WANode";
import { encodeNode } from "./Binary/encoder";
import { decodeNode } from "./Binary/decoder";
import {
  encodeHandshakeMessage, decodeHandshakeMessage, encodeClientPayload, decodeCertChain,
  kWaCertPublicKey, type ClientPayload,
} from "./Proto/handshakeSchema";
import { protobufField } from "./Proto/ProtobufLite";
import { appGlobal } from "../../app";

export class WhatsAppConnection {
  protected transport: WhatsAppTransport;
  protected noise = new NoiseHandshake();
  protected cipher: NoiseTransport | null = null;
  protected keys: ConnectionKeys;
  /** Bytes received but not yet split into complete frames. */
  protected inbound = new Uint8Array(0);
  protected sentHeader = false;
  protected iqCounter = 0;
  protected pendingIQs = new Map<string, (node: WANode) => void>();

  /** Called for every incoming stanza that is not an IQ response. */
  onStanza: (node: WANode) => void = () => undefined;

  constructor(keys: ConnectionKeys) {
    this.keys = keys;
  }

  /** Performs the Noise handshake and sends the ClientPayload. `buildPayload`
   * returns the ClientPayload protobuf object (login or registration form). */
  async connect(buildPayload: () => ClientPayload): Promise<void> {
    if (!kWhatsAppLiveEnabled) {
      throw new Error("WhatsApp live connection is disabled");
    }
    this.transport = await createWhatsAppTransport();
    this.transport.onData(data => this.onTransportData(data));
    this.transport.onClose(() => this.onStanza(new WANode("stream:error")));
    await this.transport.connect();

    let clientEphemeral = KeyPair.generate();
    this.noise.start(kConnectionHeader);
    this.noise.mixHash(clientEphemeral.publicKey);

    let clientHello = encodeHandshakeMessage({ clientHello: { ephemeral: clientEphemeral.publicKey } });
    await this.sendFrame(clientHello, true);

    let serverHelloFrame = await this.readHandshakeFrame();
    let serverHello = decodeHandshakeMessage(serverHelloFrame).serverHello!;

    this.noise.mixHash(serverHello.ephemeral);
    await this.noise.mixKeyDH(clientEphemeral.privateKey, serverHello.ephemeral);
    let serverStatic = await this.noise.decryptAndHash(serverHello.static!);
    await this.noise.mixKeyDH(clientEphemeral.privateKey, serverStatic);
    let certPayload = await this.noise.decryptAndHash(serverHello.payload!);
    this.verifyServerCertificate(certPayload, serverStatic);

    let encStatic = await this.noise.encryptAndHash(this.keys.noiseKey.publicKey);
    await this.noise.mixKeyDH(this.keys.noiseKey.privateKey, serverHello.ephemeral!);
    let payloadBytes = encodeClientPayload(buildPayload());
    let encPayload = await this.noise.encryptAndHash(payloadBytes);

    let clientFinish = encodeHandshakeMessage({ clientFinish: { static: encStatic, payload: encPayload } });
    await this.sendFrame(clientFinish, false);

    let split = this.noise.split();
    this.cipher = new NoiseTransport(split.write, split.read);
    // The first encrypted frame is the <success> or <failure> stanza, handled
    // by the read loop via onStanza.
  }

  /** Verifies the server's static key against WhatsApp's pinned root certificate. */
  protected verifyServerCertificate(certPayload: Uint8Array, serverStatic: Uint8Array) {
    let chain = decodeCertChain(certPayload);
    let intermediate = chain.intermediate!;
    let leaf = chain.leaf!;
    if (!xeddsaVerify(kWaCertPublicKey, intermediate.details!, intermediate.signature!)) {
      throw new Error("WhatsApp intermediate certificate signature invalid");
    }
    // The leaf cert's pinned key (Details field 3) must equal the server static key.
    let leafKey = protobufField(leaf.details!, 3);
    if (!leafKey || !bytesEqual(leafKey, serverStatic)) {
      throw new Error("WhatsApp server key does not match its certificate");
    }
  }

  /** Sends a binary XMPP stanza over the encrypted transport. */
  async sendNode(node: WANode): Promise<void> {
    if (!this.cipher) {
      throw new Error("Not connected");
    }
    let body = new Uint8Array(1 + encodeNode(node).length);
    body[0] = 0; // flag byte: not compressed
    body.set(encodeNode(node), 1);
    await this.sendFrame(await this.cipher.encrypt(body), false);
  }

  /** Sends an IQ and resolves with the matching response stanza. */
  async sendIQ(node: WANode): Promise<WANode> {
    let id = node.attrs.id ?? this.nextIQID();
    node.attrs.id = id;
    let response = new Promise<WANode>(resolve => this.pendingIQs.set(id, resolve));
    await this.sendNode(node);
    return await response;
  }

  nextIQID(): string {
    return `${Date.now()}-${this.iqCounter++}`;
  }

  protected async sendFrame(payload: Uint8Array, withHeader: boolean) {
    let headerLength = withHeader && !this.sentHeader ? kConnectionHeader.length : 0;
    let frame = new Uint8Array(headerLength + 3 + payload.length);
    let offset = 0;
    if (headerLength) {
      frame.set(kConnectionHeader, 0);
      offset = kConnectionHeader.length;
      this.sentHeader = true;
    }
    frame[offset] = (payload.length >> 16) & 0xFF;
    frame[offset + 1] = (payload.length >> 8) & 0xFF;
    frame[offset + 2] = payload.length & 0xFF;
    frame.set(payload, offset + 3);
    await this.transport.send(frame);
  }

  protected handshakeResolver: ((frame: Uint8Array) => void) | null = null;

  /** Waits for the next complete (still unencrypted) handshake frame. */
  protected readHandshakeFrame(): Promise<Uint8Array> {
    return new Promise(resolve => this.handshakeResolver = resolve);
  }

  protected onTransportData(data: Uint8Array) {
    let combined = new Uint8Array(this.inbound.length + data.length);
    combined.set(this.inbound);
    combined.set(data, this.inbound.length);
    this.inbound = combined;
    void this.drainFrames();
  }

  protected async drainFrames() {
    while (this.inbound.length >= 3) {
      let length = (this.inbound[0] << 16) | (this.inbound[1] << 8) | this.inbound[2];
      if (this.inbound.length < 3 + length) {
        break;
      }
      let payload = this.inbound.subarray(3, 3 + length);
      this.inbound = this.inbound.subarray(3 + length).slice();
      if (this.handshakeResolver) {
        let resolve = this.handshakeResolver;
        this.handshakeResolver = null;
        resolve(payload.slice());
      } else if (this.cipher) {
        await this.handleEncryptedFrame(payload.slice());
      }
    }
  }

  protected async handleEncryptedFrame(payload: Uint8Array) {
    let body = await this.cipher!.decrypt(payload);
    let flag = body[0];
    let nodeBytes = body.subarray(1);
    if (flag & 0x02) {
      nodeBytes = await inflate(nodeBytes);
    }
    let node = decodeNode(nodeBytes);
    let id = node.attrs.id;
    if (id && this.pendingIQs.has(id)) {
      let resolve = this.pendingIQs.get(id)!;
      this.pendingIQs.delete(id);
      resolve(node);
    } else {
      this.onStanza(node);
    }
  }

  async disconnect() {
    await this.transport?.close();
    this.cipher = null;
  }
}

/** Master switch for the live network path. Off until validated end-to-end. */
export const kWhatsAppLiveEnabled = false;

// Android connection header: "WA" + protocol version 5,2.
const kConnectionHeader = new Uint8Array([0x57, 0x41, 5, 2]);

export interface ConnectionKeys {
  /** Persistent Noise static key (Curve25519). */
  noiseKey: KeyPair;
}

/** A raw byte transport to the WhatsApp server. On Android the real client uses
 * a plain TCP socket to g.whatsapp.net:443 (the Noise layer provides security,
 * so there is no TLS). */
export interface WhatsAppTransport {
  connect(): Promise<void>;
  send(data: Uint8Array): Promise<void>;
  /** Called with each chunk of received bytes. */
  onData(callback: (data: Uint8Array) => void): void;
  onClose(callback: () => void): void;
  close(): Promise<void>;
}

const kWhatsAppServerHost = "g.whatsapp.net";
const kWhatsAppServerPort = 443;

/** Opens the raw socket via the desktop backend's TCP factory. That factory is
 * intentionally not wired yet (the live connection is gated). When enabling: add
 * `createTCPConnection(host, port)` to the desktop backend (a thin net.Socket
 * wrapper exposing connect/write/on('data')/end) and return an adapter here. */
async function createWhatsAppTransport(host = kWhatsAppServerHost, port = kWhatsAppServerPort): Promise<WhatsAppTransport> {
  let create = (appGlobal.remoteApp as any)?.createTCPConnection;
  if (!create) {
    throw new Error("WhatsApp live connection is not enabled in this build");
  }
  return await create(host, port);
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  let stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
