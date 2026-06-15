import {
  expandAppStateKeys, valueMac, indexMac, decryptMutationValue, encContentOf, valueMacOf,
  WAPatchIntegrity, LTHash, snapshotMac, patchMac,
} from "../../../../logic/Chat/WhatsApp/Crypto/appStateCrypto";
import { SyncActionData, SyncdOperation } from "../../../../logic/Chat/Signal/Proto/schema";
import { encode, decode } from "../../../../logic/Chat/Signal/Proto/codec";
import { aesCBCEncrypt, randomBytes, concatBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

let textEnc = new TextEncoder();
let textDec = new TextDecoder();

test("key expansion yields five distinct 32-byte sub-keys", () => {
  let keys = expandAppStateKeys(randomBytes(32));
  for (let k of [keys.index, keys.valueEncryption, keys.valueMac, keys.snapshotMac, keys.patchMac]) {
    expect(k.length).toBe(32);
  }
  // distinct slices of the HKDF stream
  expect(bytesEqual(keys.index, keys.valueEncryption)).toBe(false);
  expect(bytesEqual(keys.valueMac, keys.patchMac)).toBe(false);
});

/** Builds a mutation value blob for a ContactAction the way the server does, so
 * we can decrypt+verify it back — proving encrypt and decrypt agree end to end. */
async function makeContactMutation(keys: ReturnType<typeof expandAppStateKeys>, keyId: Uint8Array,
    index: string[], fullName: string) {
  let indexBytes = textEnc.encode(JSON.stringify(index));
  let plaintext = encode(SyncActionData, {
    index: indexBytes,
    value: { contactAction: { fullName } },
    version: 1,
  });
  let iv = randomBytes(16);
  let ciphertext = await aesCBCEncrypt(keys.valueEncryption, iv, plaintext);
  let encContent = concatBytes(iv, ciphertext);
  let mac = valueMac(SyncdOperation.Set, keyId, encContent, keys.valueMac);
  return { valueBlob: concatBytes(encContent, mac), indexMac: indexMac(indexBytes, keys.index) };
}

test("a ContactAction round-trips through encrypt → MAC → verify → decrypt", async () => {
  let keys = expandAppStateKeys(randomBytes(32));
  let keyId = new Uint8Array([0, 0, 0, 0, 0xe6, 0xfc]);
  let { valueBlob } = await makeContactMutation(keys, keyId, ["contact", "12345@s.whatsapp.net"], "Test User");

  // value MAC verifies, and a tampered byte breaks it
  let recomputed = valueMac(SyncdOperation.Set, keyId, encContentOf(valueBlob), keys.valueMac);
  expect(bytesEqual(recomputed, valueMacOf(valueBlob))).toBe(true);
  let tampered = valueBlob.slice();
  tampered[20] ^= 1;
  expect(bytesEqual(valueMac(SyncdOperation.Set, keyId, encContentOf(tampered), keys.valueMac), valueMacOf(tampered))).toBe(false);

  // decrypt → the action and its name
  let data = decode(SyncActionData, await decryptMutationValue(valueBlob, keys.valueEncryption));
  expect(data.value!.contactAction!.fullName).toBe("Test User");
  expect(JSON.parse(textDec.decode(data.index))).toEqual(["contact", "12345@s.whatsapp.net"]);
});

test("LTHash is commutative and add/subtract invert", () => {
  let zero = new Uint8Array(128);
  let a = randomBytes(32), b = randomBytes(32);

  // order-independent: add(a,b) == add(b,a)
  let ab = WAPatchIntegrity.subtractThenAdd(zero, [], [a, b]);
  let ba = WAPatchIntegrity.subtractThenAdd(zero, [], [b, a]);
  expect(bytesEqual(ab, ba)).toBe(true);

  // removing a from {a,b} leaves exactly {b}
  let removedA = WAPatchIntegrity.subtractThenAdd(ab, [a], []);
  let onlyB = WAPatchIntegrity.subtractThenAdd(zero, [], [b]);
  expect(bytesEqual(removedA, onlyB)).toBe(true);

  // does not mutate its input
  expect(bytesEqual(zero, new Uint8Array(128))).toBe(true);
});

test("snapshot and patch MACs are deterministic and key/version-bound", () => {
  let keys = expandAppStateKeys(randomBytes(32));
  let hash = randomBytes(128);
  let name = "critical_unblock_low";

  let snap = snapshotMac(hash, 2, name, keys.snapshotMac);
  expect(snap.length).toBe(32);
  expect(bytesEqual(snap, snapshotMac(hash, 2, name, keys.snapshotMac))).toBe(true);
  expect(bytesEqual(snap, snapshotMac(hash, 3, name, keys.snapshotMac))).toBe(false); // version-bound

  let vmacs = [randomBytes(32), randomBytes(32)];
  let patch = patchMac(snap, vmacs, 2, name, keys.patchMac);
  expect(bytesEqual(patch, patchMac(snap, vmacs, 2, name, keys.patchMac))).toBe(true);
  expect(bytesEqual(patch, patchMac(snap, [vmacs[0]], 2, name, keys.patchMac))).toBe(false); // mutation-bound
});

test("LTHash uses a separate accumulator per info string", () => {
  let other = new LTHash("WhatsApp Patch Integrity", 128);
  let point = randomBytes(32);
  let mine = WAPatchIntegrity.subtractThenAdd(new Uint8Array(128), [], [point]);
  let same = other.subtractThenAdd(new Uint8Array(128), [], [point]);
  expect(bytesEqual(mine, same)).toBe(true); // same info ⇒ same result
});
