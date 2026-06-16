# Signal implementation — architecture & plan

This is the map from the wire-protocol docs (01–07) onto our app's object model and
file layout. Read this first; it tells you what to build, in what order, where it
lives, and which parts are hard/uncertain.

> Status: foundations under construction. This doc is the source of truth for the
> design; update it when the design changes. Nothing here is auto-generated.

## Ground rules (from the user)

- **Clean-room.** No Signal-authored code or libraries (libsignal/zkgroup are AGPL — out).
- **External libs are fine** if MIT/BSD, few deps, maintained, small, and they save real
  work. We use the MIT **@noble** suite only:
  - `@noble/curves` — X25519, Ed25519, **ristretto255** (the primitive under zkgroup)
  - `@noble/hashes` — SHA-256/512, HMAC, HKDF
  - `@noble/ciphers` — AES (CBC/CTR/GCM) and **AES-GCM-SIV** (`aes.js` → `gcmsiv`)
  - `@noble/post-quantum` — **ML-KEM-1024** for PQXDH (`ml-kem.js` → `ml_kem1024`)
  - Both new packages' import closures are <200 KB uncompressed (42 KB / 116 KB), so
    static import is fine. Anything ≥200 KB must be `await import()`-ed.
- **Crypto is contained** under `Signal/Crypto/` (and `Signal/Crypto/ZKGroup/`). Protocol
  code calls into it; it does not leak crypto details outward.
- **Protobuf** uses our hand-rolled DSL (`Signal/Proto/codec.ts` + `ProtobufLite.ts`), not
  protobufjs. The `.proto` files are ported into the DSL by hand.
- **Code style:** mirror `Mail/` for style and `XMPP/` for the chat object structure.
  Do NOT copy the WhatsApp structure (it is the cautionary example). Reuse existing app
  code (Attachment, Person, Group, SQL storage, Observable, sanitize, gt) wherever possible.

## What is feasible clean-room (and what is gated)

| Area | Verdict | Notes |
|---|---|---|
| Transport (WebSocket, Envelope, send/ack, errors) | ✅ feasible | doc 01 |
| Registration (new account) | ✅ feasible | SMS/captcha + PQXDH; doc 02 |
| Linked-device provisioning (companion) | ✅ feasible | **default test path**; doc 02 |
| 1:1 messaging — Double Ratchet part | ✅ exists | shared `Crypto/SessionCipher` |
| 1:1 messaging — **PQXDH** handshake | ⚠️ build | ML-KEM-1024 init; wire = `PreKeySignalMessage{kyber_pre_key_id=7, kyber_ciphertext=8}` |
| 1:1 messaging — **SPQR triple ratchet** | ⛔ **gating** | libsignal **requires** SPQR per message (`SignalMessage.pq_ratchet=5`). ~9.2k LoC novel crypto (see below). Classic DR alone will NOT interop. |
| Sealed sender v1 + **v2** (receive) | ✅ feasible | v2 needs AES-GCM-SIV |
| Reactions / edits / delete / receipts / typing | ✅ feasible | doc 03 |
| Attachments / CDN (v4 upload, AES-CBC+HMAC) | ✅ feasible | doc 05 |
| Profiles (unversioned read), avatars | ✅ feasible | doc 05 |
| Profiles (versioned + credential), groups, group calls | ⚠️ needs **zkgroup** | clean-room port, high risk |
| Storage-service roster sync | ✅ feasible | AES-GCM+HKDF only; doc 06 |
| Contact discovery (CDSI) | ❌ not clean-room | SGX attestation. Fallback: build roster from ContactRecords + incoming + group rosters |
| 1:1 call **signaling** | ✅ feasible | doc 07 |
| 1:1 call **media** | ❌ engine gate | browser `RTCPeerConnection` can't disable DTLS / set raw DH-derived SRTP keys |
| Group calls (SFU + frame crypto) | ⚠️ hard | depends on zkgroup + the media gate |

The two red ❌ are *engine/enclave* limits, not effort limits — flagged loudly so we don't
chase them blindly. Everything else is build-it work.

## Object model (mirrors `XMPP/`)

