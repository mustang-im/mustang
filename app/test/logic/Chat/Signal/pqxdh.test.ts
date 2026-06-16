/** PQXDH session establishment: full clean-room round-trip.
 * Alice initiates a post-quantum X3DH session to Bob's bundle (incl. a Kyber
 * prekey), sends the first message in a kyber-carrying `pkmsg`; Bob decapsulates
 * and decrypts it; then both directions flow over the ongoing Double Ratchet. */
import { SignalStore } from "../../../../logic/Chat/Signal/Crypto/Store";
import { PreKeyBundle, generateSignedPreKey } from "../../../../logic/Chat/Signal/Crypto/Identity";
import { djbEncode } from "../../../../logic/Chat/Signal/Crypto/curve";
import { encrypt, decryptSignalMessage } from "../../../../logic/Chat/Signal/Crypto/SessionCipher";
import { KyberKeyPair } from "../../../../logic/Chat/Signal/Encryption/kyber";
import {
  initiatePqxdhSession, encryptPqxdh, decryptPqxdhPreKeyMessage,
  KyberPreKeyBundle, signKyberPreKey, verifyKyberPreKey,
  serializePqPreKeyMessage, parsePqPreKeyMessage,
} from "../../../../logic/Chat/Signal/Encryption/pqxdh";
import { bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

const td = new TextEncoder();
const ts = new TextDecoder();

/** Builds a PreKeyBundle (with a one-time prekey) from a store, as a server
 * would publish it, plus the matching Kyber prekey. */
function makeBundle(store: SignalStore): { bundle: PreKeyBundle, kyberPreKey: KyberPreKeyBundle, kyberKeyPair: KyberKeyPair } {
  let signed = store.signedPreKeys.get(1)!;
  let oneTime = [...store.preKeys.values()][0];
  let bundle = new PreKeyBundle();
  bundle.registrationID = store.registrationID;
  bundle.identityKey = store.identityKeyPair.publicKey;
  bundle.signedPreKeyID = signed.keyID;
  bundle.signedPreKeyPublic = signed.keyPair.publicKey;
  bundle.signedPreKeySignature = signed.signature;
  bundle.preKeyID = oneTime.keyID;
  bundle.preKeyPublic = oneTime.keyPair.publicKey;

  let kyberKeyPair = KyberKeyPair.generate();
  let signature = signKyberPreKey(store.identityKeyPair.privateKey, kyberKeyPair.publicKey);
  let kyberPreKey = new KyberPreKeyBundle(77, kyberKeyPair.publicKey, signature);
  return { bundle, kyberPreKey, kyberKeyPair };
}

test("Kyber prekey signs and verifies under the identity key", () => {
  let store = SignalStore.createNew();
  let { kyberPreKey } = makeBundle(store);
  expect(verifyKyberPreKey(store.identityKeyPair.publicKey, kyberPreKey)).toBe(true);
  // tampered public key -> rejected
  let bad = new KyberPreKeyBundle(kyberPreKey.keyID, kyberPreKey.publicKey.slice(), kyberPreKey.signature);
  bad.publicKey[0] ^= 1;
  expect(verifyKyberPreKey(store.identityKeyPair.publicKey, bad)).toBe(false);
});

test("PreKeySignalMessage with kyber fields round-trips", () => {
  let fields = {
    registrationID: 1234,
    preKeyID: 5,
    signedPreKeyID: 1,
    kyberPreKeyID: 77,
    kyberCiphertext: new Uint8Array(1568).fill(0xAB),
    baseKey: djbEncode(new Uint8Array(32).fill(2)),
    identityKey: djbEncode(new Uint8Array(32).fill(3)),
    message: new Uint8Array([1, 2, 3, 4, 5]),
  };
  let parsed = parsePqPreKeyMessage(serializePqPreKeyMessage(fields));
  expect(parsed.registrationID).toBe(1234);
  expect(parsed.preKeyID).toBe(5);
  expect(parsed.signedPreKeyID).toBe(1);
  expect(parsed.kyberPreKeyID).toBe(77);
  expect(bytesEqual(parsed.kyberCiphertext!, fields.kyberCiphertext)).toBe(true);
  expect(bytesEqual(parsed.baseKey, fields.baseKey)).toBe(true);
  expect(bytesEqual(parsed.identityKey, fields.identityKey)).toBe(true);
  expect(bytesEqual(parsed.message, fields.message)).toBe(true);
});

test("PQXDH full round-trip: initiate, pkmsg with KEM, then bidirectional ratchet", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  let { bundle, kyberPreKey, kyberKeyPair } = makeBundle(bob);

  // Alice initiates the PQXDH session and sends the first message.
  let { state, pqrKey } = initiatePqxdhSession(alice, "bob", bundle, kyberPreKey);
  expect(pqrKey.length).toBe(32); // SPQR seed surfaced for the next layer
  expect(state.pendingKyber).toBeTruthy();

  let first = await encryptPqxdh(alice, "bob", td.encode("hello bob (pq)"));
  expect(first.type).toBe("pkmsg");
  // The pkmsg must carry the kyber prekey id + serialized ciphertext (0x08 ‖ 1568).
  let parsed = parsePqPreKeyMessage(first.body);
  expect(parsed.kyberPreKeyID).toBe(kyberPreKey.keyID);
  expect(parsed.kyberCiphertext!.length).toBe(1569);

  // Bob decapsulates with his Kyber prekey and decrypts.
  let got = await decryptPqxdhPreKeyMessage(bob, "alice", first.body, kyberKeyPair);
  expect(ts.decode(got)).toBe("hello bob (pq)");
  // The one-time prekey was consumed.
  expect(bob.preKeys.has(bundle.preKeyID!)).toBe(false);

  // Bob replies; this confirms the session (clears Alice's pending kyber).
  let reply = await encrypt(bob, "alice", td.encode("hi alice, pq session up"));
  expect(reply.type).toBe("msg");
  let gotReply = await decryptSignalMessage(alice, "bob", reply.body);
  expect(ts.decode(gotReply)).toBe("hi alice, pq session up");
  expect(alice.sessions.get("bob")!.pendingKyber).toBeUndefined();

  // Ongoing ratchet, both directions, multiple messages.
  for (let i = 0; i < 3; i++) {
    let a = await encrypt(alice, "bob", td.encode(`a${i}`));
    expect(a.type).toBe("msg");
    expect(ts.decode(await decryptSignalMessage(bob, "alice", a.body))).toBe(`a${i}`);
    let b = await encrypt(bob, "alice", td.encode(`b${i}`));
    expect(ts.decode(await decryptSignalMessage(alice, "bob", b.body))).toBe(`b${i}`);
  }
});

