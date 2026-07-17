# Signal (Android) Wire Protocol — Calling (1:1 + Group), RingRTC

**Based on main-branch clones, 2026-06-16.**
(Source commits: ringrtc `a59801d`, Signal-Android `d6871f8`, Signal-Server `adb5b6a`, libsignal `a85f3c0`.)

This document covers the **Signal-level calling wire protocol**: the `CallMessage` that rides inside
`Content`, the RingRTC `signaling.proto` payloads stuffed into the `opaque` fields, the 1:1 call
setup sequence, group calls over the SFU (`sfu.voip.signal.org`), media-frame encryption, and the
ICE/TURN relay endpoint.

This drives an implementation in `app/logic/Meet/Signal/`. The app **already** has a `Meet/`
subsystem (LiveKit, Matrix calls, SIP, WhatsApp calls) that uses the browser's native
`RTCPeerConnection`. So the central distinction throughout this doc:

| Layer | Who owns it |
|---|---|
| **Signaling — the Signal wire protocol** (CallMessage, RingRTC protobufs, SFU join, key distribution) | **We build this.** This document. |
| **Media / WebRTC engine** (SDP offer/answer creation, ICE agent, DTLS-SRTP, RTP, codecs, jitter buffer) | **Delegate** to a WebRTC stack (browser `RTCPeerConnection`, as the rest of `Meet/` does). |

> ⚠️ **The single most important fact for feasibility:** RingRTC does **not** send SDP over the wire.
> It strips the SDP that WebRTC produces down to a handful of fields (ICE ufrag/pwd, codecs, a DH
> public key, a bitrate), packs them into a protobuf (`ConnectionParametersV4`), and on the receiving
> side **re-synthesizes a full SDP from those fields** before feeding it back to WebRTC. It also
> **disables DTLS** and instead derives the SRTP keys from a Diffie-Hellman exchange. See
> §B and the **Feasibility verdict** (§F) — this SDP↔protobuf round-trip is the work we must replicate.

**Scope boundaries (see other agents):**

| Out of scope | Owner |
|---|---|
| Transport framing, websocket/REST send-receive, sealed sender envelope | agent 1 |
| General `Content` / `DataMessage` body (everything except `CallMessage` + `GroupCallUpdate`) | agent 3 |
| Group **membership** (zkgroup group params, `GroupContextV2`) beyond what's needed to *join a call* | agent 4 |
| The Double Ratchet / X3DH that E2E-encrypts the `CallMessage` itself | `app/logic/Chat/Signal/Crypto/*` |

All proto field numbers below are proto2; unless noted every field is `optional`.

---

## A. 1:1 call signaling — `CallMessage` inside `Content`

A `CallMessage` is **not special transport** — it is just `Content.callMessage` (field 3), sent as a
normal E2E-encrypted Signal message (see agent 1 transport, agent 3 content wrapping). The interesting
part is the structure and the fact that the offer/answer/ICE payloads are **RingRTC protobuf in the
`opaque` field, not raw SDP**.

`SignalService.proto:123-186`:

```proto
message CallMessage {
  message Offer {
    enum Type {
      OFFER_AUDIO_CALL = 0;
      OFFER_VIDEO_CALL = 1;
      reserved /* OFFER_NEED_PERMISSION */ 2;  // removed
    }
    optional uint64 id     = 1;   // the call id (CallId)
    reserved /* sdp */ 2;          // gone — was raw SDP in V1
    optional Type   type   = 3;
    optional bytes  opaque = 4;   // serialized signaling.Offer (RingRTC)
  }

  message Answer {
    optional uint64 id     = 1;   // same call id
    reserved /* sdp */ 2;
    optional bytes  opaque = 3;   // serialized signaling.Answer (RingRTC)
  }

  message IceUpdate {
    optional uint64 id     = 1;   // same call id
    reserved /* mid */ 2;
    reserved /* line */ 3;
    reserved /* sdp */ 4;
    optional bytes  opaque = 5;   // serialized signaling.IceCandidate (RingRTC)
  }

  message Busy   { optional uint64 id = 1; }

  message Hangup {
    enum Type {
      HANGUP_NORMAL          = 0;
      HANGUP_ACCEPTED        = 1;
      HANGUP_DECLINED        = 2;
      HANGUP_BUSY            = 3;
      HANGUP_NEED_PERMISSION = 4;
    }
    optional uint64 id       = 1;   // call id
    optional Type   type     = 2;
    optional uint32 deviceId = 3;   // the *other* device for ...OnAnotherDevice
  }

  message Opaque {
    enum Urgency { DROPPABLE = 0; HANDLE_IMMEDIATELY = 1; } // missing => DROPPABLE
    optional bytes   data    = 1;   // serialized signaling.CallMessage (group/ring)
    optional Urgency urgency = 2;
  }

  optional Offer     offer               = 1;
  optional Answer    answer              = 2;
  repeated IceUpdate iceUpdate           = 3;   // NOTE: repeated — many candidates per message
  reserved /* legacyHangup */ 4;
  optional Busy      busy                = 5;
  reserved /* profileKey */ 6;
  optional Hangup    hangup              = 7;
  reserved /* multiRing */ 8;                    // multiRing is gone — see below
  optional uint32    destinationDeviceId = 9;
  optional Opaque    opaque              = 10;   // group-call / ring messages
}
```

### A.1 Field reference

