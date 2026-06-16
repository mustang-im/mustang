# Signal (Android) Wire Protocol — Transport & Service API

> Based on main-branch clones of `signalapp/Signal-Android`, `signalapp/libsignal`, and `signalapp/Signal-Server`, **2026-06-16**.

This document covers ONLY the transport and service plumbing needed for a clean-room TypeScript
reimplementation:

1. Service hosts / endpoints
2. The authenticated & unauthenticated chat WebSocket (framing, correlation, keepalive, reconnect)
3. Authentication (Basic auth username format, sealed-sender access headers)
4. Inbound delivery (the `Envelope` protobuf, how it arrives, how it is ACKed)
5. Outbound send (`PUT /v1/messages/...`, JSON bodies, exhaustive error handling)
6. The challenge / captcha flow (`PUT /v1/challenge`)

It does **not** cover: the Signal Protocol crypto math (already implemented in
`app/logic/Chat/Signal/Crypto/*`), registration, message **content** semantics, groups, profiles,
attachments/CDN internals, or calling.

Every non-obvious claim cites `source-file:line` under `/tmp/...`. Where something is genuinely
unknown it is marked `⚠️ UNKNOWN/TODO`.

---

## 1. Service hosts & endpoints

Production hostnames come from two independent sources that agree:

- **Android** `BuildConfig` (gradle): `Signal-Android/app/build.gradle.kts:238-250`
- **libsignal** Rust env: `libsignal/rust/net/src/env.rs:42-200`

| Purpose | Production host (URL) | Source |
|---|---|---|
| Chat service (REST + WebSocket) | `https://chat.signal.org` | `app/build.gradle.kts:238` ; `env.rs:53` |
| Chat over HTTP/2 (experimental) | `grpc.chat.signal.org` | `env.rs:73` |
| Storage service | `https://storage.signal.org` | `app/build.gradle.kts:239` |
| CDN 0 (legacy attachments) | `https://cdn.signal.org` | `app/build.gradle.kts:240` |
| CDN 2 | `https://cdn2.signal.org` | `app/build.gradle.kts:241` |
| CDN 3 | `https://cdn3.signal.org` | `app/build.gradle.kts:242` |
| CDSI (contact discovery) | `https://cdsi.signal.org` | `app/build.gradle.kts:243` ; `env.rs:127` |
| SVR2 (secure value recovery) | `https://svr2.signal.org` | `app/build.gradle.kts:245` ; `env.rs:163` |
| SFU (calling) — *out of scope* | `https://sfu.voip.signal.org` | `app/build.gradle.kts:246` |
| Content proxy (link previews etc.) | `contentproxy.signal.org` | `app/build.gradle.kts:250` |

Staging equivalents (e.g. `chat.staging.signal.org`, `storage-staging.signal.org`,
`cdsi.staging.signal.org`, `svr2.staging.signal.org`) are at `app/build.gradle.kts:461-467` and
`env.rs:84-200`.

For this transport doc, the only host you need is **`chat.signal.org`** (the chat service). The
others are listed for completeness; CDSI/SVR2/CDN/SFU have their own protocols owned by other agents.

### TLS

- TLS **certificate pinning** is used. Android pins via a custom `TrustStore`
  (`SignalServiceNetworkAccess.kt:171` builds `SignalServiceTrustStore`; the socket factory installs
  it via `BlacklistingTrustManager.createFor(trustStore)` at
  `OkHttpWebSocketConnection.java:401`). libsignal pins to `SIGNAL_ROOT_CERTIFICATES`
  (`env.rs:55`, `:75`, etc.). **Do not dump the certs**; just replicate "pin to the Signal root CA".
- libsignal enforces **TLS 1.3 minimum** for chat/CDSI/SVR2 (`env.rs:56`, `:98`, `:130`, `:166`);
  the legacy OkHttp path uses `ConnectionSpec.RESTRICTED_TLS` / `MODERN_TLS`
  (`OkHttpWebSocketConnection.java:144`, `SignalServiceNetworkAccess.kt:141`).
- A `x-signal-timestamp` "connection confirmation" header is expected on the chat connect response
  (`env.rs:37`, `:58`).

### Censorship circumvention (domain fronting)

When enabled or in certain country codes, traffic is fronted through Google (`G_HOST`) or Fastly
(`F_*` hosts) front domains (`SignalServiceNetworkAccess.kt:79-86`, `:201-269`). This is an
optional fallback; the normal path connects directly to `chat.signal.org`. Not required for a first
implementation.

---

## 2. The chat WebSocket

Two logical sockets exist, both to the **same** host (`chat.signal.org`):

| Socket | Purpose | Credentials | Path |
|---|---|---|---|
| **Authenticated** ("identified") | receive inbound envelopes, send identified messages, keepalive | Basic auth (ACI + device) | `wss://chat.signal.org/v1/websocket/` |
| **Unauthenticated** ("unidentified") | sealed-sender sends, unauthenticated lookups | none (sealed-sender access keys per-request) | `wss://chat.signal.org/v1/websocket/` |

