# Signal Wire Protocol: Account Registration & Device Provisioning

Based on main-branch clones, 2026-06-16.

Pinned source commits (for the permalinks at the bottom):
- `Signal-Android` @ `d6871f8dc2d12a5b74ac0501bcf73ccec38064fd`
- `libsignal` @ `a85f3c0d892a14d32b76fd724d07fec4a23821f0`
- `Signal-Server` @ `adb5b6a4ea01bae52d0d6479541435697a1bcce7`

This document covers the *wire format* for:
- **A.** Registering a brand-new account as a **primary** device (the official phone-number flow).
- **B.** Linking as a **secondary / companion** device (the "Signal Desktop" flow).
- **C.** The shared **key-upload** endpoints (`PUT/GET /v2/keys`).

Out of scope (other agents): the authenticated/unauthenticated transport WebSocket framing, message content, groups, profiles, attachments, storage service, calling. The provisioning WebSocket *is* covered here because it is the linking transport.

The crypto *math* for identity keys, registration IDs, signed prekeys, one-time prekeys and Kyber prekeys already exists in `app/logic/Chat/Signal/Crypto/*`; this doc only describes how those keys are serialized onto the wire.

> Conventions in this doc:
> - "EC public key, libsignal-serialized" = 33 bytes = `0x05` type byte ‖ 32 bytes X25519. Identity keys use the same format.
> - "Kyber1024 public key, libsignal-serialized" = 1569 bytes = 1 version byte ‖ 1568 bytes (`KeysController.java:244`).
> - Unless a field says "base64 (padded)", base64 in registration/key JSON is **standard alphabet, NO padding** (client uses `Base64.encodeWithoutPadding`, e.g. `PreKeyEntity.java:53`, `SignedPreKeyEntity.java:46`). The server's Jackson decoders accept both. The two exceptions noted below (provisioning `pub_key`, provisioning message body) are explicitly different.

---

## 0. Key derivation primitives (needed by both flows)

These feed `recoveryPassword`, `registrationLock`, and the SVR2 PIN flow.

```
AccountEntropyPool (AEP)   64-char alphanumeric string (libsignal AccountEntropyPool.generate)
        │  libsignal AccountEntropyPool.deriveSvrKey(aep)   → 32 bytes
        ▼
MasterKey (32 bytes)
        ├─ deriveRegistrationLock()            = HEX( HMAC-SHA256(masterKey, "Registration Lock") )
        ├─ deriveRegistrationRecoveryPassword()= BASE64-padded( HMAC-SHA256(masterKey, "Registration Recovery") )
        └─ deriveStorageServiceKey()           = HMAC-SHA256(masterKey, "Storage Service Encryption")
```
Source: `core/models-jvm/.../MasterKey.kt:31-49`, `AccountEntropyPool.kt:98-100`.

- `recoveryPassword` (32 bytes, the HMAC output before base64) is what you send to skip SMS verification on re-registration. In the account-creation JSON it is `recoveryPassword` (base64). ⚠️ The byte length is exactly the HMAC-SHA256 output (32 bytes); the server validates `@ExactlySize({0,32})` on `AccountAttributes.recoveryPassword` (`AccountAttributes.java:45`).
- `registrationLock` (hex of HMAC) is sent as `registrationLock` only when re-registering an account that had a PIN/reglock enabled.
- **unidentifiedAccessKey** (16 bytes): derived from the profile key. It is `AES-256-GCM(profileKey, zero-nonce, zero-plaintext)` truncated — the existing codebase already computes the profile key & UAK; on the wire it is just a 16-byte value, validated `@ExactlySize({0,16})` and length-16 (`AccountAttributes.java:33,135`). `UNIDENTIFIED_ACCESS_KEY_LENGTH = 16` (`UnidentifiedAccessUtil.java:16`).

---

## A. NEW ACCOUNT REGISTRATION (primary device)

### A.1 High-level sequence

```
 Client (new primary)                                    Signal-Server
 ─────────────────────                                   ─────────────
  1. POST /v1/verification/session  {number, [pushToken]}
        ─────────────────────────────────────────────────►
        ◄───────────────────────────────────────────────── 200 VerificationSessionResponse
                                                            {id, allowedToRequestCode:false,
                                                             requestedInformation:[pushChallenge?,captcha], ...}
  2. (optional) receive FCM/APNs push challenge value
     PATCH /v1/verification/session/{id} {pushChallenge | captcha}
        ─────────────────────────────────────────────────►
        ◄───────────────────────────────────────────────── 200 (requestedInformation shrinks;
                                                                 allowedToRequestCode flips true)
  3. POST /v1/verification/session/{id}/code  {transport:"sms"|"voice", client:"android-2021-03"}
        ─────────────────────────────────────────────────►
        ◄───────────────────────────────────────────────── 200 (nextSms/nextCall/nextVerificationAttempt)
        … SMS / voice call delivers a numeric code …
  4. PUT /v1/verification/session/{id}/code   {code:"123456"}
        ─────────────────────────────────────────────────►
        ◄───────────────────────────────────────────────── 200 {verified:true}
  5. POST /v1/registration  (Basic auth = e164:password)
       {sessionId | recoveryPassword, accountAttributes{…}, aciIdentityKey, pniIdentityKey,
        aciSignedPreKey, pniSignedPreKey, aciPqLastResortPreKey, pniPqLastResortPreKey, [gcmToken|apnToken]}
        ─────────────────────────────────────────────────►
        ◄───────────────────────────────────────────────── 200 AccountCreationResponse
                                                            {uuid(ACI), pni, number, usernameHash,
                                                             storageCapable, reregistration, entitlements}
  6. PUT /v2/keys?identity=aci   (upload one-time EC + Kyber prekeys)   ── see Section C
  7. PUT /v2/keys?identity=pni   (same for PNI)
```

The signed prekeys + Kyber last-resort prekeys for **both** ACI and PNI are uploaded *atomically inside the `POST /v1/registration` body* (step 5). Only the *one-time* prekeys are uploaded separately afterward via `/v2/keys` (steps 6–7).

### A.2 Verification-session state machine

