/** zkgroup group parameters + the KVAC verifiable encryption of member fields
 * (libsignal `api/groups/group_params.rs`, `crypto/uid_*`, `zkcredential/attributes`).
 *
 * GroupMasterKey(32) → GroupSecretParams (group id, blob key, and the uid- and
 * profile-key encryption key pairs) → GroupPublicParams. A member's ServiceId is
 * embedded as two Ristretto points (M1 = a hashed point, M2 = its Lizard encoding)
 * and encrypted as `E_A1 = a1·M1`, `E_A2 = a2·E_A1 + M2` under the group's key pair.
 *
 * Built on the verified primitives in ./sho and ./ristretto. lizard_decode (the
 * inverse map, to recover the raw UUID on decrypt) is still TODO; until then we
 * recover the M2 point and can match it against a candidate ServiceId. */
import { ristretto255 } from "@noble/curves/ed25519.js";
import { hexToBytes } from "@noble/curves/utils.js";
import { Sho } from "./sho";
import { lizardEncodeToPoint, lizardDecode, decode253Bits, elligatorFromBytes } from "./ristretto";
import { bytesToHex } from "@noble/curves/utils.js";
import { concatBytes } from "../../Crypto/primitives";
import { aesGcmSivEncrypt, aesGcmSivDecrypt } from "../aesGcmSiv";
import { ServiceId } from "../../ServiceId";

export { ServiceId } from "../../ServiceId";

const Point = ristretto255.Point;
const Fn = Point.Fn;
type Pt = InstanceType<typeof Point>;

/** A ServiceId as the two-point attribute (M1, M2) that gets encrypted. */
export function uidStructPoints(serviceId: ServiceId): { M1: Pt, M2: Pt } {
  let sho = new Sho("Signal_ZKGroup_20200424_UID_CalcM1");
  sho.absorbAndRatchet(serviceId.serviceIdBinary());
  return { M1: sho.getPoint(), M2: lizardEncodeToPoint(serviceId.uuid) };
}

/** A profile key (+ the owner's ACI) as the two-point attribute (M3, M4).
 * M3 binds the profile key to the ACI; M4 is the profile key itself as a point. */
export function profileKeyStructPoints(profileKey: Uint8Array, uuid: Uint8Array): { M3: Pt, M4: Pt } {
  let sho = new Sho("Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_CalcM3");
  sho.absorbAndRatchet(concatBytes(profileKey, uuid));
  let M3 = sho.getPointSingleElligator();
  let encoded = profileKey.slice();
  encoded[0] &= 254;
  encoded[31] &= 63;
  return { M3, M4: elligatorFromBytes(encoded) };
}

// --- system generators (per-domain, derived once via SHO) ---

function systemGenerators(label: string): { Ga1: Pt, Ga2: Pt } {
  let sho = new Sho(label);
  sho.absorbAndRatchet(new Uint8Array(0));
  return { Ga1: sho.getPoint(), Ga2: sho.getPoint() };
}

export const uidEncryptionGenerators = () =>
  systemGenerators("Signal_ZKGroup_20200424_Constant_UidEncryption_SystemParams_Generate");
export const profileKeyEncryptionGenerators = () =>
  systemGenerators("Signal_ZKGroup_20200424_Constant_ProfileKeyEncryption_SystemParams_Generate");

// --- the KVAC encryption key pair ---

export interface KvacCiphertext {
  EA1: Pt;
  EA2: Pt;
}

/** A UuidCiphertext / ProfileKeyCiphertext on the wire: `reserved(1) ‖ E_A1(32) ‖
 * E_A2(32)` = 65 bytes (zkgroup bincode form). */
export function serializeCiphertext(ct: KvacCiphertext): Uint8Array {
  return concatBytes(new Uint8Array(1), ct.EA1.toBytes(), ct.EA2.toBytes());
}

export function parseCiphertext(bytes: Uint8Array): KvacCiphertext {
  if (bytes.length != 65) {
    throw new Error(`zkgroup ciphertext must be 65 bytes, got ${bytes.length}`);
  }
  return { EA1: Point.fromBytes(bytes.subarray(1, 33)), EA2: Point.fromBytes(bytes.subarray(33, 65)) };
}