Constants:

- Path: `/v1/websocket/` — `libsignal/rust/net/src/env.rs:953` (`CHAT_WEBSOCKET_PATH`); the legacy
  OkHttp client builds `uri + "/v1/websocket/" + extraPathUri` at
  `OkHttpWebSocketConnection.java:128`, where `extraPathUri` is empty `""` for the chat socket.
- Provisioning (device-linking) uses `/v1/websocket/provisioning/` —
  `env.rs:954`, `ProvisioningSocket.kt:135`. *(Registration/linking is out of scope.)*
- The scheme is derived by replacing `https://`→`wss://`, `http://`→`ws://`
  (`OkHttpWebSocketConnection.java:126`).

### 2.1 Frame format (WebSocketResources.proto)

Both directions exchange **binary** WebSocket frames, each one a serialized `WebSocketMessage`
protobuf. Identical definitions exist in
`Signal-Android/core/network/src/main/protowire/WebSocketResources.proto` and
`libsignal/rust/net/src/proto/chat_websocket.proto` (verified byte-for-byte equal). `proto2`.

```proto
message WebSocketRequestMessage {
    optional string verb    = 1;   // "GET" | "PUT" | ...
    optional string path    = 2;   // e.g. "/api/v1/message", "/v1/keepalive"
    optional bytes  body    = 3;   // request payload (e.g. serialized Envelope, or JSON bytes)
    repeated string headers = 5;   // each entry is a full "Name: value" line
    optional uint64 id      = 4;   // correlation id (caller-assigned)
}

message WebSocketResponseMessage {
    optional uint64 id      = 1;   // echoes the request id
    optional uint32 status  = 2;   // HTTP-like status (200, 400, 409, ...)
    optional string message = 3;   // status text ("OK", "Unknown", ...)
    repeated string headers = 5;
    optional bytes  body    = 4;   // response payload
}

message WebSocketMessage {
    enum Type { UNKNOWN = 0; REQUEST = 1; RESPONSE = 2; }
    optional Type                     type     = 1;
    optional WebSocketRequestMessage  request  = 2;   // present iff type == REQUEST
    optional WebSocketResponseMessage response = 3;   // present iff type == RESPONSE
}
```

Source: `WebSocketResources.proto:13-39`.

> **Header encoding:** `headers` is a `repeated string`, **not** a map. Each element is one literal
> `"Name: value"` line (e.g. `"X-Signal-Timestamp: 1718500000000"`). Header name matching is
> case-insensitive (`SignalWebSocket.kt:473` lower-cases before comparing).

The service **tunnels a REST-like API over the socket**: a `WebSocketRequestMessage` carries an HTTP
verb + path + body + headers, and the peer replies with a `WebSocketResponseMessage` carrying the
HTTP-style status + body. So "send a message" and "receive a message" are both modeled as
request/response pairs on the one socket.

### 2.2 Request/response correlation (the `id` field)

```
client                                   server
  | --- WebSocketMessage{REQUEST,         |
  |        request{id=N, verb, path, ...}} -->
  |                                        |  (process)
  | <-- WebSocketMessage{RESPONSE,         |
  |        response{id=N, status, body}} --|
  | (match by id == N)                     |
```

- The sender stores the outgoing request keyed by `request.id` and resolves the matching future when
  a `RESPONSE` with the same id arrives: legacy `OkHttpWebSocketConnection.java:250` (store),
  `:314` (`outgoingRequests.remove(message.response.id)`).
- Keepalive responses are matched against a separate set by id
  (`OkHttpWebSocketConnection.java:323`).
- In the **modern (libsignal-net)** path, outbound correlation is handled inside libsignal — each
  `send()` returns a future resolved with the matching response
  (`LibSignalChatConnection.kt:197-211`), so the SDK does not track ids for outbound requests.
- For **inbound** server requests the client assigns its own monotonically-increasing "pseudo id"
  (`AtomicLong`) so it can correlate the later ACK callback
  (`LibSignalChatConnection.kt:89`, `:662`).

The caller is free to choose the outbound id; the legacy code uses
`System.currentTimeMillis()` (e.g. keepalive at `OkHttpWebSocketConnection.java:281`).

### 2.3 Keepalive

The client periodically sends a request and expects a 2xx:

```
WebSocketMessage{ type=REQUEST, request{ verb="GET", path="/v1/keepalive", id=<now> } }
```

- Path/verb: `OkHttpWebSocketConnection.java:281-288` (legacy);
  `LibSignalChatConnection.kt:123-129` (`KEEP_ALIVE_REQUEST = GET /v1/keepalive`).