The session object the server returns is `VerificationSessionResponse` (`VerificationSessionResponse.java`). `requestedInformation` is a list of `Information` enum JSON values (`VerificationSession.java:57-62`):

| JSON value      | enum constant   |
|-----------------|-----------------|
| `pushChallenge` | PUSH_CHALLENGE  |
| `captcha`       | CAPTCHA         |

State transitions (`VerificationController.java`):

```
 createSession ──► requestedInformation always seeded with CAPTCHA (line 265),
                   plus PUSH_CHALLENGE *prepended* if a pushToken was supplied (handlePushToken, 351-381).
                   allowedToRequestCode starts false.

 PATCH submit captcha ─────────► if valid: CAPTCHA removed from requested, added to submitted;
                                 ALSO removes PUSH_CHALLENGE (a captcha satisfies push) (505-516).
 PATCH submit pushChallenge ───► if matches: PUSH_CHALLENGE removed & submitted;
                                 ALSO removes CAPTCHA (a push satisfies captcha) (424-435).

 allowedToRequestCode becomes true ⇔ requestedInformation is now empty (435, 514-516).

 If requestedInformation empty AND allowedToRequestCode false ⇒ session is dead; create a new one.
```

Two challenge types, either of which alone unblocks the session.

#### Endpoint 1 — create session
`POST /v1/verification/session`  ·  Content-Type `application/json`  ·  **no auth**
Request `CreateVerificationSessionRequest` (`CreateVerificationSessionRequest.java`) — note `UpdateVerificationSessionRequest` fields are `@JsonUnwrapped` (flattened into the same object):

| field          | type   | req | notes |
|----------------|--------|-----|-------|
| `number`       | string | yes | E164, validated `@E164` |
| `pushToken`    | string | no  | FCM/APNs token; if set, `pushTokenType` must also be set (and vice-versa) |
| `pushTokenType`| string | no  | `"apn"` or `"fcm"` (`UpdateVerificationSessionRequest.java:31-43`) |
| `pushChallenge`| string | no  | (not used on create) |
| `captcha`      | string | no  | (not used on create) |
| `mcc`,`mnc`    | string | no  | mobile country / network code |

Response 200 `VerificationSessionResponse`:

| field                    | type        | notes |
|--------------------------|-------------|-------|
| `id`                     | string      | URL-safe base64 session id; goes in `/{sessionId}` path and in registration `sessionId` |
| `nextSms`                | long\|null  | seconds until next SMS may be requested |
| `nextCall`               | long\|null  | seconds until next voice call |
| `nextVerificationAttempt`| long\|null  | seconds until next code submission |
| `allowedToRequestCode`   | bool        | |
| `requestedInformation`   | string[]    | subset of `["pushChallenge","captcha"]` |
| `verified`               | bool        | |

Errors: 422 validation, 429 rate-limit (with `Retry-After`).

#### Endpoint 2 — update session (submit captcha / push challenge)
`PATCH /v1/verification/session/{sessionId}`  ·  json  ·  **no auth**
Body = `UpdateVerificationSessionRequest` (same fields as the unwrapped block above): send `captcha`, or `pushChallenge`, (or update `pushToken`/`pushTokenType` to (re)trigger a push challenge). Response = `VerificationSessionResponse`.
Errors: **403** if the captcha/pushChallenge was rejected (body still includes the session); 409/422; 429 (body includes session).

#### Endpoint 3 — request the code
`POST /v1/verification/session/{sessionId}/code`  ·  json  ·  **no auth**
Body = `VerificationCodeRequest` (`VerificationCodeRequest.java`):

| field       | type   | values |
|-------------|--------|--------|
| `transport` | string | `"sms"` or `"voice"` |
| `client`    | string | platform hint. Server maps `"ios"`→iOS, `"android-2021-03"`→Android-with-FCM, anything starting `android`→Android-without-FCM (`VerificationController.java:634-643`) |

Requires `allowedToRequestCode == true`, else **409** (info still pending) or **429** (no attempts left). Other codes: 418 (try a different transport), 440 (sender refused), 422, 429. Response = `VerificationSessionResponse`.

#### Endpoint 4 — submit the code
`PUT /v1/verification/session/{sessionId}/code`  ·  json  ·  **no auth**
Body = `SubmitVerificationCodeRequest` (`SubmitVerificationCodeRequest.java`): `{ "code": "123456" }` (`@NotBlank`).
Response 200 `VerificationSessionResponse`; `verified` becomes `true` if the code matched. A *wrong* code still returns 200 with `verified:false`. 409 if already verified or no code requested; 429.

#### Endpoint 5 (GET) — fetch session
`GET /v1/verification/session/{sessionId}` returns the same `VerificationSessionResponse`. Useful for polling.

### A.3 Captcha & push-challenge mechanics (this layer)

- **Captcha**: the client opens a hCaptcha/reCAPTCHA web flow (URL from the client config), gets an opaque token, and submits it as `captcha` in the PATCH. Server hands it to `RegistrationCaptchaManager.assessCaptcha(...)`; if the score passes the threshold it's accepted (`VerificationController.java:463-533`). On failure → 403.
- **Push challenge**: only triggered when the client supplied `pushToken`+`pushTokenType` on create/update. Server generates a random 16-byte hex token (`generatePushChallenge`, `942-947`), stores it, and sends it to the device via FCM/APNs (`sendRegistrationChallengeNotification`, `376-377`). The device receives that push out-of-band and echoes the value back as `pushChallenge` in a PATCH. Server compares with constant-time `MessageDigest.isEqual` (`410-412`).

### A.4 Account creation — `POST /v1/registration`

`@Path("/v1/registration")` `RegistrationController.register` (`RegistrationController.java:93-213`).

- **Auth**: HTTP **Basic**, `Authorization: Basic base64(e164 + ":" + password)` where `password` is the freshly generated random **service password** (client: `PushServiceSocket.java:469`). The server takes `number` and `password` from this header (`RegistrationController.java:121-122`); they become the primary device's auth credentials.
- Headers: `X-Signal-Agent` (signalAgent) and `User-Agent` are recorded.
- Content-Type `application/json`.