| # | Field | Meaning |
|---|---|---|
| 1 | `offer` | Caller → callee. Initiates the call. `opaque` = `signaling.Offer` (§B.1). |
| 2 | `answer` | Callee → caller. Accepts negotiation. `opaque` = `signaling.Answer`. Always sent to **one** device (`SendAnswer.receiver_device_id`, `core/signaling.rs:427-430`). |
| 3 | `iceUpdate` | **Repeated.** Both sides, continuously. Each entry's `opaque` = `signaling.IceCandidate` (one candidate, or one removal). Caller broadcasts; callee targets the caller's device (`SendIce.receiver_device_id: Option`, `core/signaling.rs:435-439`). |
| 5 | `busy` | "I'm already in a call." Carries only the call id. |
| 7 | `hangup` | End / decline. Broadcast to **all** the peer's devices (`SendHangup`, `core/signaling.rs:443-445`). |
| 9 | `destinationDeviceId` | If set → deliver only to that one device of the recipient. If absent → all of the recipient's devices ("ring all devices"). Android sets it from `broadcast ? null : remoteDevice` (`WebRtcActionProcessor.java:138,351,550`). |
| 10 | `opaque` | Carrier for **group-call** and **ring** messages (a serialized `signaling.CallMessage`, §C). Not used for 1:1 offer/answer/ICE. |

`id` is the **CallId** (random `uint64`) and is identical across the whole call (offer, answer, every
ICE update, hangup). It is generated by the caller.

### A.2 `Hangup` semantics

`Hangup.type` + `deviceId` together encode *where* the hangup happened (`core/signaling.rs:343-385`):

| `type` | `deviceId` | Meaning |
|---|---|---|
| `HANGUP_NORMAL` (0) | ignored | The user hung up **on this device**. |
| `HANGUP_ACCEPTED` (1) | the device that accepted | "I accepted on another device" — tells your *other* devices to stop ringing. |
| `HANGUP_DECLINED` (2) | the device that declined | "I declined on another device." |
| `HANGUP_BUSY` (3) | the busy device | "I was busy on another device." |
| `HANGUP_NEED_PERMISSION` (4) | (set, may be self) | Recipient needs to grant permission (not in your contacts, message-request state). |

> Note `from_type_and_device_id` (`core/signaling.rs:373-384`): the Android/iOS apps send `deviceId=0`
> rather than absent, so a missing/zero `deviceId` for `NEED_PERMISSION` is treated as "set". Match this.

### A.3 multiRing / destinationDeviceId

`multiRing` (field 8) is **reserved/removed** — there is no longer a `multiRing` boolean on the wire.
Multi-device ringing is now expressed purely by **whether `destinationDeviceId` is set**:

- **Offer / Hangup / Busy** are *broadcast* (no `destinationDeviceId`) → reach every device of the
  recipient, so all their devices ring / stop ringing.
