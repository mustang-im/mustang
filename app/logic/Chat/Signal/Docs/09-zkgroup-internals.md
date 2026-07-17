# 09 — zkgroup crypto internals (KVAC credentials, verifiable encryption, poksho proofs)

> Based on libsignal `main`, 2026-06-16. AGPL source read for spec + vectors only; our
> implementation is clean-room on `@noble/curves` `ristretto255` + `@noble/hashes`.

This document covers the **crypto internals** that `04-groups-v2.md` deferred: the SHO random
oracle, the system generator points, group params derivation, the verifiable ElGamal-style
encryption of ACI/PNI/profile-key, the algebraic-MAC (KVAC) credentials, the Schnorr/sigma
zero-knowledge presentation proofs, and the exact `bincode` byte layout of every serialized type.
`04` already covers the *wire* protocol (endpoints, JSON, where credentials are fetched and where
presentations go in the `Authorization` header). Read that for the network side; read this for the
math.

zkgroup is the Chase–Perrin–Zaverucha (CPZ) "Keyed-Verification Anonymous Credentials" (KVAC)
system over Ristretto255, plus Trevor-Perrin verifiable encryption, plus poksho Fiat–Shamir sigma
proofs. The newest credential (`AuthCredentialWithPniZkc`, "v4/Zkc") and the encryption are built on
the generic `zkcredential` crate; older credentials use the hand-rolled `zkgroup::crypto::*`. Our
port should target the **generic `zkcredential` path** for auth + encryption, and the
**`ExpiringProfileKeyCredential`** path for profiles.

---

## 0. What `@noble` gives us, and the two gaps

`@noble/curves` `ed25519.js` exports:
- `ristretto255.Point` — group ops, `.fromBytes()/.toBytes()` (canonical 32-byte ristretto
  encoding), `.fromHex()`, `.equals()`, `.add/.subtract/.multiply`, `BASE`, `ZERO`.
- `ristretto255_hasher.hashToCurve(msg)` — RFC 9380 hash-to-ristretto. This is the **two-element /
  double-Elligator** map. It equals dalek's `RistrettoPoint::from_uniform_bytes(&[u8;64])` **only if
  the 64 input bytes are split as two 32-byte halves and each mapped via Elligator then added** —
  this needs verifying against a KAT (see §1.4), because RFC 9380 `hashToCurve` does its own
  `expand_message` first, whereas zkgroup feeds raw 64 SHO bytes directly to
  `from_uniform_bytes`. **We almost certainly cannot use `hashToCurve` directly**; we need the raw
  `from_uniform_bytes` (map two 32-byte halves, no expand). ⚠️ Confirm whether noble exposes the
  inner `Point.fromUniformBytes`/`mapToCurve` without `expand_message`.
- Scalar field arithmetic via `ristretto255` curve order; `mod_order_wide` (reduce 64 bytes mod ℓ)
  is `bytesToNumberLE(bytes) % CURVE_ORDER`.

**Gap 1 — single-Elligator.** `Sho::get_point_single_elligator` and
`RistrettoPoint::from_uniform_bytes_single_elligator(&[u8;32])` map a **single** 32-byte string
through **one** Elligator2 application (not two). Used for the profile-key point `M4` and `M3`. noble
does not expose this. We must implement the ristretto Elligator2 map (`MAP` in the ristretto255
spec) ourselves over noble's field. ⚠️ Risky.

**Gap 2 — Lizard.** `RistrettoPoint::lizard_encode::<Sha256>(&[u8;16])` reversibly encodes 16 bytes
(a UUID) into a ristretto point, and `lizard_decode` recovers them. This is the "single-Elligator
with embedded data + SHA-256 check digit" construction from the dalek-signal fork
(`curve25519-dalek-signal`), **not** in this libsignal tree and **not** in noble. We must port
Lizard from the dalek-signal source. ⚠️ The single highest-risk component. See §4.2.

Everything else (SHO, scalars, MACs, proofs, serialization) is byte-mechanical and portable.

---

## 1. SHO — the poksho Stateful Hash Object (random-oracle backbone)

Two SHO variants exist. **Almost everything in zkgroup uses `ShoHmacSha256`** (the
`zkgroup::common::sho::Sho` wrapper). `ShoSha256` is used **only** for the `zkcredential`
`SystemParams::generate` (the KVAC generator points) — see §2.

### 1.1 `ShoHmacSha256` (poksho/src/shohmacsha256.rs:30-88)

State: `hasher: Hmac<Sha256>`, `cv: [u8;32]` (chaining value), `mode ∈ {ABSORBING, RATCHETED}`.
`BLOCK_LEN = 64`, `HASH_LEN = 32`.

```
new(label):
    cv = [0u8; 32]; mode = RATCHETED
    hasher = HMAC-SHA256 keyed with [0u8;32]      # 32 zero bytes
    absorb_and_ratchet(label)                       # label folded in immediately

absorb(input):                                      # shohmacsha256.rs:42
    if mode == RATCHETED:
        hasher = HMAC-SHA256 keyed with cv          # re-key with chaining value
        mode = ABSORBING
    hasher.update(input)

ratchet():                                          # shohmacsha256.rs:52
    if mode == RATCHETED: return
    hasher.update([0x00])                            # single 0x00 byte
    cv = hasher.finalize()                           # 32-byte HMAC tag
    mode = RATCHETED

absorb_and_ratchet(input) = absorb(input); ratchet()    # shoapi.rs:16

squeeze_and_ratchet(outlen) -> bytes:               # shohmacsha256.rs:63
    assert mode == RATCHETED
    prefix = HMAC-SHA256 keyed with cv
    out = []
    for i in 0,1,2,...  while i*32 < outlen:
        h = prefix.clone()
        h.update(be_u64(i))                          # 8-byte big-endian counter
        h.update([0x01])                             # domain sep 0x01
        out ||= h.finalize()                         # take min(32, remaining) bytes
    # ratchet the chaining value forward:
    next = prefix.clone()                            # NOTE: same `prefix` HMAC instance
    next.update(be_u64(outlen))                      # 8-byte big-endian length
    next.update([0x02])                              # domain sep 0x02
    cv = next.finalize()
    mode = RATCHETED
    return out[..outlen]
```

Important subtleties for byte-exactness:
- The `prefix` HMAC for squeeze is reused for both the output blocks (each a `.clone()`) and the
  "next cv" computation. In JS: build `HMAC(cv)`, clone per block.
