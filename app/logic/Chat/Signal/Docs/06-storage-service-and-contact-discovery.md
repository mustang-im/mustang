# 06 — Storage Service (the roster + contact sync) and Contact Discovery (CDSI)

Based on main-branch clones, 2026-06-16.

This document covers how Signal stores and synchronizes its **roster** — contacts,
groups, your own account record, story lists, etc. — through the **Storage Service**,
and how phone numbers in the address book are resolved to service ids (ACI/PNI) via
**CDSI** (Contact Discovery Service, internet-facing variant). Source is the
clean-room reference: Signal-Android (Kotlin/Java), libsignal (Rust), Signal-Server
(Java). Every proto field carries its number+type; every HKDF/HMAC label is verbatim
from source with file+line citations.

**Out of scope (other agents):** ProfileKey / profile-field encryption (agent 5);
group zk math & group operations (agent 4); message content (agent 3); websocket /
transport framing (agent 1); how the masterKey is *obtained* from SVR/PIN or from a
primary device's `Keys` SyncMessage / ProvisionMessage (agents 2/3 — referenced here
only as the input to the derivation chain).

---

## 0. TL;DR feasibility verdicts (read this first)

| Subsystem | Feasible without native libsignal? | Verdict |
|---|---|---|
| **Storage Service** (roster sync) | **YES** | Pure AES-GCM + HMAC-SHA256 + HKDF-SHA256. No enclave, no zk. Fully implementable in TypeScript with WebCrypto/node:crypto. |
| **CDSI** (E164 → ACI/PNI discovery) | **NO (practically)** | Requires SGX remote-attestation + a Noise (`Noise_NK`/`NKhfs`+Kyber1024) handshake to an enclave. Re-implementing attestation verification clean-room is a large, security-critical effort. |
| **Master/Storage key derivation** | **YES** | HMAC-SHA256 + HKDF-SHA256; one piece (`AccountEntropyPool → masterKey`) currently delegates to native libsignal but is a documented HKDF (see §1.4 ⚠️). |

- `@signalapp/libsignal-client` is **NOT** in `/workspace/app/node_modules` (checked:
  `/workspace/app/node_modules/@signalapp` does not exist). So **no** native CDSI
  client, no native zkgroup, no native AccountEntropyPool helper is available today.
- **Storage service works with just AES-GCM + HKDF/HMAC** — confirmed by reading the
  entire encrypt/decrypt path (`SignalStorageCipher.kt`, `StorageServiceService.kt`,
  `StorageKey.kt`, `RecordIkm.kt`). No native dependency anywhere in that path.
- **CDSI fallback (recommended):** skip address-book discovery. You can still build a
  working roster: service ids arrive via incoming messages, via the Storage Service
  `ContactRecord`s themselves (they carry `aci`/`pni`/`e164`), and via group member
  lists (agent 4). You simply cannot *discover* a brand-new number from the phone's
  address book without CDSI. See §3.6.

---

## 1. Key-derivation chain

### 1.1 The chain, end to end

```
                         ┌────────────────────────────────────────────────────────┐
                         │  ROOT SECRET (one of two, depending on account age)      │
                         └────────────────────────────────────────────────────────┘
   (newer accounts)                                  (older / classic)
   AccountEntropyPool (AEP)                           Master Key (32 bytes)
   64 lowercase alphanumeric chars                    obtained from:
        │                                               • SVR2 (PIN-derived), OR
        │ deriveSvrKey(AEP)   ⚠️ native HKDF            • primary device via the
        │ (libsignal, see §1.4)                           `Keys` SyncMessage /
        ▼                                                  ProvisionMessage.masterKey
   Master Key (32 bytes) ◄───────────────────────────────┘   (agents 2/3)
        │
        │  HMAC-SHA256(key = masterKey, msg = "Storage Service Encryption")
        ▼
   Storage Service Key  (32 bytes)   [StorageKey]
        │
        ├─ HMAC-SHA256(key = StorageKey, msg = "Manifest_" + version)
        │        ▼
        │   Manifest Key (32 bytes)  → AES-GCM-encrypts the ManifestRecord
        │
        └─ Per-item key. TWO schemes, picked by whether the manifest carries a recordIkm:
           │
           ├─ LEGACY (manifest.recordIkm == null):
           │     HMAC-SHA256(key = StorageKey, msg = "Item_" + base64pad(rawId16))
           │          ▼
           │     Item Key (32 bytes) → AES-GCM-encrypts that StorageRecord
           │
           └─ SSRE2 / current (manifest.recordIkm present, 32 bytes):
                 HKDF-SHA256(IKM = recordIkm, salt = none,
                             info = "20240801_SIGNAL_STORAGE_SERVICE_ITEM_" + rawId16,
                             L = 32)
                      ▼
                 Item Key (32 bytes) → AES-GCM-encrypts that StorageRecord
```

The **manifest is *always* encrypted with the Manifest Key** derived via the legacy
HMAC scheme (`"Manifest_" + version`), regardless of recordIkm. Only the per-item key
selection switches. (`StorageServiceService.kt:211`, `:280` for manifest;
`:298`, `:307` for items.)

### 1.2 Verbatim labels & algorithms (cite source)