export class KvacKeyPair {
  constructor(readonly a1: bigint, readonly a2: bigint, readonly A: Pt) {}

  /** Derive `a1, a2` from the SHO stream; `A = a1·G_a1 + a2·G_a2` is the public key. */
  static deriveFrom(sho: Sho, gens: { Ga1: Pt, Ga2: Pt }): KvacKeyPair {
    let a1 = sho.getScalar();
    let a2 = sho.getScalar();
    let A = gens.Ga1.multiply(a1).add(gens.Ga2.multiply(a2));
    return new KvacKeyPair(a1, a2, A);
  }

  encrypt(M1: Pt, M2: Pt): KvacCiphertext {
    let EA1 = M1.multiply(this.a1);
    let EA2 = EA1.multiply(this.a2).add(M2);
    return { EA1, EA2 };
  }

  /** Recover M2 = E_A2 − a2·E_A1 (the second embedded point). */
  decryptM2(ct: KvacCiphertext): Pt {
    return ct.EA2.subtract(ct.EA1.multiply(this.a2));
  }

  /** Recover M1 = a1⁻¹·E_A1 (used to confirm which ServiceId a ciphertext holds). */
  decryptM1(ct: KvacCiphertext): Pt {
    return ct.EA1.multiply(Fn.inv(this.a1));
  }
}

// --- group secret/public params ---

export class GroupSecretParams {
  constructor(
    readonly masterKey: Uint8Array,
    readonly groupId: Uint8Array,
    readonly blobKey: Uint8Array,
    readonly uidKeyPair: KvacKeyPair,
    readonly profileKeyKeyPair: KvacKeyPair,
  ) {}

  static deriveFromMasterKey(masterKey: Uint8Array): GroupSecretParams {
    let sho = new Sho("Signal_ZKGroup_20200424_GroupMasterKey_GroupSecretParams_DeriveFromMasterKey");
    sho.absorbAndRatchet(masterKey);
    let groupId = sho.squeezeAndRatchet(32);
    let blobKey = sho.squeezeAndRatchet(32);
    let uidKeyPair = KvacKeyPair.deriveFrom(sho, uidEncryptionGenerators());
    let profileKeyKeyPair = KvacKeyPair.deriveFrom(sho, profileKeyEncryptionGenerators());
    return new GroupSecretParams(masterKey, groupId, blobKey, uidKeyPair, profileKeyKeyPair);
  }

  encryptServiceId(serviceId: ServiceId): KvacCiphertext {
    let { M1, M2 } = uidStructPoints(serviceId);
    return this.uidKeyPair.encrypt(M1, M2);
  }

  /** Encrypt a member's profile key, bound to their ACI (16-byte UUID). */
  encryptProfileKey(profileKey: Uint8Array, aciUuid: Uint8Array): KvacCiphertext {
    let { M3, M4 } = profileKeyStructPoints(profileKey, aciUuid);
    return this.profileKeyKeyPair.encrypt(M3, M4);
  }

  /** Recover the ServiceId from a UuidCiphertext: lizard-decode M2 → the 16 UUID
   * bytes, then confirm M1 by re-hashing for the ACI candidate (and the PNI
   * candidate). Returns null if neither candidate is consistent (verification
   * failure). Mirrors `UidEncryptionDomain::decrypt`. */
  decryptServiceId(ct: KvacCiphertext): ServiceId | null {
    let uuid = lizardDecode(this.uidKeyPair.decryptM2(ct)); // M2 = lizardEncode(uuid)
    if (!uuid) {
      return null;
    }
    let M1 = this.uidKeyPair.decryptM1(ct);
    for (let candidate of [ServiceId.aci(uuid), ServiceId.pni(uuid)]) {
      if (uidStructPoints(candidate).M1.equals(M1)) {
        return candidate;
      }
    }
    return null;
  }