- Counter and length are **big-endian u64**.
- Output domain separator is `0x01`; cv-advance separator is `0x02`; ratchet absorb separator is
  `0x00`.

**KAT (shohmacsha256.rs:96):** `new(b"asd"); absorb_and_ratchet(b"asdasd"); squeeze_and_ratchet(64)`
= `392cb944937303 7f a0c11aebed69cca3 b7d3bc9790878f34 1729c65d5506442f 04986cb5c9098f27
7c3ea640a4dc6e90 372b433a90af9aea 7072eaba3398c4fe`. Use this to validate the SHO port first.

### 1.2 `ShoSha256` (poksho/src/shosha256.rs:31-92) — "innerpad" variant

Used only for KVAC generator-point generation. SHA-256 based (no HMAC):

```
new(label): hasher=SHA256, cv=[0;32], mode=RATCHETED; absorb_and_ratchet(label)
absorb(input):
    if RATCHETED: hasher.update([0u8;64]); hasher.update(cv); mode=ABSORBING   # 64 zero bytes then cv
    hasher.update(input)
ratchet(): cv = SHA256(SHA256-finalize(hasher)); mode=RATCHETED                # DOUBLE hash
squeeze_and_ratchet(outlen):
    prefix = SHA256; prefix.update([0u8; 63]); prefix.update([0x01]); prefix.update(cv)  # 63 zeros + 0x01 + cv
    for i: h=prefix.clone(); h.update(be_u64(i)); out ||= h.finalize()
    next = SHA256; next.update([0u8;63]); next.update([0x02]); next.update(cv); next.update(be_u64(outlen)); cv=next.finalize()
```
**KAT (shosha256.rs:101):** `new(b"asd"); absorb_and_ratchet(b"asdasd"); squeeze(64)` =
`ebe4ef29e18aa541 ...` (full vector in source). Validate before generating any KVAC params.

### 1.3 `zkgroup::common::sho::Sho` wrapper (common/sho.rs)

Thin wrapper over `ShoHmacSha256`:
- `Sho::new(label, data)` = `ShoHmacSha256::new(label)` then `absorb_and_ratchet(data)` (sho.rs:21).
- `Sho::new_seed(label)` = just `new(label)` (no data absorb).
- `squeeze(n)` / `squeeze_as_array::<N>()` = `squeeze_and_ratchet`.
- `get_point()` (sho.rs:44) = `from_uniform_bytes( squeeze_and_ratchet(64) )` — **double-Elligator**.
- `get_point_single_elligator()` (sho.rs:48) = `from_uniform_bytes_single_elligator( squeeze(32) )`.
- `get_scalar()` (sho.rs:54) = `Scalar::from_bytes_mod_order_wide( squeeze_and_ratchet(64) )` =
  reduce 64 little-endian bytes mod ℓ.

`zkcredential::sho::ShoExt` (zkcredential/src/sho.rs) reimplements `get_point`/`get_scalar`
identically on the plain poksho types (64-byte squeeze, double-Elligator / wide-reduce).

### 1.4 hash-to-point detail (the crux)

`from_uniform_bytes(&[u8; 64])` in dalek = split into `b[0..32]`, `b[32..64]`; map **each** 32-byte
half via the ristretto Elligator2 one-way map `R = MAP(b_i)`; result `= R0 + R1`. The 32-byte input
to the map is taken mod p with the high bit handled per the ristretto spec.
`from_uniform_bytes_single_elligator(&[u8;32])` = `MAP(b)` once.

⚠️ **TODO before coding:** confirm exactly which 64→point map noble's internal map matches. Plan:
implement our own `mapToRistretto(half32)` (ristretto255 "MAP", RFC 9496 §4.3.4 one-way map),
then `getPoint = MAP(b[0..32]) + MAP(b[32..64])` and `getPointSingleElligator = MAP(b32)`. Verify
against the `UidCiphertext` KAT in §8 (which exercises `get_point` via `calc_M1`) and the
profile-key ciphertext KAT (exercises single-Elligator via M3/M4).

---

## 2. System generators / constants (every label verbatim)

There are several independent sets of fixed generator points, each generated by squeezing points
from a SHO seeded with a fixed label. **All are hardcoded in the source as serialized bytes** (and
re-derived in tests to confirm). For the port we can either re-derive (need byte-exact SHO + map)
or hardcode the same bytes; **recommend hardcoding the published bytes and adding a self-test that
re-derivation matches**, once the map is verified.

### 2.1 KVAC system params (the `G_w, G_wprime, G_x0, G_x1, G_V, G_z, G_y[0..7]`)

Two distinct KVAC systems exist:

**(a) `zkcredential` generic system** — used by `AuthCredentialWithPniZkc` and the encryption
proofs. (zkcredential/src/credentials.rs:205)
- SHO = **`ShoSha256`** (not HMAC!), label
  `b"Signal_ZKCredential_ConstantSystemParams_generate_20230410"`.
- Squeeze points **in this order**: `G_w, G_wprime, G_x0, G_x1, G_V, G_z, then G_y[0..7]`
  (`NUM_SUPPORTED_ATTRS = 7`). 13 points total.
- Hardcoded serialization: credentials.rs:241 (`SYSTEM_HARDCODED`, the long hex starting
  `589c8718e8263a53...`). 13 × 32 = 416 bytes.

**(b) legacy `zkgroup::crypto::credentials` system** — used by `ExpiringProfileKeyCredential`,
receipts, the old auth creds. (zkgroup/src/crypto/credentials.rs:214)
- SHO = `Sho` (`ShoHmacSha256`), label
  `b"Signal_ZKGroup_20200424_Constant_Credentials_SystemParams_Generate"`, data `b""`.
- Squeeze order (credentials.rs:219-243): `G_w, G_wprime, G_x0, G_x1, G_y1, G_y2, G_y3, G_y4,
  G_m1, G_m2, G_m3, G_m4, G_V, G_z, G_y5, G_y6, G_m5`. **Order matters and is irregular** (G_y5/G_y6
  and G_m5 were appended later). `G_y` is `OneBased` (1-indexed array of 6).
- Hardcoded: credentials.rs:265 (`9ae7c8e5ed779b11...`, ~544 bytes = 17 points).

### 2.2 Encryption system params (`G_a1, G_a2` per domain)