- **Cadence:** 30 s foreground / 60 s background.
  - Legacy base constant `KEEPALIVE_FREQUENCY_SECONDS = 30` (`OkHttpWebSocketConnection.java:65`).
  - Health monitor: `KEEP_ALIVE_SEND_CADENCE = 30 s`,
    `KEEP_ALIVE_SEND_CADENCE_BACKGROUND = 60 s` (`SignalWebSocketHealthMonitor.kt:40-41`).
  - The OkHttp read/connect timeout is `KEEPALIVE_FREQUENCY_SECONDS + 10 = 40 s`
    (`OkHttpWebSocketConnection.java:145-147`).
- **libsignal** uses slightly different timers: keepalive interval **31 s**, max idle before
  disconnect **45 s** (`libsignal/rust/net/infra/src/timeouts.rs:38-40`; wired in via
  `RECOMMENDED_WS_CONFIG`, `infra/src/lib.rs:291-297`, and `RECOMMENDED_CHAT_WS_CONFIG`,
  `rust/net/src/chat.rs:51-55`).
- A missed keepalive response triggers `disconnect()` and a reconnect
  (`LibSignalChatConnection.kt:496-499`, `SignalWebSocketHealthMonitor.kt:191-192`).
- The per-request send timeout for a keepalive is `DEFAULT_SEND_TIMEOUT = 10 s`
  (`WebSocketConnection.kt:24`).

**Recommendation for our impl:** send `GET /v1/keepalive` every ~30 s; if no 2xx within ~40-45 s,
treat the socket as dead and reconnect.

### 2.4 Reconnect

- The receive loop catches any throwable from the connection and reconnects on the next iteration,
  with **exponential backoff capped at 30 s** when `attempts > 1`
  (`Signal-Android/app/src/main/java/org/thoughtcrime/securesms/messages/IncomingMessageObserver.kt:452-456`,
  `:541-543`).
- `WebSocketUnavailableException` reconnects immediately (`IncomingMessageObserver.kt:529-531`); a
  successful batch resets `attempts = 0` (`:506`, `:527`).
- libsignal auto-reconnects too: `0e6bdd8b`-style behavior — on `onConnectionInterrupted` it pushes
  `DISCONNECTED` (`LibSignalChatConnection.kt:682-693`).
- The server can close with specific codes: `4401` = connection invalidated,
  `4409` = connected elsewhere (`libsignal/rust/net/src/env.rs:39-40`). The legacy client treats
  close codes `403`/`4401` as a hard `NonSuccessfulResponseCodeException`
  (`OkHttpWebSocketConnection.java:363-364`).

---

## 3. Authentication

### 3.1 Authenticated socket — HTTP Basic auth

The authenticated socket passes credentials as an HTTP **`Authorization: Basic`** header on the
WebSocket **upgrade (connect) request** — *not* as a query param.

- Header is added at connect time: `OkHttpWebSocketConnection.java:165-171`
  (`Credentials.basic(username, password)`).
- Also adds `X-Signal-Agent: <agent>` (`:162`) and
  `X-Signal-Receive-Stories: true|false` (`:173`).

**Username format** (`CredentialsProvider.getUsername()`,
`CredentialsProvider.java:24-32`):

```
username = ACI                       (if deviceId == 1, the primary/default device)
username = ACI + "." + deviceId      (if deviceId != 1)
```

- `DEFAULT_DEVICE_ID = 1` (`SignalServiceAddress.java:22`).
- `ACI` is the account's ACI **UUID string** (`getAci().toString()`).
- **libsignal always appends `.{device_id}`** unconditionally:
  `format!("{}.{device_id}", aci.service_id_string())` (`libsignal/rust/net/src/chat.rs:251`).
  Since the primary device is `1`, `"<aci>"` and `"<aci>.1"` are both accepted by the server.
  ⚠️ Prefer the libsignal form `"<aci>.<deviceId>"` for safety.

> Note: `service_id_string()` for an ACI is just the bare UUID (no prefix). A PNI would be
> `PNI:<uuid>`, but the chat-auth username is the **ACI**, so no prefix.

**Password origin:** the password is the per-device account password generated at registration and
stored in the account state (`CredentialsProvider.getPassword()`). It is an opaque server-issued
secret; this transport doc does not generate it (registration is out of scope). It is supplied as
the Basic-auth password.

The Basic header is the standard `"Basic " + base64(username + ":" + password)`
(libsignal `auth.rs:52-57` `basic_authorization`; OkHttp `Credentials.basic`).

> There is also a separate `Auth::otp` HMAC scheme in libsignal (`auth.rs:33-49`) used for
> **derived** credentials returned by the server's `/auth` endpoints (CDSI/storage), where
> `username = hex(uid)` and `password = "timestamp:hex(otp)"`. That is **not** the chat-socket auth;
> the chat socket uses the ACI/password Basic auth above.

### 3.2 Unauthenticated socket — sealed sender access headers

The unauthenticated socket carries **no** `Authorization` header. Instead each *send* request
attaches a per-recipient sealed-sender access credential as a header
(`SignalWebSocket.kt:317-342`, `UnauthenticatedWebSocket.request`). Two mutually-exclusive forms
(`SealedSenderAccess.kt`):

