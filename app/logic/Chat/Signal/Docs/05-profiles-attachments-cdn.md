# Signal (Android) Wire Protocol — Profiles, Attachments & CDN

> Based on main-branch clones, 2026-06-16.
> Clones read: `/tmp/Signal-Android`, `/tmp/libsignal`, `/tmp/Signal-Server`.
> Scope: profile key system, profile field encryption, profile endpoints, avatar up/download,
> capabilities; attachment proto + encryption, upload (CDN2/CDN3), download (CDN0/2/3),
> stickers, long-text attachments.
> Out of scope (other agents): transport / websocket (agent 1), message-content semantics
> (agent 3), group avatars beyond "reuse CDN" (agent 4), storage-service avatars (agent 6).

All citations are `file:line` into the three clones. Anything not directly in the source is
flagged with ⚠️ UNKNOWN/TODO. **Do not guess these in the implementation.**

---

## Part A — PROFILES

### A.1 ProfileKey (32 bytes) — what it is and what it protects

The **profile key** is a random 32-byte secret per Signal account. It is the AES key that
encrypts that account's profile fields (name, about, aboutEmoji, paymentAddress,
phoneNumberSharing) and its avatar, and it is the input to the zkgroup *versioned profile*
system. You learn another user's profile key out of band (it is sent inside `DataMessage` /
group state — agent 3/4).

Constants (`/tmp/libsignal/rust/zkgroup/src/common/constants.rs`):

| Constant | Value | Line |
|---|---|---|
| `PROFILE_KEY_LEN` | 32 | 27 |
| `PROFILE_KEY_COMMITMENT_LEN` | 97 | 29 |
| `PROFILE_KEY_VERSION_LEN` | 32 | 36 |
| `PROFILE_KEY_VERSION_ENCODED_LEN` | 64 | 37 |
| `UUID_LEN` (ACI) | 16 | 50 |
| `ACCESS_KEY_LEN` | 16 | 51 |
| `RANDOMNESS_LEN` | 32 | 48 |

#### Unidentified-access key (derived from profile key)

`derive_access_key()` (`profile_key.rs:67-82`): raw AES-256 (ECB, single block) of the
plaintext block `[0,0,…,0,2]` (16 bytes, last byte = `2`) under the profile key. Result is
16 bytes. This is the "unidentified access key" used for sealed-sender delivery (agent 1) and
its checksum is exposed via the unversioned profile `unidentifiedAccess` field (below).
Java mirror: `ProfileCipher.verifyUnidentifiedAccess` → `UnidentifiedAccess.deriveAccessKeyFrom`
(`ProfileCipher.java:186-201`).

### A.2 Versioned profile system (zkgroup)

#### ProfileKeyVersion — `GET /v1/profile/{aci}/{version}` path segment

`ProfileKey::get_profile_key_version(aci)`
(`/tmp/libsignal/rust/zkgroup/src/api/profiles/profile_key_version.rs:51-74`):

```
combined  = profileKey(32) || aci_uuid_bytes(16)          // 48 bytes
sho       = SHO("Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_GetProfileKeyVersion",
                combined)
raw32     = sho.squeeze(32)                                // PROFILE_KEY_VERSION_LEN
version   = lowercase_hex(raw32)                           // 64 ASCII chars (hex)
```

The KDF label is the **exact byte string**
`Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_GetProfileKeyVersion`.
SHO = the zkgroup "stateful hash object" (HKDF/HMAC-SHA256 based). The version is **stable**
for a (profileKey, ACI) pair — it does *not* change when the user edits their profile, only
when the profile key rotates (doc comment lines 18-22). The version string is what the client
puts in the URL: `/tmp/.../profiles/ProfileApi.kt:120,147-148`.

⚠️ The SHO/`squeeze_as_array` internals (exact HKDF expansion) are not transcribed here; for a
clean-room reimplementation you must port `/tmp/libsignal/rust/zkgroup/src/common/sho.rs`
(label-seeded HMAC-SHA256 stream). Cross-check against the libsignal test KATs.

#### ProfileKeyCommitment — sent on PUT (write)

`ProfileKey::get_commitment(aci)` (`profile_key.rs:53-65`): builds a `ProfileKeyStruct` from
`(profileKey, aci_uuid_bytes)`, then a Pedersen-style commitment. Serialized length 97 bytes
(`PROFILE_KEY_COMMITMENT_LEN`). Sent in the PUT body `commitment` field; the server stores it
and uses it to verify later credential requests. ⚠️ Commitment math itself
(`crypto/profile_key_commitment.rs`) is not transcribed — port the Rust.

#### ProfileKeyCredentialRequest — `GET .../{version}/{credentialRequest}`

Client side (`ProfileApi.kt:121-124`):

```
requestContext = clientZkProfileOps.createProfileKeyCredentialRequestContext(
                   SecureRandom, aci, profileKey)
serializedRequest = hexLower(requestContext.request.serialize())
GET /v1/profile/{aci}/{version}/{serializedRequest}?credentialType=expiringProfileKey
```