test("PQXDH works without a one-time prekey (signed prekey only)", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  let { bundle, kyberPreKey, kyberKeyPair } = makeBundle(bob);
  // Drop the one-time prekey from the bundle (server ran out).
  bundle.preKeyID = undefined;
  bundle.preKeyPublic = undefined;

  initiatePqxdhSession(alice, "bob", bundle, kyberPreKey);
  let first = await encryptPqxdh(alice, "bob", td.encode("no one-time prekey"));
  let parsed = parsePqPreKeyMessage(first.body);
  expect(parsed.preKeyID).toBeUndefined();
  expect(parsed.kyberCiphertext!.length).toBe(1569); // serialized: 0x08 ‖ 1568-byte ct

  let got = await decryptPqxdhPreKeyMessage(bob, "alice", first.body, kyberKeyPair);
  expect(ts.decode(got)).toBe("no one-time prekey");
});

test("PQXDH fails the inner MAC if the wrong Kyber key decapsulates", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  let { bundle, kyberPreKey } = makeBundle(bob);

  initiatePqxdhSession(alice, "bob", bundle, kyberPreKey);
  let first = await encryptPqxdh(alice, "bob", td.encode("secret"));

  // A different Kyber key pair yields a different KEM secret -> different root
  // key -> the inner SignalMessage MAC must fail.
  let wrongKyber = KyberKeyPair.generate();
  await expect(decryptPqxdhPreKeyMessage(bob, "alice", first.body, wrongKyber)).rejects.toThrow();
});

test("PQXDH rejects a bundle with a bad kyber prekey signature", () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  let { bundle, kyberPreKey } = makeBundle(bob);
  kyberPreKey.signature[0] ^= 1;
  expect(() => initiatePqxdhSession(alice, "bob", bundle, kyberPreKey)).toThrow();
});

test("duplicate pkmsg decrypts on the same responder session (no rebuild)", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  let { bundle, kyberPreKey, kyberKeyPair } = makeBundle(bob);

  initiatePqxdhSession(alice, "bob", bundle, kyberPreKey);
  let first = await encryptPqxdh(alice, "bob", td.encode("once"));
  let second = await encryptPqxdh(alice, "bob", td.encode("twice")); // same pending session

  expect(ts.decode(await decryptPqxdhPreKeyMessage(bob, "alice", first.body, kyberKeyPair))).toBe("once");
  // Second pkmsg shares the establishing base key -> decrypted on the same
  // session, not a rebuild (which would re-decapsulate and fail / waste a prekey).
  expect(ts.decode(await decryptPqxdhPreKeyMessage(bob, "alice", second.body, kyberKeyPair))).toBe("twice");
});