| Derivation | Algorithm | Key / IKM | Info / message (VERBATIM) | Out | Source |
|---|---|---|---|---|---|
| Master Key → Storage Service Key | HMAC-SHA256 | masterKey (32B) | `Storage Service Encryption` | 32B | `MasterKey.kt:39-41,47-49` |
| Master Key → Registration Lock | HMAC-SHA256 | masterKey | `Registration Lock` | 32B → hex | `MasterKey.kt:31-33` |
| Master Key → Reg. Recovery Pwd | HMAC-SHA256 | masterKey | `Registration Recovery` | 32B → b64 | `MasterKey.kt:35-37` |
| Master Key → Logging Key | HMAC-SHA256 | masterKey | `Logging Key` | 32B | `MasterKey.kt:43-45` |
| Storage Key → Manifest Key | HMAC-SHA256 | StorageKey (32B) | `Manifest_` + `<version>` (decimal, base-10 string) | 32B | `StorageKey.kt:22-24,30-32` |
| Storage Key → Item Key (legacy) | HMAC-SHA256 | StorageKey (32B) | `Item_` + Base64-with-padding(rawId) | 32B | `StorageKey.kt:26-28,30-32` |
| recordIkm → Item Key (SSRE2) | **HKDF-SHA256** | recordIkm (32B) | `20240801_SIGNAL_STORAGE_SERVICE_ITEM_` + rawId (16 raw bytes appended) | 32B | `RecordIkm.kt:27-35` |

Notes that bite during implementation:
- "HMAC-SHA256(key, msg)" here means a **plain single-block HMAC**, *not* HKDF.
  `MasterKey.derive` and `StorageKey.derive` literally call
  `CryptoUtil.hmacSha256(key, name.utf8Bytes)` (`MasterKey.kt:48`, `StorageKey.kt:31`).
- The legacy item label uses **Base64 *with padding*** of the 16-byte id, concatenated
  to the ASCII `"Item_"`. The manifest label uses the **decimal** version string
  (`"Manifest_" + version`), e.g. `Manifest_42`.
- The SSRE2 item derivation is a real **HKDF** (extract+expand), salt unspecified
  (libsignal `hkdf` default = empty/zero salt — ⚠️ confirm against agent 1's
  `Crypto.hkdf` once that helper is ported), info = the ASCII prefix bytes **plus the
  raw 16-byte id** (not base64). (`RecordIkm.kt:29-32`.)
- `version` in `"Manifest_<version>"` is the manifest's own `uint64` version, so the
  manifest key changes every write. (`StorageServiceService.kt:211`.)

### 1.3 Key/length constants

- Master Key: **32 bytes** (`MasterKey.kt:17` `LENGTH = 32`).
- Storage Key: **32 bytes** (`StorageKey.kt:18` `check(key.size == 32)`).
- Manifest Key / Item Key: **32 bytes** (`StorageManifestKey.kt:14`, `StorageItemKey.kt:14`).
- recordIkm: **32 bytes** (`RecordIkm.kt:23` `Util.getSecretBytes(32)`).
- Storage record id (`StorageId.raw`, manifest `Identifier.raw`, `StorageItem.key`):
  **16 random bytes** (`StorageSyncHelper.kt:54` `Util.getSecretBytes(16)`).
- AccountEntropyPool: **64 chars**, lowercased alphanumeric (`AccountEntropyPool.kt:16-17, LENGTH = 64`).

### 1.4 AccountEntropyPool → Master Key  ⚠️

Newer accounts derive the master key from the **AccountEntropyPool** (AEP). In
Signal-Android this is delegated to native libsignal:

```kotlin
fun deriveMasterKey(): MasterKey =
  MasterKey(LibSignalAccountEntropyPool.deriveSvrKey(value))     // AccountEntropyPool.kt:98-100
```

⚠️ **UNKNOWN/TODO (cite needed in libsignal rust):** the exact HKDF parameters of
`deriveSvrKey` are inside the Rust `libsignal-bridge` / `account-keys` crate, not in
the Kotlin we read. It is an HKDF over the (lowercased) AEP string, output 32 bytes,
but the info/salt strings were **not located in the files cited by this task**. If the
target account predates AEP (uses a real Master Key directly from SVR/primary
provisioning), you can skip AEP entirely and start the chain at Master Key. **Mark this
as the one derivation that needs the Rust `account-keys`/`message-backup` source before
relying on it.** `AccountEntropyPool.deriveBackupKey` is the message-backup branch
(agent for backups, not us).