The request is a zk proof (`ProfileKeyCredentialRequestContext.get_request` →
`ProfileKeyCredentialRequest{ reserved, public_key, ciphertext, proof }`,
`/tmp/libsignal/rust/zkgroup/src/api/profiles/profile_key_credential_request_context.rs:24-35`).
The query param **must** be `credentialType=expiringProfileKey`; the server rejects any other
value with 400 (`ProfileController.java:284-286`,
`EXPIRING_PROFILE_KEY_CREDENTIAL_TYPE`). The response carries an
`ExpiringProfileKeyCredentialResponse` in the `credential` JSON field; the client verifies and
turns it into an `ExpiringProfileKeyCredential` via `receiveExpiringProfileKeyCredential`
(`ProfileApi.kt:200-207`). This credential is what lets you join the user to a group without
revealing the profile key to the server (group membership zk — agent 4).

⚠️ The full zkcredential issuance/verification is not transcribed; port libsignal
`rust/zkgroup/src/api/profiles/*`. For chat (1:1) you frequently only need the **plain**
versioned profile (`GET .../{version}`, no credential) — credentials are a groups concern.

### A.3 ProfileCipher — field encryption

Source: `/tmp/Signal-Android/.../api/crypto/ProfileCipher.java`.

**Scheme:** AES-256-GCM with the 32-byte profile key as key.
- 12-byte random nonce (`Util.getSecretBytes(12)`, line 66).
- `GCMParameterSpec(128, nonce)` → 16-byte (128-bit) GCM tag (line 69).
- Output layout: **`nonce(12) || ciphertext || tag(16)`** (`ByteUtil.combine(nonce, doFinal)`,
  line 71). GCM appends the tag to the ciphertext, so total overhead = **28 bytes**
  (`ENCRYPTION_OVERHEAD = 28`, line 40 = 12 nonce + 16 tag).
- Plaintext is **zero-padded to a fixed bucket length** *before* encryption; padded length is
  what `ENCRYPTION_OVERHEAD` is added to (lines 56-77).
- Decrypt strips trailing `0x00` bytes for strings (`decryptString`, lines 116-131).

```
encrypt(input, paddedLen):
  buf = zeros(paddedLen); buf[0..input.len] = input        # right-zero-padded
  nonce = random(12)
  ct = AES-256-GCM(key=profileKey, iv=nonce, tag=128b).encrypt(buf)   # ct includes 16B tag
  return nonce(12) || ct                                    # length == paddedLen + 28
```

#### Padding constants — VERBATIM (`ProfileCipher.java:31-43`)

```java
private static final int NAME_PADDED_LENGTH_1  = 53;
private static final int NAME_PADDED_LENGTH_2  = 257;
private static final int ABOUT_PADDED_LENGTH_1 = 128;
private static final int ABOUT_PADDED_LENGTH_2 = 254;
private static final int ABOUT_PADDED_LENGTH_3 = 512;

public static final int  MAX_POSSIBLE_NAME_LENGTH  = NAME_PADDED_LENGTH_2;   // 257
public static final int  MAX_POSSIBLE_ABOUT_LENGTH = ABOUT_PADDED_LENGTH_3;  // 512
public static final int  EMOJI_PADDED_LENGTH       = 32;
public static final int  ENCRYPTION_OVERHEAD       = 28;

public static final int  PAYMENTS_ADDRESS_BASE64_FIELD_SIZE = 776;
public static final int  PAYMENTS_ADDRESS_CONTENT_SIZE      = 776 * 6 / 8 - 28;  // = 582 - 28 = 554
```

Bucket selection:
- **name** (`getTargetNameLength`, lines 203-211): `≤ 53 → 53`, else `→ 257`.
- **about** (`getTargetAboutLength`, lines 213-223): `≤ 128 → 128`, `< 254 → 254`, else `→ 512`.
- **aboutEmoji**: always `EMOJI_PADDED_LENGTH = 32` (`ProfileApi.kt:77`).
- **phoneNumberSharing**: `encryptBoolean` → padded length 1 (`ProfileCipher.java:133-138`).
- **paymentAddress**: `encryptWithLength(encoded, PAYMENTS_ADDRESS_CONTENT_SIZE=554)`
  (`ProfileApi.kt:78`). `encryptWithLength` prepends a 4-byte little-endian length to the
  plaintext, then pads to 554 (`ProfileCipher.java:156-162`).

**Name field internal structure:** the `name` plaintext is `givenName || 0x00 || familyName`
(NUL-separated), then zero-padded to the bucket. ⚠️ The exact given/family split happens in
`ProfileName` (`/tmp/Signal-Android/app/.../profiles/ProfileName.java`) — confirm the
`0x00` separator there before relying on it; `ProfileCipher` itself just sees an opaque byte
array.

#### Resulting on-wire (base64) field sizes — server validation (authoritative)

The server enforces *exact* sizes on `CreateProfileRequest`
(`/tmp/Signal-Server/.../entities/CreateProfileRequest.java:34-82`). These equal
`paddedLength + 28` (the GCM overhead):

| Field | `@ExactlySize` (bytes, decoded) | = paddedLength + 28 |
|---|---|---|
| version | 64 | hex, not encrypted |
| name | `{81, 285}` | 53+28, 257+28 |
| aboutEmoji | `{0, 60}` | empty, 32+28 |
| about | `{0, 156, 282, 540}` | empty, 128+28, 254+28, 512+28 |
| paymentAddress | `{0, 582}` | empty, 554+28 |
| phoneNumberSharing | `{0, 29}` | empty, 1+28 |