Body = `RegistrationRequest` (`RegistrationRequest.java`). `DeviceActivationRequest` is `@JsonUnwrapped` so its fields sit at top level; `AccountAttributes` is nested under `accountAttributes`.

| field (top level)        | type            | req | notes |
|--------------------------|-----------------|-----|-------|
| `sessionId`              | string          | one-of | verification session id (base64url). Exactly one of `sessionId`/`recoveryPassword` (`PhoneVerificationRequest.java:30-33`) |
| `recoveryPassword`       | string(base64)  | one-of | the 32-byte recovery password (see §0) to skip SMS on re-registration |
| `accountAttributes`      | object          | yes | see table below |
| `skipDeviceTransfer`     | bool            | yes | must be `true` to force a fresh account when a device-transfer is possible, else server returns **409** |
| `aciIdentityKey`         | string(base64)  | yes | ACI identity public key, libsignal-serialized (33 B, `0x05`-prefixed) |
| `pniIdentityKey`         | string(base64)  | yes | PNI identity public key, same format |
| `aciSignedPreKey`        | ECSignedPreKey  | yes | unwrapped; ACI signed EC prekey (see §C.4) |
| `pniSignedPreKey`        | ECSignedPreKey  | yes | unwrapped; PNI signed EC prekey |
| `aciPqLastResortPreKey`  | KEMSignedPreKey | yes | unwrapped; ACI Kyber-1024 last-resort prekey |
| `pniPqLastResortPreKey`  | KEMSignedPreKey | yes | unwrapped; PNI Kyber-1024 last-resort prekey |
| `apnToken`               | object          | no  | APNs token set (mutually exclusive with `gcmToken`/`fetchesMessages`) |
| `gcmToken`               | object          | no  | `{ "gcmRegistrationId": "...", "webSocketChannel": true }` |

`accountAttributes` (`AccountAttributes.java` + `DeviceAttributes.java`, the latter `@JsonUnwrapped`):

| field                          | type           | notes |
|--------------------------------|----------------|-------|
| `fetchesMessages`              | bool           | true ⇒ device polls (no push token). Exactly one of {apnToken, gcmToken, fetchesMessages=true} (`RegistrationRequest.java:91-99`) |
| `registrationId`               | int            | ACI registration id, 14-bit (`validRegistrationId`) |
| `pniRegistrationId`            | int            | PNI registration id (JSON name `pniRegistrationId`, `DeviceAttributes.java:27`) |
| `name`                         | string(base64)\|null | **encrypted** device name bytes, base64; `@Size(max=225)` (`DeviceAttributes.java:32`). For a primary this is typically null. See §B.5 for the encryption. |
| `capabilities`                 | object         | map of capability→bool; see below |
| `registrationLock`             | string\|null   | hex reglock (see §0); `@ExactlySize({0,64})` |
| `unidentifiedAccessKey`        | string(base64) | 16 bytes; required unless `unrestrictedUnidentifiedAccess` |
| `unrestrictedUnidentifiedAccess`| bool          | |
| `discoverableByPhoneNumber`    | bool           | default true |
| `recoveryPassword`             | string(base64)\|null | 32-byte recovery password; lets the server store/refresh it. `@ExactlySize({0,32})` |

**Capabilities**: serialized as a JSON object `{ "<name>": true, ... }`. Names come from `DeviceCapability` (`DeviceCapability.java:14-20`): `storage`, `transfer`, `attachmentBackfill`, `spqr`, `profiles_v2`, `usernameChangeSyncMessage`. ⚠️ A new device **must** include all capabilities marked `requireForNewDevices=true`; currently that is **`spqr`** (SPARSE_POST_QUANTUM_RATCHET) only. Missing it ⇒ **HTTP 499 "Client must support post-quantum ratchet"** (`RegistrationController.java:128-133`, `499` documented at line 113).

Response 200 `AccountCreationResponse` (`AccountCreationResponse.java`, unwraps `AccountIdentityResponse`):

| field           | type        | notes |
|-----------------|-------------|-------|
| `uuid`          | UUID string | the **ACI** |
| `number`        | string      | E164 |
| `pni`           | UUID string | the PNI |
| `usernameHash`  | string(base64url)\|null | if a username is set |
| `usernameLinkHandle`| UUID\|null | |
| `storageCapable`| bool        | whether any device supports storage |
| `entitlements`  | object      | account entitlements/expirations |
| `reregistration`| bool        | true if an account already existed for this number (`AccountCreationResponse.java:16`) |

Error codes (`RegistrationController.java:104-113`): 401 session not verified; 403 bad recovery password; 409 device-transfer possible (need `skipDeviceTransfer:true`); 422 validation / **invalid prekey signature** (line 124-126); 423 registration-lock (body = `RegistrationLockFailure`, §A.5); 429 rate-limit; 499 missing required capability.

**Signature validation**: the server verifies *every* signed/last-resort prekey signature against the matching identity key before creating the account (`RegistrationRequest.isEverySignedKeyValid`, lines 76-86; `PreKeySignatureValidator`). The signature is over `serializedPublicKey()` (the libsignal-serialized public key) of each signed/Kyber prekey, made with the identity *private* key.

### A.5 Registration lock / PIN via SVR2 (high-level)

The PIN and registration-lock are layered on top of registration; full detail is the SVR2 enclave protocol which is **⚠️ heavy** and only summarized here.

- **PIN → MasterKey**: the user PIN never leaves the device directly. The device stores its `MasterKey` (derived from the AEP, §0) in **SVR2** (Secure Value Recovery v2), an SGX enclave, gated by a hash of the PIN. To recover after losing the device, the user re-enters the PIN, restores the MasterKey from SVR2, then derives the **recoveryPassword** to authenticate `POST /v1/registration` without SMS.
- **Server REST surface** (`SecureValueRecovery2Controller.java`, `@Path("/v2/{name: backup|svr}")`, use `/v2/svr`):
  - `GET /v2/svr/auth` (account-authenticated) → `ExternalServiceCredentials {username,password}`, 30-day TTL — credentials the client uses to talk to the SVR2 enclave.
  - `POST /v2/svr/auth/check` (rate-limited by IP) — body `AuthCheckRequest {number, tokens:[...]}`; picks which of several stored SVR2 credentials is current. Used during re-registration to find a still-valid credential.