**UID encryption** (`crypto/uid_encryption.rs:35`):
- `Sho::new(b"Signal_ZKGroup_20200424_Constant_UidEncryption_SystemParams_Generate", b"")`,
  `G_a1 = get_point()`, `G_a2 = get_point()`.
- Hardcoded 64 bytes: uid_encryption.rs:49 `a6324c368df73469...`.
- Domain ID string (for proof labels): `"Signal_ZKGroup_20230419_UidEncryption"` (uid_encryption.rs:62).

**Profile-key encryption** (`crypto/profile_key_encryption.rs:36`):
- `Sho::new(b"Signal_ZKGroup_20200424_Constant_ProfileKeyEncryption_SystemParams_Generate", b"")`,
  `G_b1 = get_point()`, `G_b2 = get_point()`.
- Hardcoded 64 bytes: profile_key_encryption.rs:50 `f6baa317ce1839c9...`.
- Domain ID: `"Signal_ZKGroup_20231011_ProfileKeyEncryption"` (profile_key_encryption.rs:63).

Note the generic `zkcredential` `derive_default_generator_points` path (attributes.rs:152) uses
label `b"Signal_ZKCredential_Domain_20231011"` then absorbs the domain `ID` and squeezes 2 points —
**but zkgroup overrides `G_a()` to return the hardcoded `G_a1/G_a2` above**, so the domain-default
derivation is NOT used for uid/profile-key. (It would matter only if we added new domains.)

### 2.3 Profile-key commitment system (`G_j1, G_j2, G_j3`)

(`crypto/profile_key_commitment.rs:46`)
`Sho::new(b"Signal_ZKGroup_20200424_Constant_ProfileKeyCommitment_SystemParams_Generate", b"")`,
squeeze `G_j1, G_j2, G_j3`. Hardcoded 96 bytes: profile_key_commitment.rs:62 `a8ca0bbd1148c466...`.

### 2.4 Full list of verbatim label strings

| Purpose | Label | File:line |
|---|---|---|
| zkcredential KVAC params | `Signal_ZKCredential_ConstantSystemParams_generate_20230410` | credentials.rs:206 |
| zkcredential priv key | `Signal_ZKCredential_CredentialPrivateKey_generate_20230410` | credentials.rs:48 |
| zkcredential issuance proof | `Signal_ZKCredential_Issuance_20230410` | issuance.rs:233 |
| zkcredential presentation proof | `Signal_ZKCredential_Presentation_20230410` | presentation.rs:465 |
| zkcredential domain default G_a | `Signal_ZKCredential_Domain_20231011` | attributes.rs:156 |
| legacy KVAC params | `Signal_ZKGroup_20200424_Constant_Credentials_SystemParams_Generate` | credentials.rs:216 |
| UID-enc params | `Signal_ZKGroup_20200424_Constant_UidEncryption_SystemParams_Generate` | uid_encryption.rs:37 |
| ProfileKey-enc params | `Signal_ZKGroup_20200424_Constant_ProfileKeyEncryption_SystemParams_Generate` | profile_key_encryption.rs:38 |
| ProfileKey-commit params | `Signal_ZKGroup_20200424_Constant_ProfileKeyCommitment_SystemParams_Generate` | profile_key_commitment.rs:48 |
| UID-enc domain ID | `Signal_ZKGroup_20230419_UidEncryption` | uid_encryption.rs:62 |
| ProfileKey-enc domain ID | `Signal_ZKGroup_20231011_ProfileKeyEncryption` | profile_key_encryption.rs:63 |
| GroupSecretParams from master key | `Signal_ZKGroup_20200424_GroupMasterKey_GroupSecretParams_DeriveFromMasterKey` | group_params.rs:69 |
| GroupSecretParams random | `Signal_ZKGroup_20200424_Random_GroupSecretParams_Generate` | group_params.rs:60 |
| ServerSecretParams random | `Signal_ZKGroup_20200424_Random_ServerSecretParams_Generate` | server_params.rs:83 |
| Group blob encrypt | `Signal_ZKGroup_20200424_Random_GroupSecretParams_EncryptBlob` | group_params.rs:176 |
| UID M1 | `Signal_ZKGroup_20200424_UID_CalcM1` | uid_struct.rs:46 |
| ProfileKey M3 | `Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_CalcM3` | profile_key_struct.rs:40 |
| ProfileKey commitment j3 | `Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKeyCommitment_Calcj3` | profile_key_commitment.rs:101 |
| ProfileKeyVersion | `Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_GetProfileKeyVersion` | profile_key_version.rs:60 |
| ProfileKey generate | `Signal_ZKGroup_20200424_Random_ProfileKey_Generate` | profile_key.rs:38 |
| Timestamp m (expiring) | `Signal_ZKGroup_20220524_Timestamp_Calc_m` | timestamp_struct.rs:28 |
| poksho proof transcript | `POKSHO_Ristretto_SHOHMACSHA256` | statement.rs:187 |
| Zkc auth credential label | `20240222_Signal_AuthCredentialZkc` | zkc.rs:20 |

---

## 3. Group params: master key → secret → public → group id

(group_params.rs; the high level is in `04-groups-v2.md §1`. Exact field-by-field derivation here.)

```
deriveFromMasterKey(masterKey[32]):               # group_params.rs:67
  sho = Sho::new("Signal_ZKGroup_20200424_GroupMasterKey_GroupSecretParams_DeriveFromMasterKey",
                 masterKey)
  group_id  = sho.squeeze(32)                       # GroupIdentifierBytes
  blob_key  = sho.squeeze(32)                       # AES-256-GCM-SIV key for group blobs
  uid_enc_key_pair         = KeyPair::derive_from(sho)   # see §3.1
  profile_key_enc_key_pair = KeyPair::derive_from(sho)
```

`generate(randomness[32])` (group_params.rs:58): `Sho::new("..._Random_GroupSecretParams_Generate",
randomness)` → `master_key = squeeze(32)` → `deriveFromMasterKey`.

### 3.1 The encryption `KeyPair::derive_from` (attributes.rs:243)

```
derive_from(sho):
  a1 = sho.get_scalar()       # 64-byte squeeze, mod ℓ
  a2 = sho.get_scalar()
  [G_a1, G_a2] = D::G_a()     # hardcoded per domain (§2.2)
  A = a1*G_a1 + a2*G_a2       # the public key
  return { a1, a2, public_key: { A } }
```
So `uid_enc_key_pair` uses `G_a1,G_a2` from §2.2 (UID); `profile_key_enc_key_pair` uses `G_b1,G_b2`.