`0` means the field may be omitted/empty. JSON serialization is **padded base64**
(`ByteArrayBase64WithPaddingAdapter`).

### A.4 Endpoints — ProfileController (authoritative server)

Base path `@Path("/v1/profile")` (`ProfileController.java:106`). The Android client issues all
of these over the authenticated *or* unauthenticated (sealed-sender) websocket
(`ProfileApi.kt`); on 401 over unauth it falls back to auth (lines 131-134).

| Method | Path | Returns | Server lines |
|---|---|---|---|
| GET | `/v1/profile/{aci}` | unversioned `BaseProfileResponse` | 305-323 |
| GET | `/v1/profile/{aci}/{version}` | `VersionedProfileResponse` | 223-256 |
| GET | `/v1/profile/{aci}/{version}/{credentialRequest}?credentialType=expiringProfileKey` | `ExpiringProfileKeyCredentialProfileResponse` | 258-301 |
| PUT | `/v1/profile` | 200 (+ avatar upload form if avatar=true) | 157-221 |

Common responses: 200 OK, 401 unauthorized, 404 not a registered user, 429 rate-limited
(`ProfileApi.kt` doc comments). PUT extra: 403 payment region not allowed (line 169), 412 if
account has `profiles_v2` (lines 170, 177-179).

#### GET response JSON (decoded by `SignalServiceProfile`)

Fields (`/tmp/Signal-Android/.../profiles/SignalServiceProfile.java`):

| JSON key | Type | Notes |
|---|---|---|
| `identityKey` | base64 string | account public identity key |
| `name` | base64 string | encrypted (ProfileCipher) — present on versioned GET |
| `about` | base64 string | encrypted |
| `aboutEmoji` | base64 string | encrypted |
| `paymentAddress` | base64 bytes | encrypted (encryptWithLength) |
| `avatar` | string | CDN object path (e.g. `profiles/<b64url>`); `null` if none |
| `unidentifiedAccess` | base64 string | UAK checksum (unversioned use) |
| `unrestrictedUnidentifiedAccess` | bool | |
| `capabilities` | object | see A.6 |
| `uuid` | ServiceId | the account's ACI/PNI |
| `credential` | base64 bytes | only on the `/{version}/{credentialRequest}` variant |
| `badges` | array | id, category, name, description, sprites6, expiration, visible, duration |
| `phoneNumberSharing` | base64 bytes | encrypted boolean |

Server entities back this exactly: `BaseProfileResponse` (identityKey, unidentifiedAccess,
unrestrictedUnidentifiedAccess, capabilities map, badges, uuid) +
`VersionedProfileResponse` (name, about, aboutEmoji, avatar, paymentAddress,
phoneNumberSharing) + `ExpiringProfileKeyCredentialProfileResponse.credential`.
Versioned fields are **empty if the requested version wasn't found** (entity Schema docs).

#### PUT request JSON — `SignalServiceProfileWrite` (client) / `CreateProfileRequest` (server)

`/tmp/Signal-Android/.../profiles/SignalServiceProfileWrite.kt` and
`ProfileApi.kt:73-84`:

| JSON key | Source | Notes |
|---|---|---|
| `version` | `profileKey.getProfileKeyVersion(aci).serialize()` | 64-hex |
| `name` | `encryptString(name, getTargetNameLength)` | base64, encrypted |
| `about` | `encryptString(about, getTargetAboutLength)` | base64, encrypted |
| `aboutEmoji` | `encryptString(emoji, EMOJI_PADDED_LENGTH=32)` | base64, encrypted |
| `paymentAddress` | `encryptWithLength(addr, 554)` or null | base64, encrypted |
| `phoneNumberSharing` | `encryptBoolean(bool)` | base64, encrypted |
| `avatar` | bool — "do I have an avatar" | drives avatar form (below) |
| `sameAvatar` | bool — "unchanged from previous version" | |
| `commitment` | `profileKey.getCommitment(aci).serialize()` | base64, 97 bytes |
| `badgeIds` | list of badge id strings to show | |

Server `AvatarChange` resolution (`CreateProfileRequest.java:85-99`):
`!hasAvatar → CLEAR`; `hasAvatar && !sameAvatar → UPDATE`; `hasAvatar && sameAvatar →
UNCHANGED`. **Only on `UPDATE`** does the 200 body contain an avatar upload form
(`ProfileController.java:216-220`).

### A.5 Avatar upload & download

#### Upload (own avatar) — PUT response is an S3 POST-policy form

When `avatar=true && sameAvatar=false`, PUT returns `ProfileAvatarUploadAttributes`
(`/tmp/Signal-Server/.../entities/ProfileAvatarUploadAttributes.java`), an
**AWS S3 POST Policy (Signature v4)** form:

| field | value (server `generateAvatarUploadForm`, `ProfileController.java:556-565`) |
|---|---|
| `key` | object name = `profiles/<base64url(16 random bytes)>` (`ProfileHelper.java:83-88`) |
| `credential` | `policy.first()` — AWS credential scope |
| `acl` | `"private"` |
| `algorithm` | `"AWS4-HMAC-SHA256"` |
| `date` | `now` in `PostPolicyGenerator.AWS_DATE_TIME` format |
| `policy` | base64 POST policy (max size = `MAX_PROFILE_AVATAR_SIZE_BYTES = 10 MiB`, `ProfileHelper.java:35`) |
| `signature` | HMAC signature over the policy |