- **Enclave protocol** (⚠️ heavy, separate connection, not plain REST): defined by `SVR2.proto`. The client sends a `Request{ oneof: backup|expose|restore|delete }`; server replies `Response{ oneof matching }`.
  - `BackupRequest { bytes data(16-48B); bytes pin(32B); uint32 maxTries(1-255) }` — stores the MasterKey share keyed by the PIN-derived value; `maxTries` is the guess budget.
  - `ExposeRequest { bytes data }` / `ExposeResponse{status: OK|ERROR}` — a second step that commits the backup; an unexpected `ERROR` after a successful Backup signals tampering/brute-force.
  - `RestoreRequest { bytes pin(32B) }` → `RestoreResponse { status: OK|MISSING|PIN_MISMATCH|REQUEST_INVALID; bytes data; uint32 tries }` — recover the share; `PIN_MISMATCH` decrements `tries`.
  - `DeleteRequest{}` / `DeleteResponse{}`.
- **Registration-lock interaction**: when an existing account had reglock enabled and a client tries to re-register against it, `POST /v1/registration` returns **423** with `RegistrationLockFailure { timeRemaining (ms), svr2Credentials {username,password} }` (`RegistrationLockFailure.java`). The client then uses those SVR2 creds + the user's PIN to restore the MasterKey, derives `registrationLock` (hex) and `recoveryPassword`, and retries registration including `accountAttributes.registrationLock`.

---

## B. LINKED / COMPANION DEVICE PROVISIONING (secondary device)

The secondary (e.g. a desktop client we are writing) generates an ephemeral identity keypair, opens a provisioning WebSocket, displays a QR code, and waits for the existing primary phone to push it an encrypted `ProvisionMessage` containing the account's identity keys. The secondary then finishes by calling `PUT /v1/devices/link`.

### B.1 Sequence

```
 Secondary (us)                  Server                         Primary (existing phone)
 ─────────────                   ──────                         ────────────────────────
  generate ephemeral
  X25519 IdentityKeyPair
  WS connect
  wss://…/v1/websocket/provisioning/
        ───────────────────────►
        ◄─────────────────────── PUT /v1/address  (ProvisioningAddress{address})
  build QR:
  sgnl://linkdevice?uuid=<address>
        &pub_key=<b64 ephemeral pub>
        &capabilities=backup5
  (display QR)
                                                  primary scans QR, reads uuid+pub_key
                                                  GET /v1/devices/provisioning/code
                                                  ◄──────────────► {verificationCode, tokenIdentifier}
                                                  PrimaryProvisioningCipher.encrypt(ProvisionMessage)
                                                  PUT /v1/provisioning/<uuid>
                                                     {body:<MIME-b64 ProvisionEnvelope>}
        ◄─────────────────────── PUT /v1/message  (raw ProvisionEnvelope bytes)
        (server closes WS)
  decrypt → ProvisionMessage{aci,pni,identity keys,number,provisioningCode,…}
  generate our own prekeys signed with the received identity keys
  PUT /v1/devices/link   (Basic auth = aci.deviceless:newPassword)
        {verificationCode: provisioningCode, accountAttributes{…},
         aciSignedPreKey,pniSignedPreKey,aciPqLastResortPreKey,pniPqLastResortPreKey,[gcm|apn]}
        ───────────────────────►
        ◄─────────────────────── 200 LinkDeviceResponse {uuid(ACI), pni, deviceId}
  PUT /v2/keys?identity=aci   (one-time prekeys)   ── Section C
  PUT /v2/keys?identity=pni
```

### B.2 Provisioning WebSocket

- **URL**: `wss://<service-host>/v1/websocket/provisioning/` (`ProvisioningSocket.kt:135`). No authentication — it's an anonymous socket.
- On connect the server immediately sends a WebSocket *request* `PUT /v1/address` whose body is a protobuf `ProvisioningAddress`. The client must reply 200 to every server request it receives (the socket is full-duplex request/response framed; the client ACKs with `WebSocketResponseMessage{id, status:200, message:"OK"}`, `ProvisioningSocket.kt:282-291`).
- `ProvisioningAddress` (`Provisioning.proto` / `chat_provisioning.proto`, proto2):
  | field     | # | type   | notes |
  |-----------|---|--------|-------|
  | `address` | 1 | string | opaque; do not interpret. Goes into the QR `uuid` param. |
- When the primary posts the encrypted message, the server delivers it as another WebSocket request `PUT /v1/message`, whose **body is the raw serialized `ProvisionEnvelope` bytes** (server: `ProvisioningConnectListener.java` sends `PUT /v1/message` with the content bytes; client decodes with `ProvisionEnvelope.ADAPTER.decode(body)`, `ProvisioningSocket.kt:216-220`). The server then closes the socket.
- Keep-alive: client sends `GET /v1/keepalive` every 30s (`ProvisioningSocket.kt:258-279`). Socket lifespan 90s; must receive the address within 10s.

> Note there are two modes (`ProvisioningSocket.kt:294-297`): `LINK` (new linked device — `ProvisionEnvelope`/`ProvisionMessage`) and `REREG` (quick re-registration — `RegistrationProvisionEnvelope`/`RegistrationProvisionMessage`). For implementing a companion device you want **LINK**.

### B.3 The QR / linking URI

Built by `generateProvisioningUrl` (`ProvisioningSocket.kt:252-256`):

```
sgnl://<host>?uuid=<URL-encoded address>&pub_key=<URL-encoded base64-no-padding pubkey><params>
```

For the LINK mode (`Mode.LINK`, `ProvisioningSocket.kt:296`):
- `host` = `linkdevice`
- `params` = `&capabilities=backup5`

So the exact string a companion device displays is:

```
sgnl://linkdevice?uuid=<address>&pub_key=<b64nopad>&capabilities=backup5
```