  /** Recover a member's profile key from a ProfileKeyCiphertext, given the owner's
   * ACI UUID. M4 = single-Elligator of the profile key with bits 0, 254, 255
   * cleared; we decode all Elligator preimages, restore each of the 8 cleared-bit
   * combinations, and keep the unique one whose M3 matches (mirrors
   * `ProfileKeyEncryptionDomain::decrypt`). */
  decryptProfileKey(ct: KvacCiphertext, aciUuid: Uint8Array): Uint8Array | null {
    let M4 = this.profileKeyKeyPair.decryptM2(ct);
    let targetM3 = bytesToHex(this.profileKeyKeyPair.decryptM1(ct).toBytes());
    let { mask, candidates } = decode253Bits(M4);
    let result: Uint8Array | null = null;
    let found = 0;
    for (let i = 0; i < 8; i++) {
      if (!((mask >> i) & 1)) {
        continue;
      }
      for (let j = 0; j < 8; j++) {
        let pk = candidates[i].slice();
        if ((j >> 2) & 1) {
          pk[0] |= 0x01;
        }
        if ((j >> 1) & 1) {
          pk[31] |= 0x80;
        }
        if (j & 1) {
          pk[31] |= 0x40;
        }
        if (bytesToHex(profileKeyStructPoints(pk, aciUuid).M3.toBytes()) == targetM3) {
          result = pk;
          found++;
        }
      }
    }
    return found == 1 ? result : null;
  }

  /** Encrypt a GroupAttributeBlob (title/description/timer): AES-256-GCM-SIV under
   * `blobKey`, output `ciphertext ‖ nonce(12) ‖ reserved(1)`. */
  encryptBlob(plaintext: Uint8Array, randomness: Uint8Array): Uint8Array {
    let sho = new Sho("Signal_ZKGroup_20200424_Random_GroupSecretParams_EncryptBlob");
    sho.absorbAndRatchet(randomness);
    let nonce = sho.squeezeAndRatchet(12);
    let ciphertext = aesGcmSivEncrypt(this.blobKey, nonce, plaintext);
    return concatBytes(ciphertext, nonce, new Uint8Array(1));
  }

  /** Decrypt a GroupAttributeBlob field: strip the reserved byte + trailing nonce,
   * AES-256-GCM-SIV-decrypt under `blobKey`. */
  decryptBlob(blob: Uint8Array): Uint8Array {
    if (blob.length < 12 + 1) {
      throw new Error("group blob too short");
    }
    let unreserved = blob.subarray(0, blob.length - 1);
    let nonce = unreserved.subarray(unreserved.length - 12);
    let ciphertext = unreserved.subarray(0, unreserved.length - 12);
    return aesGcmSivDecrypt(this.blobKey, nonce, ciphertext);
  }

  getPublicParams(): GroupPublicParams {
    return new GroupPublicParams(this.groupId, this.uidKeyPair.A, this.profileKeyKeyPair.A);
  }
}

/** The public group params: group id and the two encryption public keys.
 * Sent to the server as `Group.publicKey` (97 bytes). */
export class GroupPublicParams {
  constructor(
    readonly groupId: Uint8Array,
    readonly uidPublicKey: Pt,
    readonly profileKeyPublicKey: Pt,
  ) {}

  /** Bincode 97-byte form: reserved(1) + group_id(32) + uid_A(32) + profile_A(32).
   * Hex of this is the "username" in the group-server Authorization header. */
  serialize(): Uint8Array {
    return concatBytes(
      new Uint8Array(1), this.groupId, this.uidPublicKey.toBytes(), this.profileKeyPublicKey.toBytes());
  }
}

/** The hardcoded UID-encryption system params from libsignal (used to verify our
 * SHO/Elligator-derived generators reproduce Signal's exact constants). */
export const kUidEncryptionSystemParamsHardcoded =
  hexToBytes("a6324c368df734691147981348b6e7eb42c3307e711b6c7eccd3032d45693f5a" +
             "048013525b76124bf2640c5e9369c76efbe80aba2a24aa5d8e18a98eba14f837");
