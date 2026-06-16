import {
  uidEncryptionGenerators, kUidEncryptionSystemParamsHardcoded,
  GroupSecretParams, ServiceId, uidStructPoints, profileKeyStructPoints,
  KvacKeyPair,
} from "../../../../logic/Chat/Signal/Encryption/ZKGroup/groupParams";
import { Sho } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/sho";
import { concatBytes } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { bytesToHex } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

// Committed KAT: SHO + double-Elligator (get_point) must reproduce libsignal's
// hardcoded UID-encryption SystemParams (uid_encryption.rs SYSTEM_HARDCODED).
test("get_point reproduces libsignal's hardcoded UID-encryption generators", () => {
  let { Ga1, Ga2 } = uidEncryptionGenerators();
  expect(bytesToHex(concatBytes(Ga1.toBytes(), Ga2.toBytes())))
    .toBe(bytesToHex(kUidEncryptionSystemParamsHardcoded));
});

test("group params derive deterministically from the master key", () => {
  let masterKey = Uint8Array.from({ length: 32 }, (_, i) => 100 + i); // libsignal TEST_ARRAY_32_1
  let a = GroupSecretParams.deriveFromMasterKey(masterKey);
  let b = GroupSecretParams.deriveFromMasterKey(masterKey);
  expect(a.groupId.length).toBe(32);
  expect(bytesToHex(a.groupId)).toBe(bytesToHex(b.groupId));
  expect(a.uidKeyPair.a1).toBe(b.uidKeyPair.a1); // deterministic scalars
});

test("UID encryption recovers both embedded points (M1, M2)", () => {
  let params = GroupSecretParams.deriveFromMasterKey(new Uint8Array(32).fill(7));
  let aci = ServiceId.aci(Uint8Array.from({ length: 16 }, (_, i) => i));
  let { M1, M2 } = uidStructPoints(aci);

  let ct = params.uidKeyPair.encrypt(M1, M2);
  expect(params.uidKeyPair.decryptM2(ct).equals(M2)).toBe(true);
  expect(params.uidKeyPair.decryptM1(ct).equals(M1)).toBe(true);

  // encryptServiceId composes the two and is deterministic (no randomness).
  let ct2 = params.encryptServiceId(aci);
  expect(ct2.EA1.equals(ct.EA1)).toBe(true);
  expect(ct2.EA2.equals(ct.EA2)).toBe(true);
});

// libsignal uid_encryption.rs test_uid_encryption — committed ciphertext bytes.
test("UID encryption reproduces the committed ciphertext KAT", () => {
  let sho = new Sho("Test_Uid_Encryption");
  sho.absorbAndRatchet(Uint8Array.from({ length: 32 }, (_, i) => i)); // TEST_ARRAY_32
  let keyPair = KvacKeyPair.deriveFrom(sho, uidEncryptionGenerators());

  let aci = ServiceId.aci(Uint8Array.from({ length: 16 }, (_, i) => i)); // TEST_ARRAY_16
  let { M1, M2 } = uidStructPoints(aci);
  let ct = keyPair.encrypt(M1, M2);

  expect(bytesToHex(concatBytes(ct.EA1.toBytes(), ct.EA2.toBytes()))).toBe(
    "f89ee7705a66036b908db884211b773ac543ee35c4a3086220fc3e1e35b4234c" +
    "fa1d2eea2cc2f4b4c42cff39a9dceb57293b5f8770ca60f9e9b74447bfd3bd3d");
});

test("profile-key encryption recovers both embedded points (M3, M4)", () => {
  let params = GroupSecretParams.deriveFromMasterKey(new Uint8Array(32).fill(9));
  let profileKey = Uint8Array.from({ length: 32 }, (_, i) => 200 + (i % 50));
  let aciUuid = Uint8Array.from({ length: 16 }, (_, i) => 16 + i);
  let { M3, M4 } = profileKeyStructPoints(profileKey, aciUuid);
  let ct = params.encryptProfileKey(profileKey, aciUuid);
  expect(params.profileKeyKeyPair.decryptM2(ct).equals(M4)).toBe(true);
  expect(params.profileKeyKeyPair.decryptM1(ct).equals(M3)).toBe(true);
});