- **Answer** is *targeted* (`destinationDeviceId` = the caller's device that sent the offer) → only the
  device that actually placed the call processes the answer.
- **ICE** from the callee is targeted at the caller's device; ICE from the caller is broadcast.

### A.4 Urgency (the `urgent` envelope flag)

The send path sets the envelope's `urgent` flag based on message type
(`SignalServiceCallMessage.isUrgent()`, `SignalServiceMessageSender.java:185-189`):

- **Urgent** = any **offer**, any **hangup**, or an **Opaque** message with `HANDLE_IMMEDIATELY`.
- **Non-urgent** = answers, ICE updates, droppable opaque.

`HANDLE_IMMEDIATELY` vs `DROPPABLE` on `Opaque` (`WebRtcUtil.getUrgencyFromCallUrgency`,
`SignalService.proto:168-173`): RingRTC chooses. Ring intentions / "a call started" must be delivered
even if the device is asleep (`HANDLE_IMMEDIATELY`); routine group-call signaling is `DROPPABLE`.

---

## B. RingRTC signaling protobuf (`opaque` payloads)

These live in **`ringrtc/protobuf/protobuf/signaling.proto`**. A serialized one of these goes into the
matching `CallMessage` `opaque` field above. The comments in the proto state this explicitly
(`signaling.proto:14, 20, 25`).

### B.1 `Offer` / `Answer` — just a version slot

```proto
message Offer  { optional ConnectionParametersV4 v4 = 4; }   // signaling.proto:16-18
message Answer { optional ConnectionParametersV4 v4 = 4; }   // signaling.proto:21-23
```

Both are thin wrappers around `ConnectionParametersV4`, deliberately using a numbered "slot" (field 4 =
"v4") so future versions (v5, v6…) can be added as new fields. **Only V4 is accepted for
offers/answers today** (`core/signaling.rs:122,178` always return `Version::V4`; `connection.rs:728,821`
return `UnknownSignaledProtocolVersion` if `v4` is absent). History (`core/signaling.rs:22-31`):

- V1 = raw SDP + DTLS + SCTP (gone). V2 = SDP-in-protobuf + RTP data (gone).
- V3 = replaced DTLS with a custom DH→SRTP exchange. Still used for **ICE candidates**, not offers.
- V4 = same crypto as V3 but **replaces SDP with discrete protobuf fields** (this is current).

### B.2 `ConnectionParametersV4` — the heart of it

```proto
message ConnectionParametersV4 {                  // signaling.proto:62-71
  optional bytes  public_key            = 1;      // 32-byte X25519 public key (DH for SRTP)
  optional string ice_ufrag             = 2;      // ICE username fragment
  optional string ice_pwd               = 3;      // ICE password
  repeated VideoCodec receive_video_codecs = 4;   // codecs *this sender* can receive
  optional uint64 max_bitrate_bps       = 5;      // requested send bitrate from the peer
}

message VideoCodec { optional VideoCodecType type = 1; reserved 2; }  // signaling.proto:57-60
enum VideoCodecType {                              // signaling.proto:49-55
  VP8 = 8; VP9 = 9;
  H264_CONSTRAINED_BASELINE = 40; H264_CONSTRAINED_HIGH = 46;
}
```

This is the **entire** negotiated state. Everything else WebRTC normally negotiates via SDP (DTLS
fingerprints, SRTP key from DTLS handshake, full m-lines, RTP header extensions, payload-type maps,
rtcp-mux, bundle, …) is **either fixed by convention or reconstructed locally** by RingRTC's C++ from
this small set of fields.

How it is produced and consumed (`webrtc/sdp_observer.rs:168-211`, `216-259`):
- `SessionDescription::to_v4()` parses the local WebRTC SDP and extracts `ice_ufrag`, `ice_pwd`, and the
  receive video codecs; `public_key` and `max_bitrate_bps` are filled in by the caller
  (`connection.rs:638-642`, `824/858`).
- `SessionDescription::offer_from_v4()` / `answer_from_v4()` do the **reverse**: re-synthesize a full SDP
  string in RingRTC's C++ from the V4 fields, with hard-coded conventions for everything not in the proto.

> ⚠️ **The SDP reconstruction rules are in RingRTC's C++ (not in the .proto and not in Rust).** The Rust
> just calls FFI. To interop without RingRTC we must reproduce these rules. See §F.

### B.3 ICE candidates

```proto
message IceCandidate {                          // signaling.proto:30-38
  optional IceCandidateV3 added_V3 = 2;         // an added candidate (field tag 2 for V2/V3/V4 compat)
  optional SocketAddr     removed  = 3;         // a removed candidate (ip+port only)
}
message IceCandidateV3 { optional string sdp = 1; }       // signaling.proto:40-42
message SocketAddr {                            // signaling.proto:44-47
  optional bytes  ip   = 1;   // 4 bytes (IPv4) or 16 bytes (IPv6)
  optional uint32 port = 2;
}
```

- An **added** candidate is just the SDP candidate line as a string in `added_V3.sdp`
  (e.g. `"candidate:… 1 udp … typ host"`). ICE candidates are still **V3 (SDP string)** even in V4
  offers (`core/signaling.rs:266-326`).
- A **removed** candidate is identified only by `(ip, port)` (transport assumed "audio"/component 1/udp,
  `signaling.proto:33-37`). For backward-compat a fake `added_V3` line is also set
  (`core/signaling.rs:280-315`).
- Multiple candidates ride in **one** `CallMessage` because `iceUpdate` is `repeated`
  (`signaling.proto:26` "the ICE message contains many of these"). `Ice.candidates: Vec<IceCandidate>`
  (`core/signaling.rs:213-215`).

### B.4 `signaling.CallMessage` — the group/ring carrier (goes in `Opaque.data`)

```proto
message CallMessage {                                    // signaling.proto:76-106
  message RingIntention {
    enum Type { RING = 0; CANCELLED = 1; }
    optional bytes    group_id = 1;
    optional Type     type     = 2;
    optional sfixed64 ring_id  = 3;     // signed so it fits a SQLite int column
  }
  message RingResponse {
    enum Type { RINGING = 0; ACCEPTED = 1; DECLINED = 2; BUSY = 3; }
    optional bytes    group_id = 1;
    optional Type     type     = 2;
    optional sfixed64 ring_id  = 3;
  }
  optional group_call.DeviceToDevice group_call_message = 1;  // §C.4 — media keys etc.
  optional RingIntention             ring_intention     = 2;  // "start ringing the group"
  optional RingResponse              ring_response      = 3;  // "I'm ringing/accepted/declined/busy"
}
```

This is what is serialized into `CallMessage.Opaque.data` (field 10 of the outer Signal `CallMessage`).
`RingIntention`/`RingResponse` drive **group ringing**; `group_call_message` carries
`DeviceToDevice` (notably `MediaKey`, §C.5) when sent over signaling.

---

## C. The 1:1 call setup sequence + crypto

### C.1 Sequence diagram

```
   CALLER (device A)                                              CALLEE (devices B1..Bn)
        |                                                                   |
        |  generate CallId (u64); WebRTC create_offer() -> local SDP        |
        |  X25519: (a_secret, a_public) = keypair        connection.rs:637  |
        |  to_v4(SDP) -> {ice_ufrag,ice_pwd,codecs} + a_public + maxBitrate  |
        |                                                                   |
        |  Content.callMessage.offer{ id=CallId, type=OFFER_(AUDIO|VIDEO),  |
        |        opaque = signaling.Offer{ v4: ConnectionParametersV4 } }   |
        |  (broadcast: no destinationDeviceId; urgent)                      |
        | ----------------- E2E-encrypted Signal message -----------------> | (all devices ring)
        |                                                                   |
        |                          one device accepts:                      |
        |                          X25519 (b_secret,b_public)               |
        |                          negotiate_srtp_keys(b_secret, a_public,  |
        |                                caller_idkey, callee_idkey)         |
        |                          disable DTLS, install SRTP keys          |
        |                          WebRTC create_answer() -> to_v4()        |
        |                                                                   |
        |  Content.callMessage.answer{ id=CallId,                          |
        |        opaque=signaling.Answer{ v4{ public_key=b_public, ... }}} |
        |        destinationDeviceId = A (targeted, non-urgent)            |
        | <---------------- E2E-encrypted Signal message ----------------- | (device B_k)
        |                                                                   |
        |  caller: negotiate_srtp_keys(a_secret, b_public, ...)             |
        |          disable DTLS, install same SRTP keys, set remote answer  |
        |                                                                   |
        |  <========== ICE: repeated iceUpdate[] both directions =========> |
        |          (caller broadcasts; callee targets A; continual)         |
        |                                                                   |
        |  <=============== ICE connectivity check (STUN) ================> |
        |  <======== media: SRTP (AEAD-AES-256-GCM), NO DTLS =============> |
        |                                                                   |
        |          (callee's other devices: Hangup ACCEPTED -> stop ring)   |
        |                                                                   |
        |  Hangup{ id=CallId, type=NORMAL } broadcast (urgent)              |
        | <===============================================================> |
```

Driving code: outgoing parent builds the offer (`connection.rs:start_outgoing_parent`, ~620-672);
caller applies the answer (`start_outgoing_child`, 679-781); callee builds the answer
(`start_incoming`, 788-879). Android wiring: `OutgoingCallActionProcessor.handleStartOutgoingCall`,
`WebRtcActionProcessor.handleSendOffer/Answer/IceCandidates`,
`OutgoingCallActionProcessor.handleReceivedAnswer` (sequence per agent-4 research).

### C.2 ⚠️ DTLS is disabled; SRTP keys come from a DH exchange

This is the second major departure from "normal WebRTC". After both V4 params are exchanged, RingRTC
calls `negotiate_srtp_keys` and then `disable_dtls_and_set_srtp_key` on both the local and remote SDP
(`connection.rs:731-744` caller, `839-873` callee). So there is **no DTLS handshake**; SRTP keys are
installed directly.

`negotiate_srtp_keys` (`connection.rs:2264-2320`):

1. **X25519 DH:** `shared_secret = local_secret.diffie_hellman(remote_public_key)`. Reject if not
   contributory (low-order key) (`connection.rs:2281-2285`).
2. **HKDF-SHA256:**
   - salt = 32 zero bytes (`connection.rs:2287`)
   - IKM = the 32-byte DH shared secret
   - info = `"Signal_Calling_20200807_SignallingDH_SRTPKey_KDF"` ‖ **caller_identity_key** ‖
     **callee_identity_key** (`connection.rs:2288-2294`). The identity keys come from the received
     offer/answer (`ReceivedOffer/Answer.sender_identity_key` + `receiver_identity_key`,
     `core/signaling.rs:448-464`). This binds the SRTP key to the two parties' long-term identities.
3. **Derive 2 directional SRTP keys** for suite **AEAD-AES-256-GCM** (`connection.rs:2297`). Output key
   material = `offer_key ‖ offer_salt ‖ answer_key ‖ answer_salt` (`connection.rs:2300-2306`).
   - The **offer key** encrypts media sent by the *caller*; the **answer key** encrypts media sent by the
     *callee*. Both sides derive both keys and assign by role.

`public_key` in V4 is the X25519 public key; the local keypair is `StaticSecret::random_from_rng(OsRng)`
(`connection.rs:2253-2257`). 1:1 calls use a **fresh DH per call** (no ratcheting).

### C.3 RTP data channel (in-call control)

After the SDP is set, RingRTC enables an RTP data path on **payload type 101**
(`RTP_DATA_PAYLOAD_TYPE = 101`, `connection.rs:87,756`). In-call control messages flow over this path
encoded with **`ringrtc/protobuf/protobuf/rtp_data.proto`**:

```proto
message Message {                                  // rtp_data.proto:43-53
  optional Accepted       accepted       = 1;      // { id }            rtp_data.proto:12-14
  optional Hangup         hangup         = 2;      // { id, type, deviceId }  18-28
  optional SenderStatus   senderStatus   = 3;      // { id, video_enabled, sharing_screen, audio_enabled } 30-35
  optional uint64         seqnum         = 4;      // ordering across unordered transports
  optional ReceiverStatus receiverStatus = 5;      // { id, max_bitrate_bps } 37-41
}
```

`Hangup.Type` here mirrors the signaling enum (`HANGUP_NORMAL=0 … HANGUP_NEED_PERMISSION=4`,
`rtp_data.proto:17-23`). `Accepted` over RTP is how the callee signals "I picked up" so media can start
flowing (the caller withholds outgoing media until accepted — `connection.rs:752-756`).
`ReceiverStatus.max_bitrate_bps` lets a peer adjust the other's send bitrate mid-call
(`connection.rs:1116-1126,1939`).

> These RTP-data messages are *inside* the SRTP-encrypted media transport — they are **not** Signal
> `CallMessage`s. For 1:1 we mostly need `accepted`, `hangup`, and `senderStatus` (mute/video state).

### C.4 What we delegate vs build (1:1)

| Concern | Build (our wire protocol) | Delegate to WebRTC |
|---|---|---|
| CallMessage offer/answer/ice/hangup/busy framing | ✅ | |
| `signaling.proto` (Offer/Answer/IceCandidate/ConnectionParametersV4) encode/decode | ✅ | |
| X25519 keypair, DH, HKDF→SRTP keys, identity-key binding | ✅ | |
| SDP↔V4 field extraction & **SDP re-synthesis** | ✅ ⚠️ (the hard bit) | |
| Disabling DTLS and installing a raw SRTP key | ✅ direct (needs WebRTC API support) | |
| ICE agent, STUN, candidate gathering | | ✅ (`RTCPeerConnection`) |
| SRTP transport, RTP, codecs, jitter buffer | | ✅ |
| RTP-data control messages (`rtp_data.proto`) | ✅ encode/decode | ✅ transport (data over RTP PT 101) |

---

## D. Group calls (SFU)

Group calls are **not** peer-to-peer. Every participant connects to a central **SFU** (Selective
Forwarding Unit) at `https://sfu.voip.signal.org`
(`Signal-Android app/build.gradle.kts:246`, staging at line 247). RingRTC takes no SFU URL constant —
the app passes `sfu_url` in (`lite/sfu.rs`). The connection to the SFU is a **single
PeerConnection to the SFU** (same V4/DH/SRTP transport machinery as §B/§C, but the peer is the SFU, not
another client). E2E content protection is layered **on top** via per-sender media-frame encryption
(§D.4) since the SFU forwards (and could otherwise read) media.

### D.1 "A call started" — `GroupCallUpdate` in `DataMessage`

When a group call begins, members are notified via `DataMessage.groupCallUpdate`
(`SignalService.proto:351-353, 434`; see agent 3 for `DataMessage`):

```proto
message GroupCallUpdate { optional string eraId = 1; }   // SignalService.proto:351-353
```

The `eraId` identifies the current call instance (see §D.3). Ring intentions (§B.4 `RingIntention`)
additionally make members' devices ring.

### D.2 Joining the SFU

Join request — `lite/sfu.rs`:

- **`PUT {sfu_url}/v2/conference/participants`** (`participants_url_from_sfu_url`, `sfu.rs:529-534`;
  `join`, `sfu.rs:704-705`).
- Headers: `Authorization` (§D.5), `Content-Type: application/json`, plus call-link room headers if
  applicable (`http_request_headers`, `sfu.rs:555-575`).
- JSON body `JoinRequest` (`sfu.rs:662-678`, camelCase):

| JSON field | Type | Source |
|---|---|---|
| `adminPasskey` | base64 (omitted if none) | call-link admin only |
| `iceUfrag` | string | **our** WebRTC ICE ufrag |
| `icePwd` | string | **our** WebRTC ICE pwd |
| `dhePublicKey` | hex | **our** X25519 public key (DH with the SFU for SRTP) |
| `hkdfExtraInfo` | hex | extra HKDF info bytes |

Join response — `SerializedJoinResponse` (`sfu.rs:232-258`, camelCase JSON):

| JSON field | → field | Type | Meaning |
|---|---|---|---|
| `demuxId` | `client_demux_id` | u32 | **our** demux id (identifies our media streams at the SFU) |
| `ips` | `server_ips` | IpAddr[] | SFU media IPs |
| `port` | `server_port` | u16 | SFU UDP port |
| `portTcp` | `server_port_tcp` | u16 | SFU TCP port |
| `portTls` | `server_port_tls` | u16? | SFU TLS port |
| `hostname` | `server_hostname` | string? | for TLS |
| `iceUfrag` | `server_ice_ufrag` | string | SFU ICE ufrag |
| `icePwd` | `server_ice_pwd` | string | SFU ICE pwd |
| `dhePublicKey` | `server_dhe_pub_key` | [u8;32] hex | SFU X25519 public key (DH→SRTP with SFU) |
| `callCreator` | `call_creator` | string | who started the call |
| `conferenceId` | `era_id` | string | the **eraId** (§D.3) |
| `clientStatus` | `client_status` | string | `ACTIVE` / `PENDING` / `BLOCKED` |

The response is enough to set up the (single) PeerConnection to the SFU: build an SDP "answer" from the
SFU's ufrag/pwd, do X25519 DH with `server_dhe_pub_key` to get SRTP keys (same `negotiate_srtp_keys`
shape as §C.2), and connect.

