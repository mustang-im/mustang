# 08 — Post-Quantum Ratchet (SPQR)

> Based on **SPQR v1.5.1** + **libsignal main**, 2026-06-16.
> AGPL source read for spec + vectors only; our implementation is **clean-room** on the MIT `@noble/*` libraries.
> Citations are `file:line` into the two clones:
> - SPQR: `/tmp/spqr` → GitHub `signalapp/SparsePostQuantumRatchet@v1.5.1`
> - libsignal: `/tmp/libsignal/rust/protocol` → GitHub `signalapp/libsignal` (main)

This document tells a developer how to reimplement SPQR from scratch in TypeScript and unit-test it. It describes the algorithm, constants, KDF labels, byte layouts, and serialization precisely. It does **not** instruct anyone to copy AGPL code.

---

## 1. Big picture

### What SPQR is

SPQR ("Sparse Post-Quantum Ratchet") is the **public ratchet** half of Signal's "Triple Ratchet". It replaces the classic Diffie-Hellman ratchet of the Double Ratchet with an **ML-KEM-768 based ratchet**, so that the per-message key stream gains **post-quantum forward secrecy (FS)** and **post-compromise security (PCS)**. It does *not* implement a full messaging protocol; it outputs *message keys* (32-byte secrets) that the caller mixes into its existing key schedule (`/tmp/spqr/README.md`).

The hard problem SPQR solves: an ML-KEM-768 public key (~1.2 KB) and ciphertext (~1.1 KB) are far too large to attach to every message. SPQR therefore **streams** each large object across many messages using a systematic Reed-Solomon erasure code, and runs a careful state machine (the "ML-KEM Braid") so both sides converge on a fresh shared secret per *epoch* even with reordering, loss, and simultaneous sends.

### The Triple Ratchet combination (the exact mix)

The combination lives in libsignal, not SPQR. SPQR is an opaque box: `send`/`recv` consume a serialized state + a per-message wire blob, and emit an optional 32-byte `MessageKey`.

Per outgoing message (`triple_ratchet.rs:86-135`):
1. `spqr::send(pqr_state, rng) -> { state, msg, key }` (`triple_ratchet.rs:93-102`).
   - `msg` is the bytes that go on the wire as `SignalMessage.pq_ratchet` (field 5).
   - `key` is `Option<[u8;32]>` — present only once SPQR has completed an epoch (see §3).
2. `message_keys = sender_chain_key.message_keys().generate_keys(pqr_key)` (`triple_ratchet.rs:104`).
3. AES-256-CBC encrypt plaintext with `message_keys.cipher_key()` / `.iv()` (`triple_ratchet.rs:106`).
4. Build `SignalMessage` including `pq_ratchet = msg` (`triple_ratchet.rs:118-129`), MAC over the message with `message_keys.mac_key()`.
5. Advance: `sender_chain_key = next_chain_key()`, `pqr_state = new_pqr_state` (`triple_ratchet.rs:131-132`).

The actual key mix is **HKDF where the SPQR key is the salt** (`ratchet/keys.rs:100-118`):

```
DR_seed = HMAC-SHA256(chain_key, 0x01)         // classic message-key seed (keys.rs:172-176, 184)
message_keys = HKDF-SHA256(
    salt = pqr_key  (Option<[u8;32]>, may be None),
    ikm  = DR_seed,
    info = "WhisperMessageKeys")
  -> cipher_key[32] || mac_key[32] || iv[16]    // derive_arrays, keys.rs:106-110
```

So: the Double Ratchet output is the HKDF **IKM**; the SPQR per-epoch secret is the HKDF **salt**. When SPQR has no key yet (`pqr_key == None`, e.g. before the first epoch completes), HKDF salt is `None`, i.e. effectively all-zero salt, and the result equals the legacy Double-Ratchet message keys. This is how a brand-new session is bit-compatible with pre-SPQR derivation until the first epoch lands.

Receiving mirrors this (`triple_ratchet.rs:215-298`): derive DR message-key generator, call `spqr::recv(pqr_state, ciphertext.pq_ratchet())` to get `pqr_key`, then `generate_keys(pqr_key)`, verify MAC, AES-CBC-decrypt, and only **then** commit `pqr_state = new_pqr_state` (`triple_ratchet.rs:295`). State is never polluted on MAC/decrypt failure.

### Mandatory

`pq_ratchet` is field **5** of `SignalMessage`, `optional bytes` (`wire.proto:15`). Both session initializers set `version: V1, min_version: V1` with the comment *"Require that all clients speak SPQR"* (`ratchet.rs:85-88`, `148-151`). `min_version = V1` means a peer that downgrades to V0 is **rejected** with `Error::MinimumVersion` (`lib.rs:384-387`, tests `negotiation_refused_*` `lib.rs:988-1068`). So in current Signal, SPQR is effectively non-optional for new sessions.

---

## 2. Initialization

### `spqr::Params` (`lib.rs:54-60`)

| Field | Type | Meaning |
|---|---|---|
| `direction` | `Direction` (A2B=0 / B2A=1) | Which half of the braid this side starts on |
| `version` | `Version` (V0=0 / V1=1) | Highest version we speak |
| `min_version` | `Version` | Lowest version we'll accept (V1 = require SPQR) |
| `auth_key` | `&[u8]` (32 bytes in practice) | Root key for the Authenticator + symmetric chain |
| `chain_params` | `ChainParams` | `max_jump`, `max_ooo_keys` |

`Direction` enum wire values: `A_2_B = 0`, `B_2_A = 1` (`pq_ratchet.proto:218-221`). `Version`: `V_0 = 0` (disabled), `V_1 = 1` (`pq_ratchet.proto:213-216`).

### What `initial_state` builds (`lib.rs:210-234`)

- V0 → empty state (`empty_state()` = empty `Vec`, `lib.rs:45-47`). An **empty serialized state is interpreted as V0** (`decode_state`, `lib.rs:470-480`).
- V1 → a `PqRatchetState` protobuf with:
  - `inner`: the initial braid state for the direction — A2B starts `init_a` = `KeysUnsampled` (send_ek role); B2A starts `init_b` = `NoHeaderReceived` (send_ct role) (`lib.rs:196-208`, `states.rs:58-64`).
  - `chain`: `None` initially (built lazily from `version_negotiation`, `lib.rs:273-287`).
  - `version_negotiation`: carries `auth_key`, `direction`, `min_version`, `chain_params` so the chain can be created on first use (`lib.rs:220-225`).