### 3.2 `GroupPublicParams` (group_params.rs:96)

```
{ reserved=0, group_id, uid_enc_public_key.A, profile_key_enc_public_key.A }
```
Serialized = 97 bytes (`GROUP_PUBLIC_PARAMS_LEN`): 1 (reserved) + 32 (group_id) + 32 (uid A) + 32
(profile A). This is `Group.publicKey` on the wire (see `04 §1`).

### 3.3 `GroupSecretParams` serialized = 289 bytes (`GROUP_SECRET_PARAMS_LEN`)

`bincode` field order (group_params.rs:25): `reserved(1) + master_key(32) + group_id(32) +
blob_key(32) + uid_enc_key_pair + profile_key_enc_key_pair`. Each `KeyPair` serializes as `a1(32) +
a2(32) + public_key.A(32)` = 96. 1+32+32+32+96+96 = 289. ✓

`group_id` is the 32-byte `GroupIdentifierBytes` = `GROUP_IDENTIFIER_LEN`.

---

## 4. Ciphertexts (verifiable encryption)

### 4.1 The CPZ §4.1 encryption (attributes.rs:285-335)

An `Attribute` is a pair of ristretto points `(M1, M2)`. A `KeyPair{a1,a2}` encrypts:
```
E_A1 = a1 * M1
E_A2 = a2 * E_A1 + M2
ciphertext = (E_A1, E_A2)
```
Decrypt-to-second-point: `M2 = E_A2 - a2*E_A1` (and reject if `E_A1 == BASE`, attributes.rs:331).
This is **not** plain ElGamal; it's deterministic (no per-message randomness) and "garbage in,
garbage out" — validity is enforced by re-deriving `M1` from the decoded value and checking
`a1*M1 == E_A1` (see §4.2/§4.3 decode routines).

`Ciphertext` serializes as `E_A1(32) + E_A2(32)` = 64 bytes (domain `PhantomData` is `#[serde(skip)]`).

### 4.2 `UidStruct` — ACI/PNI → point pair (uid_struct.rs)

```
from_service_id(service_id):                        # uid_struct.rs:34
  M1 = calc_M1(seed_M1(), service_id)
  raw_uuid_bytes = service_id.raw_uuid (16 bytes)
  M2 = RistrettoPoint::lizard_encode::<Sha256>(raw_uuid_bytes)   # 16 bytes -> point, reversible

seed_M1() = Sho::new_seed("Signal_ZKGroup_20200424_UID_CalcM1")  # label only, no data
calc_M1(seed, service_id):
  seed.absorb_and_ratchet( service_id.service_id_binary() )       # 17 bytes (see below)
  return seed.get_point()                                         # double-Elligator
```

`service_id_binary()`: for an ACI it is the 16 raw UUID bytes; for a PNI it is `0x01 ||` the 16 raw
bytes (libsignal_core ServiceId binary form). ⚠️ Verify exact ACI/PNI prefix bytes in
`libsignal_core::ServiceId::service_id_binary()` — ACI is bare 16 bytes, PNI is prefixed `0x01`.
`raw_uuid()` is always the bare 16 bytes (no prefix). This is why decryption must try both ACI and
PNI `M1` reconstructions (uid_encryption.rs:88-101): M2/Lizard only recovers the UUID, not the kind.

**Lizard encode/decode** (the dalek-signal fork, not in this tree):
- `lizard_encode::<Sha256>(data16)`: build a 32-byte field-element candidate where bytes `[8..24]`
  hold the 16 data bytes and bytes `[0..8]`/`[24..32]` hold a SHA-256-derived check value, then map
  via single-Elligator to a point. (Embeds the 16 bytes as the middle of a field element with a hash
  "frame" so decode can verify.)
- `lizard_decode::<Sha256>()`: invert the single-Elligator (recover up to a small set of preimages),
  extract the candidate middle 16 bytes, recompute the SHA-256 frame, return the bytes iff the frame
  matches; else `None`.
- KAT (integration_tests.rs:28): `lizard_encode(TEST_ARRAY_16)` then `lizard_decode` == `TEST_ARRAY_16`.

⚠️ **We must port Lizard from `curve25519-dalek-signal` (the `lizard` module).** Clone that crate,
read `src/lizard/` byte-for-byte, reimplement over noble's field. This is the riskiest single
component. Validate with the KAT above.

`UidStruct` serialization (uid_struct.rs:17): `raw_uuid_bytes(16) + M1(32) + M2(32)` = 80 bytes.
(`#[serde(rename="bytes")]` on the UUID field is cosmetic for serde-JSON; bincode ignores names.)

`UidCiphertext` wire type (uuid_ciphertext.rs): `reserved(1) + ciphertext(64)` = 65 bytes
(`UUID_CIPHERTEXT_LEN`). Encrypt: `GroupSecretParams.encrypt_service_id` → `uid_enc_key_pair.encrypt(uid)`.

### 4.3 `ProfileKeyStruct` — profile key → point pair (profile_key_struct.rs)

```
new(profile_key_bytes[32], uid_bytes[16]):          # profile_key_struct.rs:24
  encoded = profile_key_bytes; encoded[0] &= 254; encoded[31] &= 63    # clamp to valid field elt
  M3 = calc_M3(seed_M3(), profile_key_bytes, uid_bytes)
  M4 = RistrettoPoint::from_uniform_bytes_single_elligator(encoded)    # single-Elligator of clamped key
  store { bytes: profile_key_bytes, M3, M4 }

seed_M3() = Sho::new_seed("Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_CalcM3")
calc_M3(seed, pk[32], uid[16]):
  seed.absorb_and_ratchet( pk || uid )              # 48 bytes
  return seed.get_point_single_elligator()          # single-Elligator
```

`M4`'s clamp (`&254`, `&63`) makes the 32 profile-key bytes a canonical field element; decode
(profile_key_encryption.rs:71-115) recovers it by `M4.decode_253_bits()` (returns candidate byte
strings + a validity mask), then brute-forces the cleared bits (8×8 combos), re-derives `M3` and
checks `M3 == a1.invert()*E_A1`. So decode needs `decode_253_bits` (another dalek-signal-fork point
method) + `calc_M3`. ⚠️ `decode_253_bits` is also fork-specific — port it with Lizard.