- `uuid` = the opaque `address` from `ProvisioningAddress`, URL-encoded (`URLEncoder.encode(..., "UTF-8")`).
- `pub_key` = `Base64.encodeWithoutPadding( secondaryDevicePublicKey.serialize() )` then URL-encoded. `secondaryDevicePublicKey.serialize()` is the **33-byte** libsignal-serialized identity public key (`0x05`-prefixed). ⚠️ This is base64 **without padding**, then URL-encoded — different from the `+`/`/`-padded MIME base64 used for the message body.
- `capabilities=backup5` advertises that the new device understands backup v5. (For REREG mode `host="rereg"` and there are no extra params.)

The primary parses `uuid` and `pub_key`, decodes the public key, and encrypts a `ProvisionMessage` to it.

### B.4 ProvisioningCipher (encrypt by primary / decrypt by secondary)

The exact scheme — confirmed from both `PrimaryProvisioningCipher.java:41-97` (encrypt) and `SecondaryProvisioningCipher.kt:81-137` (decrypt):

```
ourKey      = ephemeral X25519 keypair (the *primary* generates this per message)
sharedSecret= ECDH(ourKey.priv, theirPublicKey)            // theirPublicKey = secondary's pub_key from QR
derivedSecret = HKDF-SHA256(IKM=sharedSecret, salt=null, info="TextSecure Provisioning Message", L=64)
                // 3-arg HKDF.deriveSecrets(ikm, info, len) passes salt=null → RFC-5869 treats it as 32 zero bytes
cipherKey   = derivedSecret[0:32]        // AES-256 key
macKey      = derivedSecret[32:64]       // HMAC-SHA256 key

iv          = random 16 bytes (AES/CBC/PKCS5Padding IV)
ciphertext  = iv ‖ AES-256-CBC-PKCS5(cipherKey, iv, ProvisionMessage.encode())
version     = 0x01
mac         = HMAC-SHA256(macKey, version ‖ ciphertext)    // FULL 32 bytes, NOT truncated
body        = version ‖ ciphertext ‖ mac
            = 0x01 ‖ iv(16) ‖ aes_cbc(...) ‖ hmac(32)
```

- **Info string is exactly** `"TextSecure Provisioning Message"` (UTF-8) (`PrimaryProvisioningCipher.java:33`).
- HKDF output length = 64 bytes, split 32/32.
- The MAC is computed over `version ‖ ciphertext` (note: `ciphertext` already includes the IV) and is the **full** HMAC-SHA256 (32 bytes); the secondary verifies it constant-time over `body[0 .. len-32]` (`SecondaryProvisioningCipher.kt:96-111`). Layout lengths confirmed: VERSION_LENGTH=1, IV_LENGTH=16, MAC_LENGTH=32 (`SecondaryProvisioningCipher.kt:34-36`).
- The whole `body` becomes `ProvisionEnvelope.body`, and `ourKey.publicKey` (33-byte serialized) becomes `ProvisionEnvelope.publicKey`.

```
message ProvisionEnvelope {       // Provisioning.proto, proto2
  optional bytes publicKey = 1;   // primary's per-message EPHEMERAL X25519 pub (33 B, 0x05-prefixed)
  optional bytes body      = 2;   // = version‖iv‖ciphertext‖mac as above (encrypted ProvisionMessage)
}
```

The secondary decrypts: `ECDH(secondaryIdentity.priv, envelope.publicKey)` → same HKDF → verify MAC → AES-CBC decrypt → `ProvisionMessage.decode(plaintext)`.

#### Wrapping for transport
When the **primary** posts to the server it base64s the whole serialized `ProvisionEnvelope`:
`PUT /v1/provisioning/{uuid}` body `ProvisioningMessage { "body": <base64-with-padding(ProvisionEnvelope.encode())> }` (`LinkDeviceApi.kt:137-140`, `ProvisioningApi.kt:45`; server decodes with `Base64.getMimeDecoder()`, `ProvisioningController.java:98`). ⚠️ This body uses **MIME/standard base64 *with* padding** (`Base64.encodeWithPadding`), unlike the `pub_key` URI param. Server entity: `ProvisioningMessage{ String body }` (`ProvisioningMessage.java`), `@NotEmpty`, max 256 KiB (`ProvisioningController.java:56`).

### B.4.1 ProvisionMessage (the decrypted payload)

`ProvisionMessage` (`Provisioning.proto`, proto2). Every field, number, type:

| field                  | #  | type   | notes |
|------------------------|----|--------|-------|
| `aciIdentityKeyPublic` | 1  | bytes  | ACI identity public key (33 B serialized) |
| `aciIdentityKeyPrivate`| 2  | bytes  | ACI identity **private** key (32 B) — the account's real identity key, shared with the new device |
| `number`               | 3  | string | E164 |
| `provisioningCode`     | 4  | string | the `verificationCode` from `GET /v1/devices/provisioning/code`; used as `verificationCode` in `PUT /v1/devices/link` |
| `userAgent`            | 5  | string | usually null (`LinkDeviceApi.kt:127`) |
| `profileKey`           | 6  | bytes  | 32-byte profile key |
| `readReceipts`         | 7  | bool   | the account's read-receipt setting |
| `aci`                  | 8  | string | ACI UUID as string |
| `provisioningVersion`  | 9  | uint32 | `ProvisioningVersion.CURRENT = 1` (see enum below) |
| `pni`                  | 10 | string | PNI UUID string, **without** the `PNI:` prefix (`LinkDeviceApi.kt:124`) |
| `pniIdentityKeyPublic` | 11 | bytes  | PNI identity public key (33 B) |
| `pniIdentityKeyPrivate`| 12 | bytes  | PNI identity private key (32 B) |
| *(13 reserved)*        | 13 | —      | was `masterKey`; **deprecated** in favor of `accountEntropyPool` |
| `ephemeralBackupKey`   | 14 | bytes  | 32 bytes; optional ephemeral message-backup key |
| `accountEntropyPool`   | 15 | string | the AEP (see §0) — lets the new device derive the master/backup keys |
| `mediaRootBackupKey`   | 16 | bytes  | 32 bytes |
| `aciBinary`            | 17 | bytes  | ACI as 16-byte UUID |
| `pniBinary`            | 18 | bytes  | PNI as 16-byte UUID |