The **direction is the only asymmetry**: A is the first sender (send_ek role), B the first responder (send_ct role). The `auth_key` is identical on both sides.

### Tie to PQXDH

`auth_key` = the `pqr_key` produced by PQXDH (`ratchet.rs:44-65, 83-96`). PQXDH's `HandshakeKeys { root_key, chain_key, pqr_key }` is computed by the handshake; `pqr_key` (32 bytes) is fed in as SPQR's `auth_key`. Initiator (Alice) → `Direction::A2B`; recipient (Bob) → `Direction::B2A`. `chain_params` come from `spqr_chain_params(self_session)` (`ratchet.rs:27-38`): `max_jump = MAX_FORWARD_JUMPS = 25_000` (`u32::MAX` for self-sessions), `max_ooo_keys = MAX_MESSAGE_KEYS = 2000` (`consts.rs:8-9`).

> ⚠️ The derivation of `pqr_key` inside PQXDH (`pqxdh.rs`) is out of scope for this doc — treat it as a given 32-byte secret. Document it separately if needed.

---

## 3. The ML-KEM Braid public ratchet

Each **epoch** establishes one fresh ML-KEM-768 shared secret. The two sides have fixed *roles within an epoch*: one side **sends the encapsulation key** (role `send_ek`), the other **sends the ciphertext** (role `send_ct`). After an epoch completes, the roles **switch** for the next epoch, so the braid alternates who generates the keypair. `Epoch` is a `u64` starting at **1** (`unchunked/send_ek.rs:78`, `send_ct.rs:95`).

The braid is "sparse": objects are streamed as 32-byte chunks (one chunk per message). A side only advances when it has fully received the object it was waiting for.

### Per-epoch crypto flow (the `unchunked` layer — the actual ML-KEM ops)

This is the conceptual handshake for one epoch, ignoring chunking. `send_ek` is the keypair owner; `send_ct` is the encapsulator.

```
send_ek (A)                                 send_ct (B)
 ─ generate ML-KEM keypair (ek, dk)          ─ wait for header
 ─ derive hdr = pk1 (64 B compressed seed)
 ─ MAC(hdr) --------- header + MAC --------▶  verify MAC, store hdr
 ─ send ek = pk2 (1152 B) ----- ek -------▶   (B does NOT request ek until it has sent ct1)
                              ◀─── ct1 ───   encaps1(hdr) -> (ct1 960B, encaps-state es, ss-part)
                                             B derives epoch secret here  ← key emitted on B side
 verify ek matches hdr (ek_matches_header)   recv ek, check ek_matches_header
                              ◀─── ct2 ───   encaps2(ek, es) -> ct2 (128B); MAC over ct1||ct2
 decaps(dk, ct1, ct2) -> ss
 derive same epoch secret  ← key on A side
 verify MAC over ct1||ct2
 epoch += 1, switch roles                     epoch += 1, switch roles
```

Key crypto details:

- **Keypair generation** (`incremental_mlkem768.rs:34-43`): seed-based `KeyPairCompressedBytes::from_seed(randomness)` where `randomness` is `KEY_GENERATION_SEED_SIZE` (64 B). Yields `hdr = pk1()` (64 B), `ek = pk2()` (1152 B), `dk = sk()` (2400 B). See §4 for the incremental split.
- **encaps1** (`incremental_mlkem768.rs:48-66`): `encapsulate1(hdr, randomness[32]) -> (ct1[960], es[2080], ss[32])`. Produces a *partial* ciphertext + an encapsulation state to be finished later.
- **encaps2** (`incremental_mlkem768.rs:71-79`): `encapsulate2(es, ek) -> ct2[128]`. Finishes the ciphertext using the full encapsulation key.
- **decaps** (`incremental_mlkem768.rs:156-169`): `decapsulate_compressed_key(dk, ct1, ct2) -> ss[32]`.
- **ek_matches_header** (`incremental_mlkem768.rs:28-30`): `validate_pk_bytes(hdr, ek)` — confirms a received `ek` is consistent with the previously MAC'd `hdr`. Mismatch ⇒ `Error::ErroneousDataReceived` (`unchunked/send_ct.rs:160-170`).

**Epoch-secret derivation** (identical on both sides — this is the per-epoch `key`):

```
ss_raw = ML-KEM-768 shared secret (32 B from encaps1/decaps)
info   = "Signal_PQCKA_V1_MLKEM768:SCKA Key" || epoch.to_be_bytes()   (u64 big-endian, 8 B)
ss     = HKDF-SHA256(salt = 0x00*32, ikm = ss_raw, info, L = 32)
```
Cited at `unchunked/send_ct.rs:130-135` (encapsulator side) and `unchunked/send_ek.rs:151-156` (keypair side). This 32-byte `ss` is wrapped as `EpochSecret { secret: ss, epoch }` and is exactly what `add_epoch` mixes into the symmetric chain (§6). The MAC is taken over `ct1 || ct2` (`unchunked/send_ek.rs:159-160`, `send_ct.rs:189-193`); see §7.

> Note the protocol's internal label is `Signal_PQCKA_V1_MLKEM768:...` — "PQCKA" / "SCKA" (Sparse/Post-Quantum Continuous Key Agreement). These exact ASCII strings are load-bearing.

### The chunked state machine (the braid)

Each role's unchunked machine is wrapped by a chunked machine that drives the RS encoder/decoder. The combined enum `States` has 11 variants (`states.rs:16-29`): 5 for `send_ek`, 6 for `send_ct`.

ASCII state diagram (epoch-internal; `current_epoch` carried by `uc.epoch`):