### D.3 Peeking + eraId

- **`GET {sfu_url}/v2/conference/participants`** (`peek`, `sfu.rs:593-657`) returns who's in the call
  without joining. Response `SerializedPeekInfo` (`sfu.rs:137-149`): `conferenceId`→`era_id`,
  `maxDevices`, `participants`→`devices[]` (each `opaqueUserId` = hex(sha256(GroupMemberId)) + `demuxId`,
  `sfu.rs:153-159`), `creator`, `pendingClients`, `callLinkState`. A 404 means "no call in progress"
  (`sfu.rs:632-645`).
- **eraId** (`conferenceId`): a 16-hex-digit ID the SFU assigns to a call instance. It **changes every
  time the call empties out and is restarted** (`sfu.rs:42-43`). It is what `GroupCallUpdate.eraId`
  refers to and is mapped to a `RingId` via `RingId::from_era_id` (`group_call.rs:93-113`).

The peek info also surfaces in-band via `group_call.SfuToDevice.PeekInfo` (`group_call.proto:130-155`):
`era_id`, `max_devices`, `creator`, `devices[]`/`pending_devices[]` (each `demux_id` + `opaque_user_id`),
and optional `CallLinkState` (`encrypted_name`, `restrictions` NONE/ADMIN_APPROVAL, `revoked`,
`expiration_unix_timestamp`).