`ProfileKeyStruct` serialization: `bytes(32) + M3(32) + M4(32)` = 96 bytes.
`ProfileKeyCiphertext` wire type (profile_key_ciphertext.rs): `reserved(1) + ciphertext(64)` = 65
bytes (`PROFILE_KEY_CIPHERTEXT_LEN`).

### 4.4 ProfileKey commitment + version (server-side profile lookup)

`ProfileKeyCommitment` (profile_key_commitment.rs:73): with system `G_j1,G_j2,G_j3` and
`j3 = Sho("...Calcj3", pk||uid).get_scalar()`:
```
J1 = j3*G_j1 + M3 ;  J2 = j3*G_j2 + M4 ;  J3 = j3*G_j3
```
Wire `ProfileKeyCommitment` = `reserved(1) + J1(32)+J2(32)+J3(32)` = 97 (`PROFILE_KEY_COMMITMENT_LEN`).

`ProfileKeyVersion` (profile_key_version.rs:51): `Sho("...GetProfileKeyVersion", pk||uid)` →
`squeeze(32)` → **lowercase hex-encode** → 64 ASCII bytes. This is the path component used to fetch
a profile (`04`/`05`). Serializes as the 64 ASCII bytes (serialize_tuple, no length prefix).

---

## 5. KVAC credentials

### 5.1 Generic `zkcredential` MAC (CPZ §3.1, credentials.rs:74)

Server private key `{w, wprime, W=w·G_w, x0, x1, y[0..7]}` (credentials.rs:46). Public key
`{C_W, I[0..6]}` where `C_W = W + wprime·G_wprime` and `I_n = G_V - x0·G_x0 - x1·G_x1 - Σ y_i·G_yi`
(credentials.rs:115; `I` is provided per attribute count).

```
credential_core(M[], sho):                          # credentials.rs:74
  t = sho.get_scalar()
  U = sho.get_point()
  V = W + (x0 + x1*t)*U + Σ y_i * M_i
  return Credential{ t, U, V }
```
`Credential` serializes as `t(32) + U(32) + V(32)` = 96 bytes.

**Attribute point list** (issuance.rs:70): index 0 is reserved for the **aggregate public
attribute** (a point hashed from the SHA over the credential label + all public attrs); indices 1..
are the two-point hidden attributes in order. So a 2-hidden-attribute credential (auth: aci, pni)
uses points `[H_public, aci.M1, aci.M2, pni.M1, pni.M2]` = 5 points (`y[0..5]`).

### 5.2 `AuthCredentialWithPniZkc` (v4/Zkc) — the live auth credential (zkc.rs)

Label `CREDENTIAL_LABEL = b"20240222_Signal_AuthCredentialZkc"` (zkc.rs:20).

**Attributes, in order** (zkc.rs:89-93):
1. `UidStruct::from_service_id(aci)` — hidden attribute (2 points)
2. `UidStruct::from_service_id(pni)` — hidden attribute (2 points)
3. `redemption_time: Timestamp` — **public** attribute (`Timestamp::hash_into` → `u64.to_be_bytes`,
   simple_types.rs:113 + attributes.rs:62)

**Issuance response** (`AuthCredentialWithPniZkcResponse`, zkc.rs:35): `version(1)=0x03 +
IssuanceProof`. `IssuanceProof` = `Credential(96) + poksho_proof(Vec<u8>)`. Total
`AUTH_CREDENTIAL_WITH_PNI_RESPONSE_LEN = 425` (constants.rs:26). The server calls
`issue_credential(aci, pni, redemption_time, server_secret_params, randomness)` →
`IssuanceProofBuilder::new(LABEL).add_attribute(aci).add_attribute(pni)
.add_public_attribute(redemption_time).issue(generic_credential_key_pair, randomness)`.

**Client receive/verify** (zkc.rs:101): rebuild the same builder, call `.verify(public_key, proof)`.
Rejects non-day-aligned `redemption_time` (zkc.rs:108). On success stores
`AuthCredentialWithPniZkc{ version=3, credential, aci(UidStruct), pni(UidStruct), redemption_time }`
= `AUTH_CREDENTIAL_WITH_PNI_LEN`-ish (1 + 96 + 80 + 80 + 8 = 265 = `AUTH_CREDENTIAL_WITH_PNI_LEN`, ✓
constants.rs:25).

### 5.3 Issuance proof statement (issuance.rs:98)

poksho `Statement` (proves the server knows a valid key producing this MAC):
```
C_W   = w*G_w + wprime*G_wprime
G_V-I = x0*G_x0 + x1*G_x1 + Σ y_i*G_yi        (i = 0..n)
V     = w*G_w + x0*U + x1*tU + Σ y_i*M_i       (i = 0..n)
```
The number of `y_i / M_i` terms = number of attribute points (issuance.rs:115,130). Public point
`G_V-I` is computed as `system.G_V - public_key.I(total_attr_count)` (issuance.rs:191). The proof's
synthetic nonce uses label `Signal_ZKCredential_Issuance_20230410` + randomness (issuance.rs:233).
`authenticated_message` is empty for auth creds (the label is a public attribute, not the message).

### 5.4 `ExpiringProfileKeyCredential` (legacy crypto path) — for profiles

Uses the **legacy** `zkgroup::crypto::credentials` KVAC (5 stored scalars,
`AttrScalars::Storage=[Scalar;5]`, credentials.rs:80). Blind issuance: the client sends a
`ProfileKeyCredentialRequest` (ElGamal-encrypting `(M3,M4)` under a request key), the server issues a
**blinded** credential `{t, U, S1, S2}` plus an expiration timestamp folded in as `m5 =
TimestampStruct::calc_m_from(exp)`, `M5 = m5·G_m5`, `Vprime += y[5]·M5` (credentials.rs:338-368).
Client unblinds with its request secret to get `ExpiringProfileKeyCredential{t,U,V}` (96 bytes,
`EXPIRING_PROFILE_KEY_CREDENTIAL_LEN = 153` once wrapped with version + expiration). Full blind-issuance
math is in `crypto/proofs.rs` and `crypto/profile_key_credential_request.rs` — **defer detailed port
until after auth works**; profiles can also be fetched without zk in some flows (see `05`).

---