```
enum ProvisioningVersion {        // Provisioning.proto
  option allow_alias = true;
  INITIAL        = 0;
  TABLET_SUPPORT = 1;
  CURRENT        = 1;   // current devices send 1
}
```

⚠️ The companion device does **not** generate its own ACI/PNI identity keys — it receives them from the primary inside `ProvisionMessage`. It *does* generate its own registration IDs, signed prekeys, one-time prekeys, and Kyber prekeys, signing them with the *received* identity keys.

> Re-registration variant (REREG mode) uses `RegistrationProvisionMessage` (`RegistrationProvisioning.proto`, proto3) with a different but related field set: `e164(1)`, `aci(2,bytes)`, `accountEntropyPool(3)`, `pin(4,opt)`, `platform(5: ANDROID=0/IOS=1)`, `backupTimestampMs(6,opt)`, `tier(7: FREE=0/PAID=1)`, `backupSizeBytes(8,opt)`, `restoreMethodToken(9)`, `aciIdentityKeyPublic(10)`, `aciIdentityKeyPrivate(11)`, `pniIdentityKeyPublic(12)`, `pniIdentityKeyPrivate(13)`, `backupVersion(14)`. Same `RegistrationProvisionEnvelope{publicKey=1,body=2}` and same cipher. Not needed for plain linking.

### B.5 Finishing the link — `PUT /v1/devices/link`

`DeviceController.linkDevice` (`DeviceController.java:214-305`).

- **Auth**: HTTP **Basic** `Authorization: Basic base64(<username> + ":" + <newPassword>)`. The new device generates a fresh random password (this becomes its device password). The username is the account identifier the device is linking to (ACI-based) — the server pulls the password out of the header (`authorizationHeader.getPassword()`, line 284) and assigns it to the new device. The account itself is located via the `verificationCode` (the `provisioningCode`), not the username: `accounts.checkDeviceLinkingToken(linkDeviceRequest.verificationCode())` (line 236). ⚠️ The exact username string the official client puts in the header for `/link` is constructed from the ACI; the *password* is what matters server-side. Treat username as `<aci>` (matching how authenticated requests later use `<aci>.<deviceId>:<password>`).
- Content-Type `application/json`.

Body = `LinkDeviceRequest` (`LinkDeviceRequest.java`). Note: `accountAttributes` maps to a `DeviceAttributes` (NOT the full `AccountAttributes` used in primary registration), and the `DeviceActivationRequest` fields are **flattened at top level** via the `@JsonCreator` constructor:

| field                   | type            | notes |
|-------------------------|-----------------|-------|
| `verificationCode`      | string          | = `provisioningCode` from the `ProvisionMessage` |
| `accountAttributes`     | DeviceAttributes| `{fetchesMessages, registrationId, pniRegistrationId, name, capabilities}` — the new device's own reg ids + **encrypted device name** |
| `aciSignedPreKey`       | ECSignedPreKey  | signed with the *received* ACI identity key |
| `pniSignedPreKey`       | ECSignedPreKey  | signed with the *received* PNI identity key |
| `aciPqLastResortPreKey` | KEMSignedPreKey | Kyber-1024 last-resort, ACI |
| `pniPqLastResortPreKey` | KEMSignedPreKey | Kyber-1024 last-resort, PNI |
| `apnToken`              | object\|absent  | exactly one of {apnToken, gcmToken, fetchesMessages=true} |
| `gcmToken`              | object\|absent  | |

`DeviceAttributes` JSON (`DeviceAttributes.java`): `fetchesMessages` (bool), `registrationId` (int), `pniRegistrationId` (int), `name` (base64 of encrypted device name, ≤225 B, nullable), `capabilities` (object map). The new device must include the required capabilities (`spqr`) or it risks 409 (capability downgrade) / general rejection; also must not *downgrade* below capabilities all existing devices have (`isCapabilityDowngrade`, line 267 → **409**).

**Encrypted device name** (`name`): `DeviceNameCipher.encryptDeviceName(plaintext, identityKeyPair)` (`DeviceNameCipher.kt:30-46`) producing a serialized `DeviceName` proto, then base64. Scheme:
- `ephemeralKeyPair` = fresh X25519; `masterSecret = ECDH(ephemeral.priv, identityKey.pub)` (the account ACI identity key).
- `syntheticIv = HMAC-SHA256( HMAC-SHA256(masterSecret,"auth"), plaintext )[0:16]`.
- `cipherKey   = HMAC-SHA256( HMAC-SHA256(masterSecret,"cipher"), syntheticIv )`.
- `ciphertext  = AES-256-CTR(cipherKey, IV=0^16, plaintext)`.
- `DeviceName { ephemeralPublic=1 (33 B), syntheticIv=2 (16 B), ciphertext=3 }` (`DeviceName.proto`).

Response 200 `LinkDeviceResponse` (`LinkDeviceResponse.java`):

| field      | type | notes |
|------------|------|-------|
| `uuid`     | UUID | the account ACI |
| `pni`      | UUID | the account PNI |
| `deviceId` | byte | the **assigned** device id for this new linked device |

Errors (`DeviceController.java:223-230`): 403 account not found / wrong code; 409 missing/downgraded capability; 411 device limit; 422 validation (incl. invalid prekey signatures, lines 245-257); 429.

> The primary obtains `provisioningCode` from `GET /v1/devices/provisioning/code` → `LinkedDeviceVerificationCodeResponse {verificationCode, tokenIdentifier}` (`LinkDeviceApi.kt:84-88`, server `DeviceController.createDeviceToken` line 193, returns `LinkDeviceToken{verificationCode, tokenIdentifier}`). The primary puts `verificationCode` into the `ProvisionMessage.provisioningCode`; the new device echoes it back in `PUT /v1/devices/link`. The primary may poll `GET /v1/devices/wait_for_linked_device/{tokenIdentifier}?timeout=…` to learn when linking completed.

### B.6 Link-and-sync — message-history transfer (`ephemeralBackupKey` + `transfer_archive`)

Signal's "[A Synchronized Start for Linked Devices](https://signal.org/blog/a-synchronized-start-for-linked-devices/)" lets a newly linked device receive recent message history **automatically over the server relay — no manual file copy.** It rides on the link ceremony plus a one-time **"Transfer Message History"** confirmation the user taps on the *primary*; it is not re-requestable on demand afterward.

