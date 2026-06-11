import { SignalStore } from "../../../../logic/Chat/WhatsApp/Crypto/Signal/Store";
import { PreKeyBundle } from "../../../../logic/Chat/WhatsApp/Crypto/Signal/Identity";
import { initiateSession, encrypt, decryptPreKeyMessage, decryptSignalMessage }
  from "../../../../logic/Chat/WhatsApp/Crypto/Signal/SessionCipher";
import {
  createSenderKey, createDistributionMessage, processDistributionMessage, groupEncrypt, groupDecrypt,
} from "../../../../logic/Chat/WhatsApp/Crypto/Signal/GroupCipher";
import { expect, test } from "vitest";

const utf8 = (s: string) => new TextEncoder().encode(s);
const str = (b: Uint8Array) => new TextDecoder().decode(b);

/** Builds a prekey bundle from a store (as if fetched from the server). */
function bundleFrom(store: SignalStore, withOneTime: boolean): PreKeyBundle {
  let signed = store.signedPreKeys.get(1)!;
  let bundle = new PreKeyBundle();
  bundle.registrationID = store.registrationID;
  bundle.identityKey = store.identityKeyPair.publicKey;
  bundle.signedPreKeyID = signed.keyID;
  bundle.signedPreKeyPublic = signed.keyPair.publicKey;
  bundle.signedPreKeySignature = signed.signature;
  if (withOneTime) {
    let preKey = store.preKeys.get(1)!;
    bundle.preKeyID = preKey.keyID;
    bundle.preKeyPublic = preKey.keyPair.publicKey;
  }
  return bundle;
}

test("X3DH + Double Ratchet: full bidirectional conversation", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();

  // Alice fetches Bob's bundle and starts a session.
  initiateSession(alice, "bob", bundleFrom(bob, true));

  // Alice -> Bob (first message is a pkmsg that establishes Bob's session)
  let m1 = await encrypt(alice, "bob", utf8("hello bob"));
  expect(m1.type).toBe("pkmsg");
  expect(str(await decryptPreKeyMessage(bob, "alice", m1.body))).toBe("hello bob");

  // Alice -> Bob again (still pkmsg until Bob replies)
  let m2 = await encrypt(alice, "bob", utf8("second"));
  expect(str(await decryptPreKeyMessage(bob, "alice", m2.body))).toBe("second");

  // Bob -> Alice (triggers Alice's DH ratchet)
  let r1 = await encrypt(bob, "alice", utf8("hi alice"));
  expect(r1.type).toBe("msg");
  expect(str(await decryptSignalMessage(alice, "bob", r1.body))).toBe("hi alice");

  // Now Alice's messages become plain `msg` (session confirmed)
  let m3 = await encrypt(alice, "bob", utf8("third"));
  expect(m3.type).toBe("msg");
  expect(str(await decryptSignalMessage(bob, "alice", m3.body))).toBe("third");

  // Several back-and-forth rounds with ratcheting
  for (let i = 0; i < 5; i++) {
    let a = await encrypt(alice, "bob", utf8(`a${i}`));
    expect(str(await decryptSignalMessage(bob, "alice", a.body))).toBe(`a${i}`);
    let b = await encrypt(bob, "alice", utf8(`b${i}`));
    expect(str(await decryptSignalMessage(alice, "bob", b.body))).toBe(`b${i}`);
  }
});

test("Out-of-order delivery uses skipped message keys", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  initiateSession(alice, "bob", bundleFrom(bob, true));
  // establish
  let first = await encrypt(alice, "bob", utf8("establish"));
  await decryptPreKeyMessage(bob, "alice", first.body);
  let reply = await encrypt(bob, "alice", utf8("ack"));
  await decryptSignalMessage(alice, "bob", reply.body);

  // Alice sends 4 messages; Bob receives them out of order: 3, 1, 0, 2
  let msgs = [];
  for (let i = 0; i < 4; i++) {
    msgs.push((await encrypt(alice, "bob", utf8(`msg${i}`))).body);
  }
  expect(str(await decryptSignalMessage(bob, "alice", msgs[3]))).toBe("msg3");
  expect(str(await decryptSignalMessage(bob, "alice", msgs[1]))).toBe("msg1");
  expect(str(await decryptSignalMessage(bob, "alice", msgs[0]))).toBe("msg0");
  expect(str(await decryptSignalMessage(bob, "alice", msgs[2]))).toBe("msg2");
});

test("Bundle without a one-time prekey still works", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  initiateSession(alice, "bob", bundleFrom(bob, false));
  let m = await encrypt(alice, "bob", utf8("no one-time prekey"));
  expect(str(await decryptPreKeyMessage(bob, "alice", m.body))).toBe("no one-time prekey");
});

test("Tampered ciphertext fails the MAC check", async () => {
  let alice = SignalStore.createNew();
  let bob = SignalStore.createNew();
  initiateSession(alice, "bob", bundleFrom(bob, true));
  let m = await encrypt(alice, "bob", utf8("secret"));
  m.body[m.body.length - 12] ^= 0xFF; // corrupt the ciphertext region
  await expect(decryptPreKeyMessage(bob, "alice", m.body)).rejects.toThrow();
});

test("Sender Keys: group message from one member to others", async () => {
  // Alice creates her sender key and distributes it; Bob and Carol process it.
  let aliceSenderKey = createSenderKey(1);
  let distribution = createDistributionMessage(aliceSenderKey);
  let bobView = processDistributionMessage(distribution);
  let carolView = processDistributionMessage(distribution);

  for (let i = 0; i < 3; i++) {
    let ct = await groupEncrypt(aliceSenderKey, utf8(`group ${i}`));
    expect(str(await groupDecrypt(bobView, ct))).toBe(`group ${i}`);
    // Carol must process each in order too; send her a fresh copy
    let ct2 = await groupEncrypt(aliceSenderKey, utf8(`to carol ${i}`));
    expect(str(await groupDecrypt(carolView, ct2))).toBe(`to carol ${i}`);
  }
});

test("Sender Keys: forged signature is rejected", async () => {
  let aliceSenderKey = createSenderKey(1);
  let bobView = processDistributionMessage(createDistributionMessage(aliceSenderKey));
  let ct = await groupEncrypt(aliceSenderKey, utf8("real"));
  // Replace the signing key the receiver trusts -> signature check must fail
  bobView.signingPublicKey = createSenderKey(2).signingPublicKey;
  await expect(groupDecrypt(bobView, ct)).rejects.toThrow();
});
