import { NoiseHandshake, NoiseTransport } from "../../../../logic/Chat/WhatsApp/Crypto/Noise";
import { KeyPair } from "../../../../logic/Chat/Signal/Crypto/KeyPair";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

/** Drives both sides of the Noise_XX handshake against each other, to validate
 * the symmetric state (mixHash/mixKey/encrypt/decrypt/split) and the transport
 * cipher end to end. */
test("Noise XX handshake completes and transport round-trips", async () => {
  let header = new Uint8Array([0x57, 0x41, 6, 3]); // "WA", 6, dict version
  let clientStatic = KeyPair.generate();
  let clientEph = KeyPair.generate();
  let serverStatic = KeyPair.generate();
  let serverEph = KeyPair.generate();
  let serverCert = randomBytes(80); // stands in for the CertChain payload
  let clientPayload = new TextEncoder().encode("client-payload-protobuf");

  let client = new NoiseHandshake();
  let server = new NoiseHandshake();
  client.start(header);
  server.start(header);

  // -> e  (ClientHello.ephemeral, cleartext)
  client.mixHash(clientEph.publicKey);
  server.mixHash(clientEph.publicKey);

  // <- e, ee, s, es  (ServerHello)
  server.mixHash(serverEph.publicKey);
  await server.mixKeyDH(serverEph.privateKey, clientEph.publicKey); // ee
  let encServerStatic = await server.encryptAndHash(serverStatic.publicKey);
  await server.mixKeyDH(serverStatic.privateKey, clientEph.publicKey); // es
  let encCert = await server.encryptAndHash(serverCert);

  client.mixHash(serverEph.publicKey);
  await client.mixKeyDH(clientEph.privateKey, serverEph.publicKey); // ee
  let serverStaticGot = await client.decryptAndHash(encServerStatic);
  await client.mixKeyDH(clientEph.privateKey, serverStaticGot); // es
  let certGot = await client.decryptAndHash(encCert);
  expect(bytesEqual(serverStaticGot, serverStatic.publicKey)).toBe(true);
  expect(bytesEqual(certGot, serverCert)).toBe(true);

  // -> s, se  (ClientFinish)
  let encClientStatic = await client.encryptAndHash(clientStatic.publicKey);
  await client.mixKeyDH(clientStatic.privateKey, serverEph.publicKey); // se
  let encPayload = await client.encryptAndHash(clientPayload);

  let clientStaticGot = await server.decryptAndHash(encClientStatic);
  await server.mixKeyDH(serverEph.privateKey, clientStaticGot); // se
  let payloadGot = await server.decryptAndHash(encPayload);
  expect(bytesEqual(clientStaticGot, clientStatic.publicKey)).toBe(true);
  expect(new TextDecoder().decode(payloadGot)).toBe("client-payload-protobuf");

  // split() is from the initiator's perspective and is deterministic, so both
  // parties derive the identical pair; the responder (server) swaps write/read.
  let cSplit = client.split();
  let sSplit = server.split();
  expect(bytesEqual(cSplit.write, sSplit.write)).toBe(true);
  expect(bytesEqual(cSplit.read, sSplit.read)).toBe(true);

  // Transport frames round-trip in both directions.
  let clientTx = new NoiseTransport(cSplit.write, cSplit.read);
  let serverTx = new NoiseTransport(sSplit.read, sSplit.write); // server swaps
  let frame1 = await clientTx.encrypt(new TextEncoder().encode("ping"));
  expect(new TextDecoder().decode(await serverTx.decrypt(frame1))).toBe("ping");
  let frame2 = await serverTx.encrypt(new TextEncoder().encode("pong"));
  expect(new TextDecoder().decode(await clientTx.decrypt(frame2))).toBe("pong");
  // Counters advance independently per direction.
  let frame3 = await clientTx.encrypt(new TextEncoder().encode("second"));
  expect(new TextDecoder().decode(await serverTx.decrypt(frame3))).toBe("second");
});