```
 send_ek role (A starts here on epoch 1)          send_ct role (B starts here on epoch 1)
 ┌──────────────────┐                             ┌──────────────────┐
 │ KeysUnsampled    │ send_hdr_chunk (samples     │ NoHeaderReceived │ recv Hdr chunks until
 └────────┬─────────┘  keypair, encodes hdr+MAC)  └────────┬─────────┘  full header decoded
          │ send Hdr chunks                                │ recv_header (verify MAC)
          ▼                                                ▼
 ┌──────────────────┐  recv first Ct1 chunk →     ┌──────────────────┐
 │ KeysSampled      │──── recv_ct1_chunk ───────▶ │ HeaderReceived   │ send_ct1_chunk:
 └────────┬─────────┘  switch to sending EK       └────────┬─────────┘  encaps1 → emits EpochSecret
          │ (also begins receiving ct1)                    │ send Ct1 chunks
          ▼                                                ▼
 ┌──────────────────┐  ct1 fully received         ┌──────────────────┐  recv EK chunks;
 │ HeaderSent       │──── recv_ct1_chunk Done ──▶ │ Ct1Sampled       │  branch on ct1_ack flag:
 └────────┬─────────┘                             └───┬───────┬───────┘   ek done + ack → Ct2Sampled
          │ send EK chunks (EkCt1Ack)                 │       │           ek done no-ack → EkReceivedCt1Sampled
          ▼                                           │       │           ack no-ek → Ct1Acknowledged
 ┌──────────────────┐  recv first Ct2 chunk       ┌───▼───────▼──────┐
 │ Ct1Received      │──── recv_ct2_chunk ───────▶ │ EkReceivedCt1Sampled / Ct1Acknowledged │
 └────────┬─────────┘                             └────────┬─────────┘
          │ send Ct1Ack(true)                              │ (converge)
          ▼                                                ▼
 ┌──────────────────┐  ct2 fully received         ┌──────────────────┐
 │ EkSentCt1Received│──── recv_ct2_chunk Done ──▶ │ Ct2Sampled       │ send Ct2 chunks
 └────────┬─────────┘   decaps → EpochSecret;     └────────┬─────────┘   recv_next_epoch on epoch+1
          │  epoch+1, role → send_ct                       │  epoch+1, role → send_ek
          ▼                                                ▼
   becomes NoHeaderReceived(epoch+1)                becomes KeysUnsampled(epoch+1)
```

Driving rules (`states.rs`):
- **`send`** picks the next chunk to emit based on current state, advancing the encoder; most transitions to "sampled" states happen here (`states.rs:115-273`). `send` only returns a non-None `key` when the send_ct side first does `send_ct1_chunk` in `HeaderReceived` (`states.rs:203-220`) — that is where `encaps1` produces the epoch secret.
- **`recv`** consumes an incoming `Message` (`states.rs:275-532`). It compares `msg.epoch` to current epoch:
  - `Greater` → generally `Error::EpochOutOfRange` **except** in `Ct2Sampled` where `epoch == current+1` triggers `recv_next_epoch` → next epoch in `KeysUnsampled` (the role-switch, `states.rs:513-529`).
  - `Less` → ignore (stale), keep state.
  - `Equal` → feed the chunk to the appropriate decoder; transition when the object fully decodes.
- The send_ek side emits the epoch secret only when it **finishes receiving ct2** and decapsulates (`recv_ct2_chunk` Done, `states.rs:357-369` → `unchunked/send_ek.rs:139-172`).

**Message payload types** (which object a chunk belongs to) — enum `MessagePayload` (`states.rs:31-39`) and wire `MessageType` (`states/serialize.rs:95-105`):

| MessageType | value | Direction | Carries |
|---|---|---|---|
| None | 0 | either | no payload (idle/poll) |
| Hdr | 1 | send_ek→send_ct | header (pk1) chunk |
| Ek | 2 | send_ek→send_ct | encapsulation key (pk2) chunk |
| EkCt1Ack | 3 | send_ek→send_ct | ek chunk + "I have your ct1" ack |
| Ct1Ack | 4 | send_ek→send_ct | bare ack (bool true), no chunk |
| Ct1 | 5 | send_ct→send_ek | ct1 chunk |
| Ct2 | 6 | send_ct→send_ek | ct2 (+MAC) chunk |

The "ack" merging (EkCt1Ack, Ct1Ack) lets the braid converge under simultaneous send / reordering: the send_ek side piggybacks "I received your ct1" onto its ek chunks, so the send_ct side knows when to finalize ct2. The convergence branches are the four `Ct1SampledRecvChunk` cases (`send_ct.rs:148-153`, `163-197`).

**Convergence guarantee:** in lockstep, A sends Hdr, B receives header → sends Ct1 (emits epoch secret), A receives ct1 → sends Ek, B receives ek + ack → sends Ct2, A receives ct2 → decapsulates (emits same epoch secret), both bump epoch and swap roles. Out of order, each side keeps re-sending the current object's chunks until the peer has enough to decode (`send` always returns *some* chunk of the in-flight object).

---

## 4. Incremental ML-KEM-768

"Incremental" = libcrux's `mlkem768::incremental` API, which **splits** both the public key and the ciphertext into two parts so each can be transmitted/processed separately:

| Object | symbol | size | libcrux fn | source |
|---|---|---|---|---|
| Header (pk part 1) | `hdr` | **64** | `pk1_len()` | `incremental_mlkem768.rs:13` |
| Encapsulation key (pk part 2) | `ek` | **1152** | `pk2_len()` | `incremental_mlkem768.rs:15` |
| Decapsulation key (secret) | `dk` | **2400** | (sk) | refine `unchunked/send_ek.rs:51` |
| Ciphertext part 1 | `ct1` | **960** | `Ciphertext1::len()` | `incremental_mlkem768.rs:8` |
| Ciphertext part 2 | `ct2` | **128** | `Ciphertext2::len()` | `incremental_mlkem768.rs:11` |
| Encapsulation state | `es` | **2080** | `encaps_state_len()` | `incremental_mlkem768.rs:54`, refine `unchunked/send_ct.rs:66` |
| Shared secret | `ss` | **32** | `SHARED_SECRET_SIZE` | `incremental_mlkem768.rs:55` |
| Keygen seed | — | **64** | `KEY_GENERATION_SEED_SIZE` | `incremental_mlkem768.rs:35` |

Sanity: standard ML-KEM-768 is `ek=1184, dk=2400, ct=1088`. Incremental: `hdr+ek = 64+1152 = 1216` (32 B larger than 1184 — `hdr` is a compressed seed/hash of the rho part, not just a slice). `ct1+ct2 = 960+128 = 1088` (exactly the standard ct).

**Why split:** the encapsulator can begin (`encaps1` over `hdr` alone, 64 B) and produce `ct1` (960 B) **before** it has received the full 1152-byte `ek`. Then `encaps2(ek, es)` finishes with just 128 more bytes. This pipelines the braid: the small `hdr` MAC commits the keypair early, and the large `ek` and `ct1` stream in parallel.