The client encrypts the avatar with `ProfileCipherOutputStream` (profile-key GCM stream, see
A.5.1) and POSTs it as multipart/form-data to **CDN 0** root via `uploadToCdn0`
(`ProfileApi.kt:86-107`, `PushServiceSocket.java:580-591`,
`AVATAR_UPLOAD_PATH = ""` → `PushServiceSocket.java:163`). Multipart fields
(`uploadToCdn0`, `PushServiceSocket.java:840-851`):

```
POST {cdn0Url}/                       (multipart/form-data)
  acl              = <form.acl>
  key              = <form.key>          # e.g. profiles/AbC...   <-- this becomes profile.avatar
  policy           = <form.policy>
  Content-Type     = <contentType>       # e.g. image/jpeg  (profileAvatar.getContentType())
  x-amz-algorithm  = <form.algorithm>
  x-amz-credential = <form.credential>
  x-amz-date       = <form.date>
  x-amz-signature  = <form.signature>
  file             = <encrypted avatar bytes>
```

The returned `key` is the avatar path that subsequently appears as `profile.avatar`
(`uploadProfileAvatar` returns `formAttributes.getKey()`, line 589).

**Group avatars** reuse the *same* CDN0 multipart path (`uploadGroupV2Avatar`,
`PushServiceSocket.java:641-652`) — details are agent 4.

##### A.5.1 ProfileCipherOutputStream / InputStream (avatar crypto)

Avatar bytes are encrypted with AES-256-GCM keyed by the profile key (NOT the attachment
scheme). `/tmp/Signal-Android/.../api/crypto/ProfileCipherOutputStream.java`:

```
write order:  nonce(12) || GCM-ciphertext(plaintext) || GCM-tag(16)
```

- 12-byte random nonce, written first (lines 28-31).
- AES/GCM/NoPadding, `GCMParameterSpec(128, nonce)` (line 29) — 16-byte tag appended on
  `close()` (lines 60-68).
- Ciphertext length helper: `getCiphertextLength(plaintextLength) = 12 + 16 + plaintextLength`
  (lines 77-79). Used to set the multipart content length (`ProfileApi.kt:89`).