Flow (companion = us):

1. We advertise support in the QR: `...&capabilities=backup5` (§B.4). The primary only offers the transfer when it sees this.
2. The user taps **Transfer Message History** on the primary. The primary then includes `ephemeralBackupKey` (field 14, a random 32-byte one-time backup key) in the `ProvisionMessage` it sends us. **Its presence ⇒ a transfer is coming**; if absent, the user declined and we skip.
3. We finish `PUT /v1/devices/link` as usual (the primary learns our `deviceId`/`registrationId` via `wait_for_linked_device`).
4. The primary exports an encrypted **message backup** of recent history, uploads it as a plain v4 attachment (`AttachmentUploadUtil`, see Docs/05), then `PUT /v1/devices/transfer_archive` announcing the location to our device.
5. We long-poll `GET /v1/devices/transfer_archive` for that location, download the blob from the CDN, decrypt it with `ephemeralBackupKey`, and import. **Media > 45 days old is not synced** (CDN retention); the archive carries attachment *pointers*, not bytes.

**Endpoints** (`DeviceController.java`, both `@Auth <aci>.<deviceId>:<password>`):

| method | path | who | body |
|--------|------|-----|------|
| `PUT` | `/v1/devices/transfer_archive` | primary announces upload | `TransferArchiveUploadedRequest` → 204 |
| `GET` | `/v1/devices/transfer_archive?timeout=<1–3600>` | **our device** long-polls (default 30s) | → `RemoteAttachment` \| `RemoteAttachmentError`; **204 on timeout** (loop) |

- `RemoteAttachment` = `{ cdn: int, key: base64url(≤64) }` — download is the normal unauthenticated v4 attachment fetch: `GET {cdnHost(cdn)}/attachments/{urlEncode(key)}`. The blob is the self-encrypting backup file (no separate attachment key/digest, hence `RemoteAttachment` carries none).
- `RemoteAttachmentError` = `{ error: <CONTINUE_WITHOUT_UPLOAD | RELINK_REQUESTED | ...> }` — the primary couldn't produce it; give up and continue without history.
- `TransferArchiveUploadedRequest` = `{ destinationDeviceId, destinationDeviceRegistrationId, transferArchive: RemoteAttachment|RemoteAttachmentError }`.

The backup file format + key derivation are in **Docs/10-link-sync-message-backup**. Our implementation: `Connection/MessageBackupImport.ts` (request/poll/download/import), `Encryption/MessageBackupCipher.ts` (keys + decrypt), `Proto/backup.ts` (frame subset).

---

## C. KEY UPLOAD (shared by both flows)

After account creation/linking, the device uploads its **one-time** EC prekeys and **one-time** Kyber prekeys (and may refresh its signed/last-resort prekeys) per identity.

### C.1 Upload — `PUT /v2/keys?identity=aci|pni`

`KeysController.setKeys` (`KeysController.java:129-201`). Account-authenticated (`@Auth AuthenticatedDevice` — Basic auth `<aci>.<deviceId>:<password>`). Query param `identity` defaults to `aci`; pass `pni` to upload PNI keys. Call it twice (once per identity).

Body = `SetKeysRequest` (`SetKeysRequest.java`):

| field              | type               | notes |
|--------------------|--------------------|-------|
| `preKeys`          | ECPreKey[]         | one-time EC prekeys; ≤100. If present & non-empty, **replaces** all stored one-time EC prekeys; if absent/empty, existing ones are untouched. |
| `signedPreKey`     | ECSignedPreKey\|absent | optional; replaces the device's signed EC prekey if present. Must be validly signed. |
| `pqPreKeys`        | KEMSignedPreKey[]  | one-time **signed** Kyber-1024 prekeys; ≤100. Replaces all stored one-time PQ prekeys if non-empty. Each must be validly signed. |
| `pqLastResortPreKey`| KEMSignedPreKey\|absent | optional; replaces the last-resort Kyber prekey if present. |

The server validates signatures of `signedPreKey`, all `pqPreKeys`, and `pqLastResortPreKey` against the identity key for the chosen identity (`checkSignedPreKeySignatures`, lines 203-223) → **422** on mismatch. **403** if a non-primary device tries to change the identity key. Response 200 (empty).

### C.2 Element JSON shapes

`ECPreKey` (`ECPreKey.java`) — unsigned one-time EC prekey:
```json
{ "keyId": 12345, "publicKey": "<base64 33-byte EC pub>" }
```

`ECSignedPreKey` (`ECSignedPreKey.java`):
```json
{ "keyId": 1, "publicKey": "<base64 33-byte EC pub>", "signature": "<base64 64-byte sig>" }
```

`KEMSignedPreKey` (`KEMSignedPreKey.java`) — Kyber-1024, one-time *and* last-resort use the same shape:
```json
{ "keyId": 7, "publicKey": "<base64 1569-byte Kyber pub>", "signature": "<base64 64-byte sig>" }
```

Field rules (all three): `keyId` is `1 ≤ id < 2^24` (`@Min(MIN_KEY_ID) @Max(MAX_KEY_ID)`, must be non-zero); `publicKey` is the libsignal-serialized public key, base64 (client emits no padding, `PreKeyEntity.java:53`, `SignedPreKeyEntity.java:46`); `signature` is the identity key's signature over `serializedPublicKey()`, base64. The signed-prekey / last-resort signatures are verified the same way the registration body's are (`SignedPreKey.signatureValid`, `SignedPreKey.java:14-19`).

⚠️ The owner must be able to tell from a Kyber `keyId` whether it is a one-time vs last-resort key, but a third party must **not** (`KEMSignedPreKey.java:22-25`); this is purely a client-side keyId-allocation concern, no separate wire field.

### C.3 Fetch a peer's bundle — `GET /v2/keys/{identifier}/{deviceId}`

`KeysController.getDeviceKeys` (`KeysController.java:320-398`). `{identifier}` is a `ServiceIdentifier` (ACI uuid, or `PNI:<uuid>`); `{deviceId}` is a specific id or `*` for all enabled devices. Auth is one of: account auth, an unidentified-access key header, or a group-send token (`347-369`).