### ⚠️ libcrux issue #1275 (endianness of stored `es`)

Older serialized `EncapsulationState` (the `error2` polynomial portion) may have wrong endianness. Before `encaps2`, SPQR inspects `es[1536 .. 2080-32]` as little-endian `i16`s; if values lie outside η₂ range `[-2,2]` in the expected encoding, it byte-swaps each `i16` pair (`incremental_mlkem768.rs:92-151`). A clean-room TS port using `@noble/post-quantum`'s ML-KEM will **not** have this bug, so this fixup can be **omitted** — *but* a TS port must still be able to deserialize old states (see §8, regression vectors `issue1275_*_state.in`).

> ⚠️ **Risk:** `@noble/post-quantum` does **not** expose an "incremental"/split ML-KEM API. A TS port must either (a) reproduce the pk1/pk2 and ct1/ct2 split byte-for-byte to stay wire-compatible with Signal peers, or (b) only interoperate with itself. The exact split (which bytes go in `hdr` vs `ek`, the `es` layout) is defined by libcrux `mlkem768::incremental`, **not** by the FIPS-203 standard, and is the single biggest reimplementation risk. See §10.

---

## 5. Reed-Solomon erasure coding (the novel part)

Goal: turn a fixed-length message `M` (e.g. the 1152-byte `ek`) into an unbounded stream of 32-byte **chunks**, indexed `0,1,2,…`, such that **any** `ceil(len(M)/32)` distinct chunks reconstruct `M`. This is a *systematic-ish* RS code over GF(2¹⁶): the first chunks reproduce the original data; later chunks are parity that any subset can substitute.

### The field: GF(2¹⁶) (`encoding/gf.rs`)

- Elements are `u16`. Primitive polynomial `POLY = 0x1100b` (octal 0o210013) (`gf.rs:7`).
- **Add/Sub = XOR** (`gf.rs:28`, `81-83`).
- **Mul** = carry-less multiply then reduce mod `POLY`. Reference (portable) impl: `unaccelerated::poly_mul` (shift-and-XOR long multiply, `gf.rs:381-427`) followed by `reduce::poly_reduce` (table-driven Barrett-style reduction with a precomputed 256-entry `REDUCE_BYTES` table, `gf.rs:489-537`). The x86 PCLMULQDQ / aarch64 PMULL paths (`gf.rs:227-286`) are optimizations that must give **identical** results — port only the portable path.
- **Div** = `a · b^(2¹⁶-2)` (Fermat inverse), via square-and-multiply 15 times (`gf.rs:548-557`, const variant `571-588`).
- Constants: `ZERO = 0`, `ONE = 1` (`gf.rs:541-542`).

For a TS port: implement GF(2¹⁶) with a `mul(a,b)` that long-multiplies two u16 into a u32 then reduces by repeatedly XOR-ing `POLY << k` for each set bit `k` in `[16..31]`, plus a Fermat-inverse `div`. (You can skip the byte-table optimization; a straightforward reduce loop is fine and easier to verify.) Cross-check against the `gf.rs` unit tests `add`/`mul`/`div` (`gf.rs:601-640`) which compare against the external `galois_field_2pm` crate.

### The code parameters (`encoding/polynomial.rs`)

- **Chunk size** = `CHUNK_SIZE = 32` bytes (`polynomial.rs:504`).
- **Number of parallel polynomials** = `NUM_POLYS = CHUNK_SIZE/2 = 16` (`polynomial.rs:506`). Each GF element is 2 bytes, so one 32-byte chunk = **16 field elements**, one per polynomial.

The message is interpreted as a sequence of 2-byte big-endian field elements, **round-robin distributed across 16 independent polynomials**. Element `i` (0-based) of the message goes to polynomial `i % 16` as that polynomial's next data point (`encode_bytes_base`, `polynomial.rs:657-678`):

```
poly j holds the message elements at positions j, j+16, j+32, …
the value at position (16*k + j) is the data point with X = k for polynomial j
```

So polynomial `j` is the unique polynomial of degree `< D_j` passing through points `{ (x=k, y=element_{16k+j}) : k = 0 .. D_j-1 }`, where `D_j` = number of message elements assigned to poly `j`.

**Chunk `idx`** is built by evaluating, for each of the 16 polynomials, the polynomial at the X-coordinate that round-robin maps to `(idx, i)` (`chunk_at`, `polynomial.rs:681-697`):

```
for i in 0..16:
    total_idx = idx*16 + i
    poly      = total_idx % 16          // = i  (since idx*16 % 16 == 0)
    poly_idx  = total_idx / 16          // = idx
    y         = polynomial[poly].evaluate(X = poly_idx)
    append y as 2 big-endian bytes
chunk = { index: idx (u16), data: [32 bytes] }
```

Because `poly = i` and `poly_idx = idx` for every i, **chunk `idx` = the 16 polynomials all evaluated at X = idx**, concatenated. Chunk 0 = all polys at X=0 = the first 16 message elements = literally the first 32 message bytes (systematic property); chunk 1 = next 32 bytes; … up to the data range, then parity beyond.

### Encoder state machine (`PolyEncoder`)

Two representations (`EncoderState`, `polynomial.rs:516-522`):
- **`Points`**: the raw data points, one `Vec<GF16>` per poly (the as-received y-values for X = 0,1,2,…). Used while requested X-coords are within the data range — no interpolation needed (`point_at`, `polynomial.rs:611-620`).
- **`Polys`**: once a requested X exceeds the stored data range, the encoder Lagrange-interpolates each poly **once** from its points into an explicit coefficient polynomial, switches to `Polys`, and evaluates from there on (`point_at`, `polynomial.rs:620-654`). `from_complete_points` requires the points to fill `X = 0..N` exactly (`polynomial.rs:288-324`); precomputed Lagrange basis polys exist for sizes 1,3,5,30,34,36 (`polynomial.rs:496-501`) with a generic fallback (`polynomial.rs:308-321`).

`next_chunk` just emits `chunk_at(idx)` then `idx = idx.wrapping_add(1)` (`polynomial.rs:721-725`).

### Decoder (`PolyDecoder`, `polynomial.rs:728-936`)

State: `pts_needed = len_bytes/2` (total field elements expected), and 16 `SortedSet<Pt>` (one per poly, keyed/deduped by X) (`polynomial.rs:746`, `new_with_poly_count` `769-778`).