### D.4 ⚠️ advanced — group media-frame encryption

Because the SFU forwards media, group calls add a second layer: each sender E2E-encrypts every media
frame with a **per-sender ratcheting key**, on top of the SFU-leg SRTP. Implemented in
`ringrtc/src/rust/src/core/crypto.rs`.

**Key derivation (per sender)** (`crypto.rs:55-114`). From a 32-byte `secret`, via HKDF-SHA256 (no salt):

| Output | HKDF info string | Size |
|---|---|---|
| AES key | `"RingRTC AES Key"` | 32 |
| HMAC key | `"RingRTC HMAC Key"` | 32 |
| ratchet advance | `"RingRTC Ratchet"` (`RATCHET_INFO_STRING`, `crypto.rs:25`) | 32 (new secret) |

A **ratchet** is `secret ← HKDF(secret, "RingRTC Ratchet")` and `ratchet_counter += 1`
(`mut_advance_ratchet`, `crypto.rs:76-89`).

**Frame encryption** (`crypto.rs:344-371`):
- `iv` = 16 bytes = `frame_counter` (u64, big-endian) in the high bytes, rest zero
  (`convert_frame_counter_to_iv`, `crypto.rs:204-209`).
- ciphertext = **AES-256-CTR**(aes_key, iv) over plaintext (in place).
- `mac` = first **16 bytes** (`MAC_SIZE_BYTES`, `crypto.rs:32`) of
  `HMAC-SHA256(hmac_key, iv ‖ len(data)_u32_BE ‖ data ‖ 0x00000000)` (`crypto.rs:360-368`).