| Header name | Value | When |
|---|---|---|
| `Unidentified-Access-Key` | base64 of the 16-byte recipient access key | normal sealed sender (`SealedSenderAccess.kt:63`) |
| `Group-Send-Token` | base64 group-send endorsement token | group sealed sender (`SealedSenderAccess.kt:39`, `:83`) |

- If a sealed-sender send returns **401**, the client switches to a fallback access key and retries
  once (`SignalWebSocket.kt:331-337`).
- Server-side constants match: `Unidentified-Access-Key` and `Group-Send-Token`
  (`Signal-Server/.../util/HeaderUtils.java:37`, `:39`).

---

## 4. Inbound delivery

### 4.1 The `Envelope` protobuf

Inbound messages are delivered as a serialized `Envelope` (in the `body` of an inbound
`WebSocketRequestMessage`).

**Client definition** (`Signal-Android/lib/libsignal-service/src/main/protowire/SignalService.proto:13-...`),
`proto2`:

```proto
message Envelope {
  enum Type {
    UNKNOWN                 = 0;
    DOUBLE_RATCHET          = 1;  // "normal" ratchet message  (server name: CIPHERTEXT)
    // 2 reserved (formerly KEY_EXCHANGE)
    PREKEY_MESSAGE          = 3;  // session-initiating prekey  (server name: PREKEY_BUNDLE)
    SERVER_DELIVERY_RECEIPT = 5;  // server-generated receipt, no content
    UNIDENTIFIED_SENDER     = 6;  // sealed sender (single OR multi-recipient sealed-sender format)
    // 7 reserved (formerly SENDERKEY_MESSAGE)
    PLAINTEXT_CONTENT       = 8;  // decryption-error receipts only; never user content
  }

  optional Type   type                       = 1;
  // 2 reserved (formerly sourceE164)
  optional string sourceServiceId            = 11;  // ACI/PNI string  (server side: reserved)
  optional uint32 sourceDeviceId             = 7;
  optional string destinationServiceId       = 13;  // (server side: reserved)
  // 3 reserved (formerly relay)
  optional uint64 clientTimestamp            = 5;   // original sender timestamp
  // 6 reserved (formerly legacyMessage)
  optional bytes  content                    = 8;   // encrypted Content (see Crypto/*)
  optional string serverGuid                 = 9;   // (server side: reserved)
  optional uint64 serverTimestamp            = 10;  // time of server receipt/delivery
  optional bool   ephemeral                  = 12;  // don't persist if recipient offline
  optional bool   urgent                     = 14 [default = true];
  optional string updatedPni                 = 15;  // number-change sync  (server side: reserved)
  optional bool   story                      = 16;
  optional bytes  report_spam_token          = 17;  // spam-report token
  // 18 reserved (internal server use)
  optional bytes  sourceServiceIdBinary      = 19;  // 16-byte ACI, or 1-byte prefix + 16-byte PNI
  optional bytes  destinationServiceIdBinary = 20;
  optional bytes  serverGuidBinary           = 21;  // 16-byte UUID
  optional bytes  updatedPniBinary           = 22;  // 16-byte UUID
}
```

Source: `SignalService.proto` `message Envelope` block (fields and reserved tags verified verbatim).

> **⚠️ Important naming/encoding nuances — read this before implementing the decoder:**
>
> 1. **Enum names differ between repos for the SAME numbers.** The Android client proto calls them
>    `DOUBLE_RATCHET(1)` / `PREKEY_MESSAGE(3)`; the **server's** wire proto
>    (`Signal-Server/service/src/main/proto/TextSecure.proto:13-22`) calls them
>    `CIPHERTEXT(1)` / `PREKEY_BUNDLE(3)`. Values are identical
>    (`UNKNOWN=0, 1, 3, SERVER_DELIVERY_RECEIPT=5, UNIDENTIFIED_SENDER=6, PLAINTEXT_CONTENT=8`).
>    Decode by **number**, not name.
> 2. **The server populates the BINARY fields, and reserves the string ones.** In
>    `TextSecure.proto:24-42`, fields 9/11/13/15 (string `server_guid`/`source_service_id`/
>    `destination_service_id`/`updated_pni`) are **reserved** server-side; the server emits
>    `source_service_id`(19), `destination_service_id`(20), `server_guid`(21), `updated_pni`(22) as
>    **bytes**. So for messages arriving FROM the server, read the `*Binary` fields. The string
>    fields still exist in the client proto for historical/local use.
> 3. The server also has field `shared_mrm_key = 18` (`TextSecure.proto:38`) for fetching
>    multi-recipient content; on the client this tag is reserved for server use.
> 4. `report_spam_token`(17) is what the task brief called `reportingToken`.

### 4.2 How a message arrives over the socket

The server delivers an inbound message as a `WebSocketRequestMessage`:

| Field | Value | Source |
|---|---|---|
| `verb` | `"PUT"` | `LibSignalChatConnection.kt:115`, predicate `SignalWebSocket.kt:289-290` |
| `path` | `"/api/v1/message"` | `LibSignalChatConnection.kt:116` |
| `body` | serialized `Envelope` protobuf bytes | decoded at `SignalWebSocket.kt:459` (`Envelope.ADAPTER.decode(...)`) |
| `headers` | one line `"X-Signal-Timestamp: <serverDeliveryTimestamp>"` | `LibSignalChatConnection.kt:117-119`, `:665`; `SignalWebSocket.kt:62`, `:473` |
| `id` | server-assigned (or local pseudo id in libsignal) | `LibSignalChatConnection.kt:662` |

```
server ──► WebSocketMessage{
              type=REQUEST,
              request{ verb="PUT", path="/api/v1/message",
                       headers=["X-Signal-Timestamp: 1718500000000"],
                       body=<Envelope bytes>, id=N }
           }
```

The client recognizes it via `isSignalServiceEnvelope()` =
`verb=="PUT" && path=="/api/v1/message"` (`SignalWebSocket.kt:289-291`).

### 4.3 ACKing a received message

The client replies with a `WebSocketResponseMessage` echoing the request id, status 200, message
`"OK"`, no body (`SignalWebSocket.kt:297-311`):

```
client ──► WebSocketMessage{
              type=RESPONSE,
              response{ id=N, status=200, message="OK" }
           }
```

```kotlin
WebSocketResponseMessage.Builder()
  .id(this.id)
  .status(200)
  .message("OK")
  .build()
```

- Non-envelope requests get `status=400, message="Unknown"` (`SignalWebSocket.kt:304-309`).
- ACK is **not** automatic — the higher layer processes the envelope batch and the caller invokes
  `sendAck(...)` (`SignalWebSocket.kt:194-196`, `:484-487`). For a clean-room impl: send the 200/OK
  response only after the envelope is durably stored, so an unACKed message is redelivered.
- In the legacy OkHttp path the 200/OK is sent on the wire
  (`OkHttpWebSocketConnection.java:262-275`). In libsignal-net the 200/OK is instead a local handle
  that fires the stored ack callback (`LibSignalChatConnection.kt:584-594`); on the wire it is still
  an ACK. Replicate the wire behavior (send the 200/OK RESPONSE frame).

### 4.4 Queue-empty / end-of-queue signal

After draining the offline queue the server sends:

```
WebSocketMessage{ type=REQUEST, request{ verb="PUT", path="/api/v1/queue/empty" } }
```

- Constants: `SOCKET_EMPTY_REQUEST_VERB="PUT"`, `SOCKET_EMPTY_REQUEST_PATH="/api/v1/queue/empty"`
  (`LibSignalChatConnection.kt:117-118`); predicate `isSocketEmptyRequest()`
  (`SignalWebSocket.kt:293-295`).
- It is **not** ACKed and is **not** an envelope; the client uses it to mark "decryption drained"
  (`SignalWebSocket.kt:421-423`, `:435`; `IncomingMessageObserver.kt:509-514`).

---

## 5. Outbound send

### 5.1 Single-recipient send

```
PUT /v1/messages/{destinationServiceId}?story={true|false}
Content-Type: application/json
Authorization: Basic ...            (authenticated socket)
   OR
Unidentified-Access-Key: <base64>   (unauthenticated / sealed sender)
   OR
Group-Send-Token: <base64>          (group sealed sender)
```

- Path template (client): `"/v1/messages/%s?story=%s"`
  (`PushServiceSocket.java:493`). `{destinationServiceId}` is the recipient ACI/PNI service id
  (`bundle.getDestination()`).
- Server endpoint: `MessageController` `@Path("/v1/messages")` + `@Path("/{destination}")` `@PUT`,
  `@Consumes/@Produces application/json` (`MessageController.java:99`, `:168-171`).
- Query params: `story` (`MessageController.java:212`).
- This request is tunneled over the WebSocket as a `WebSocketRequestMessage` with
  `verb="PUT"`, `path="/v1/messages/{dest}?story=..."`, `body=<JSON bytes>` (sealed-sender header
  appended for the unauthenticated socket, `SignalWebSocket.kt:317-326`). The legacy path can also
  send it as plain HTTP via `PushServiceSocket` (`makeServiceRequest`, `:493`); both hit the same
  `MessageController`.

**Request JSON body** = `OutgoingPushMessageList`
(`OutgoingPushMessageList.java`, server side `IncomingMessageList.java`):

```jsonc
{
  "destination": "<recipient ACI/PNI service id string>",  // server ignores; uses path param
  "timestamp": 1718500000000,        // sender timestamp (ms); server uses now() if 0
  "online": false,                   // deliver only if recipient online
  "urgent": true,                    // default true; false = not time-critical
  "messages": [
    {
      "type": 1,                     // Envelope.Type number (1=ciphertext/double-ratchet, 3=prekey,
                                     //   6=unidentified-sender, 8=plaintext-content)
      "destinationDeviceId": 1,      // recipient device id
      "destinationRegistrationId": 12345,  // recipient device registration id
      "content": "<base64 of encrypted ciphertext>"   // base64; 0x05 DJB framing is INSIDE this
    }
    // one entry PER recipient device
  ]
}
```