`necessary_points(poly)` (`polynomial.rs:758-766`): poly `j` needs `floor(pts_needed/16)` points, plus 1 if `j < pts_needed%16`. (Distributes the remainder across the first polys.)

`add_chunk` (`polynomial.rs:851-876`): de-interleaves the 32-byte chunk into 16 `(X=poly_idx, Y)` points, one per poly, where `poly_idx = (chunk.index*16 + i)/16 = chunk.index`. It adds a point to poly `j` only if (a) `poly_idx < necessary_points(j)` (a low-index point that lets us decode without interpolation) **or** (b) we don't yet have enough points for poly `j`. Duplicate X is dropped (SortedSet equality is X-only, `polynomial.rs:60-64`).

`decoded_message` (`polynomial.rs:883-935`): if every poly has `>= necessary_points`, reconstruct each of the `pts_needed` elements: for element `i`, `poly = i%16`, `X = i/16`; if a point with that X is already present, use its Y directly; otherwise Lagrange-interpolate poly `poly` (lazily, once) from its `necessary_points` points and evaluate at X. Output 2 big-endian bytes per element. Returns `None` until complete; sets nothing destructive (the `is_complete` flag prevents re-emitting, `polynomial.rs:884`).

### Lagrange interpolation (`Poly`, `polynomial.rs:77-350`)

- Coefficients are `Vec<GF16>`, **little-endian** (index 0 = constant term).
- `lagrange_interpolate(pts)` (`polynomial.rs:106-137`): standard Lagrange over GF(2¹⁶), O(N²). Builds `PRODUCT(x - pᵢ.x)` once (`lagrange_interpolate_prepare`, `144-163`), then for each point divides out its `(x - pᵢ.x)`, scales by `pᵢ.y / PRODUCT_{j≠i}(pᵢ.x - pⱼ.x)`, and sums (`lagrange_interpolate_complete`, `197-223`). Note the internal representation is "scaled by x" for efficiency; callers drop the lowest coefficient (`118-119`, `131-134`).
- `compute_at(x)` (`polynomial.rs:255-272`): Horner-ish — builds `x^0..x^N` then dot-products with coefficients.
- Serialize: each coefficient as 2 big-endian bytes (`serialize`, `326-337`; `deserialize`, `339-349`).

### RS chunking diagram

```
message bytes:  e0 e0 | e1 e1 | e2 e2 | ... (each eK is a 2-byte GF16 element, big-endian)
round-robin into 16 polynomials:
   poly0:  e0 ,  e16 ,  e32 , ...     (points (0,e0),(1,e16),(2,e32),...)
   poly1:  e1 ,  e17 ,  e33 , ...
    ...
   poly15: e15,  e31 ,  e47 , ...

chunk[idx] = [ poly0(idx) | poly1(idx) | ... | poly15(idx) ]   (16 GF16 = 32 bytes)
            = original data when idx < D   (systematic)
            = parity (interpolated) when idx >= D

reconstruct: collect any necessary_points(j) points per poly j → interpolate → evaluate
```

---

## 6. Symmetric chain (`chain.rs`, `kdf.rs`)

The symmetric ratchet turns each epoch secret into a per-message-index key stream and tolerates out-of-order delivery.

### KDF primitive (`kdf.rs`)

`hkdf_to_vec(salt, ikm, info, L)` / `hkdf_to_slice(...)` = **HKDF-SHA256** (RFC 5869), extract-then-expand (`kdf.rs:6-18`). All SPQR KDF calls use this.

### Chain construction (`Chain::new`, `chain.rs:329-348`)

```
genr8r[96] = HKDF-SHA256(salt=0x00*32, ikm=initial_key, info="Signal PQ Ratchet V1 Chain  Start", L=96)
            // NOTE the DOUBLE SPACE in "Chain  Start"  (chain.rs:334)
next_root  = genr8r[0..32]
send seed  = genr8r[32..64] if dir==A2B else genr8r[64..96]   (ced_for_direction, chain.rs:321-327)
recv seed  = the other 32-byte slice
current_epoch = send_epoch = 0
links = [ Epoch { send: CED(send seed), recv: CED(recv seed) } ]
```

`initial_key` here is the `auth_key` when the chain is first created from version negotiation (`lib.rs:331-339`). Epoch 0 exists before any ML-KEM secret; it produces the keys used while SPQR is still negotiating its first real epoch.

### Adding an epoch (`add_epoch`, `chain.rs:350-369`)

When an `EpochSecret { epoch = current+1, secret }` arrives (from §3):
```
genr8r[96] = HKDF-SHA256(salt=next_root, ikm=epoch_secret.secret,
                         info="Signal PQ Ratchet V1 Chain Add Epoch", L=96)
current_epoch = epoch_secret.epoch
next_root     = genr8r[0..32]
push link Epoch { send: CED(genr8r[dir slice]), recv: CED(genr8r[other slice]) }
```
The `next_root` is the running root key; it chains epochs together so compromise of one epoch's keys doesn't reveal others (PCS).

### Per-direction key derivation (`ChainEpochDirection`, `chain.rs:210-317`)