```
ChatAccount (Chat/ChatAccount.ts)
  └─ SignalAccount            extends ChatAccount      protocol = "signal"
ChatRoom (Chat/ChatRoom.ts)
  └─ SignalChatRoom           extends ChatRoom         (shared send/receive/history)
       ├─ Signal1to1ChatRoom  extends SignalChatRoom
       └─ SignalGroupChatRoom extends SignalChatRoom
ChatMessage (Chat/Message.ts)
  └─ SignalChatMessage        extends ChatMessage
ChatPersonUID (Chat/ChatPersonUID.ts)
  └─ SignalContact            extends ChatPersonUID    (keyed by ACI; PNI/E.164 aliases)
ChatRoomEvent (Chat/RoomEvent.ts)
  └─ SignalRoomEvent          extends ChatRoomEvent
MeetAccount (Meet/MeetAccount.ts)
  └─ SignalMeetAccount        extends MeetAccount      (calls; depends on SignalAccount)
```

Mirrors of XMPP's responsibilities:
- `SignalAccount` ≈ `XMPPAccount`: login/connect, roster, rooms, routing inbound to rooms,
  config persistence (`toConfigJSON`/`fromConfigJSON`). Plus Signal-only: registration/
  provisioning, prekey upload/replenish, the service-WebSocket transport, sealed sender.
- `SignalChatRoom` ≈ `XMPPChat`: `addMessage` (route reaction/receipt/edit/delete/typing vs
  new), `sendMessage`/`sendReaction`/`sendCorrection`/`sendRetraction`/`sendDisplayedMarker`/
  `sendChatState`, `listMessages` (DB first, then server history via `syncState`),
  `saveNewMessages`.
- `SignalChatMessage` ≈ `XMPPChatMessage`; `SignalContact` ≈ `XMPPPerson`.

## File / directory layout

```
Chat/Signal/
  SignalAccount.ts            account orchestration (≈ XMPPAccount/WhatsAppAccount)
  SignalChatRoom.ts           shared room base (≈ XMPPChat)
  Signal1to1ChatRoom.ts
  SignalGroupChatRoom.ts
  SignalChatMessage.ts
  SignalContact.ts
  SignalRoomEvent.ts
  SignalMedia.ts              attachment up/download + CDN (≈ XMPPMedia)
  ServiceIdentity.ts          ACI/PNI/E.164 value object + parsing
  Connection/
    SignalTransport.ts        the chat-service WebSocket (WebSocketMessage framing)
    SignalRequest.ts          REST-over-socket + plain HTTPS (ky) helper, auth headers
    Registration.ts           new-account registration (verification session, account create)
    Provisioning.ts           linked-device QR provisioning (default path)
    Errors.ts                 409/410 device mgmt, 428 challenge, typed errors
  Profile/
    Profile.ts                profile fetch/set, capabilities
    StorageService.ts         roster/contacts/settings sync (manifest + records)
  Groups/
    Group.ts                  group state, fetch/modify, admin ops, DecryptedGroup pipeline
    SenderKeyGroupSend.ts     sender-key + multi-recipient sealed-sender fan-out
  Proto/                      (shared generic codec lives here; Signal schemas added)
    codec.ts, ProtobufLite.ts          [existing, shared — extended for fixed32/64]
    signalService.ts          Envelope, Content, DataMessage, SyncMessage, Receipt, Typing…
    websocket.ts              WebSocketMessage/Request/Response
    provisioning.ts           ProvisionEnvelope/ProvisionMessage
    groups.ts                 Group, GroupChange.Actions, GroupAttributeBlob, DecryptedGroup
    storage.ts                StorageManifest/Item/Record (Contact/Account/GroupV2)
  Crypto/                     [existing SHARED Signal Protocol crypto — used by WhatsApp +
                               XMPP OMEMO too. Treat as READ-ONLY; keep any change tiny +
                               additive. Do NOT put Signal-app crypto here.]
    KeyPair, curve, primitives, Identity, Store, SessionCipher, GroupCipher, messages  [existing]
  Encryption/                 [NEW — all Signal-app-specific crypto, contained here]
    aesGcmSiv.ts              thin wrapper over @noble/ciphers gcmsiv
    kyber.ts                  ML-KEM-1024 wrapper (@noble/post-quantum)
    pqxdh.ts                  PQXDH session init (reuses shared SessionState/Double Ratchet)
    SealedSender.ts           v1 + v2 decrypt/encrypt, sender/server certificate, UAK
    SignalKeyStore.ts         Signal-app key state (Kyber prekeys, PNI identity) wrapping
                               the shared SignalStore — keeps Crypto/Store.ts untouched
    ProfileCipher.ts          profile field + avatar encryption
    AttachmentCipher.ts       attachment AES-CBC+HMAC, digest, incremental MAC
    StorageCipher.ts          storage-service record/manifest AES-GCM + key derivation
    ProvisioningCipher.ts     provisioning message ECDH→HKDF→AES-CBC+HMAC
    DeviceNameCipher.ts       encrypted device name
    ZKGroup/                  clean-room zkgroup on ristretto255 (the hard part)
      sho.ts                  poksho SHO (SHA-256 sponge) — RO + label framing
      ristretto.ts            ristretto255 helpers (lizard/single-elligator) over @noble
      credentials.ts          KVAC AuthCredentialWithPni, ProfileKeyCredential
      groupParams.ts          GroupMasterKey→Secret/PublicParams, Uid/ProfileKey ciphertext
      presentation.ts         AuthCredentialPresentation, ProfileKeyCredentialPresentation
      serialize.ts            bincode-exact (de)serialization

Meet/Signal/
  SignalMeetAccount.ts        call orchestration (≈ Meet/WhatsApp/WhatsAppMeetAccount)
  SignalCall.ts               1:1 call: CallMessage signaling + WebRTC drive
  signalingProto.ts           RingRTC signaling.proto (ConnectionParametersV4, ICE)
  callSRTP.ts                 DH→SRTP key derivation (media gate documented here)
  SignalGroupCall.ts          SFU join/peek, frame crypto (best-effort)
```