- Fields: `OutgoingPushMessageList.java` (`destination`, `timestamp`, `messages`, `online`,
  `urgent`) and `OutgoingPushMessage.java`
  (`type`, `destinationDeviceId`, `destinationRegistrationId`, `content`).
- Server deserializes to `IncomingMessageList`/`IncomingMessage`; `content` is base64-decoded
  (`IncomingMessage.java:27-31`, `@JsonDeserialize(using = ByteArrayBase64Deserializer.class)`),
  `urgent` defaults to `true` if absent (`IncomingMessageList.java:48`).
- `online` maps to the envelope `ephemeral` flag server-side (`IncomingMessage.toEnvelope(...)`,
  `IncomingMessage.java:52`).
- **One `messages[]` entry per destination device.** Duplicate `destinationDeviceId` ⇒ 400
  (`IncomingMessageList.java:53-67`).

> The `content` value is the serialized Signal-protocol ciphertext, base64-encoded. The DJB key
> framing (the `0x05` type-byte prefix on Curve25519 public keys) lives **inside** that ciphertext,
> produced by the crypto layer (`app/logic/Chat/Signal/Crypto/*`). The transport layer just
> base64s the opaque bytes.

**Success response (200)** = `SendMessageResponse`:

```json
{ "needsSync": true }
```

`needsSync` indicates whether the sender's other devices need a sync copy
(`SendMessageResponse.java`; set at `MessageController.java:254`, `needsSync` true when the account
has >1 device, `:243`).

### 5.2 Multi-recipient sealed-sender send

```
PUT /v1/messages/multi_recipient?ts={timestamp}&online={bool}&urgent={bool}&story={bool}
Content-Type: application/vnd.signal-messenger.mrm
Unidentified-Access-Key: <base64 XOR of all recipients' keys>   OR   Group-Send-Token: <base64>
```

- Path template (client): `"/v1/messages/multi_recipient?ts=%s&online=%s&urgent=%s&story=%s"`
  (`PushServiceSocket.java:159`).
- Server: `MessageController` `@Path("/multi_recipient")` `@PUT`,
  `@Consumes("application/vnd.signal-messenger.mrm")`, `@Produces application/json`
  (`MessageController.java:439-442`); media type constant
  `MultiRecipientMessageProvider.java:33`.
- Query params: `ts` (timestamp), `online`, `urgent` (default true), `story`
  (`MessageController.java:476-485`).
- **Body is binary** — the libsignal-serialized `SealedSenderMultiRecipientMessage`, **not** JSON
  (`MessageController.java:486-487`). Its internal layout is produced by the crypto layer; the
  transport layer sends the opaque bytes with the `application/vnd.signal-messenger.mrm` content
  type.
- The `Unidentified-Access-Key` here is the **XOR-combined** access key of all recipients
  (deprecated) or a single `Group-Send-Token` (`MessageController.java:467-473`); the two are
  mutually exclusive (`:542-544`).

**Success response (200)** = `SendMultiRecipientMessageResponse`:

```json
{ "uuids404": ["<service id>", "..."] }
```

`uuids404` = recipients in the request that are not registered Signal users; only populated when a
group-send token was supplied (`SendMultiRecipientMessageResponse.java`,
`MessageController.java:580`).

### 5.3 Error handling (EXHAUSTIVE)

Status codes interpreted by the client live in `PushServiceSocket.java:1342-1391` (authoritative
client mapping) and are produced by `MessageController` + exception mappers (server). Anything not
`200/202/204/207` is an error (`PushServiceSocket.java:1389`).