**On-wire frame footer** appended after the ciphertext (`group_call.rs:3860-3882`,
read back at `3928-3953`):

```
[ encrypted payload ][ ratchet_counter : u8 ][ frame_counter : u32 BE ][ mac : 16 bytes ]
```

`frame_counter` starts at 1 and increments per frame (`crypto.rs:327,354-355`); it must stay ≤ u32::MAX
(`group_call.rs:3873`). Receivers find the matching `ReceiverState` by demux id and `ratchet_counter`,
ratcheting forward if needed and tolerating out-of-order frames (`crypto.rs:376-410`, up to
`MAX_OOO_FRAMES = 300`, `MAX_OOO_RATCHETS = 5`).

### D.5 ⚠️ advanced — media-key distribution

The per-sender secret is distributed **over Signal signaling** (E2E-encrypted), via
`signaling.CallMessage.group_call_message` → `group_call.DeviceToDevice.MediaKey`:

```proto
message MediaKey {                       // group_call.proto:26-30
  optional uint32 ratchet_counter = 1;
  optional bytes  secret          = 2;   // 32-byte frame_crypto::Secret
  optional uint32 demux_id        = 3;
}
```

Lifecycle (`group_call.rs`):

- **On join:** generate a random send secret (`frame_crypto::Context::new(random_secret(OsRng))`,
  `group_call.rs:1298-1300`). Send your current `(ratchet_counter, secret)` to all members
  (`resend_media_keys`, `group_call.rs:2305-2342` reading `send_state()`).
- **Member added (forward secrecy of the past):** `advance_send_ratchet()` (one ratchet step) and send the
  new key only to the newly-added users (`advance_media_send_key_and_send_to_users_with_added_devices`,
  `group_call.rs:3605-3637`). New members can't decrypt earlier frames.
- **Member removed (forward secrecy of the future):** generate a **brand-new random** secret
  (counter reset to 0), send it to everyone *except* the removed user, wait
  `MEDIA_SEND_KEY_ROTATION_DELAY_SECS`, then `reset_send_ratchet(secret)`
  (`rotate_media_send_key_and_send_to_users_not_removed`, `group_call.rs:3525-3603`). The removed user
  can't decrypt future frames.
- **Receiving a key:** `add_receive_secret(demux_id, ratchet_counter, secret)`
  (`group_call.rs:3640-3691`, `crypto.rs:437-448`; up to `MAX_RECEIVER_STATES_TO_RETAIN = 5` per sender).

### D.6 SFU control over RTP data (`group_call.proto`)

Client↔SFU control (not media) uses `group_call.DeviceToSfu` / `SfuToDevice` over RTP data
(reliability via `MRPHeader{seqnum, ack_num, num_packets}`, `group_call.proto:11-17`):

- **`DeviceToSfu`** (`group_call.proto:60-127`): `video_request` (which resolutions to forward),
  `leave`, admin actions (`approve`/`deny`/`remove`/`block`), `raise_hand`, `stats`, MRP `content`.
- **`SfuToDevice`** (`group_call.proto:129-219`): `video_request` (resolution the SFU wants from you),
  `speaker`, `device_joined_or_left` (carries `PeekInfo`), `current_devices`, `stats`, `removed`,
  `raised_hands`, `endorsements` (group-send endorsements), MRP `content`.
- **`DeviceToDevice`** also carries (over RTP, peer-to-peer-through-SFU): `Heartbeat`
  (audio/video mute, presenting, screen-share, `muted_by_demux_id`), `Leaving`, `Reaction`,
  `RemoteMuteRequest` (`group_call.proto:24-58`).

### D.7 Membership proof / auth (how the Authorization header is built)

Two distinct mechanisms (`sfu.rs`, `lite/call_links.rs`):

1. **Group calls** — `auth_header_from_membership_proof` (`sfu.rs:504-520`): the proof is a UTF-8 token
   `uuid:rest`; the header is `"Basic " + base64("{uuid}:{token}")`. The token is a zkgroup group
   membership proof (set via `group_call.rs:set_membership_proof`, ~682-690). **Obtaining the
   membership proof is agent 4's domain** (zkgroup group params); we only need to format the header.