Each `(epoch, direction)` has a `next` 32-byte chain key and a counter `ctr` (starting 0). To advance one step (`next_key_internal`, `chain.rs:228-245`):
```
ctr += 1
genr8r[64] = HKDF-SHA256(salt=0x00*32, ikm=next,
                         info = ctr.to_be_bytes() || "Signal PQ Ratchet V1 Chain Next", L=64)
next = genr8r[0..32]          // ratchet the chain key forward
key  = genr8r[32..64]         // the message key for this (epoch,ctr)
return (ctr, key)
```
- **Send** (`send_key`, `chain.rs:384-407`): returns `(index, key)` for the current send epoch; prunes old epochs / clears spent `next` chain keys (forward secrecy). Errors if the send epoch decreases (`SendKeyEpochDecreased`).
- **Recv** (`recv_key` → `key(at, ...)`, `chain.rs:409-411`, `247-296`): can fetch any index `at`. If `at > ctr`, ratchet forward (storing skipped keys in `prev` history for later out-of-order arrival) up to `max_jump` ahead (`KeyJump` error if exceeded). If `at < ctr`, look up in `prev` history (`KeyTrimmed` if GC'd, `KeyAlreadyRequested` if already consumed). `at == ctr` ⇒ `KeyAlreadyRequested`.
- **KeyHistory** (`chain.rs:91-208`): stores skipped keys as `[BE32 index][32-byte key]` (36 B each), GC'd beyond `max_ooo_keys` behind current; trim threshold `max_ooo*11/10 + 1` (`chain.rs:84-88`).

### ChainParams (`chain.rs:16-89`, proto `223-231`)

`max_jump` default **25_000**, `max_ooo_keys` default **2_000** (`DEFAULT_CHAIN_PARAMS`, `chain.rs:34-37`). On the wire, `0` means "use default" (`into_pb`/`*_or_default`, `chain.rs:40-81`).

### How send/recv tie chain + braid (`lib.rs`)

- `send` (`lib.rs:263-324`): run braid `send`; if it produced an `EpochSecret`, `chain.add_epoch(...)`; then `chain.send_key(msg.epoch - 1)` → `(index, msg_key)`; serialize message with that `index`. Note the **`epoch - 1`**: the chain epoch is one behind the braid epoch (the braid is already negotiating the *next* epoch's KEM). Special case: if no chain exists yet (still pure negotiation), `index = 0, key = None`.
- `recv` (`lib.rs:354-453`): version-negotiate (§8), deserialize message, run braid `recv`; if it produced an `EpochSecret`, `chain.add_epoch(...)`; then `msg_key_epoch = scka_msg.epoch - 1`; if `(msg_key_epoch == 0 && index == 0)` ⇒ no key (`vec![]`), else `chain.recv_key(msg_key_epoch, index)`.

---

## 7. Authenticator (`authenticator.rs`)

Authenticates the ML-KEM header and ciphertext so a MITM can't substitute a different keypair/ciphertext. It is a **keyed running MAC** whose key is ratcheted with each epoch secret, binding the braid to the shared `auth_key` and to all prior epoch secrets.

State: `{ root_key[32], mac_key[32] }` (`authenticator.rs:27-30`). `MACSIZE = 32` (`authenticator.rs:34`).

- **`new(root_key, ep)`** (`authenticator.rs:35-42`): start with `root_key = mac_key = 0x00*32`, then `update(ep, root_key)`. (So the very first update folds in the `auth_key`.)
- **`update(ep, k)`** (`authenticator.rs:44-54`):
  ```
  ikm  = root_key || k
  info = "Signal_PQCKA_V1_MLKEM768:Authenticator Update" || ep.to_be_bytes()   (u64 BE)
  out  = HKDF-SHA256(salt=0x00*32, ikm, info, L=64)
  root_key = out[0..32]; mac_key = out[32..64]
  ```
  Called with the epoch secret on both sides right after deriving it (`unchunked/send_ct.rs:136`, `send_ek.rs:158`), so the MAC key tracks the freshly agreed secret.
- **`mac_hdr(ep, hdr)`** (`authenticator.rs:90-104`):
  ```
  HMAC-SHA256(key=mac_key, data = "Signal_PQCKA_V1_MLKEM768:ekheader" || ep.to_be_bytes() || hdr)[0..32]
  ```
- **`mac_ct(ep, ct)`** (`authenticator.rs:65-79`):
  ```
  HMAC-SHA256(key=mac_key, data = "Signal_PQCKA_V1_MLKEM768:ciphertext" || ep.to_be_bytes() || ct)[0..32]
  ```
  where `ct = ct1 || ct2` (160+ … = 1088 bytes; `unchunked/send_ek.rs:159`, `send_ct.rs:192`).
- **`verify_*`** use constant-time `compare` (`util.rs`, `authenticator.rs:57-63, 81-88`).

So per epoch: the **header is MAC'd before any KEM secret exists** (commit), and the **ciphertext is MAC'd after the epoch secret has been folded into `mac_key`** (binds ct to the agreed secret + history). Wire labels exactly: `"...:ekheader"`, `"...:ciphertext"`, `"...:Authenticator Update"`, `"...:SCKA Key"`.

---

## 8. Serialization (`serialize.rs`, `proto.rs`, `pq_ratchet.proto`)

Two distinct serializations: **state** (protobuf) and **wire message** (custom).

### State = protobuf `PqRatchetState` (`pq_ratchet.proto:25-38`)

```
PqRatchetState {
  VersionNegotiation version_negotiation = 1; // {auth_key:1, direction:2, min_version:3, chain_params:4}
  Chain             chain                = 2;  // §6 serialized chain
  oneof inner { V1State v1 = 3; }              // absent => V0
}
```
Empty bytes ⇒ V0 / all-None (`lib.rs:470-480`). `current_version` reports StillNegotiating vs NegotiationComplete based on presence of `version_negotiation` (`lib.rs:247-260`).

`V1State` (`pq_ratchet.proto:66-193`) is a `oneof inner_state` over the **11 chunked states** (`keys_unsampled=1 … ct2_sampled=11`), each wrapping an `Unchunked.*` message plus `PolynomialEncoder`/`PolynomialDecoder` for the in-flight chunk streams. Field numbers are exactly as in the proto. `Authenticator { root_key:1, mac_key:2 }`. `Chain { direction:1, current_epoch:2, links:3 (repeated Epoch), next_root:4, send_epoch:5, params:6 }`, `Epoch { send:1, recv:2 }`, `EpochDirection { ctr:1, next:2, prev:3 }`.

`PolynomialEncoder { idx:1, pts:2 (repeated bytes), polys:3 (repeated bytes) }` — exactly one of `pts`/`polys` is non-empty (proto comment `8-16`). Each `pts[j]` = poly j's points as concatenated 2-byte BE y-values (X is implicit = position); each `polys[j]` = poly j's coefficients as 2-byte BE each (`polynomial.rs:537-567`). There are always 16 entries (`NUM_POLYS`).

`PolynomialDecoder { pts_needed:1, polys:2(=16), pts:3 (repeated bytes, 16 of them), is_complete:4 }`. Each `pts[j]` = SortedSet of `Pt` serialized as 4 bytes each: `X(2 BE) || Y(2 BE)` (`Pt::serialize`, `polynomial.rs:32-37`; decoder `into_pb`/`from_pb`, `polynomial.rs:780-826`).

> Use `protobufjs` or generate from the `.proto` for the state. Field numbers above are authoritative.

### Wire message = custom bytes (`states/serialize.rs:205-279`)

This is the content of `SignalMessage.pq_ratchet`. **Not protobuf** — a hand-rolled compact format:

```
[version]       1 byte    = 0x01 for V1 (Version::V1.into())
[epoch]         varint    1-10 bytes (u64, protobuf-style LEB128)
[index]         varint    1-5 bytes  (u32 chunk index INTO THE CHAIN, from chain.send_key)
[message_type]  1 byte    0..6 (table in §3)
-- if message_type carries a chunk (Hdr/Ek/EkCt1Ack/Ct1/Ct2): --
[chunk.index]   varint    1-3 bytes  (u16 RS chunk index)
[chunk.data]    32 bytes
```
Cited: `serialize` `states/serialize.rs:222-246`, `deserialize` `248-279`. Varint is standard unsigned LEB128 (`encode_varint`/`decode_varint`, `137-183`; test: `encode_varint(0x012C) == [0xAC,0x02]`, `289-294`). `MessageType::None` and `Ct1Ack` carry **no** chunk. `Ct1Ack` deserializes to `Ct1Ack(true)` (`273-274` — actually `268`). **Trailing bytes are allowed** for forward-compat (`deserialize` comment, `275-278`). An empty `pq_ratchet` (len 0) ⇒ V0 message (`msg_version`, `lib.rs:462-468`).

Note the two distinct "index" fields: the **outer** `index` (varint after epoch) is the symmetric-chain message index (`chain.send_key` result, `lib.rs:298-303`); the **inner** `chunk.index` is the RS chunk number. Don't conflate them.

### Version negotiation (`lib.rs:354-410`)

On `recv`, compare incoming `msg_version` to our state version:
- msg higher than we support → ignore, keep our format (`lib.rs:362-369`).
- equal/greater → proceed.
- msg lower → if we still allow negotiation and `msg_version >= our min_version`, downgrade (re-init `inner` for that version, drop further negotiation, keep chain); else `VersionMismatch` / `MinimumVersion` (`lib.rs:375-408`). Receiving always **clears** `version_negotiation` (`lib.rs:439`); sending never changes it (`lib.rs:309`).

---

## 9. Test vectors

**There are no published per-step known-answer vectors (KATs) in the SPQR test suite.** The tests are property/round-trip/fuzz style (`/tmp/spqr/src/test/orchestrator.rs` random chaos runs; `lib.rs:490-1126` send/recv equality checks). So for "no trial and error," generate our own KATs from the Rust crate, and use these usable anchors that *are* in-tree:

### 9.1 Usable in-tree constants and small vectors

- **GF(2¹⁶) multiply/reduce**: cross-check against `galois_field_2pm` semantics with `POLY = 0x1100b` (`gf.rs:7`, tests `gf.rs:601-640`). E.g. implement `mul`, `div`, then random-test against a second independent impl, exactly as the crate does.
- **Varint** (`states/serialize.rs:289-323`):
  - `encode_varint(0x012C) == [0xAC, 0x02]`
  - `decode_varint([0xFF,0xAC,0x02,0xFF], at=1) == 0x012C`, `at -> 3`
  - `decode_varint([0x00], at=0) == 0`, `at -> 1`
- **RS round-trip** (`polynomial.rs:944-1042`):
  - `PolyEncoder::encode_bytes("abcdefghij")` then decode using only `chunk_at(1)` and `chunk_at(2)` (NOT chunk 0) ⇒ reconstructs `"abcdefghij"` (proves erasure recovery from non-systematic chunks).
  - `encode_bytes([3u8;1088])`, feed chunks starting at index `1088/32+1 = 35` (skip all systematic chunks) ⇒ reconstructs `[3;1088]`.
  - `Pt{x:0x1234,y:0x5678}.serialize() == [0x12,0x34,0x56,0x78]`.
- **incremental ML-KEM round-trip** (`incremental_mlkem768.rs:177-185`): `keys = generate(seed)`, `(ct1,es,ss1)=encaps1(hdr)`, `ct2=encaps2(ek,es)`, `ss2=decaps(dk,ct1,ct2)` ⇒ `ss1 == ss2`. Plus the size assertions of §4.
- **Chain directions match** (`chain.rs:463-487`): with `initial_key=b"1"`, A2B `send_key(0)` returns index `1` and a key equal to B2A `recv_key(0,1)`; after `add_epoch(epoch=1, secret=[2])` on both, `send_key(1)` index `1` matches `recv_key(1,1)`; the 10th `send_key(1)` is index `10` and matches `recv_key(1,10)`. This anchors the chain KDF labels and the double-space `"Chain  Start"`.
- **End-to-end lockstep state dump** (`lib.rs:1073-1126`, `lockstep_run_with_logging`): with `auth_key = [0x29; 32]` (decimal 41), `version=min_version=V1`, A2B/B2A, 30 lockstep rounds, then `log::info!` of the final hex of both serialized states. Running this test with `RUST_LOG=info` **prints byte-exact `alex_state` / `blake_state` hex** — capture these as the canonical end-state KAT.
- **Regression states** (`lib.rs:1128-1172`): `src/issue1275_a_state.in` (5621 B) and `issue1275_b_state.in` (6153 B) are real serialized `PqRatchetState`s 30 steps into a lockstep run (binary; load via `include_bytes!`). A TS port must `decode_state` these and continue 20 more lockstep steps successfully. Useful as deserialization fixtures even if we skip the endianness fixup.

### 9.2 Recommended KAT-generation harness (do this, deterministically)

Because the crate uses `OsRng`, to get reproducible vectors add a tiny harness (in a *throwaway* checkout of the AGPL crate — for vector extraction only) that:
1. seeds a deterministic RNG (e.g. `ChaCha20Rng::from_seed([0u8;32])`),
2. `initial_state` for A2B and B2A with `auth_key=[0x29;32]`, default `chain_params`,
3. runs N lockstep `send`/`recv` rounds,
4. emits, per step: the hex of `msg`, the `key` (or "None"), and the resulting state hex.

Capture that table. Our TS port, fed the same seed and inputs, must reproduce every `msg`/`key`/state byte-for-byte. This is the only way to get full-coverage KATs since Signal ships none. (`@noble` ML-KEM uses a different internal RNG path, so KEM-dependent bytes will only match if seeds + the incremental split match — see §10 risk.)

---

## 10. Clean-room TS port — summary, difficulty, feasibility

### What to build (modules mirroring the Rust)
1. `gf16.ts` — GF(2¹⁶), POLY `0x1100b`, add(XOR)/mul/div, portable reduce. (~120 LoC)
2. `polynomial.ts` — `Poly` (Lagrange interpolate, compute_at, serialize), `PolyEncoder`, `PolyDecoder`, round-robin over 16 polys, chunk size 32. (~450 LoC)
3. `incremental_mlkem768.ts` — wrap ML-KEM-768 with the pk1/pk2 + ct1/ct2 split. (~150 LoC + risk)
4. `authenticator.ts` — HKDF/HMAC-SHA256 running MAC, the four labels. (~80 LoC)
5. `chain.ts` — symmetric ratchet, KeyHistory, ChainParams. (~400 LoC)
6. `kdf.ts` — HKDF-SHA256 helper. (~15 LoC)
7. `braid/*.ts` — unchunked + chunked state machines (11 states), `MessagePayload`/`MessageType`. (~700 LoC)
8. `serialize.ts` — wire message (custom varint) + state protobuf (protobufjs). (~300 LoC)
9. `spqr.ts` — `initialStary/send/recv/currentVersion`, version negotiation. (~250 LoC)
10. Triple-ratchet glue in `SessionCipher.ts`: HKDF mix (salt=pqr_key, ikm=DR_seed, info `WhisperMessageKeys`). (~40 LoC)

**Total estimate: ~2,500–3,000 LoC** of non-trivial TS, plus tests.

### Riskiest parts (in order)
1. **Incremental ML-KEM split (highest risk).** `@noble/post-quantum` exposes standard `ml_kem768` (keygen/encaps/decaps) but **not** libcrux's incremental pk1/pk2 + ct1/ct2 + encaps-state API. To be **wire-compatible with real Signal peers**, the exact byte split (what's in the 64-byte `hdr` vs the 1152-byte `ek`, the 2080-byte `es` layout, the 960/128 ct split) must match libcrux's `mlkem768::incremental` byte-for-byte. That layout is **libcrux-specific, not FIPS-203**, and is not documented here at byte granularity (⚠️ UNKNOWN: exact `es`/`hdr`/`ct1`/`ct2` field encodings). Options: (a) reverse-engineer libcrux's incremental encoding from its source and reimplement on `@noble` primitives — substantial; (b) port/compile libcrux's incremental ML-KEM to WASM; (c) accept self-interop only (no real-Signal interop) by using standard ML-KEM with a deterministic split of our own. For *our* use (Signal interop) only (a)/(b) are viable.
2. **GF(2¹⁶) + Lagrange correctness.** Subtle but bounded; the field has independent test oracles and the RS round-trip tests are strong. Get `POLY`, big-endian element encoding, and the "scaled by x" interpolation representation right. Medium risk, fully verifiable.
3. **Braid state machine convergence under reorder/loss.** 11 states × payload types × epoch-compare branches. High behavioral complexity but deterministic; the orchestrator chaos test is the spec. Medium-high risk; mitigate with a port of the lockstep + chaos harness.
4. **KDF label/byte exactness.** Easy to get wrong (the double space in `"Chain  Start"`, BE u64 epochs, salt=zeros vs salt=next_root). Low risk if you copy labels verbatim from §6/§7.
5. **Two protobuf serializations + custom wire format.** Mechanical; field numbers are pinned. Low risk.

### Test vectors verdict
**No official KATs exist.** Strong in-tree round-trip/property tests and a few concrete small vectors (varint, RS recovery, Pt serialize, chain-direction match) are usable immediately (§9.1). For full coverage you must **self-generate deterministic KATs** from a seeded run of the AGPL crate (§9.2) and the `lockstep_run_with_logging` hex dump + the two `issue1275_*_state.in` fixtures. Feasible, but the ML-KEM-dependent bytes only reproduce if the incremental split matches — so risk #1 gates end-to-end KAT matching.

---

## Source files

SPQR v1.5.1 (`https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/<path>`):
- [`src/lib.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/lib.rs) — public API, send/recv, version negotiation, KDF wiring, end-to-end tests
- [`src/v1.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1.rs) / [`src/v1/chunked.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1/chunked.rs)
- [`src/v1/chunked/states.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1/chunked/states.rs) — 11-state braid machine
- [`src/v1/chunked/send_ek.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1/chunked/send_ek.rs), [`send_ct.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1/chunked/send_ct.rs)
- [`src/v1/unchunked/send_ek.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1/unchunked/send_ek.rs), [`send_ct.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1/unchunked/send_ct.rs) — ML-KEM ops + epoch-secret KDF
- [`src/incremental_mlkem768.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/incremental_mlkem768.rs) — sizes, encaps1/encaps2/decaps, issue-1275 fixup
- [`src/chain.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/chain.rs) — symmetric ratchet, ChainParams
- [`src/kdf.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/kdf.rs) — HKDF-SHA256
- [`src/authenticator.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/authenticator.rs) — running MAC + labels
- [`src/encoding.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/encoding.rs), [`encoding/gf.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/encoding/gf.rs), [`encoding/polynomial.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/encoding/polynomial.rs), [`encoding/round_robin.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/encoding/round_robin.rs)
- [`src/serialize.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/serialize.rs), [`src/v1/chunked/states/serialize.rs`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/v1/chunked/states/serialize.rs) — wire message format
- [`src/proto/pq_ratchet.proto`](https://github.com/signalapp/SparsePostQuantumRatchet/blob/v1.5.1/src/proto/pq_ratchet.proto) — state protobuf

libsignal (`https://github.com/signalapp/libsignal/blob/main/rust/protocol/<path>`):
- [`src/triple_ratchet.rs`](https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/triple_ratchet.rs) — DR+SPQR combine, encrypt/decrypt
- [`src/ratchet.rs`](https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/ratchet.rs) — `spqr::Params`, V1/min_version V1, A2B/B2A, chain params
- [`src/ratchet/keys.rs`](https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/ratchet/keys.rs) — `generate_keys` (salt=pqr_key, ikm=DR seed, info "WhisperMessageKeys"), ChainKey
- [`src/proto/wire.proto`](https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/proto/wire.proto) — `SignalMessage.pq_ratchet = 5`
- [`src/consts.rs`](https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/consts.rs) — MAX_FORWARD_JUMPS=25000, MAX_MESSAGE_KEYS=2000
- `src/state/session.rs` (`take_pq_ratchet_state`/`set_pq_ratchet_state`), `src/session_management.rs`, `src/pqxdh.rs` (produces `pqr_key`)