| Status | Meaning | Body | Client action | Source |
|---|---|---|---|---|
| **200** | sent | `SendMessageResponse` / `SendMultiRecipientMessageResponse` | success | `MessageController.java:254`, `:519` |
| **400** | bad request (duplicate recipient device, bad envelope type, illegal timestamp) | — | fail | `MessageController.java:395`, `:453`, `:492` |
| **401** | not a story and auth / access key / group-send token missing or wrong | — | `AuthorizationFailedException`; for sealed sender, retry once with fallback key then fail | `MessageController.java:185`, `OptionalAccess.java:71`; client `PushServiceSocket.java:1349-1351`, retry `SignalWebSocket.kt:331-337` |
| **403** | forbidden (e.g. PNI sync target) | — | `AuthorizationFailedException` | `MessageController.java:285`; client `:1350` |
| **404** | recipient service id is not a registered user (non-story) | — | `NotFoundException` ⇒ `UnregisteredUserException` | `MessageController.java:188`, `:264`; client `:1352`, `:499-500` |
| **409** | **mismatched devices** — wrong set of devices for recipient | `MismatchedDevicesResponse` (single) / `AccountMismatchedDevices[]` (multi) | re-fetch device list, resend to the right devices | `MessageController.java:426-430`, `:669-675`; client `:1354-1357` |
| **410** | **stale devices** — wrong registration ids for some devices | `StaleDevicesResponse` (single) / `AccountStaleDevices[]` (multi) | archive/rebuild sessions for the stale devices, resend | `MessageController.java:421-424`, `:677-688`; client `:1358-1361` |
| **413** | payload too large (also rate-limit on some endpoints) | — | `RateLimitException` (reads `Retry-After`) | `MessageController.java:433`, `:660`; client `:1343-1348` |
| **428** | **proof required** — complete a challenge/captcha first | `ProofRequiredResponse` `{token, options}` + optional `Retry-After` | run challenge flow (§6), then resend | `MessageController.java:197`; client `:1375-1380` |
| **429** | rate limited | — + `Retry-After` (seconds) | `RateLimitException` (back off `Retry-After`) | server `RateLimitExceededExceptionMapper.java`; client `:1344-1347` |
| **508** | server rejected (loop / abuse) | — | `ServerRejectedException` — do **not** auto-retry | client `PushServiceSocket.java:1385-1386` |

Other codes the client maps (not message-send specific, but on the same path):
`411` device-limit (`DeviceLimitExceededException`, `:1362-1365`), `417`
(`ExpectationFailedException`, `:1366`), `423` registration-lock (`:1368`), `499`
deprecated-version (`:1382`), `422` invalid access selector (`OptionalAccess.java:48`).

#### 409 — Mismatched devices

Single-recipient body (`MismatchedDevicesResponse.java`):

```json
{
  "missingDevices": [2, 3],   // present on the account but absent in your request
  "extraDevices":   [4]       // in your request but not on the account
}
```

Multi-recipient body is an **array**, one object per affected recipient
(`AccountMismatchedDevices.java`):

```json
[
  { "uuid": "<recipient service id>",
    "devices": { "missingDevices": [2], "extraDevices": [] } }
]
```

(`MessageController.java:662-674`.)

#### 410 — Stale devices

Single-recipient body (`StaleDevicesResponse.java`):

```json
{ "staleDevices": [2, 3] }   // registration ids no longer valid; rebuild sessions
```

Multi-recipient body is an **array** (`AccountStaleDevices.java`):

```json
[
  { "uuid": "<recipient service id>",
    "devices": { "staleDevices": [2] } }
]
```

(`MessageController.java:677-688`.)

> The client-side parse targets are `MismatchedDevices` (fields `missingDevices`/`extraDevices`) and
> `StaleDevices` (field `staleDevices`) — `PushServiceSocket.java:1355`, `:1359`. JSON keys match the
> server entities exactly.

#### 428 — Proof required (body)

```json
{
  "token":   "<opaque challenge token>",
  "options": ["recaptcha", "pushChallenge"]   // which challenge types are accepted
}
```

(`ProofRequiredResponse.java`; server entity `RateLimitChallenge.java` = `{token, options}`.) May
include a `Retry-After` header (`PushServiceSocket.java:1377`).

---

## 6. Challenge / captcha flow (transport level)

When a send (or other rate-limited op) returns **428** with `{token, options}`, the client must
complete one of the offered challenges and prove it, then retry the original request.

### 6.1 Submit a completed challenge

```
PUT /v1/challenge
Content-Type: application/json
Authorization: Basic ...     (authenticated)
```

Endpoint: `ChallengeController` `@Path("/v1/challenge")` `@PUT`
(`ChallengeController.java:50`, `:72-74`). The JSON body is polymorphic, discriminated by a `type`
field (`AnswerChallengeRequest.java:11-15`):

**Captcha (`type = "captcha"`)** — `AnswerCaptchaChallengeRequest.java`:

```json
{
  "type": "captcha",
  "token": "<the token from the 428 response>",
  "captcha": "signal-hcaptcha.<uuid>.challenge.<solution>"
}
```

**Push challenge (`type = "rateLimitPushChallenge"`)** — `AnswerPushChallengeRequest.java`:

```json
{
  "type": "rateLimitPushChallenge",
  "challenge": "<token delivered via the push notification>"
}
```

Responses (`ChallengeController.java:85-90`, `:104-139`):

| Status | Meaning |
|---|---|
| 200 | challenge accepted — retry the original request |
| 400 | invalid request / invalid captcha argument |
| 428 | submitted captcha token not accepted (still challenged) |
| 429 | too many attempts (`Retry-After` header) |

### 6.2 Request a push challenge

```
POST /v1/challenge/push        (empty body)
Authorization: Basic ...
```

Endpoint: `ChallengeController.java:142-201`. Asks the server to send a push to the account's
**primary** device. The push payload carries `rateLimitChallenge: "<CHALLENGE_TOKEN>"`
(`ChallengeController.java:150-165`); the client then submits that token via §6.1 with
`type="rateLimitPushChallenge"`.