2. **Call links** — `auth_header_from_auth_credential` (`call_links.rs:127-129`):
   `"Bearer auth.{base64(presentation)}"` where the presentation is a zkgroup
   `CallLinkAuthCredentialPresentation` (creation uses `"Bearer create.{...}"`, `call_links.rs:138`).
   Call-link endpoints hit `{sfu_url}/v1/call-link` (`call_links.rs:124`); the room is identified by
   `X-Room-Id: hex(derive_room_id(root_key))` + an epoch header.

### D.8 Call links (adhoc calls) — lower priority

Call links are ad-hoc calls not tied to a Signal group. zkgroup (libsignal
`rust/zkgroup/src/api/call_links/`) provides:

| Type | Purpose |
|---|---|
| `CallLinkSecretParams` / `CallLinkPublicParams` | UID-encryption keypair derived from the link root key (`params.rs:38-50`, label `"…CallLinkSecretParams_DeriveFromRootKey"`). Encrypts member ACIs for peek info. |
| `CallLinkAuthCredential` (+ `Response`/`Presentation`) | Proves a user may join/peek a link (MAC over ACI + day-granularity time, label `"20230421_Signal_CallLinkAuthCredential"`). |
| `CreateCallLinkCredential` (+ `Request`/`Response`/`Presentation`) | Authorizes *creating* a link (MAC over a client-chosen room id + ACI + day-truncated ts, label `"20230413_Signal_CreateCallLinkCredential"`). |
| `GenericServerPublicParams` / `GenericServerSecretParams` | The server signing keypair for both credential types (`generic_server_params.rs:12-38`). |

Room id derivation: HKDF-SHA256 over the root key, info `"20230501-Signal-CallLinkRootKey-RoomId"`
(ringrtc `root_key.rs:272,301-307`) → 32-byte room id sent as `X-Room-Id`. **Defer call links** until
group calls work.

---

## E. ICE / TURN relays (Signal-Server)

To get STUN/TURN servers for the WebRTC ICE agent:

- **`GET /v2/calling/relays`** (`CallRoutingControllerV2.java`, `@Path("/v2/calling")` class,
  `@GET @Path("/relays")`, lines ~26/43-45). **Auth: standard account+device Basic auth**
  (`@Auth AuthenticatedDevice`, ~line 57). No query params. Rate-limited per account.

> ⚠️ The prompt referenced `/v1/calling/relays`; in this server tree only the **V2** controller exists
> (`/v2/calling/relays`). The older V1 path may still be served by Signal's production but isn't in this
> source. Verify the path against the deployed server when implementing.

Response — `GetCallingRelaysResponse` (`GetCallingRelaysResponse.java:11-12`):

```json
{ "relays": [ TurnToken, ... ] }
```

`TurnToken` (`auth/TurnToken.java:13-19`):

| JSON field | Type | Meaning |
|---|---|---|
| `username` | string | TURN username (time-limited credential) |
| `password` | string | TURN password |
| `ttl` | number (seconds) | credential lifetime (`@JsonProperty("ttl") ttlSeconds`) |
| `urls` | string[] | STUN/TURN URLs (`stun:` / `turn:` / `turns:` entries) |
| `urlsWithIps` | string[] | same servers pre-resolved to IPs (skip DNS) |
| `hostname` | string? | TLS hostname for `urlsWithIps` |

Feed `urls` (or `urlsWithIps` + `hostname`) + `username` + `password` straight into the
`RTCPeerConnection` `iceServers` config. Refresh before `ttl` expires.

---

## F. Feasibility verdict (interop without RingRTC)

**Question:** can a TypeScript client interoperate with Signal calling without linking RingRTC, using a
standard WebRTC engine (browser `RTCPeerConnection`, as the rest of `Meet/` already does)?

The `opaque` payloads are produced/consumed by RingRTC's Rust+C++. The wire **protobufs are fully
documented above and trivially reproducible in TS** (protobufjs). The hard parts are the bits RingRTC
does *outside* the proto:

1. **SDP ↔ V4 conversion.** We must extract `ice_ufrag`/`ice_pwd`/codecs from the SDP our WebRTC engine
   produces, and **re-synthesize a complete SDP** from a received `ConnectionParametersV4` (with the
   fixed conventions RingRTC bakes into its C++: m-line layout, RTP header extensions, payload-type maps,
   rtcp-mux, bundle, the SRTP setup line, the RTP-data PT 101, etc.). These conventions are **not** in
   the .proto and **not** in the Rust — they're in RingRTC's C++/WebRTC fork. **This is the main risk and
   effort.** It is mechanical but must match byte-for-byte semantics or the peer's WebRTC rejects the SDP.
   ⚠️ TODO: read RingRTC's C++ `sdp.cc` / WebRTC fork to extract the exact SDP template (not in the Rust
   sources cloned here).
2. **No DTLS; raw SRTP key install.** RingRTC disables DTLS and installs a DH-derived SRTP key directly.
   Browser `RTCPeerConnection` **does not expose** an API to disable DTLS or set a raw SRTP key — it
   *requires* DTLS-SRTP. So a **stock browser `RTCPeerConnection` cannot do Signal's SRTP scheme.** A
   WebRTC stack that allows setting external SRTP keys (e.g. a native binding, `werift`/`node-datachannel`
   with SRTP key injection, or a custom build) is required. The DH+HKDF math itself (X25519, HKDF-SHA256,
   identity-key binding, AEAD-AES-256-GCM) is straightforward in TS.