Decrypt (`ProfileCipherInputStream.java`): read nonce(12), then stream-decrypt with libsignal
`Aes256GcmDecryption`, holding back the trailing 16-byte tag for final `verifyTag`
(lines 22-89). Note: this is the **same** GCM construction as `ProfileCipher` but streamed and
*without* the fixed-bucket zero-padding (avatars aren't bucketed).

#### Download (other users' avatars)

`SignalServiceProfile.avatar` is the CDN object path. The client GETs it from **CDN 0** and
decrypts with the contact's profile key:

```
retrieveProfileAvatar(path, dest, maxSize)  ->  downloadFromCdn(dest, cdn=0, {}, path, ...)
```
(`PushServiceSocket.java:565-571`). Then wrap the downloaded file in `ProfileCipherInputStream`
with the profile key (A.5.1) to get plaintext. Avatars have no separate length field — the GCM
stream self-delimits via the trailing tag.

### A.6 Capabilities

Client model (`SignalServiceProfile.Capabilities`, lines 191-221) reads three JSON booleans:

| JSON key | meaning |
|---|---|
| `storage` | storage service supported |
| `ssre2` | storage-service encryption v2 |
| `usernameChangeSyncMessage` | username-change sync messages |

The **server** decides which capabilities appear in the profile JSON via
`DeviceCapability.includeInProfile()`
(`/tmp/Signal-Server/.../storage/DeviceCapability.java:14-20`, 4th ctor arg = includeInProfile):

| enum | JSON name | includeInProfile |
|---|---|---|
| `STORAGE` | `storage` | false |
| `TRANSFER` | `transfer` | false |
| `ATTACHMENT_BACKFILL` | `attachmentBackfill` | **true** |
| `SPARSE_POST_QUANTUM_RATCHET` | `spqr` | **true** |
| `PROFILES_V2` | `profiles_v2` | **true** |
| `USERNAME_CHANGE_SYNC_MESSAGE` | `usernameChangeSyncMessage` | **true** |

So the live JSON `capabilities` map currently contains `attachmentBackfill`, `spqr`,
`profiles_v2`, `usernameChangeSyncMessage` (server emits all `includeInProfile` capabilities as
`name → bool`, `ProfileController.java:567-571`). ⚠️ The Android `Capabilities` class above is
*behind* the server set (it only parses `storage`/`ssre2`/`usernameChangeSyncMessage`); unknown
keys are simply ignored by Jackson. Treat the **server** list as authoritative and parse the
map generically.

---

## Part B — ATTACHMENTS / FILE TRANSFER

### B.1 AttachmentPointer proto — EVERY field

`/tmp/Signal-Android/.../protowire/SignalService.proto:892-925`. Proto3.

```proto
message AttachmentPointer {
  enum Flags {
    VOICE_MESSAGE = 1;
    BORDERLESS    = 2;
    reserved 4;
    GIF           = 8;
  }

  oneof attachment_identifier {
    fixed64 cdnId  = 1;     // legacy CDN0 numeric id
    string  cdnKey = 15;    // CDN2/CDN3 string key
  }
  optional bytes   clientUuid       = 20;  // cross-client id among a message's attachments
  optional string  contentType      = 2;
  optional bytes   key              = 3;   // 64-byte combined key (AES||HMAC), see B.2
  optional uint32  size             = 4;   // plaintext size (pre-padding)
  optional bytes   thumbnail        = 5;
  optional bytes   digest           = 6;   // SHA-256 over iv||ciphertext||mac, see B.2
  reserved 16;                             // (was incrementalMac w/ implicit chunk sizing)
  reserved 18;                             // (was incrementalMac for all types)
  optional bytes   incrementalMac   = 19;  // concatenated chunk MACs, see B.3
  optional uint32  chunkSize        = 17;  // incremental-mac chunk size in bytes
  optional string  fileName         = 7;
  optional uint32  flags            = 8;   // bitfield of Flags
  optional uint32  width            = 9;
  optional uint32  height           = 10;
  optional string  caption          = 11;
  optional string  blurHash         = 12;
  optional uint64  uploadTimestamp  = 13;
  optional uint32  cdnNumber        = 14;  // 0 legacy / 2 GCS / 3 TUS
  // Next ID: 21
}
```

> ⚠️ **Discrepancy with the task brief.** The brief said `GIF = 4` and
> `chunkSize`/`incrementalMacChunkSize` as the field name. The **actual source** says
> `GIF = 8` with tag `4` *reserved*, and the chunk-size field is `chunkSize = 17` (the proto
> field-number for the incremental-mac chunk size). Use the source values. The older
> `incrementalMac` numbers 16 and 18 are reserved (removed). Live `incrementalMac = 19`.

`attachment_identifier` is a `oneof`: a v3/v4 attachment uses `cdnKey` (string); a legacy CDN0
attachment uses `cdnId` (fixed64). Client remote-id types mirror this:
`SignalServiceAttachmentRemoteId.V2`(cdnId) / `.V4`(cdnKey) / `.Backup`
(`PushServiceSocket.java:521-533`).

### B.2 Attachment encryption (AttachmentCipher) — exact byte layout

The 64-byte attachment `key` (proto field 3) splits into two 32-byte halves:
`Util.split(combinedKeyMaterial, 32, 32)` → `[0]` = AES-256-CBC key, `[1]` = HMAC-SHA256 key
(`AttachmentCipherOutputStream.kt:37`, `AttachmentCipherInputStream.kt:41-42,363-372`).

**Encrypt** (`AttachmentCipherOutputStream.kt`):
- `AES/CBC/PKCS5Padding` (= PKCS#7 for 16-byte blocks), random 16-byte IV (or supplied)
  (lines 33, 39-43).
- IV is written first and fed into the MAC (lines 47-48).
- On close: `mac = HMAC-SHA256(iv || ciphertext)` is appended (lines 76-81).
- `digest = SHA-256(iv || ciphertext || mac)` via the wrapping `DigestingOutputStream`
  (every `super.write` updates the SHA-256, `DigestingOutputStream.java:27-49`) →
  `getTransmittedDigest()`.

```
encrypted attachment blob on CDN:

  +--------+--------------------------------------+-----------------+
  | IV     |  AES-256-CBC(PKCS7) ciphertext       |  HMAC-SHA256    |
  | 16 B   |  (plaintext is padded first, B.4)    |  32 B           |
  +--------+--------------------------------------+-----------------+
  |<--------------- HMAC covers these ---------->|
  |<----------------------- digest = SHA256 covers ALL ----------->|

  key (proto field 3) = AES_KEY(32) || MAC_KEY(32)         // 64 bytes total
  HMAC  = HMAC-SHA256(MAC_KEY, IV || ciphertext)           // = trailing 32 B
  digest= SHA-256(IV || ciphertext || HMAC)                // proto field 6
  size  = original plaintext length (pre-padding)          // proto field 4
```

Ciphertext length helper (`AttachmentCipherStreamUtil.kt:18-23`):
`getCiphertextLength(plaintextLen) = 16 (IV) + 32 (MAC) + ((plaintextLen/16 + 1) * 16)`
(the `+1` block accounts for PKCS7 always adding a full padding block when input is a multiple
of 16). Inverse: `getPlaintextLength` (lines 26-28).

**Decrypt + verify** (`AttachmentCipherInputStream.kt`, `create()` lines 234-297):
1. Reject if `streamLength ≤ 16 + 32` (overhead) (lines 248-250).
2. Verify MAC (and optionally the encrypted `digest`) over the whole stream minus the trailing
   32-byte MAC (`verifyMacAndMaybeEncryptedDigest`, lines 327-361):
   - HMAC-SHA256 over `[0 .. len-32)` (which is `IV||ciphertext`), compare to trailing 32 bytes
     (constant-time `MessageDigest.isEqual`).
   - `ourDigest = SHA256(IV||ciphertext || theirMac)` (line 349 `digest.digest(theirMac)`) and
     compare to the proto `digest` if provided.
3. Decrypt: `LimitedInputStream(stream, len-32)` → read 16-byte IV → `AES/CBC/PKCS5Padding`
   decrypt (lines 283-285, 299-305).
4. Trim to plaintext length: `LimitedInputStream(decrypted, plaintextLength)` strips the B.4
   padding (line 286).

**`IntegrityCheck`** (lines 382-409): the caller supplies an `encryptedDigest` (the proto
`digest`) and/or a `plaintextHash`. At least one is required. `plaintextHash` (SHA-256 of the
**plaintext**, 32 bytes) is validated by wrapping the *decrypted* stream in a
`DigestValidatingInputStream` (lines 288-296). `plaintextHash` is primarily a
backup/archive concern (it lets the server's re-encrypted "archive" layer be validated); for
ordinary message attachments the `encryptedDigest` (proto `digest`) is the integrity check.

### B.3 Incremental / chunked MAC (proto `incrementalMac` + `chunkSize`)

Lets a downloader verify-as-it-streams (e.g. video playback) instead of buffering the whole
file. `incrementalMac` (field 19) is the **concatenation of per-chunk HMAC-SHA256 outputs**;
`chunkSize` (field 17) is the chunk size in bytes.

Chunk-size selection — libsignal `calculate_chunk_size`
(`/tmp/libsignal/rust/protocol/src/incremental_mac.rs:25-46`):

```
MINIMUM_CHUNK_SIZE       = 64 * 1024        # 64 KiB
MAXIMUM_CHUNK_SIZE       = 2 * 1024 * 1024  # 2 MiB
TARGET_TOTAL_DIGEST_SIZE = 8 * 1024         # 8 KiB
target_chunk_count = 8192 / 32 = 256        # 32 = SHA-256 output size

if data_size <  256 * 64KiB    -> 64KiB
if data_size <  256 * 2MiB     -> ceil(data_size / 256)
else                           -> 2MiB
```

On the wire the client uses `ChunkSizeChoice.inferChunkSize(contentLength)` when producing the
incremental digest during upload (`DigestingRequestBody.kt:48`) and
`ChunkSizeChoice.everyNthByte(incrementalMacChunkSize)` (the proto `chunkSize`) when validating
on download (`AttachmentCipherInputStream.kt:266-275`). Incremental MAC is keyed by the **same**
32-byte MAC key as the regular MAC. The MAC/digest still apply for streams that *also* carry an
incremental mac (the incremental path additionally wraps a `DigestValidatingInputStream` over
the proto `digest`, lines 260-275). If `incrementalMac` is empty or `chunkSize ≤ 0`,
incremental validation is disabled and the plain B.2 path is used (line 253).

⚠️ Exact chunk-MAC framing (whether a partial final chunk emits a MAC, ordering) — port
libsignal `incremental_mac.rs` `update`/`finalize` (lines 78-99) rather than re-derive.

### B.4 Attachment padding (PaddingInputStream)

Before encryption, plaintext is zero-padded to a deterministic bucket so the **ciphertext
length leaks less about the original size** (`PaddingInputStream.java:58-60`):

```java
getPaddedSize(size) = max(541, floor( 1.05 ^ ceil( log(size) / log(1.05) ) ))
```

i.e. round up to the next power of `1.05`, with a floor of 541 bytes. Padding bytes are `0x00`
(lines 20-46). `size` (proto field 4) records the **original** length so the receiver can trim.
Upload flow applies this: `paddedLength = PaddingInputStream.getPaddedSize(len)` →
`ciphertextLength = AttachmentCipherStreamUtil.getCiphertextLength(paddedLength)`
(`AttachmentApi.kt:79-81`).

### B.5 Upload

#### Step 1 — get an upload form

`AttachmentControllerV4` (`@Path("/v4/attachments")`,
`/tmp/Signal-Server/.../controllers/AttachmentControllerV4.java`):

```
GET /v4/attachments/form/upload?uploadLength={ciphertextBytes}
-> 200 AttachmentDescriptorV3 { cdn, key, headers, signedUploadLocation }
   400 bad uploadLength, 413 too large (global.attachments.maxBytes), 429 rate-limited
```

The server picks the CDN: `cdn = 3` if the account is enrolled in the `cdn3` experiment, else
`cdn = 2` (lines 114-118). `key = base64url(15 random bytes)`
(`AttachmentUtil.generateAttachmentKey`,
`/tmp/Signal-Server/.../attachments/AttachmentUtil.java`). This `key` becomes the
AttachmentPointer `cdnKey`, and the chosen `cdn` becomes `cdnNumber`.

`AttachmentDescriptorV3` (`/tmp/Signal-Server/.../entities/AttachmentDescriptorV3.java`):
`int cdn`, `String key`, `Map<String,String> headers`, `String signedUploadLocation`.

CDN-specific descriptor contents:
- **CDN2 = GCS** (`GcsAttachmentGenerator.java`): `signedUploadLocation` =
  `https://{domain}{resourcePath}?{canonicalQuery}&X-Goog-Signature=…`; headers =
  `{ host, x-goog-content-length-range: "1,{max}", x-goog-resumable: "start" }` (lines 40-51).
- **CDN3 = TUS** (`TusAttachmentGenerator.java`): `signedUploadLocation` = `{tusUri}/attachments`;
  headers = `{ Authorization: Bearer <jwt>, Upload-Metadata: "filename <base64(key)>" }`
  (lines 28-39).

Android fetches this over the chat websocket (`AttachmentApi.getAttachmentV4UploadForm` →
`AuthMessagesService.getUploadForm`, `AttachmentApi.kt:42-55`) and maps it to
`AttachmentUploadForm { cdn, key, headers, signedUploadLocation }`
(`/tmp/Signal-Android/.../internal/push/AttachmentUploadForm.kt`).

#### Step 2 — upload the encrypted blob

Client encrypts on the fly with `AttachmentCipherOutputStreamFactory(key, iv)`
(`AttachmentApi.kt:91`) and uploads. Two flows (`AttachmentApi.uploadAttachmentV4`, lines
67-129; `PushServiceSocket`):

**CDN3 (TUS "creation-with-upload", single POST)** —
`createAndUploadToCdn3` (`PushServiceSocket.java:943-999`):
```
POST {signedUploadLocation}            # = {tusUri}/attachments
  Upload-Length: {ciphertextBytes}
  Tus-Resumable: 1.0.0
  Authorization: Bearer <jwt>          # from form.headers
  Upload-Metadata: filename <b64(key)> # from form.headers
  [x-signal-checksum-sha256: <b64 sha256>]   # optional
  Content-Type: application/offset+octet-stream
  body = IV || ciphertext || MAC
```

**CDN2 (GCS resumable, 2-phase)** —
`getResumableUploadUrl` (POST, returns `location:` header, lines 885-941) then
`uploadToCdn2` (PUT via PATCH/HEAD resume logic, lines 1012+):
```
# phase 1: create resumable session
POST {signedUploadLocation}            # cdn==2
  Content-Length: 0
  Content-Type: application/octet-stream
  (form.headers except host)
  -> 200, response "location" header = resumableUrl

# phase 2: upload (with resume support via HEAD + ranged PUT)
PUT {resumableUrl}
  Content-Type: application/octet-stream
  body = IV || ciphertext || MAC
```

`ResumableUploadSpec` bundles `(secretKey(64), iv(16), key, cdn, resumeLocation, expiration,
headers)`; resume links live `CDN2_RESUMABLE_LINK_LIFETIME_MILLIS = 7 days`
(`PushServiceSocket.java:193,654-662`). The upload's running SHA-256 digest is read back from
the `DigestingRequestBody` → fills the AttachmentPointer `digest` (field 6). The
`key`/`cdn` from the form become `cdnKey`/`cdnNumber`.

> CDN0 multipart POST (`uploadToCdn0`, lines 824-879) is **only** used for avatars/group avatars
> and legacy paths, not v4 message attachments.

### B.6 Download

```
retrieveAttachment(cdnNumber, headers, remoteId, dest, maxSize, listener)
  remoteId V2 (cdnId):  path = "attachments/{cdnId}"     # legacy CDN0
  remoteId V4 (cdnKey): path = "attachments/{urlEncode(cdnKey)}"
  remoteId Backup:      path = "backups/{mediaCdnPath}/{mediaId}"   # agent: backups
  -> downloadFromCdn(dest, cdnNumber, headers, path, maxSize, listener)
```
(`PushServiceSocket.java:518-534`, path constants lines 161-162, 186). GET to
`{cdn[cdnNumber]Url}/attachments/{cdnKey|cdnId}`. `downloadFromCdn` selects the OkHttp client
for the given CDN number from `cdnClientsMap` and throws `MissingConfigurationException` for an
unknown CDN (lines 700-706). `headers` is empty for plain message attachments; backup/archive
downloads pass credentials (agent: backups).

After download, decrypt+verify via `AttachmentCipherInputStream.createForAttachment(...)`
with the 64-byte combined key, the `IntegrityCheck` (proto `digest`), and optional
`incrementalDigest`/`incrementalMacChunkSize` (B.2/B.3). Trim to proto `size`.

**CDN number meaning** (`AttachmentDescriptorV3` Schema doc + controllers):
`0` = legacy S3/CDN0 (numeric `cdnId`), `2` = GCS resumable, `3` = TUS/Cloudflare resumable.

### B.7 Stickers

Stickers are a **separate** CDN0 path and key-derivation, not the message-attachment scheme.

```
GET stickers/{hexPackId}/manifest.proto      # STICKER_MANIFEST_PATH
GET stickers/{hexPackId}/full/{stickerId}    # STICKER_PATH
```
from CDN0, max 1 MiB each (`PushServiceSocket.java:165-166, 537-563`).

Decrypt with `AttachmentCipherInputStream.createForStickerData(data, packKey)`
(`AttachmentCipherInputStream.kt:182-201`):
```
keyMaterial = HKDF(packKey, info="Sticker Pack", L=64)   # 64 -> AES_KEY(32)||MAC_KEY(32)
verify HMAC-SHA256 over data[..len-32], then AES-256-CBC/PKCS7 decrypt
```
KDF label is the **exact** ASCII string `Sticker Pack` (line 185). No proto `digest` is used
(MAC only). `packKey` comes from sticker-pack metadata (agent 3 message semantics).

### B.8 Long-text attachments

Message bodies over a threshold are split: a trimmed inline body + a plain attachment holding
the full text. `/tmp/Signal-Android/app/.../util/MessageUtil.kt`:

```
MAX_INLINE_BODY_SIZE_BYTES = 2 KiB    # 2.kibiBytes  -> inline proto body cap
MAX_TOTAL_BODY_SIZE_BYTES  = 64 KiB   # overall cap even as long-text attachment
```

`getSplitMessage` (lines 26-46): split `rawText` at `MAX_INLINE_BODY_SIZE_BYTES`; if there's a
remainder, the **whole** text is written as a single attachment with:
- MIME type `text/x-signal-plain`
  (`MediaUtil.LONG_TEXT` → `ContentTypeUtil.LONG_TEXT`,
  `/tmp/Signal-Android/core/util/.../ContentTypeUtil.java:36`),
- filename `signal-<yyyy-MM-dd-HHmmss>.txt`.

The long-text attachment is an **ordinary AttachmentPointer** — same B.2 encryption, B.5
upload, B.6 download. The inline `DataMessage.body` carries the first ≤2 KiB; the receiver
fetches and concatenates the attachment to reconstruct the full body. (Message-level wiring is
agent 3.)

---

## Implementation checklist (TypeScript clean-room)

1. **Profile key version / commitment / credential request** — port libsignal
   `rust/zkgroup` (SHO, profile_key_*); KDF label
   `Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_GetProfileKeyVersion`; version = 64-hex.
2. **ProfileCipher** — AES-256-GCM (12B nonce, 128b tag), layout `nonce||ct||tag`, +28 overhead;
   zero-pad to buckets `name {53,257}`, `about {128,254,512}`, `emoji 32`, `phoneNumberSharing 1`,
   `paymentAddress encryptWithLength(554)`; strip trailing `0x00` on decrypt.
3. **Endpoints** — GET `/v1/profile/{aci}` , `/{version}`, `/{version}/{credReq}?credentialType=expiringProfileKey`;
   PUT `/v1/profile` with `SignalServiceProfileWrite` JSON.
4. **Avatar** — own: PUT returns S3 POST-policy form → multipart POST to CDN0 root, body =
   `ProfileCipherOutputStream` (nonce||GCM-ct||tag); other: GET `profile.avatar` from CDN0 →
   `ProfileCipherInputStream`.
5. **Attachment crypto** — 64B key = AES(32)||MAC(32); IV(16)||AES-CBC/PKCS7 ct||HMAC(32);
   digest = SHA256(IV||ct||MAC); pad plaintext via `getPaddedSize`.
6. **Upload** — GET `/v4/attachments/form/upload?uploadLength=…`; CDN3=TUS single POST,
   CDN2=GCS POST-create + PUT; `cdnKey`=form.key, `cdnNumber`=form.cdn.
7. **Download** — GET `cdn{n}/attachments/{cdnKey|cdnId}`; verify MAC+digest, trim to `size`.
8. **Long text** — >2 KiB body → `text/x-signal-plain` attachment.

---

## Source files (GitHub permalinks — `main` as of 2026-06-16)

> Permalinks point at `main`; pin to a commit SHA when implementing, since `main` moves.

**Signal-Android** (`https://github.com/signalapp/Signal-Android`):
- `lib/libsignal-service/src/main/protowire/SignalService.proto` (AttachmentPointer L892-925)
- `lib/libsignal-service/src/main/protowire/ResumableUploads.proto`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/ProfileCipher.java`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/ProfileCipherOutputStream.java`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/ProfileCipherInputStream.java`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/AttachmentCipherOutputStream.kt`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/AttachmentCipherInputStream.kt`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/AttachmentCipherStreamUtil.kt`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/DigestingOutputStream.java`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/profiles/ProfileApi.kt`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/profiles/SignalServiceProfile.java`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/profiles/SignalServiceProfileWrite.kt`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/crypto/PaddingInputStream.java`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/PushServiceSocket.java`
- `lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/AttachmentUploadForm.kt`
- `lib/network/src/main/java/org/signal/network/api/AttachmentApi.kt`
- `app/src/main/java/org/thoughtcrime/securesms/util/MessageUtil.kt`
- `core/util/src/main/java/org/signal/core/util/ContentTypeUtil.java`

**libsignal** (`https://github.com/signalapp/libsignal`):
- `rust/zkgroup/src/api/profiles/profile_key.rs`
- `rust/zkgroup/src/api/profiles/profile_key_version.rs`
- `rust/zkgroup/src/api/profiles/profile_key_credential_request_context.rs`
- `rust/zkgroup/src/common/constants.rs`
- `rust/protocol/src/incremental_mac.rs`

**Signal-Server** (`https://github.com/signalapp/Signal-Server`):
- `service/src/main/java/org/whispersystems/textsecuregcm/controllers/ProfileController.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/controllers/AttachmentControllerV4.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/entities/CreateProfileRequest.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/entities/ProfileAvatarUploadAttributes.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/entities/BaseProfileResponse.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/entities/VersionedProfileResponse.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/entities/ExpiringProfileKeyCredentialProfileResponse.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/entities/AttachmentDescriptorV3.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/attachments/AttachmentUtil.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/attachments/GcsAttachmentGenerator.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/attachments/TusAttachmentGenerator.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/storage/DeviceCapability.java`
- `service/src/main/java/org/whispersystems/textsecuregcm/util/ProfileHelper.java`
</content>
</invoke>