Responses (`ChallengeController.java:171-184`):

| Status | Meaning |
|---|---|
| 200 | push attempted |
| 404 | no push token on the primary device |
| 413 / 429 | too many attempts (`Retry-After`) |

```
            send → 428 {token, options:["recaptcha","pushChallenge"]}
                          │
        ┌─────────────────┴───────────────────┐
   captcha path                          push path
   (user solves captcha)        POST /v1/challenge/push  ──► push w/ rateLimitChallenge token
        │                                   │
   PUT /v1/challenge                  PUT /v1/challenge
   {type:"captcha",token,captcha}     {type:"rateLimitPushChallenge",challenge}
        │                                   │
        └────────────► 200 ◄───────────────┘
                          │
                  retry original send
```

> ⚠️ The `options` strings: the brief and Signal docs use `"recaptcha"` and `"pushChallenge"`.
> The submit-body discriminators are `"captcha"` and `"rateLimitPushChallenge"`
> (`AnswerChallengeRequest.java:12-15`). They are NOT the same strings — `options` advertises which
> challenge *families* are accepted; the submit `type` names the concrete answer shape. Map
> `recaptcha`/captcha → `type:"captcha"`, `pushChallenge` → `type:"rateLimitPushChallenge"`.

---

## Source files

All paths are from the `main` branch of each repo (clones dated 2026-06-16).

**Signal-Android** (`https://github.com/signalapp/Signal-Android`):

- WebSocket frame proto — https://github.com/signalapp/Signal-Android/blob/main/core/network/src/main/protowire/WebSocketResources.proto
- Envelope proto — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/protowire/SignalService.proto
- Legacy WebSocket impl (connect/auth/keepalive/ack) — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/websocket/OkHttpWebSocketConnection.java
- WebSocket facade (request tunneling, ack, sealed-sender headers) — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/websocket/SignalWebSocket.kt
- libsignal-net chat connection wrapper — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/websocket/LibSignalChatConnection.kt
- WebSocket health monitor (keepalive cadence) — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/websocket/SignalWebSocketHealthMonitor.kt
- Credentials/username format — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/util/CredentialsProvider.java
- Default device id — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/push/SignalServiceAddress.java
- Sealed-sender access headers — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/SealedSenderAccess.kt
- Send paths + client status-code mapping — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/PushServiceSocket.java
- Outbound JSON body — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/OutgoingPushMessageList.java , https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/OutgoingPushMessage.java
- 428 client entity — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/ProofRequiredResponse.java
- Network config / hosts / TLS pinning — https://github.com/signalapp/Signal-Android/blob/main/app/src/main/java/org/thoughtcrime/securesms/push/SignalServiceNetworkAccess.kt
- Production host constants (gradle) — https://github.com/signalapp/Signal-Android/blob/main/app/build.gradle.kts
- Receive loop / reconnect backoff — https://github.com/signalapp/Signal-Android/blob/main/app/src/main/java/org/thoughtcrime/securesms/messages/IncomingMessageObserver.kt

**libsignal** (`https://github.com/signalapp/libsignal`):

- chat_websocket proto — https://github.com/signalapp/libsignal/blob/main/rust/net/src/proto/chat_websocket.proto
- chat connection / auth headers / ws config — https://github.com/signalapp/libsignal/blob/main/rust/net/src/chat.rs
- Basic-auth + OTP — https://github.com/signalapp/libsignal/blob/main/rust/net/src/auth.rs
- Production hosts / TLS / close codes / paths — https://github.com/signalapp/libsignal/blob/main/rust/net/src/env.rs
- Recommended ws config — https://github.com/signalapp/libsignal/blob/main/rust/net/infra/src/lib.rs
- Keepalive / idle timeout constants — https://github.com/signalapp/libsignal/blob/main/rust/net/infra/src/timeouts.rs

**Signal-Server** (`https://github.com/signalapp/Signal-Server`):

- Message endpoints + error handling — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/controllers/MessageController.java
- Challenge endpoints — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/controllers/ChallengeController.java
- Server-side envelope proto (legacy enum names + binary fields) — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/proto/TextSecure.proto
- Request entities — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/IncomingMessageList.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/IncomingMessage.java
- Response entities — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/SendMessageResponse.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/MismatchedDevicesResponse.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/StaleDevicesResponse.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/AccountMismatchedDevices.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/AccountStaleDevices.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/SendMultiRecipientMessageResponse.java
- Challenge request entities — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/AnswerChallengeRequest.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/AnswerCaptchaChallengeRequest.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/AnswerPushChallengeRequest.java , https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/entities/RateLimitChallenge.java
- Header name constants — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/util/HeaderUtils.java
- Sealed-sender auth verify — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/auth/OptionalAccess.java
- Multi-recipient media type — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/providers/MultiRecipientMessageProvider.java
- 429 / Retry-After mapper — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/mappers/RateLimitExceededExceptionMapper.java