3. **Group media-frame encryption (§D.4)** is fully specified here (AES-256-CTR + truncated HMAC-SHA256 +
   ratchet) and reproducible, **but** it must hook the WebRTC encode/decode pipeline. In browsers this
   maps to **Insertable Streams / `RTCRtpScriptTransform`** (encoded-frame transforms) — feasible but
   only where that API exists.

**Verdict:**

- **1:1 calling — feasible but non-trivial.** The signaling (CallMessage + signaling.proto + DH→SRTP) is
  fully reproducible from this doc. The blocker is **(a)** reproducing RingRTC's SDP template and **(b)**
  needing a WebRTC engine that lets us **disable DTLS and inject the DH-derived SRTP key** — which the
  plain browser `RTCPeerConnection` does *not* allow. Minimum viable path: synthesize the
  `signaling.proto` offer/answer ourselves, drive a WebRTC engine that supports external SRTP keying, and
  port `negotiate_srtp_keys`. **Recommended first step:** implement send/parse of the `CallMessage` +
  `signaling.proto` layer (pure TS, fully specified here, immediately testable against captured traffic),
  then tackle the SRTP-keying engine question separately. ⚠️ The DTLS-disable requirement is the real
  gate — confirm the chosen WebRTC stack can do it before committing.
- **Group calling — substantially harder; defer.** Adds the SFU HTTP join/peek (easy), the
  membership-proof/zkgroup auth (depends on agent 4), the **second** crypto layer (frame encryption via
  encoded-frame transforms), and the same SDP/SRTP gating as 1:1 (the SFU leg is the same V4/DH/SRTP
  transport). Reproducible from this doc, but a large surface. **Defer until 1:1 works.**
- **Call links** — lowest priority; defer (§D.8).

The existing `Meet/` precedent matters: `Meet/WhatsApp/whatsAppCallE2E.ts` and
`whatsAppCallSignaling.ts` already implement **custom call signaling + E2E** over `RTCPeerConnection`,
and `Meet/SIP`, `Meet/M3`, `Meet/LiveKit` all drive WebRTC. So the signaling half fits the codebase
cleanly; the open question is purely the **DTLS-disable / raw-SRTP-key** capability of whatever WebRTC
engine `Meet/Signal/` ends up using.

---

## Source files

- ringrtc signaling proto — https://github.com/signalapp/ringrtc/blob/a59801d/protobuf/protobuf/signaling.proto
- ringrtc group_call proto — https://github.com/signalapp/ringrtc/blob/a59801d/protobuf/protobuf/group_call.proto
- ringrtc rtp_data proto — https://github.com/signalapp/ringrtc/blob/a59801d/protobuf/protobuf/rtp_data.proto
- ringrtc signaling.rs — https://github.com/signalapp/ringrtc/blob/a59801d/src/rust/src/core/signaling.rs
- ringrtc connection.rs (DH→SRTP, V4 flow) — https://github.com/signalapp/ringrtc/blob/a59801d/src/rust/src/core/connection.rs
- ringrtc crypto.rs (frame encryption/ratchet) — https://github.com/signalapp/ringrtc/blob/a59801d/src/rust/src/core/crypto.rs
- ringrtc group_call.rs (key distribution, frame footer) — https://github.com/signalapp/ringrtc/blob/a59801d/src/rust/src/core/group_call.rs
- ringrtc sfu.rs (join/peek/auth) — https://github.com/signalapp/ringrtc/blob/a59801d/src/rust/src/lite/sfu.rs
- ringrtc call_links.rs — https://github.com/signalapp/ringrtc/blob/a59801d/src/rust/src/lite/call_links.rs
- ringrtc sdp_observer.rs (SDP↔V4) — https://github.com/signalapp/ringrtc/blob/a59801d/src/rust/src/webrtc/sdp_observer.rs
- Signal-Android SignalService.proto (CallMessage, GroupCallUpdate) — https://github.com/signalapp/Signal-Android/blob/d6871f8/lib/libsignal-service/src/main/protowire/SignalService.proto
- Signal-Android SignalServiceMessageSender.java (createCallContent, isUrgent) — https://github.com/signalapp/Signal-Android/blob/d6871f8/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/SignalServiceMessageSender.java
- Signal-Android WebRtcActionProcessor.java — https://github.com/signalapp/Signal-Android/blob/d6871f8/app/src/main/java/org/thoughtcrime/securesms/service/webrtc/WebRtcActionProcessor.java
- Signal-Android app/build.gradle.kts (SFU URL) — https://github.com/signalapp/Signal-Android/blob/d6871f8/app/build.gradle.kts
- Signal-Server CallRoutingControllerV2.java — https://github.com/signalapp/Signal-Server/blob/adb5b6a/service/src/main/java/org/whispersystems/textsecuregcm/controllers/CallRoutingControllerV2.java
- Signal-Server GetCallingRelaysResponse.java — https://github.com/signalapp/Signal-Server/blob/adb5b6a/service/src/main/java/org/whispersystems/textsecuregcm/controllers/GetCallingRelaysResponse.java
- Signal-Server TurnToken.java — https://github.com/signalapp/Signal-Server/blob/adb5b6a/service/src/main/java/org/whispersystems/textsecuregcm/auth/TurnToken.java
- libsignal zkgroup call_links — https://github.com/signalapp/libsignal/blob/a85f3c0/rust/zkgroup/src/api/call_links.rs