## 6. Presentations (the zero-knowledge proof sent to the group server)

### 6.1 What is proven (presentation.rs:222)

The client proves, **without revealing the plaintext attributes**, that:
1. It holds a valid credential `(t,U,V)` issued by the server (the `Z`, `C_x1` equations), via the
   commitments `C_x0 = z·G_x0 + U`, `C_x1 = z·G_x1 + t·U`, `C_V = z·G_V + V`, `C_y_i = z·G_yi + M_i`.
2. The supplied ciphertexts `(E_A1,E_A2)` for each hidden attribute are correct encryptions of the
   credential's `M_i` under a key whose public `A` it also proves valid (the `0`, `sum(A)`, `E_A*`,
   `C_y*-E_A*` equations, CPZ §4.1 + Perrin's key-validity addition).

The statement (presentation.rs:222-305), where `key_id` is the encryption domain ID string:
```
Z       = z*I
C_x1    = t*C_x0 + z0*G_x0 + z*G_x1                       (z0 = -z*t)
0       = z1_{key}*I + a1_{key}*Z                          (per key)
sum(A)  = Σ ( a1_{key}*G_a1_{key} + a2_{key}*G_a2_{key} )
# per encrypted attribute (first point p1, second point p2):
E_A{p1}        = a1_{key}*C_y{p1} + z1_{key}*G_y{p1}
C_y{p2}-E_A{p2}= z*G_y{p2} + a2_{key}*(-E_A{p1})
# the hardcoded public attribute point 0:
C_y0    = z*G_y0
```
Note `z1_{key} = -z*a1` (presentation.rs:507). The verifier (server) recomputes
`Z = C_V - W - x0·C_x0 - x1·C_x1 - Σ y_i·C_yi - y0·M0_public - Σ y_i·M_i(revealed)` from its private
key (presentation.rs:660) and checks the proof. So the **server uses its KVAC private key** to
verify — this is "keyed-verification".

### 6.2 `AuthCredentialWithPniZkcPresentation` (zkc.rs:41)

```
present():                                            # zkc.rs:145
  proof = PresentationProofBuilder::new(LABEL)
            .add_attribute(aci, uid_enc_key_pair)     # encrypts aci under the GROUP's uid key
            .add_attribute(pni, uid_enc_key_pair)
            .present(public_key, credential, randomness)
  aci_ciphertext = uid_enc_key_pair.encrypt(aci)
  pni_ciphertext = uid_enc_key_pair.encrypt(pni)
  return { version=3, proof, aci_ciphertext, pni_ciphertext, redemption_time }
```
The ciphertexts here are the **same** the group already stores for the member, so the server learns
nothing new — it just verifies the presenter owns a credential for those encrypted identities at
`redemption_time` (a public attribute supplied by the verifier, zkc.rs:203). Presentation randomness
nonce label `Signal_ZKCredential_Presentation_20230410`.

Verify (zkc.rs:188): `PresentationProofVerifier::new(LABEL).add_attribute(aci_ciphertext,
uid_enc_public_key).add_attribute(pni_ciphertext, uid_enc_public_key)
.add_public_attribute(redemption_time).verify(generic_credential_key_pair, proof)`.

### 6.3 poksho proof transcript (statement.rs) — byte-exact

Compact Schnorr (challenge + responses). Proof bytes = `challenge(32) || response_0(32) ||
response_1(32) || ...` (proof.rs:45), each a canonical little-endian scalar.

```
prove(scalars, points, message, randomness[32]):     # statement.rs:173
  g1 = scalars sorted by first-appearance order in the statement
  A  = points sorted likewise (index 0 = ristretto BASE, implicit)
  sho = ShoHmacSha256::new("POKSHO_Ristretto_SHOHMACSHA256")
  sho.absorb( statement.to_bytes() )                  # D, see encoding below
  for P in A: sho.absorb( P.compress() )              # A (32 bytes each, compressed ristretto)
  sho.ratchet()
  sho2 = sho.clone()
  sho2.absorb(randomness)                             # Z
  for s in g1: sho2.absorb(s.to_bytes())              # a (witness)
  sho2.ratchet(); sho2.absorb_and_ratchet(message)    # M
  nonce = [ reduce64( chunk ) for chunk in sho2.squeeze(64*len(g1)) ]
  R = homomorphism(nonce)                              # apply each equation's RHS to nonce
  for P in R: sho.absorb( P.compress() )
  sho.absorb_and_ratchet(message)
  challenge = reduce64( sho.squeeze(64) )
  response  = [ nonce_i + g1_i*challenge ]
  proof = challenge || response...
```
Verify recomputes `R = homomorphism(response) - challenge*A` and re-derives the challenge
(statement.rs:246). Note the **subtraction trick**: each equation's LHS point is subtracted with
scalar `-challenge` (statement.rs:377).

**Statement `to_bytes()` (D)** (statement.rs:332) — the proof is bound to the exact equation
structure by *indices*, not names:
```
Ne (1 byte)                              # number of equations
for each equation:
  lhs_point_index (1 byte)               # 0 = base point
  Nt (1 byte)                            # number of RHS terms
  for each term: scalar_index(1) point_index(1)
```
Indices are assigned by first appearance; point index 0 is pre-bound to the ristretto base point
(statement.rs:133). KAT (statement.rs:441): `add("A",[("a","G")])` → `[1,1,1,0,0]`.
KAT full proof for a 2-equation/4-scalar statement: statement.rs:550 (use to validate the prover).

### 6.4 Presentation serialized layout (zkc.rs:41, what goes in the group `Authorization`)

`AuthCredentialWithPniZkcPresentation` bincode order:
```
version(1) = 0x03 (PRESENTATION_VERSION_4)
proof: PresentationProof = commitments + poksho_proof
       commitments = C_x0(32) C_x1(32) C_V(32) + C_y (Vec<RistrettoPoint>: u64 len LE + N*32)
       poksho_proof = Vec<u8> (u64 len LE + bytes)
aci_ciphertext = E_A1(32) E_A2(32)
pni_ciphertext = E_A1(32) E_A2(32)
redemption_time(8) = u64 LE
```
The full `AUTH_CREDENTIAL_PRESENTATION_V4_RESULT` KAT (integration_tests.rs:38) is in §8 — match it
byte-for-byte. The wire format sent to the group server is base64 of this (`04 §2.3`).