## Persistence

Follow XMPP-OMEMO / WhatsApp: **the Signal store (identity, registration ids, EC + Kyber
prekeys, pairwise sessions, sender keys, trusted identities) and account credentials persist
in the account config JSON** via `toConfigJSON`/`fromConfigJSON` (`SignalStore.toJSON` already
exists; extend for Kyber prekeys + PNI identity). A debounced `scheduleSave()` re-writes it as
the ratchet advances (copy WhatsApp's pattern). **Messages, rooms, roster** persist through the
existing `SQLChatStorage` (`saveMessage`/`saveRoom`/`saveAccount`) + `SQLChatMessage.readAll` /
`SQLChatRoom.readAll` — no new tables. Group state + storage-service manifest version also live
in config JSON. Result: a full restore after restart, no re-handshake.

## Protobuf DSL — required extension

`codec.ts` supports varint/bool/string/bytes/message/repeated. Signal additionally needs:
- `fixed64` (e.g. `AttachmentPointer.cdnId`) and `fixed32` — add builders + wire types; read
  path: capture wire types 1/5 in `ProtobufLite.readProto` (currently skipped).
- packed repeated scalars — proto2 default is unpacked (Signal is proto2), but handle packed on
  read defensively.
- `sint`/zigzag — only if a needed message uses it (most are uint/int). Add lazily.
Keep the extension additive so WhatsApp's schemas are unaffected.

## Build order (dependency-first)

1. **Proto DSL extension** (+ unit test) and the **WebSocketMessage** + core **SignalService**
   schemas.
2. **Crypto additions** (contained), each with a known-answer test where a vector exists:
   `aesGcmSiv`, `kyber`/PQXDH, `SealedSender` (v1+v2), the field ciphers.
3. **Transport + SignalAccount skeleton + Store persistence** (config JSON), then
   **Provisioning** (default) and **Registration**, then **prekey upload**.
4. **1:1 messaging**: session establish (PQXDH), send/receive, sealed-sender receive, the side
   messages (reactions/edits/delete/receipts/typing), SyncMessage `Sent`, history, attachments,
   profiles (unversioned), persistence.
5. **Storage-service roster sync**.
6. **zkgroup** (its own test vectors first) → **Groups v2** + versioned profiles.
7. **Calling**: 1:1 signaling (verifiable) → media (document the engine gate) → group calls.

## ⛔ Critical finding (discovered during implementation): SPQR is mandatory

Current Signal does **not** use the classic Double Ratchet alone. Every 1:1 message runs
the **Triple Ratchet = Double Ratchet + SPQR** (Sparse Post-Quantum Ratchet). libsignal
`rust/protocol/src/ratchet.rs` sets `min_version: V1, // Require that all clients speak SPQR`,
and `SignalMessage.pq_ratchet` (field 5) carries it. A message without a valid `pq_ratchet`
is rejected by a current peer.

- **PQXDH** (one-time, at session start): adds an ML-KEM-1024 encapsulation to X3DH. Wire:
  `PreKeySignalMessage` gains `kyber_pre_key_id=7`, `kyber_ciphertext=8`. Tractable; reuses our
  ML-KEM wrapper. Build in `Encryption/pqxdh.ts`.
- **SPQR** (continuous, every message): a separate AGPL repo
  `signalapp/SparsePostQuantumRatchet` v1.5.1, **~9,200 LoC** of novel crypto — incremental
  ML-KEM-768, Reed-Solomon systematic erasure codes over GF, the "ML-KEM Braid" public ratchet
  (replaces the DH ratchet), a symmetric chain, an authenticator, and bit-exact serialization.
  Clean-room this is a project on the order of zkgroup. It is the **gate on 1:1 interop**.
  See `08-post-quantum-ratchet-spqr.md` (being written). Cloned for reference at `/tmp/spqr`.

Consequence for "works on first test": the two novel-crypto subsystems **SPQR** and **zkgroup**
are each multi-week, bit-exact, and untestable against live Signal from here. They are built and
unit-tested in isolation (against published test vectors) before any live run. Everything else
(transport, provisioning, content protobufs, sealed sender, attachments, profiles, storage,
call signaling) is ordinary engineering and is where the early, verifiable progress is.

## Known hard gates (do not silently chase)

- **SPQR "incremental ML-KEM-768" — RESOLVED** (read libcrux `ind_cca/incremental/types.rs` +
  confirmed at runtime). It is *standard* ML-KEM-768 re-sliced at fixed offsets, so plain
  `@noble/post-quantum` `ml_kem768` does it — no libcrux, no WASM:
  - `ek = pk2 ‖ seed` where `pk2 = ek[0..1152]` (encoded t̂), `seed = ek[1152..1184]` (ρ). `ek` is 1184 B.
  - `pk1 = seed(32) ‖ SHA3-256(ek)(32)` = 64 B (the "header" chunk streamed first).
  - Encaps is deterministic: `encapsulate(ek, m)` with the 32-B `m` from the SPQR chain gives
    `(ct, ss)`; `ct1 = ct[0..960]` (compressed u), `ct2 = ct[960..1088]` (compressed v). ct is 1088 B.
  - Decaps: reassemble `ct = ct1 ‖ ct2`, `decapsulate(ct, dk)`. (libcrux's encaps1/encaps2 split is
    only a latency optimisation; the bytes are identical to one deterministic standard encaps.)
  - ⚠️ confirm ct1/ct2 order against an SPQR fixture once (almost certainly c1=u, c2=v per FIPS-203).
- **zkgroup Lizard / single-Elligator — RESOLVED** (read `curve25519-dalek-signal`
  `lizard/lizard_ristretto.rs` + `ristretto.rs`). The ~80% mechanical part (SHO, scalars, KVAC MAC,
  sigma proofs, bincode) ports onto `@noble` ristretto255 and is gated by published KATs (incl. a
  fixed-randomness end-to-end v4 auth-presentation vector). For the maps:
  - `lizard_encode(d[16])`: `fe = SHA256(d)`; `fe[8..24] = d`; `fe[0] &= 254`; `fe[31] &= 63`;
    point = `elligator_ristretto_flavor(FieldElement::from_bytes(fe))`. KAT: `lizard_encode([0;16])`
    compresses to `f0b7e344…774f` (more vectors in `lizard_ristretto.rs` tests).
  - profile-key point: `from_uniform_bytes_single_elligator(b[32])` = `elligator_ristretto_flavor(from_bytes(b))`.
  - `@noble` ristretto exposes only `Point` (its public hash-to-group is *two* Elligator + add — wrong
    here), so port the **single** `elligator_ristretto_flavor` (Jacobi-quartic Elligator2) over
    `@noble`'s ed25519 field `Fp`. Inverse map (`elligator_..._inverse`) is needed for `lizard_decode`.
  - ✅ **IMPLEMENTED + KAT-verified**: `Encryption/ZKGroup/ristretto.ts` (single Elligator2 + Lizard
    encode), passing all 3 curve25519-dalek-signal Lizard known-answer vectors. Still TODO: the
    inverse map for `lizard_decode` (UidCiphertext → ACI on the receive path).
- **zkgroup**: large, exacting; validate every step against libsignal's published test vectors
  (read them from `/tmp/libsignal/rust/zkgroup` test data — reading AGPL *tests for vectors* to
  verify our independent impl is acceptable; do not copy code). If a step can't be matched,
  stop and flag rather than ship a subtly-wrong credential.
- **Call media (SRTP)**: a stock browser cannot inject Signal's DH-derived SRTP keys nor disable
  DTLS. The signaling layer is still worth building and testing; media needs a non-browser WebRTC
  engine. Document, don't fake.
- **CDSI**: out (SGX). Roster comes from storage-service + incoming + groups.
```
