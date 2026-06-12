// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import {
  WhatsAppConnection, kConnectionHeader, type WhatsAppTransport,
} from "../../../../logic/Chat/WhatsApp/WhatsAppConnection";
import { getLoginPayload } from "../../../../logic/Chat/WhatsApp/clientInfo";
import { NoiseHandshake, NoiseTransport } from "../../../../logic/Chat/WhatsApp/Crypto/Noise";
import { KeyPair } from "../../../../logic/Chat/WhatsApp/Crypto/KeyPair";
import { xeddsaSign } from "../../../../logic/Chat/WhatsApp/Crypto/curve";
import {
  encodeHandshakeMessage, decodeHandshakeMessage, CertChain, ClientPayload,
} from "../../../../logic/Chat/WhatsApp/Proto/handshakeSchema";
import { encode, decode } from "../../../../logic/Chat/WhatsApp/Proto/codec";
import { ProtoWriter } from "../../../../logic/Chat/WhatsApp/Proto/ProtobufLite";
import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { encodeNode } from "../../../../logic/Chat/WhatsApp/Binary/encoder";
import { decodeNode } from "../../../../logic/Chat/WhatsApp/Binary/decoder";
import { expect, test } from "vitest";

/** These tests drive the REAL WhatsAppConnection (Noise handshake, frame framing,
 * certificate-chain verification, IQ routing) end to end against an in-memory
 * mock that plays WhatsApp's server side of the protocol. No network is touched:
 * the transport is injected, and the pinned root cert key is overridden so a
 * test-generated certificate chain can stand in for WhatsApp's real one. */

/** One end of an in-memory byte pipe. Whatever one end sends, the other receives. */
class MockChannel implements WhatsAppTransport {
  other!: MockChannel;
  protected dataCB: ((data: Uint8Array) => void) | null = null;
  protected closeCB: (() => void) | null = null;

  async connect(): Promise<void> {
  }
  async send(data: Uint8Array): Promise<void> {
    let copy = data.slice();
    queueMicrotask(() => this.other.dataCB?.(copy));
  }
  onData(cb: (data: Uint8Array) => void): void {
    this.dataCB = cb;
  }
  onClose(cb: () => void): void {
    this.closeCB = cb;
  }
  async close(): Promise<void> {
    this.closeCB?.();
  }
}

function linkedChannels(): [MockChannel, MockChannel] {
  let a = new MockChannel();
  let b = new MockChannel();
  a.other = b;
  b.other = a;
  return [a, b];
}

/** A NoiseCertificate.Details protobuf: serial=1, issuerSerial=2 (omitted when 0,
 * like the real root-issued intermediate), key=3. */
function encodeDetails(serial: number, issuerSerial: number, key: Uint8Array): Uint8Array {
  let writer = new ProtoWriter().varint(1, serial);
  if (issuerSerial) {
    writer.varint(2, issuerSerial);
  }
  return writer.bytes(3, key).finish();
}

interface CertOptions {
  /** Sign the leaf with a stranger key instead of the intermediate. */
  breakLeafSignature?: boolean;
  /** Put a key in the leaf that is not the server's actual static key. */
  wrongLeafKey?: boolean;
}

/** Builds a leaf+intermediate chain: root signs the intermediate, the
 * intermediate signs the leaf, and the leaf pins the server's static key. */
function buildCertChain(root: KeyPair, serverStatic: KeyPair, options: CertOptions = {}): Uint8Array {
  let intermediate = KeyPair.generate();
  let intermediateDetails = encodeDetails(100, 0, intermediate.publicKey);
  let intermediateSignature = xeddsaSign(root.privateKey, intermediateDetails);

  let leafKey = options.wrongLeafKey ? KeyPair.generate().publicKey : serverStatic.publicKey;
  let leafDetails = encodeDetails(200, 100, leafKey);
  let leafSigner = options.breakLeafSignature ? KeyPair.generate() : intermediate;
  let leafSignature = xeddsaSign(leafSigner.privateKey, leafDetails);

  return encode(CertChain, {
    leaf: { details: leafDetails, signature: leafSignature },
    intermediate: { details: intermediateDetails, signature: intermediateSignature },
  });
}

/** The WhatsApp server side of the Noise_XX handshake plus a tiny stanza echo. */
class MockWAServer {
  readonly serverStatic = KeyPair.generate();
  protected serverEphemeral = KeyPair.generate();
  protected noise = new NoiseHandshake();
  protected cipher: NoiseTransport | null = null;
  protected gotHeader = false;
  protected sawClientHello = false;
  protected queue: Promise<void> = Promise.resolve();
  protected certChain: Uint8Array;

  /** The ClientPayload bytes we received in the client's handshake finish. */
  receivedClientPayload: Uint8Array | null = null;
  onConnected: (() => void) | null = null;

  constructor(root: KeyPair, options: CertOptions = {}) {
    this.certChain = buildCertChain(root, this.serverStatic, options);
  }

  attach(channel: MockChannel) {
    channel.onData(data => this.onData(channel, data));
  }

  protected onData(channel: MockChannel, data: Uint8Array) {
    let buf = data;
    if (!this.gotHeader) {
      buf = buf.subarray(kConnectionHeader.length); // first frame carries the connection header
      this.gotHeader = true;
    }
    let length = (buf[0] << 16) | (buf[1] << 8) | buf[2];
    let payload = buf.subarray(3, 3 + length).slice();
    this.queue = this.queue.then(() => this.handleFrame(channel, payload));
  }