ASCII flow:
```
        CLIENT                                   CHAT SERVER (issuer)            GROUP SERVER (verifier)
  GroupMasterKey ─derive─► GroupSecretParams
                            │ (uid_enc key)
  fetch auth cred ───────────────────────────►  issue_credential(aci,pni,rt)
                                                  IssuanceProof ───────────────►
  receive()/verify() ◄──── AuthCredWithPniZkcResponse(425B)
  store AuthCredentialWithPniZkc(265B)
  present(group_secret_params) ──────────────────────────────────────────────►  verify(server_secret,
   = proof + aci_ct + pni_ct + rt  (v4, ~? bytes)                                       group_public, rt)
```

---

## 7. Serialization (bincode, byte-exact)

zkgroup uses bincode with **fixed-int encoding, little-endian, reject-trailing-bytes**
(serialization.rs:12). Rules our TS serializer must replicate:
- Integers: fixed width, **little-endian**. `u8`→1, `u32`→4, `u64`→8 bytes LE. (Note: lengths inside
  proofs/`Vec` are `u64` LE; but the *semantic* timestamp/redemption fields are also LE u64 — yet
  `Timestamp::to_be_bytes` is used **inside hashing** (§5.2). Don't confuse the two: hashing uses BE,
  bincode wire uses LE.)
- `[u8; N]` / fixed arrays: raw N bytes, **no length prefix**.
- `Vec<T>`: `u64 LE length` then elements. (`poksho_proof: Vec<u8>`, `C_y: Vec<RistrettoPoint>`.)
- `RistrettoPoint`: 32-byte canonical compressed encoding (`.compress()`/`.toBytes()`).
- `Scalar`: 32-byte canonical little-endian; deserialization rejects non-canonical (simple_types.rs:142).
- `struct`: fields concatenated in declaration order, no names, no padding.
- `VersionByte<C>` / `ReservedByte` (serialization.rs:49): a single byte that **must equal C** on
  read (else error). `ReservedByte = VersionByte<0>`. Always the **first** field of wire types.
- `PhantomData` domain markers are `#[serde(skip)]` — zero bytes.
- `PartialDefault` is just a codegen detail for in-place deserialize; no wire effect.

Length constants (constants.rs) to assert against:
```
GROUP_MASTER_KEY_LEN=32  GROUP_SECRET_PARAMS_LEN=289  GROUP_PUBLIC_PARAMS_LEN=97
GROUP_IDENTIFIER_LEN=32  UUID_CIPHERTEXT_LEN=65       PROFILE_KEY_CIPHERTEXT_LEN=65
PROFILE_KEY_COMMITMENT_LEN=97  PROFILE_KEY_VERSION_ENCODED_LEN=64
AUTH_CREDENTIAL_WITH_PNI_LEN=265  AUTH_CREDENTIAL_WITH_PNI_RESPONSE_LEN=425
EXPIRING_PROFILE_KEY_CREDENTIAL_LEN=153  EXPIRING_PROFILE_KEY_CREDENTIAL_RESPONSE_LEN=497
SERVER_SECRET_PARAMS_LEN=2721  SERVER_PUBLIC_PARAMS_LEN=673
PRESENTATION_VERSION_4=3 (the v4/Zkc presentation leading byte)
```
The presentation lengths are variable (Vec-prefixed proofs); compare against the KAT bytes, not a
constant.

---

## 8. Test vectors (known-answer, fixed randomness — verify without live Signal)

These are exact and reproducible. All `TEST_ARRAY_*` are in constants.rs:56-90.
`TEST_ARRAY_16 = [0,1,...,15]`, `TEST_ARRAY_16_1 = [100..115]`, `TEST_ARRAY_32 = [0..31]`,
`TEST_ARRAY_32_1 = [100..131]`, `TEST_ARRAY_32_2 = [200..231]`, `TEST_ARRAY_32_3 = [1..32]`,
`TEST_ARRAY_32_4 = [2..33]`, `TEST_ARRAY_32_5 = [3..34]`.

### 8.1 SHO KATs (validate first)
- `ShoHmacSha256::new("asd"); absorb_and_ratchet("asdasd"); squeeze(64)` =
  `392cb944937303 7fa0c11aebed69cca3 b7d3bc9790878f34 1729c65d5506442f 04986cb5c9098f27 7c3ea640a4dc6e90 372b433a90af9aea 7072eaba3398c4fe` (shohmacsha256.rs:103).
- `ShoSha256::new("asd"); absorb_and_ratchet("asdasd"); squeeze(64)` starts `ebe4ef29e18aa541...`
  (shosha256.rs:109).

### 8.2 poksho proof KAT (validate the prover/statement)
The 2-equation complex statement KAT proof bytes are at statement.rs:550 (160-byte proof:
challenge + 4 responses). Reproduce exactly.

### 8.3 Lizard KAT
`lizard_encode::<Sha256>(TEST_ARRAY_16).lizard_decode::<Sha256>() == TEST_ARRAY_16`
(integration_tests.rs:28).

### 8.4 UID ciphertext KAT (uid_encryption.rs:117)
```
sho      = Sho::new("Test_Uid_Encryption", TEST_ARRAY_32)
key_pair = KeyPair::derive_from(sho)
aci      = Aci::from_uuid_bytes(TEST_ARRAY_16)
uid      = UidStruct::from_service_id(aci)
ciphertext = key_pair.encrypt(uid)         # 64 bytes
expected (uid_encryption.rs:148):
  f89ee7705a66036b 908db884211b773a c543ee35c4a30862 20fc3e1e35b4234c
  fa1d2eea2cc2f4b4 c42cff39a9dceb57 293b5f8770ca60f9 e9b74447bfd3bd3d
```
Also confirms `SystemParams::generate() == get_hardcoded()` (so re-derivation of `G_a1,G_a2` is
byte-exact). A PNI variant exists at uid_encryption.rs:162.

### 8.5 Profile-key ciphertext KAT (profile_key_encryption.rs:124)
```
sho      = Sho::new("Test_Profile_Key_Encryption", TEST_ARRAY_32_1)
key_pair = KeyPair::derive_from(sho)
profile_key = ProfileKeyStruct::new(TEST_ARRAY_32_1, TEST_ARRAY_16_1)
ciphertext  = key_pair.encrypt(profile_key)    # 64 bytes
expected (profile_key_encryption.rs:156):
  5618cb4c7d721e01 2b22f077ef1264f6 b143bb597a1d665a 70aa84245f246d20
  badb97474a56f4b5 361aeca9d118b700 4e14097199 0aab2a f2432d3f8f7d213a
```
Exercises single-Elligator (M3, M4) + decode round-trip (profile_key_encryption.rs:165).