Response 200 `PreKeyResponse` (`PreKeyResponse.java` / client `KeysApiV2.kt:91-130`):

```json
{
  "identityKey": "<base64 33-byte identity pub for the requested identity>",
  "devices": [
    {
      "deviceId": 1,
      "registrationId": 12345,
      "signedPreKey": { "keyId": 1,  "publicKey": "...", "signature": "..." },
      "preKey":       { "keyId": 99, "publicKey": "..." },          // may be absent if exhausted
      "pqPreKey":     { "keyId": 7,  "publicKey": "...", "signature": "..." }
    }
  ]
}
```

- `signedPreKey` — the device's signed EC prekey (`ECSignedPreKey`).
- `preKey` — *one* unsigned one-time EC prekey, **consumed** by this request; absent if none remain (`PreKeyResponseItem.java:26-27`).
- `pqPreKey` — *one* signed Kyber prekey: a one-time PQ prekey if any remain, otherwise the **last-resort** Kyber prekey (`PreKeyResponseItem.java:30-31`). Always a `KEMSignedPreKey` shape.

404 if the identity/device has no available prekeys; 401/400 on auth problems; 429 rate-limit.

### C.4 Post-quantum (Kyber-1024) status

⚠️ **PQ is mandatory for new accounts and new linked devices.** Evidence:
- `RegistrationRequest`, `DeviceActivationRequest`, and `LinkDeviceRequest` all mark `aciPqLastResortPreKey`/`pniPqLastResortPreKey` `@NotNull` (`DeviceActivationRequest.java:25-37`), and `RegistrationRequest.isEverySignedKeyValid` returns false (→ 422) if any is missing (`RegistrationRequest.java:77-86`).
- The `spqr` (sparse post-quantum ratchet) capability is `requireForNewDevices=true`; omitting it yields **HTTP 499** (`RegistrationController.java:128-133`, `DeviceCapability.java:18`).
- Kyber keys are signed by the identity key (the `signature` field), verified server-side alongside EC signed prekeys.

Kyber public key serialized size: 1569 bytes (1 version + 1568) per the server's own description (`KeysController.java:244`).

### C.5 Auxiliary key endpoints (for completeness)
- `GET /v2/keys?identity=aci|pni` → `PreKeyCount { count (EC one-time), pqCount (Kyber one-time) }` (`KeysController.java:106-127`). Used to decide when to top up.
- `POST /v2/keys/check` — submit a SHA-256 digest of repeated-use key material so client & server can detect drift; digest = `SHA256( identityKey(33) ‖ ecSignedPreKeyId(8, big-endian) ‖ ecSignedPreKeyPub(33) ‖ lastResortKyberId(8) ‖ lastResortKyberPub(1569) )` (`KeysController.java:225-318`). 200 if consistent, 409 if not.

---

## ⚠️ Open / unverified items
- **`/v1/devices/link` Basic-auth username**: confirmed the *password* in the header becomes the device password and the account is found via `verificationCode`; the exact username string the official client sends was not located in the cloned source. Assume `<aci>` (subsequent authenticated calls use `<aci>.<deviceId>:<password>`).
- **unidentifiedAccessKey derivation** (profileKey → AES-GCM → 16 B): the math lives in the existing `Crypto/*` code; only the 16-byte wire length + validation were verified here.
- **Whether a primary ever sends a non-null `name`** in `POST /v1/registration`: the encrypted-device-name path (§B.5) is the linked-device case; primary registration usually sends `name:null`.
- **REGISTRATION_RPC** specifics (carrier data, fraud scoring) are server-internal and not part of the client wire contract.

---

## Source files
Permalinks at the pinned commits above.

Signal-Server @ `adb5b6a`:
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/controllers/VerificationController.java
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/controllers/RegistrationController.java
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/controllers/DeviceController.java
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/controllers/KeysController.java
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/controllers/ProvisioningController.java
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/controllers/SecureValueRecovery2Controller.java
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/websocket/ProvisioningConnectListener.java
- entities/: CreateVerificationSessionRequest, UpdateVerificationSessionRequest, VerificationCodeRequest, SubmitVerificationCodeRequest, VerificationSessionResponse, RegistrationServiceSession, RegistrationRequest, AccountAttributes, DeviceAttributes, AccountIdentityResponse, AccountCreationResponse, PhoneVerificationRequest, RegistrationLockFailure, DeviceActivationRequest, ECPreKey, ECSignedPreKey, KEMSignedPreKey, SignedPreKey, PreKey, SetKeysRequest, PreKeyResponse, PreKeyResponseItem, PreKeyCount, ProvisioningMessage, LinkDeviceRequest, LinkDeviceResponse — all under `.../textsecuregcm/entities/` at the same commit.
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/storage/DeviceCapability.java
- https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/util/LinkDeviceToken.java

Signal-Android @ `d6871f8`:
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/protowire/Provisioning.proto
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/protowire/RegistrationProvisioning.proto
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/protowire/SVR2.proto
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/feature/registration/src/main/protowire/Registration.proto
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/crypto/PrimaryProvisioningCipher.java
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/crypto/SecondaryProvisioningCipher.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/provisioning/ProvisioningSocket.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/network/src/main/java/org/signal/network/api/ProvisioningApi.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/network/src/main/java/org/signal/network/api/LinkDeviceApi.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/network/src/main/java/org/signal/network/api/KeysApiV2.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/PushServiceSocket.java
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/push/SignedPreKeyEntity.java
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/PreKeyEntity.java
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/core/models-jvm/src/main/java/org/signal/core/models/MasterKey.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/core/models-jvm/src/main/java/org/signal/core/models/AccountEntropyPool.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/app/src/main/java/org/thoughtcrime/securesms/registration/secondary/DeviceNameCipher.kt
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/app/src/main/protowire/DeviceName.proto
- https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/app/src/main/java/org/thoughtcrime/securesms/registration/v2/AppRegistrationNetworkController.kt

libsignal @ `a85f3c0`:
- https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/net/src/proto/chat_provisioning.proto