  protected async handleFrame(channel: MockChannel, payload: Uint8Array) {
    if (this.cipher) {
      return await this.handleStanza(channel, payload);
    }
    if (!this.sawClientHello) {
      this.sawClientHello = true;
      return await this.handleClientHello(channel, payload);
    }
    return await this.handleClientFinish(payload);
  }

  protected async handleClientHello(channel: MockChannel, payload: Uint8Array) {
    let clientEphemeral = decodeHandshakeMessage(payload).clientHello!.ephemeral!;
    this.noise.start(kConnectionHeader);
    this.noise.mixHash(clientEphemeral);
    this.noise.mixHash(this.serverEphemeral.publicKey);
    await this.noise.mixKeyDH(this.serverEphemeral.privateKey, clientEphemeral); // ee
    let encStatic = await this.noise.encryptAndHash(this.serverStatic.publicKey);
    await this.noise.mixKeyDH(this.serverStatic.privateKey, clientEphemeral); // es
    let encCert = await this.noise.encryptAndHash(this.certChain);
    let serverHello = encodeHandshakeMessage({
      serverHello: { ephemeral: this.serverEphemeral.publicKey, static: encStatic, payload: encCert },
    });
    await this.sendFrame(channel, serverHello);
  }

  protected async handleClientFinish(payload: Uint8Array) {
    let finish = decodeHandshakeMessage(payload).clientFinish!;
    let clientStatic = await this.noise.decryptAndHash(finish.static!);
    await this.noise.mixKeyDH(this.serverEphemeral.privateKey, clientStatic); // se
    this.receivedClientPayload = await this.noise.decryptAndHash(finish.payload!);
    let split = this.noise.split();
    this.cipher = new NoiseTransport(split.read, split.write); // server swaps write/read
    this.onConnected?.();
  }

  protected async handleStanza(channel: MockChannel, payload: Uint8Array) {
    let body = await this.cipher!.decrypt(payload);
    let node = decodeNode(body.subarray(1)); // skip the (uncompressed) flag byte
    if (node.attrs.id) {
      await this.sendStanza(channel, new WANode(node.tag, { id: node.attrs.id, type: "result" }));
    }
  }

  protected async sendStanza(channel: MockChannel, node: WANode) {
    let nodeBytes = encodeNode(node);
    let body = new Uint8Array(1 + nodeBytes.length); // body[0] = 0: not compressed
    body.set(nodeBytes, 1);
    await this.sendFrame(channel, await this.cipher!.encrypt(body));
  }

  protected async sendFrame(channel: MockChannel, payload: Uint8Array) {
    let frame = new Uint8Array(3 + payload.length);
    frame[0] = (payload.length >> 16) & 0xFF;
    frame[1] = (payload.length >> 8) & 0xFF;
    frame[2] = payload.length & 0xFF;
    frame.set(payload, 3);
    await channel.send(frame);
  }
}

test("completes the Noise handshake against a mock server and round-trips an IQ", async () => {
  let root = KeyPair.generate();
  let server = new MockWAServer(root);
  let [clientChannel, serverChannel] = linkedChannels();
  server.attach(serverChannel);

  let connection = new WhatsAppConnection({ noiseKey: KeyPair.generate() });
  connection.rootCertKey = root.publicKey; // trust our test root instead of the pinned one
  let serverConnected = new Promise<void>(resolve => server.onConnected = resolve);

  await connection.connect(() => getLoginPayload(491700000000, 0), clientChannel);
  await serverConnected;

  // The server decrypted our ClientPayload, proving the whole handshake matched.
  expect(server.receivedClientPayload).not.toBeNull();
  let payload = decode(ClientPayload, server.receivedClientPayload!);
  expect(payload.username).toBe(491700000000);

  // A full stanza round-trip over the encrypted transport (encode → frame →
  // decrypt → decode on the server, and the reverse for its reply).
  let response = await connection.sendIQ(new WANode("iq", { type: "get", xmlns: "w:p", to: "s.whatsapp.net" }));
  expect(response.tag).toBe("iq");
  expect(response.attrs.type).toBe("result");
});

test("rejects a server certificate not signed by the pinned root", async () => {
  let server = new MockWAServer(KeyPair.generate()); // chain signed by some other root
  let [clientChannel, serverChannel] = linkedChannels();
  server.attach(serverChannel);

  let connection = new WhatsAppConnection({ noiseKey: KeyPair.generate() });
  // rootCertKey left at the real pinned key, which did not sign this chain.
  await expect(connection.connect(() => getLoginPayload(1, 0), clientChannel))
    .rejects.toThrow(/intermediate certificate signature invalid/);
});

test("rejects a leaf certificate not signed by the intermediate", async () => {
  let root = KeyPair.generate();
  let server = new MockWAServer(root, { breakLeafSignature: true });
  let [clientChannel, serverChannel] = linkedChannels();
  server.attach(serverChannel);

  let connection = new WhatsAppConnection({ noiseKey: KeyPair.generate() });
  connection.rootCertKey = root.publicKey;
  await expect(connection.connect(() => getLoginPayload(1, 0), clientChannel))
    .rejects.toThrow(/leaf certificate signature invalid/);
});

test("rejects when the leaf certificate key is not the server's static key", async () => {
  let root = KeyPair.generate();
  let server = new MockWAServer(root, { wrongLeafKey: true });
  let [clientChannel, serverChannel] = linkedChannels();
  server.attach(serverChannel);

  let connection = new WhatsAppConnection({ noiseKey: KeyPair.generate() });
  connection.rootCertKey = root.publicKey;
  await expect(connection.connect(() => getLoginPayload(1, 0), clientChannel))
    .rejects.toThrow(/server key does not match its certificate/);
});