### 8.6 ProfileKey access-key KAT (profile_key.rs:90)
`ProfileKey([b950...f359]).derive_access_key() == [24fb96d4a5e333e9d4451205b9e2faed]` (raw AES-256 of
`[0..0,2]`). Independent of ristretto — easy first portable check.

### 8.7 Group blob encryption KAT (group_params.rs:352)
`GroupSecretParams::generate([0;32]).encrypt_blob_with_padding([0;32], b"secret team", 0)` =
`3798afe9c65ffb35a63b2c048b16f19dd50ee9acc33cc925667a9abad4d4c6f86675fa8e32243e0831203700`
(AES-256-GCM-SIV; needs a GCM-SIV impl — note RFC 8452 KATs at group_params.rs:273 too). Also
integration_tests.rs:355 has another blob KAT.

### 8.8 Auth presentation v4 KAT (the big one — integration_tests.rs:67)
```
server_secret_params = ServerSecretParams::generate(TEST_ARRAY_32)
master_key           = TEST_ARRAY_32_1
group_secret_params  = GroupSecretParams::derive_from_master_key(master_key)
aci = Aci(TEST_ARRAY_16); pni = Pni(TEST_ARRAY_16_1)
redemption_time = 123456 * 86400   (epoch seconds)
issue randomness    = TEST_ARRAY_32_2
present randomness   = TEST_ARRAY_32_5
presentation.serialize() == AUTH_CREDENTIAL_PRESENTATION_V4_RESULT (integration_tests.rs:38)
  = 035e3e79afda8dc0...0060c77b02000000   (full hex in source, ~? bytes)
```
This single vector exercises: ServerSecretParams generation, group derivation, UID structs,
issuance, receive/verify, presentation, and serialization end to end. **This is the gold target.**
Also: `presentation.get_pni_ciphertext() == group_secret_params.encrypt_service_id(pni)` and the
redemption-time skew checks (±1 day) at integration_tests.rs:143.

### 8.9 Expiring profile-key presentation KATs (integration_tests.rs:167)
`PROFILE_KEY_CREDENTIAL_PRESENTATION_V3_RESULT` (integration_tests.rs:51) and `_V4_RESULT`
(integration_tests.rs:55) with master_key `TEST_ARRAY_32_1`, aci `TEST_ARRAY_16`, profile_key
`ProfileKey::create(TEST_ARRAY_32_1)`, request randomness `TEST_ARRAY_32_3`, issue randomness
`TEST_ARRAY_32_4`, present randomness `TEST_ARRAY_32_5`, plus an expiration timestamp. Use once the
profile path is ported.

### 8.10 Legacy MAC KAT (credentials.rs:438)
`ExpiringProfileKeyCredential` blinded MAC = `ef47110715831160...` — validates the legacy KVAC
generator-point ordering and `credential_core` math.

---

## Difficulty / feasibility (read before scoping)

**Verdict: feasible but front-loaded with two non-portable curve primitives.** The SHO, scalar
math, MACs, sigma proofs, and bincode serialization are all byte-mechanical and reproduce cleanly on
noble + the published KATs (≈ §8.1, §8.2, §8.4, §8.8 give a tight verification ladder). The hard
20% is **Lizard** (§4.2) and **single-Elligator + `decode_253_bits`** (§4.1/§4.3), which live in the
`curve25519-dalek-signal` fork, not in this tree and not in noble. They require porting the
ristretto Elligator2 forward/inverse maps over noble's `Fp`. Do those first against §8.3/§8.5 or the
whole effort stalls.

LoC estimate (TS, excluding tests): SHO + helpers ~150; generators/constants (hardcode + self-test)
~120; group params ~120; encryption (KeyPair/Ciphertext + decode) ~250; Lizard + Elligator + decode
~400 (the risk); poksho Statement/Proof ~350; zkcredential issuance+presentation ~500; auth Zkc
wrapper + serialization ~250; bincode helpers ~150. **≈ 2,300–2,800 LoC** for the auth path;
+~600 for the expiring-profile path. Riskiest: Lizard/Elligator (correctness + constant-time decode
brute force), then exact bincode `Vec` length-prefixing, then the irregular legacy generator order.

**Usable test vectors: yes, excellent.** Self-contained KATs at every layer (SHO, proof, Lizard,
both ciphertexts, full v4 auth presentation with fixed randomness) let us verify byte-for-byte
offline without a live Signal server. The §8.8 auth-presentation KAT is the definitive
end-to-end gate.

---

## Source files (GitHub permalinks, libsignal main)

- https://github.com/signalapp/libsignal/blob/main/rust/poksho/src/shohmacsha256.rs
- https://github.com/signalapp/libsignal/blob/main/rust/poksho/src/shosha256.rs
- https://github.com/signalapp/libsignal/blob/main/rust/poksho/src/shoapi.rs
- https://github.com/signalapp/libsignal/blob/main/rust/poksho/src/statement.rs
- https://github.com/signalapp/libsignal/blob/main/rust/poksho/src/proof.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkcredential/src/sho.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkcredential/src/attributes.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkcredential/src/credentials.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkcredential/src/issuance.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkcredential/src/presentation.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/common/sho.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/common/constants.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/common/simple_types.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/common/serialization.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/crypto/uid_struct.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/crypto/uid_encryption.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/crypto/profile_key_struct.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/crypto/profile_key_encryption.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/crypto/profile_key_commitment.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/crypto/credentials.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/crypto/timestamp_struct.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/groups/group_params.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/groups/uuid_ciphertext.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/groups/profile_key_ciphertext.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/profiles/profile_key.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/profiles/profile_key_version.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/profiles/profile_key_credential_presentation.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/auth/auth_credential_with_pni/zkc.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/src/api/server_params.rs
- https://github.com/signalapp/libsignal/blob/main/rust/zkgroup/tests/integration_tests.rs
- (Lizard / single-Elligator / decode_253_bits live in the `curve25519-dalek-signal` fork, not in
  libsignal: https://github.com/signalapp/curve25519-dalek — read its `lizard` module to port §4.)