For a first implementation: obtain the **Master Key** directly (from the primary
device's `Keys` sync / provisioning per agents 2/3), and you never need AEP.

---

## 2. Storage Service protocol

### 2.1 Architecture & the two servers

There are **two** server roles, and they are easy to confuse:

1. **The chat server** (`chat.signal.org`) hosts `SecureStorageController`
   (`@Path("/v1/storage")`, `@GET /auth`, `Signal-Server`
   `SecureStorageController.java:21,38-50`). Its **only** storage endpoint is
   `GET /v1/storage/auth`, which issues an `ExternalServiceCredentials` (username +
   password) scoped to your account UUID
   (`SecureStorageController.java:49-50 generateForUuid`).
2. **The storage-service microservice** (separate host; the `storageClients` pool in
   `PushServiceSocket`) hosts the actual item endpoints
   (`/v1/storage`, `/v1/storage/read`, `/v1/storage/manifest`). You authenticate to it
   with **HTTP Basic auth** using the username/password from step 1
   (`StorageServiceApi.kt:33-37` builds `Credentials.basic(username, password)`;
   `PushServiceSocket.java:1494-1496` sends it as the `Authorization` header).

⚠️ The storage-service microservice source is **not** in the `Signal-Server` clone
(it's a separate repo). All endpoint semantics below are taken from the **client** side
(`StorageServiceApi.kt`, `PushServiceSocket.java`) and the response-code handling in
`makeStorageRequest`, which is authoritative for the wire contract the client expects.

### 2.2 The protos (StorageService.proto, package `signalservice`)

Source: `Signal-Android/lib/libsignal-service/src/main/protowire/StorageService.proto`.
proto3.

#### Transport / container messages

```protobuf
message StorageManifest {           // line 19
  uint64 version = 1;               // monotonically increasing
  bytes  value   = 2;              // AES-GCM(ManifestKey, ManifestRecord-bytes)
}

message StorageItem {               // line 24
  bytes key   = 1;                  // the 16-byte raw id
  bytes value = 2;                  // AES-GCM(ItemKey, StorageRecord-bytes)
}

message StorageItems {              // line 29
  repeated StorageItem items = 1;
}

message ReadOperation {             // line 33  (body of PUT /v1/storage/read)
  repeated bytes readKey = 1;       // the raw 16-byte ids you want
}

message WriteOperation {            // line 37  (body of PUT /v1/storage)
           StorageManifest manifest   = 1;   // the NEW manifest (version = old+1)
  repeated StorageItem     insertItem = 2;   // records to add/replace
  repeated bytes           deleteKey  = 3;   // raw ids to remove
           bool            clearAll   = 4;   // wipe everything (force-push only)
}
```

#### ManifestRecord (the decrypted list of everything)

```protobuf
message ManifestRecord {            // line 44
  message Identifier {              // line 45
    enum Type {                     // line 46
      UNKNOWN                 = 0;
      CONTACT                 = 1;
      GROUPV1                 = 2;
      GROUPV2                 = 3;
      ACCOUNT                 = 4;
      STORY_DISTRIBUTION_LIST = 5;
      // note: 6 is skipped
      CALL_LINK               = 7;
      CHAT_FOLDER             = 8;
      NOTIFICATION_PROFILE    = 9;
    }
    bytes raw  = 1;                 // the 16-byte storage id
    Type  type = 2;
  }
           uint64     version      = 1;   // == enclosing StorageManifest.version
  repeated Identifier identifiers  = 2;   // EVERY record currently in your store
           uint32     sourceDevice = 3;   // device id that wrote this manifest
           bytes      recordIkm    = 4;   // 32B; present => SSRE2 item-key scheme
}
```

**Unknown types are preserved**, not dropped: a record whose `type` the client doesn't
recognize is kept as an opaque `StorageId` and round-tripped, so newer clients on other
devices don't lose data (`StorageServiceService.kt:143-149`, `StorageId.isUnknown`).
When re-serializing an unknown-typed id, the writer sets `Type.UNKNOWN` and re-attaches
the original integer as an unknown protobuf field #2
(`StorageServiceService.kt:194-200`).

#### StorageRecord (the decrypted per-item payload)

```protobuf
message StorageRecord {             // line 69
  oneof record {
    ContactRecord               contact               = 1;
    GroupV1Record               groupV1               = 2;
    GroupV2Record               groupV2               = 3;
    AccountRecord               account               = 4;
    StoryDistributionListRecord storyDistributionList = 5;
    // 6 skipped
    CallLinkRecord              callLink              = 7;
    ChatFolderRecord            chatFolder            = 8;
    NotificationProfile         notificationProfile   = 9;
  }
}
```

The oneof field number **must match** the manifest `Identifier.Type` value
(1↔CONTACT, 3↔GROUPV2, etc.).

### 2.3 ContactRecord — THE ROSTER (every field)

`StorageService.proto:107-146`. This is the per-contact roster entry. The conversation
partner's identity, profile pointer, and per-conversation UI state all live here.

```protobuf
message ContactRecord {
  enum IdentityState { DEFAULT = 0; VERIFIED = 1; UNVERIFIED = 2; }   // line 108
  message Name { string given = 1; string family = 2; }              // line 114
```

| # | Type | Field | Meaning |
|---|---|---|---|
| 1 | string | `aci` | ACI as canonical UUID string (legacy text form) |
| 2 | string | `e164` | phone number, `+` E.164 |
| 15 | string | `pni` | PNI as `PNI:`-style UUID string (legacy text form) |
| 3 | bytes | `profileKey` | 32B profile key (decrypts profile — agent 5) |
| 4 | bytes | `identityKey` | the contact's identity public key |
| 5 | IdentityState | `identityState` | DEFAULT / VERIFIED / UNVERIFIED |
| 6 | string | `givenName` | profile given name (Signal-profile, not system) |
| 7 | string | `familyName` | profile family name |
| 8 | string | `username` | Signal username (`name.NN`) |
| 9 | bool | `blocked` | contact is blocked |
| 10 | bool | `whitelisted` | "profile sharing" enabled / approved conversation |
| 11 | bool | `archived` | conversation archived |
| 12 | bool | `markedUnread` | manually marked unread |
| 13 | uint64 | `mutedUntilTimestamp` | mute expiry (ms epoch; 0 = unmuted) |
| 14 | bool | `hideStory` | hide this contact's story |
| 16 | uint64 | `unregisteredAtTimestamp` | when seen as unregistered (ms; 0 = registered) |
| 17 | string | `systemGivenName` | from device address book |
| 18 | string | `systemFamilyName` | from device address book |
| 19 | string | `systemNickname` | system contact nickname |
| 20 | bool | `hidden` | hidden from contact list |
| 21 | bool | `pniSignatureVerified` | PNI↔ACI signature verified |
| 22 | Name | `nickname` | user-set nickname {given, family} |
| 23 | string | `note` | freeform user note |
| 24 | optional AvatarColor | `avatarColor` | pinned avatar color (see enum below) |
| 25 | bytes | `aciBinary` | **16-byte** ACI UUID (preferred over #1) |
| 26 | bytes | `pniBinary` | **16-byte** PNI UUID (preferred over #15) |

Implementation note: prefer the **binary** id fields (`aciBinary`/`pniBinary`, added so
PNIs can be represented without the `PNI:` text prefix). Older records only have the
string forms; newer ones may have both. (Field comments: `proto:143-144`.)

### 2.4 GroupV1Record / GroupV2Record

```protobuf
message GroupV1Record {             // line 148  (legacy, mostly historical)
  bytes  id                  = 1;   // legacy group id
  bool   blocked             = 2;
  bool   whitelisted         = 3;
  bool   archived            = 4;
  bool   markedUnread        = 5;
  uint64 mutedUntilTimestamp = 6;
}

message GroupV2Record {             // line 157  (the live group membership entry)
  enum StorySendMode { DEFAULT = 0; DISABLED = 1; ENABLED = 2; }
  bytes         masterKey                    = 1;  // GV2 master key → derives group secrets (agent 4)
  bool          blocked                      = 2;
  bool          whitelisted                  = 3;
  bool          archived                     = 4;
  bool          markedUnread                 = 5;
  uint64        mutedUntilTimestamp          = 6;
  bool          dontNotifyForMentionsIfMuted = 7;
  bool          hideStory                    = 8;
  // 9 reserved (was storySendEnabled)
  StorySendMode storySendMode                = 10;
  optional AvatarColor avatarColor           = 11;
  bytes         verifiedNameHash             = 12; // SHA-256 of last-verified decrypted title
}
```

The roster's **group membership** is exactly this list of `GroupV2Record`s. The
`masterKey` (32B) is the only crypto material you need from here; everything zk
(group id, members, decrypting the title) is agent 4's job — this record just tells you
*which* groups you're in and their per-conversation UI flags.

### 2.5 AccountRecord — your own profile & app settings (key fields)

`StorageService.proto:183-308`. This is the singleton record of type `ACCOUNT`. Full
field list is large; the load-bearing ones:

| # | Type | Field | Meaning |
|---|---|---|---|
| 1 | bytes | `profileKey` | **your own** 32B profile key |
| 2 | string | `givenName` | your profile given name |
| 3 | string | `familyName` | your profile family name |
| 4 | string | `avatarUrlPath` | your profile avatar URL path |
| 12 | PhoneNumberSharingMode | `phoneNumberSharingMode` | EVERYBODY/NOBODY |
| 13 | bool | `unlistedPhoneNumber` | not discoverable by number |
| 14 | repeated PinnedConversation | `pinnedConversations` | pinned chats (contact/group/release-notes) |
| 16 | Payments | `payments` | `{bool enabled=1; bytes entropy=2}` |
| 20 | repeated string | `preferredReactionEmoji` | custom reaction set |
| 21 | bytes | `subscriberId` | donation subscriber id |
| 22 | string | `subscriberCurrencyCode` | |
| 33 | string | `username` | your Signal username |
| 35 | UsernameLink | `usernameLink` | `{bytes entropy=1; bytes serverId=2; Color color=3}` |
| 6/7/8 | bool | `readReceipts` / `sealedSenderIndicators` / `typingIndicators` | privacy toggles |
| 11 | bool | `linkPreviews` | |
| 17 | uint32 | `universalExpireTimer` | default disappearing-msg timer |
| 40 | optional uint64 | `backupTier` | backup tier (zkgroup int; unset if off) |
| 41 | IAPSubscriberData | `backupSubscriberData` | |

Note: **the masterKey is NOT in AccountRecord.** (Older clients carried it in some
sync flows, but it is not a field here — `e164` at #19 is even reserved/removed.) The
masterKey reaches a linked device through the `Keys` SyncMessage / provisioning, not
through storage service (agents 2/3). Nested messages of interest for completeness:
`PinnedConversation` (oneof contact/legacyGroupId/groupMasterKey/releaseNotes,
`proto:191-206`), `UsernameLink` (`:208-224`), `IAPSubscriberData` (`:226-235`),
`Payments` (`:178-181`).

### 2.6 Other StorageRecord variants (field numbers)

- **StoryDistributionListRecord** (`proto:310-318`): `identifier`=1 (bytes),
  `name`=2, `recipientServiceIds`=3 (repeated string), `deletedAtTimestamp`=4,
  `allowsReplies`=5, `isBlockList`=6, `recipientServiceIdsBinary`=7 (repeated bytes,
  binary service id form).
- **CallLinkRecord** (`proto:320-325`): `rootKey`=1 (bytes), `adminPasskey`=2 (bytes),
  `deletedAtTimestampMs`=3 (uint64). (4 reserved — was unused `epoch`.)
- **ChatFolderRecord** (`proto:341-360`): `identifier`=1, `name`=2, `position`=3,
  `showOnlyUnread`=4, `showMutedChats`=5, `includeAllIndividualChats`=6,
  `includeAllGroupChats`=7, `folderType`=8 (UNKNOWN/ALL/CUSTOM),
  `includedRecipients`=9, `excludedRecipients`=10 (both `repeated Recipient`),
  `deletedAtTimestampMs`=11.
- **NotificationProfile** (`proto:362-387`): `id`=1, `name`=2, `emoji`=3 (optional),
  `color`=4 (fixed32, 0xAARRGGBB), `createdAtMs`=5, `allowAllCalls`=6,
  `allowAllMentions`=7, `allowedMembers`=8 (`repeated Recipient`),
  `scheduleEnabled`=9, `scheduleStartTime`=10 (uint32 HHMM), `scheduleEndTime`=11,
  `scheduleDaysEnabled`=12 (`repeated DayOfWeek`), `deletedAtTimestampMs`=13.
- **Recipient** (`proto:327-339`): oneof `contact`=1 (`{serviceId=1, e164=2,
  serviceIdBinary=3}`) / `legacyGroupId`=2 / `groupMasterKey`=3.
- **AvatarColor** enum (`proto:92-105`): A100=0 … A210=11. If unset, computed from
  `SHA-256(CONTACT_ID)[0] % colorCount` where CONTACT_ID = first of
  {binary ACI, e164, binary PNI, group id}; once set it never changes (`proto:83-91`).
- **OptionalBool** enum (`proto:13-17`): UNSET=0, ENABLED=1, DISABLED=2.

### 2.7 Record encryption — the AES-GCM scheme (verbatim)

`SignalStorageCipher.kt` (object `SignalStorageCipher`):

```
encrypt(key, data):                          // SignalStorageCipher.kt:22-44
  iv  = 12 random bytes                       // IV_LENGTH = 12  (line 19)
  ct  = AES/GCM/NoPadding, 128-bit tag, SecretKeySpec(key,"AES"), GCMParameterSpec(128, iv)
  return iv || ct                             // 12-byte IV PREPENDED to ciphertext+tag

decrypt(key, blob):                          // SignalStorageCipher.kt:48-69
  iv  = blob[0..12]
  ct  = blob[12..]
  return AES/GCM decrypt(ct) with iv          // throws InvalidKeyException on tamper
```

So every `StorageManifest.value` and every `StorageItem.value` is exactly
`IV(12) || AES-256-GCM-ciphertext || GCM-tag(16)`. **No associated data (AAD)** is
passed (`cipher.init(...)` is followed directly by `doFinal(data)` with no
`updateAAD`). Tag length = 128 bits (`GCMParameterSpec(128, iv)`).

Putting it together (`StorageServiceService.kt`):

```
Encrypt a record for upload (toRemote, :306-314):
  key = manifest.recordIkm ? recordIkm.deriveStorageItemKey(id.raw)        // HKDF
                           : storageKey.deriveItemKey(id.raw)              // HMAC legacy
  StorageItem{ key = id.raw(16B), value = SignalStorageCipher.encrypt(key, StorageRecord.encode()) }

Encrypt the manifest for upload (:204-216):
  manifestKey = storageKey.deriveManifestKey(version)                       // HMAC "Manifest_<v>"
  StorageManifest{ version, value = SignalStorageCipher.encrypt(manifestKey, ManifestRecord.encode()) }

Decrypt an item (toLocal, :296-304):  symmetric — same key selection, then decrypt, then decode StorageRecord
Decrypt the manifest (toLocal, :278-293): manifestKey = storageKey.deriveManifestKey(this.version)
```

### 2.8 Endpoints (client-authoritative)

All against the **storage-service host**, HTTP Basic auth from `GET /v1/storage/auth`.
Bodies are protobuf with `Content-Type: application/x-protobuf`
(`PushServiceSocket.java:1290-1292 protobufRequestBody`).

| Method | Path | Body | Success | Notable failures |
|---|---|---|---|---|
| GET | `/v1/storage/auth` | — | 200 JSON `{username,password}` (`StorageAuthResponse`) | issued by chat server, not storage host |
| GET | `/v1/storage/manifest` | — | 200 `StorageManifest` | 404 = no manifest yet (new account) |
| GET | `/v1/storage/manifest/version/{version}` | — | 200 `StorageManifest` (remote is newer) | **204 = you're up to date** (same version) |
| PUT | `/v1/storage/read` | `ReadOperation` | 200 `StorageItems` | — |
| PUT | `/v1/storage` | `WriteOperation` | 200 (empty) | **409 = version conflict**, body is the current `StorageManifest` (binary) |
| GET | `/ping` | — | 200 | reachability check, no auth |

Citations: `StorageServiceApi.kt:33-100`, `PushServiceSocket.java:603-625`.

Response-code handling (`PushServiceSocket.java:1513-1547`, `makeStorageRequest`):
- 204 → treated as "no content" (used by the version-checked manifest GET to mean
  "same version, nothing returned").
- 401/403 → `AuthorizationFailedException` (re-fetch `/v1/storage/auth`).
- 404 → `NotFoundException` (no manifest).
- **409 → `ContactManifestMismatchException(body)`** where the body is the **current
  remote `StorageManifest` bytes** — i.e., the conflict response *gives you* the
  manifest you raced against, so you can re-diff without a second GET.
- 429 → `RateLimitException`. 499 → `DeprecatedVersionException`.

The write contract: your `WriteOperation.manifest.version` **must equal
remoteVersion + 1**; otherwise 409 (`StorageServiceApi.kt:80-83`).

### 2.9 The sync algorithm (StorageSyncJob)

ASCII overview (`StorageSyncJob.kt:247-420`, `StorageSyncHelper.findIdDifference`
`:69-99`):

```
storageKey = masterKey.deriveStorageServiceKey()        // StorageSyncJob.kt:203-207

── REMOTE → LOCAL (pull) ────────────────────────────────────────────────
1. GET /v1/storage/manifest/version/{localManifest.version}
      204 SameVersion  → already current, skip to push step
      200 DifferentVersion(remoteManifest)
2. If remoteManifest.version > localManifest.version:
     idDiff = findIdDifference(remoteIds, localIds)      // by 16B raw id
        remoteOnly = remoteIds − localIds   (new/changed remote records to fetch)
        localOnly  = localIds  − remoteIds   (records remote dropped → delete locally)
        typeMismatch: same raw id, different type  → schedule a FORCE PUSH (primary only)
     PUT /v1/storage/read { readKey = remoteOnly raw ids }   (batched ≤ 1000, :44)
        → decrypt each StorageItem (item-key selected via remoteManifest.recordIkm)
        → apply per-type record processors (Contact/GV2/Account/…)
        → unknown-typed records stored opaquely, round-tripped
     save remoteManifest as the new local manifest
   elif remoteManifest.version < localManifest.version:  user likely switched accounts

── recordIkm guard ──────────────────────────────────────────────────────
3. If remoteManifest.recordIkm == null (server supports SSRE2 but ikm missing):
     enqueue StorageForcePushJob and stop.               // :360-364

── LOCAL → REMOTE (push) ─────────────────────────────────────────────────
4. Recompute idDiff against (now-merged) local state:
        remoteInserts = build StorageRecords for localOnly ids   (encrypt each)
        remoteDeletes = remoteOnly raw ids
   newManifest = { version = remoteManifest.version + 1,
                   sourceDeviceId = thisDevice,
                   recordIkm = remoteManifest.recordIkm,     // carried forward
                   storageIds = all current local ids }
5. If non-empty:  PUT /v1/storage  WriteOperation{ newManifest, insertItem, deleteKey }
      200 → save newManifest locally; trigger multi-device sync
      409 ConflictError → set localManifestOutOfDate = true; throw RetryLater
           (next run re-pulls the manifest the 409 body handed back and re-diffs)
```

Merge/conflict rules at a practical level:
- **Identity = the 16-byte raw id.** Two records "match" iff their raw ids are equal.
  A changed contact = same id, new encrypted value (so changes propagate as a delete of
  the old id + insert of a fresh id, or replace-in-place by re-inserting the same id;
  Signal generally **rotates the storage id on change**, hence diff-by-id works).
- **Type mismatch** (same id, different `type`) is treated as corruption →
  the primary schedules a **force push** that rewrites the whole store with `clearAll`
  (`StorageServiceService.resetAndWriteStorageRecords` → `WriteOperation.clearAll=true`).
- **Optimistic concurrency:** every write bumps `version` by exactly 1; a concurrent
  writer causes 409, and you retry against the manifest the 409 returned. There is **no
  field-level merge** at the storage layer — it's last-writer-wins per record id, with
  the application-level record processors deciding how to reconcile a remote record into
  the local DB.
- **Unknown records are never deleted just because this client can't parse them**;
  they're preserved so other devices/newer clients keep their data.

`StorageForcePushJob` / `StorageRotateManifestJob` exist for recovery (undecryptable
data, AEP rotation): force-push uses `clearAll=true` and regenerates fresh ids + a fresh
recordIkm; rotate-manifest writes the unchanged manifest under a new key after an AEP
change (`StorageServiceService.writeUnchangedManifest`, `:179-183`).

---

## 3. CDSI — Contact Discovery (resolve E164 → ACI/PNI)

### 3.1 Purpose

CDSI answers: "given these phone numbers from my address book, which are on Signal, and
what are their ACI/PNI?" Without it you can message any service id you *already* know
(from incoming messages, ContactRecords, group rosters) but you can't *discover* a new
number. It is an **attested SGX enclave** service, reached over a websocket carrying a
Noise-encrypted tunnel — fundamentally different from the plain-HTTPS storage service.

### 3.2 Connection & attestation (⚠️ heavy — needs native libsignal)

- **Host:** `cdsi.signal.org` (staging `cdsi.staging.signal.org`)
  — `libsignal/rust/net/src/env.rs:127,145`.
- **Endpoint:** websocket to `/v1/{hex(enclaveId)}/discovery`
  — `libsignal/rust/net/src/enclave.rs:59-61`
  (`format!("/v1/{}/discovery", hex::encode(enclave))`). The `enclaveId` is the
  expected `MrEnclave` measurement, baked into the client config.
- **Tunnel:** a **Noise** handshake runs *inside* the websocket, then all
  ClientRequest/ClientResponse bytes are Noise-encrypted. Patterns
  (`libsignal/rust/attest/src/client_connection.rs:17-18`):
  - `Noise_NK_25519_ChaChaPoly_SHA256`
  - `Noise_NKhfs_25519+Kyber1024_ChaChaPoly_SHA256` (hybrid forward-secret, post-quantum)
- **Remote attestation:** the enclave sends `ClientHandshakeStart{ evidence,
  endorsement, testonlyPubkey }` (`CDSI.proto:85-95`). The client must verify the SGX
  quote/evidence against the pinned `MrEnclave` before trusting the Noise static key.
  This is the hard part: parsing/validating SGX DCAP quotes + endorsements is exactly
  what `libsignal/rust/attest` (`cds2`, `sgx_session`) does in Rust. **⚠️ Deep enclave
  verification is heavy and security-critical — defer to native libsignal; do not
  hand-roll attestation.**
- **Auth:** HTTP Basic-style `Auth { username, password }` for the websocket connection
  (`libsignal/rust/net/examples/cdsi_lookup.rs:45-62`; the credentials come from a
  Signal-Server endpoint analogous to storage auth).

### 3.3 The protos (CDSI.proto, package `org.signal.cdsi`)

Source: `Signal-Android/.../protowire/CDSI.proto` (mirrored by
`libsignal/rust/net/src/proto/cds2.proto`, same field numbers).

```protobuf
message ClientRequest {                       // CDSI.proto:8
  bytes aciUakPairs           = 1;  // concat of 32B pairs: 16B ACI || 16B UAK (access key)
  bytes prevE164s             = 2;  // concat of 8B big-endian E164s (already-known, for rate discount)
  bytes newE164s              = 3;  // concat of 8B big-endian E164s (new lookups)
  bytes discardE164s          = 4;  // E164s to drop from a prior token's set
  // 5 reserved (was has_more)
  bytes token                 = 6;  // rate-limit token from a previous response (optional)
  bool  tokenAck              = 7;  // send a message with ONLY this set to ack a new token
  bool  returnAcisWithoutUaks = 8;  // (Android proto) ask server to return ACI even w/o UAK match
                                    // NOTE: libsignal rust marks #8 reserved/deprecated (cds2.proto:30)
}

message ClientResponse {                      // CDSI.proto:37
  bytes e164PniAciTriples = 1;  // concat of 34B triples: 8B E164 || 16B PNI || 16B ACI
                                //   not-found  → PNI and ACI all-zero
                                //   PNI found, ACI not → PNI nonzero, ACI all-zero
  int32 retryAfterSecs    = 2;  // (Android) set on quota exhaustion; rust marks #2 reserved
  bytes token             = 3;  // new rate-limit token to reuse next time
  int32 debugPermitsUsed  = 4;  // permits deducted (debug)
}

message ClientHandshakeStart {                // CDSI.proto:85  (enclave → client, attestation)
  bytes testonlyPubkey = 1;     // test-only enclave pubkey
  bytes evidence       = 2;     // SGX remote-attestation evidence
  bytes endorsement    = 3;     // endorsements of that evidence
}
// EnclaveLoad (proto:70) is server-internal (loading tuples into the enclave) — not a client message.
```

Field layout details that matter (from libsignal parsing):
- E164 = **8 bytes big-endian** integer (e.g. `+15551234567` → the number `15551234567`
  as a u64) — `cdsi.rs:84-89`, `LookupResponseEntry::SERIALIZED_LEN = 8 + 16 + 16 = 40`
  ⚠️ (the response **triple** is 40 bytes in libsignal's `LookupResponseEntry`:
  `E164(8) + Uuid(16)*2`; the proto comment says "(2+32)" referring to protobuf framing
  overhead, not the binary triple — use 8+16+16). Confirmed `cdsi.rs:195-196`.
- `aciUakPairs` = repeated 32B (16B ACI UUID || 16B unidentified-access-key)
  — `cdsi.rs:66-80` (`AciAndAccessKey`, SERIALIZED_LEN=32). These let the server return
  the ACI for a number when your access key matches the contact's profile policy.
- A returned PNI/ACI of all-zeros (nil UUID) means "absent"; libsignal maps nil → `None`
  (`cdsi.rs:166-191`).

### 3.4 The lookup sequence (libsignal `cdsi.rs`)

```
1. connect_with(...)            → CdsiConnection over an AttestedConnection (Noise+attest)   :302-322
2. send_request(LookupRequest)  → encode ClientRequest, send Noise-encrypted bytes           :324-347
                                   first ClientResponse carries ONLY a fresh `token`
                                   (error if token empty)                                     :337-341
3. ClientResponseCollector.collect():                                                         :350-383
     send ClientRequest{ token_ack = true }            (ack the token)                        :354-359
     receive ClientResponse (first chunk of triples)
     loop: receive_bytes → response.merge(chunk)  until a Normal websocket close (4000s)      :362-381
     parse merged e164PniAciTriples into LookupResponseEntry{ e164, aci?, pni? }              :135-162
```

So the flow is two round trips: (a) request → token, (b) token-ack → streamed triples
until the enclave closes the socket normally.

### 3.5 Rate-limit token reuse

The server hands back a `token` (ClientResponse #3). On the *next* lookup you set
`ClientRequest.token` and move the previously-queried numbers into `prevE164s`; the
server then only charges rate-limit quota for the **new** `newE164s`, discounting the
prev set (`CDSI.proto:23-30, 59-62`; `cdsi.rs:91-114`). Quota exhaustion →
`retryAfterSecs` / a `RateLimited(RetryLater)` with a `retry_after` seconds value, and a
websocket close code **4008 (RESOURCE_EXHAUSTED)** (`CDSI.proto:52-57`,
`cdsi.rs:293-297, 229-230`). Persist the latest token between syncs to keep costs down.

### 3.6 Feasibility verdict & fallback

**Verdict: CDSI is impractical to clean-room without native libsignal.** The blocker is
not the protobufs (trivial) nor the Noise tunnel (a Noise_NK implementation is
available in JS), but **SGX remote-attestation verification** — validating DCAP quotes,
endorsement chains, and the `MrEnclave` measurement. Getting that wrong silently defeats
the entire privacy guarantee, so it must not be approximated. Without
`@signalapp/libsignal-client` (absent from node_modules) there is no off-the-shelf
attested-connection client.

**Recommended fallback (build the roster without CDSI):**
- Learn service ids from **incoming messages** (sender's ACI/PNI) — agent 3.
- Read `ContactRecord`s from the **Storage Service** — they already carry `aci`,
  `aciBinary`, `pni`, `pniBinary`, `e164` (§2.3). This is your primary roster source and
  needs no enclave.
- Learn members from **group rosters** (GV2) — agent 4.
- You **cannot** turn an arbitrary address-book phone number into a service id. Surface
  that as a known limitation (no "find friends from contacts"). If CDSI is later
  required, the clean path is to depend on native `@signalapp/libsignal-client` and call
  its CDSI lookup, rather than reimplement attestation.

---

## 4. Implementation checklist (TypeScript port)

1. **Crypto primitives:** HMAC-SHA256, HKDF-SHA256, AES-256-GCM (12B IV prepended,
   128-bit tag, no AAD). All in WebCrypto / `node:crypto`. No native dep.
2. **Key chain:** masterKey → `HMAC(masterKey,"Storage Service Encryption")` =
   storageKey → manifestKey `HMAC(storageKey,"Manifest_"+version)` → itemKey either
   `HMAC(storageKey,"Item_"+base64pad(id))` (legacy) or
   `HKDF(recordIkm, "20240801_SIGNAL_STORAGE_SERVICE_ITEM_"+id, 32)` (SSRE2).
3. **Protos:** generate from `StorageService.proto` (and `CDSI.proto` only if you
   pursue CDSI). Keep unknown-field round-tripping for unknown manifest types.
4. **Auth:** `GET /v1/storage/auth` (on chat host) → Basic creds → use on storage host.
5. **Sync loop:** version-checked manifest GET (handle 204), diff by 16B id, batched
   `/v1/storage/read` (≤1000), apply, then `PUT /v1/storage` with version+1 and handle
   409 (re-diff against the manifest in the 409 body).
6. **CDSI:** stub out; rely on ContactRecord/messages/groups for service ids (§3.6).

---

## Source files

Signal-Android (`Signal-Android` @ main):
- StorageService.proto — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/protowire/StorageService.proto
- CDSI.proto — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/protowire/CDSI.proto
- MasterKey.kt — https://github.com/signalapp/Signal-Android/blob/main/core/models-jvm/src/main/java/org/signal/core/models/MasterKey.kt
- StorageKey.kt — https://github.com/signalapp/Signal-Android/blob/main/core/models-jvm/src/main/java/org/signal/core/models/storageservice/StorageKey.kt
- StorageItemKey.kt / StorageManifestKey.kt / StorageCipherKey.kt — https://github.com/signalapp/Signal-Android/blob/main/core/models-jvm/src/main/java/org/signal/core/models/storageservice/
- AccountEntropyPool.kt — https://github.com/signalapp/Signal-Android/blob/main/core/models-jvm/src/main/java/org/signal/core/models/AccountEntropyPool.kt
- RecordIkm.kt — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/storage/RecordIkm.kt
- SignalStorageCipher.kt — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/storage/SignalStorageCipher.kt
- SignalStorageManifest.kt — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/storage/SignalStorageManifest.kt
- StorageId.java — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/storage/StorageId.java
- StorageServiceApi.kt — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/storage/StorageServiceApi.kt
- StorageServiceService.kt — https://github.com/signalapp/Signal-Android/blob/main/lib/network/src/main/java/org/signal/network/service/StorageServiceService.kt
- PushServiceSocket.java — https://github.com/signalapp/Signal-Android/blob/main/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/PushServiceSocket.java
- StorageSyncJob.kt — https://github.com/signalapp/Signal-Android/blob/main/app/src/main/java/org/thoughtcrime/securesms/jobs/StorageSyncJob.kt
- StorageSyncHelper.kt — https://github.com/signalapp/Signal-Android/blob/main/app/src/main/java/org/thoughtcrime/securesms/storage/StorageSyncHelper.kt

libsignal (`libsignal` @ main):
- rust/net/src/cdsi.rs — https://github.com/signalapp/libsignal/blob/main/rust/net/src/cdsi.rs
- rust/net/src/enclave.rs — https://github.com/signalapp/libsignal/blob/main/rust/net/src/enclave.rs
- rust/net/src/env.rs — https://github.com/signalapp/libsignal/blob/main/rust/net/src/env.rs
- rust/net/src/proto/cds2.proto — https://github.com/signalapp/libsignal/blob/main/rust/net/src/proto/cds2.proto
- rust/attest/src/client_connection.rs — https://github.com/signalapp/libsignal/blob/main/rust/attest/src/client_connection.rs
- rust/net/examples/cdsi_lookup.rs — https://github.com/signalapp/libsignal/blob/main/rust/net/examples/cdsi_lookup.rs

Signal-Server (`Signal-Server` @ main):
- SecureStorageController.java (issues /v1/storage/auth) — https://github.com/signalapp/Signal-Server/blob/main/service/src/main/java/org/whispersystems/textsecuregcm/controllers/SecureStorageController.java

⚠️ Not in any clone (separate repos): the **storage-service** microservice (the GET/PUT
`/v1/storage*` item endpoints) and the **CDSI enclave** service. Endpoint semantics
above are taken from the authoritative *client* code and verified against client-side
response-code handling.
