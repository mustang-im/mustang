# Signal Groups V2 — Wire Protocol (clean-room reference)

Based on main-branch clones, 2026-06-16.

Source commits used throughout (permalink base for all citations at the bottom):
- `signalapp/Signal-Android` @ `d6871f8dc2d12a5b74ac0501bcf73ccec38064fd`
- `signalapp/libsignal` @ `a85f3c0d892a14d32b76fd724d07fec4a23821f0`
- `signalapp/Signal-Server` @ `adb5b6a4ea01bae52d0d6479541435697a1bcce7`

This document covers Groups V2 end-to-end: the key hierarchy, zkgroup auth, the group-cloud
HTTP endpoints, every protobuf field, field-level encryption, the decrypted client view, the
`DataMessage` group context, admin/access semantics, and group-send relationship to sender keys.

> Boundaries (other agents): storage-service record sync internals = agent 6 (we only touch
> `GroupV2Record.masterKey`); profiles / profile-key-credentials issuance = agent 5; message
> content / sender keys = agent 3; transport / sealed sender = agent 1.

> ⚠️ **Repo gap:** the actual **GroupsController** lives in the `org.signal.storageservice`
> package, which is a **separate repository** (the "storage service" / group cloud). It is **not
> present** in the cloned `Signal-Server` (that clone only contains the main chat server, where
> the group *auth-credential* endpoint lives). The endpoint paths, request/response bodies, and
> status codes documented below for `/v2/groups...` are reconstructed from the **client side**
> (Android `PushServiceSocket` / `GroupsV2Api`), which is authoritative for the wire format the
> client produces and expects. Server-internal validation rules are flagged ⚠️ where I could not
> read the server source.

---

## 0. TL;DR feasibility verdict

zkgroup is a **Ristretto255 anonymous-credential cryptosystem** (Chase–Perrin–Zaverucha KVAC +
verifiable ElGamal-like encryption + poksho Sigma proofs + AES-256-GCM-SIV blob encryption). It is
**very hard to port to pure TypeScript** (needs non-standard curve25519-dalek functions: Lizard
map, single-Elligator, etc.).

**BUT** the official native package **`@signalapp/libsignal-client` (npm, currently 0.96.1)** ships
**prebuilt Node native binaries for linux/darwin/win × x64/arm64** and exports the entire zkgroup
API. It is a Node addon → works in **Electron / Node** (this codebase), **not** in a pure browser.
**It is NOT currently installed** (`/workspace/app/node_modules/@signalapp` does not exist).

→ **Groups V2 is feasible IF we add `@signalapp/libsignal-client` as a dependency.** Porting
zkgroup ourselves is not realistic. See §11 for the full analysis.

---

## 1. Key hierarchy (wire level)

```
                       GroupMasterKey  (32 bytes)
                       │  source: DataMessage.GroupContextV2.masterKey  (§7)
                       │          or storage-service GroupV2Record.masterKey (agent 6)
                       │
                       │  GroupSecretParams.deriveFromMasterKey(masterKey)
                       │  = SHO(label, masterKey) → squeeze fields  (§1.1)
                       ▼
        ┌──────────────────────────────────────────────────────────┐
        │ GroupSecretParams  (289 bytes serialized)                 │
        │   reserved byte                                           │
        │   master_key (32)                                         │
        │   group_id (32)         ← GroupIdentifier                 │
        │   blob_key (32, AES-256 key for title/desc/avatar/timer)  │
        │   uid_enc_key_pair        (a1,a2 + public)               │
        │   profile_key_enc_key_pair (b1,b2 + public)             │
        └──────────────────────────────────────────────────────────┘
                       │  getPublicParams()
                       ▼
        ┌──────────────────────────────────────────────────────────┐
        │ GroupPublicParams  (97 bytes serialized)                  │
        │   reserved byte                                           │
        │   group_id (32)         ← GroupIdentifier (same 32 bytes) │
        │   uid_enc_public_key                                      │
        │   profile_key_enc_public_key                              │
        └──────────────────────────────────────────────────────────┘
                       │  getGroupIdentifier()
                       ▼
              GroupIdentifier  (32 bytes)
              = the group id used on the wire / DB key
              = GroupPublicParams.group_id
```

- `GroupMasterKey` length `GROUP_MASTER_KEY_LEN = 32`. Struct `GroupSecretParams`
  (`group_params.rs:20-33`), `GroupPublicParams` (`group_params.rs:41-47`).
- Serialized lengths: `GROUP_SECRET_PARAMS_LEN = 289`, `GROUP_PUBLIC_PARAMS_LEN = 97`,
  `GROUP_IDENTIFIER_LEN = 32` (`constants.rs:19-21`).
- The 32-byte `GroupIdentifier` IS what `Group.publicKey` carries on the wire? **No** — careful:
  `Group.publicKey` (field 1) carries the **full serialized `GroupPublicParams` (97 bytes)**, not
  the 32-byte id. The 32-byte `GroupIdentifier` is derived from those public params and is what the
  *server* uses as the group's primary key / URL identity. (Android sets
  `publicKey = groupSecretParams.getPublicParams().serialize()`,
  `GroupsV2Operations.java:117`.)

### 1.1 `GroupSecretParams.deriveFromMasterKey` (exact)

`group_params.rs:67-86`. A poksho **Stateful Hash Object (SHO)** is seeded with a verbatim domain
label and the 32-byte master key, then squeezed field-by-field **in this order**:

```
sho = Sho::new(b"Signal_ZKGroup_20200424_GroupMasterKey_GroupSecretParams_DeriveFromMasterKey",
               master_key.bytes)        // group_params.rs:68-71
group_id  = sho.squeeze(32)             // GroupIdentifierBytes  (line 72)
blob_key  = sho.squeeze(32)             // AES-256 key for blobs  (line 73)
uid_enc_key_pair         = uid_encryption::KeyPair::derive_from(sho)          (line 74)
profile_key_enc_key_pair = profile_key_encryption::KeyPair::derive_from(sho)  (line 75-76)
```

The SHO is `poksho::ShoHmacSha256` — an **HMAC-SHA256-based** sponge (zkgroup `Sho` wraps it,
`sho.rs:11-14`). Construction (`shohmacsha256.rs`): `new(label)` keys HMAC with 32 zero bytes then
`absorb_and_ratchet(label)`; `absorb(data)` re-keys with the current chaining value `cv` and
`update`s; `ratchet()` does `update(&[0x00])` then `cv = HMAC.finalize()`; `squeeze(n)` outputs in
counter blocks `HMAC(cv, be_u64(i) || 0x01)` and then advances `cv = HMAC(cv, be_u64(outlen) ||
0x02)`. Domain bytes: **0x00 ratchet, 0x01 output, 0x02 next-state.** This must be byte-exact for
any cross-impl. (Not needed if using `@signalapp/libsignal-client`, which does it natively.)

The master key can also be **generated** fresh (new group):
`GroupSecretParams::generate(randomness)` =
`Sho::new(b"Signal_ZKGroup_20200424_Random_GroupSecretParams_Generate", randomness)` → squeeze 32
→ master key → `derive_from_master_key` (`group_params.rs:58-65`).

---

## 2. zkgroup auth credentials

Group-cloud requests are **not** basic-auth'd with the account password. They authenticate with a
**zero-knowledge `AuthCredentialPresentation`** that proves "I am a member of the group identified
by these public params, for this redemption day" without revealing the account to the group server.

### 2.1 Fetch auth credentials (this endpoint IS on the main chat server)

```
GET /v1/certificate/auth/group?redemptionStartSeconds={start}&redemptionEndSeconds={end}
Auth: normal authenticated account/device (websocket auth)
200 → GroupCredentials (JSON)
```

- Client call + exact querystring: `GroupsV2ApiHelper.kt:23-31` (over the authenticated
  websocket). Returns **7 days** of credentials (`getCredentials` adds `7.days`,
  `GroupsV2ApiHelper.kt:29`).
- Server handler: `CertificateController.getGroupAuthenticationCredentials`
  (`CertificateController.java:90-128`). Query params `redemptionStartSeconds`,
  `redemptionEndSeconds`. The server builds a `RedemptionRange.inclusive(start, end)` and iterates
  **one credential per day**; max range `MAX_REDEMPTION_DURATION = Duration.ofDays(7)`
  (`CertificateController.java:56`).
- For each daily redemption instant it issues
  `serverZkAuthOperations.issueAuthCredentialWithPniZkc(aci, pni, redemption)`
  (`CertificateController.java:117`). The current credential type is **v4 "Zkc"**.

**Response JSON shape** (`GroupCredentials.java`):
```jsonc
{
  "credentials": [ { "credential": <bytes>, "redemptionTime": <epoch-seconds> }, ... ],   // one per day
  "callLinkAuthCredentials": [ { "credential": <bytes>, "redemptionTime": <seconds> }, ... ],
  "pni": "<uuid>"
}
```
`redemptionTime` is **day-aligned epoch seconds** (`(int) redemption.getEpochSecond()`,
`CertificateController.java:120`). Each `credential` byte blob is an
`AuthCredentialWithPniResponse.serialize()` (`AUTH_CREDENTIAL_WITH_PNI_RESPONSE_LEN = 425`,
`constants.rs:29`).

Client parses each into an `AuthCredentialWithPniResponse` keyed by `redemptionTime`
(`GroupsV2Api.java:191-219`). Cache for ~7 days.

### 2.2 Derive `AuthCredentialWithPni`, then build the presentation

`GroupsV2Api.getGroupsV2AuthorizationString` (`GroupsV2Api.java:67-79`):

```
authOps = ClientZkAuthOperations
authCredentialWithPni =
    authOps.receiveAuthCredentialWithPniAsServiceId(aci, pni, redemptionTimeSeconds, response)
authCredentialPresentation =
    authOps.createAuthCredentialPresentation(SecureRandom, groupSecretParams, authCredentialWithPni)
return GroupsV2AuthorizationString(groupSecretParams, authCredentialPresentation)
```

Crypto (`zkgroup`):
- `receive` (`auth_credential_with_pni/zkc.rs:67-128`): version-checks (only v3 "Zkc"
  supported), **rejects a non-day-aligned redemption_time** (`zkc.rs:108`), and verifies the
  issuance proof binding hidden attrs `UidStruct(aci)`, `UidStruct(pni)` and public attr
  `redemption_time` under credential label `b"20240222_Signal_AuthCredentialZkc"` (`zkc.rs:20`).
- `present` (`zkc.rs:131-172`): produces a `PresentationProof` plus `aci_ciphertext` and
  `pni_ciphertext` **encrypted under the group's `uid_enc_key_pair`** — so the group server learns
  only the encrypted ACI/PNI (the same ciphertexts that appear in the group state), proving the
  presenter owns a credential for those encrypted identities at `redemption_time`. Presentation
  struct (`zkc.rs:41-48`): `{version, proof, aci_ciphertext, pni_ciphertext, redemption_time}`.
- Presentation wire version byte = `PRESENTATION_VERSION_4 = 3` (`constants.rs:13`). Length
  `AUTH_CREDENTIAL_PRESENTATION_V2_LEN = 461` for the older v2 (`constants.rs:24`); v4 length is
  not a single named constant.

### 2.3 The Authorization header for group-cloud requests

⚠️ Counter-intuitive: the zk presentation is wrapped in an **HTTP Basic** header, but the
username/password are **not** account creds — they are the **group public params** and the
**presentation**, both hex-encoded.

`GroupsV2AuthorizationString` (`GroupsV2AuthorizationString.java:13-18`):
```
username = hex(  GroupSecretParams.getPublicParams().serialize()  )   // 97-byte public params
password = hex(  AuthCredentialPresentation.serialize()           )   // the zk presentation
Authorization: Basic base64(username + ":" + password)
```
So the group server reads the group identity from the username and the membership proof from the
password. There is **no per-account secret** in this header — the credential is anonymous.

---

## 3. Group-cloud HTTP endpoints

All requests below carry the §2.3 `Authorization: Basic <hex pubparams>:<hex presentation>` header
and use protobuf bodies. Client side: `PushServiceSocket` (`makeStorageRequest`) +
`GroupsV2Api`. Path constants `PushServiceSocket.java:168-174`.

Every response handler **requires an `X-Signal-Timestamp` response header** or it synthesizes a
500 (`PushServiceSocket.java:1886,1894,1905,1926`).

| Method & Path | Purpose | Request body | Response body | Notable statuses |
|---|---|---|---|---|
| `PUT /v2/groups/` | Create group | `Group` (full new state, version=0) | `GroupResponse` | **409 → group already exists** (`GROUPS_V2_PUT_RESPONSE_HANDLER`, `:1890`) |
| `GET /v2/groups/` | Fetch current group state | — | `GroupResponse` | 403 → not in group; 404 → group not found (`:1899-1900`) |
| `PATCH /v2/groups/` | Submit a `GroupChange.Actions`; server signs & applies | `GroupChange.Actions` | `GroupChangeResponse` (the applied `GroupChange`) | 400 → patch not accepted (JSON `{message}`); **423 → group terminated** (`:1909-1922`) |
| `PATCH /v2/groups/?inviteLinkPassword={b64url}` | Same, but joining via invite link | `GroupChange.Actions` | `GroupChangeResponse` | as above (`:1983-1984`) |
| `GET /v2/groups/logs/{fromVersion}?maxSupportedChangeEpoch={E}&includeFirstState={bool}&includeLastState=false` | Change history from a revision | — | `GroupChanges` | 200 full / **206 partial** (paged via `Content-Range`); 403/404 (`:2005-2032`) |
| `GET /v2/groups/join/{inviteLinkPassword}` | Group preview before joining (inviteLinkPassword may be empty) | — | `GroupJoinInfo` | **403 → link not active** (`X-Signal-Forbidden-Reason`); 423 → terminated (`:1930-1936`) |
| `GET /v2/groups/avatar/form` | Get a CDN upload form for the group avatar | — | `AvatarUploadAttributes` | — (`:1965-1976`) |
| `GET /v2/groups/joined_at_version` | The revision at which self joined | — | (uint32 in body) | 403/404 (`:2036-2044`) |
| `GET /v2/groups/token` | External group credential (e.g. for calls) | — | `ExternalGroupCredential` | — (`GROUPSV2_TOKEN`, `:173`) |

Notes:
- **`maxSupportedChangeEpoch`** = the highest `GroupChange.changeEpoch` this client understands.
  Android sends `HIGHEST_KNOWN_EPOCH = 7` (`GroupsV2Operations.java:78`, passed as
  `highestKnownEpoch` to `getGroupHistory`, `GroupsV2Api.java:122`). The server uses it to decide
  how far it can serve / how to encode changes. A client must **ignore** any returned change with
  `changeEpoch > HIGHEST_KNOWN_EPOCH` (Android: `decryptChange` returns empty, then re-fetches the
  full snapshot, `GroupsV2Operations.java:516-517`).
- **History paging:** a 206 carries a `Content-Range` header; the client loops until it has all
  changes (`PushServiceSocket.java:2019-2030`). Also sends a request header
  `Cached-Send-Endorsements: <seconds>` so the server can skip re-issuing endorsements
  (`:2002-2003`).
- **Avatar upload (2-step):** (1) `GET /v2/groups/avatar/form` → `AvatarUploadAttributes`
  (a presigned CDN POST form). (2) Encrypt the avatar as a `GroupAttributeBlob{avatar}` with
  `ClientZkGroupCipher.encryptBlob`, POST the ciphertext to the CDN using the form, then set
  `Group.avatarUrl` / `ModifyAvatarAction.avatar` = `form.key`
  (`GroupsV2Api.uploadAvatar`, `:158-175`).
- `revision`/`version` conflicts: a `PATCH` that targets a stale revision is rejected; the client
  must re-fetch (current snapshot or `logs/`), rebase its `Actions`, and retry. (Server returns a
  400/409-class error; exact code ⚠️ — handled client-side by `GroupChangeUtil.resolveConflict`
  in `groupsv2/`.)

---

## 4. Protobufs — `Groups.proto` (server/wire types)

File: `Signal-Android/lib/libsignal-service/src/main/protowire/Groups.proto`. `syntax = "proto3"`.
**Every field below: name = number, type.** All `bytes` "enc" fields are zkgroup ciphertexts
(see §5).

### 4.1 `Member` (`Groups.proto:26-40`)
```
enum Role { UNKNOWN=0; DEFAULT=1; ADMINISTRATOR=2; }
bytes  userId          = 1   // encrypted ACI (UuidCiphertext, 65 B)
Role   role            = 2
bytes  profileKey      = 3   // encrypted profile key (ProfileKeyCiphertext, 65 B)
bytes  presentation    = 4   // ProfileKeyCredentialPresentation (set on add; server strips after applying)
uint32 joinedAtVersion = 5
bytes  labelEmoji      = 6   // enc, decrypts to UTF-8
bytes  labelString     = 7   // enc, decrypts to UTF-8
```
On add, the client sends only `role` + `presentation` (`GroupsV2Operations.member()`,
`:426-431`); the server derives `userId`/`profileKey`/`joinedAtVersion` from the presentation.

### 4.2 `MemberPendingProfileKey` (invited member) (`Groups.proto:42-46`)
```
Member member        = 1   // role + userId(enc) only; no profileKey yet
bytes  addedByUserId = 2   // encrypted ACI of inviter
uint64 timestamp     = 3   // ms since epoch
```

### 4.3 `MemberPendingAdminApproval` (join-request) (`Groups.proto:48-53`)
```
bytes  userId       = 1   // enc ACI
bytes  profileKey   = 2   // enc profile key
bytes  presentation = 3   // ProfileKeyCredentialPresentation
uint64 timestamp    = 4
```

### 4.4 `MemberBanned` (`Groups.proto:55-58`)
```
bytes  userId    = 1   // enc service id
uint64 timestamp = 2
```

### 4.5 `AccessControl` (`Groups.proto:60-73`)
```
enum AccessRequired { UNKNOWN=0; ANY=1; MEMBER=2; ADMINISTRATOR=3; UNSATISFIABLE=4; }
AccessRequired attributes        = 1
AccessRequired members           = 2
AccessRequired addFromInviteLink = 3
AccessRequired memberLabel       = 4
```

### 4.6 `Group` (full state) (`Groups.proto:75-93`)
```
bytes         publicKey                = 1   // serialized GroupPublicParams (97 B)
bytes         title                    = 2   // enc GroupAttributeBlob{title}
bytes         description              = 11  // enc GroupAttributeBlob{descriptionText}
string        avatarUrl                = 3   // CDN key; content = enc GroupAttributeBlob{avatar}
bytes         disappearingMessagesTimer= 4   // enc GroupAttributeBlob{disappearingMessagesDuration}
AccessControl accessControl            = 5
uint32        version                  = 6   // == revision
repeated Member                     members                  = 7
repeated MemberPendingProfileKey    membersPendingProfileKey = 8   // invited
repeated MemberPendingAdminApproval membersPendingAdminApproval = 9 // join requests
bytes         inviteLinkPassword       = 10
bool          announcements_only       = 12
repeated MemberBanned               members_banned           = 13
bool          terminated               = 14
// next: 15
```

### 4.7 `GroupAttributeBlob` — the plaintext blob that gets AES-encrypted into `Group.title` etc.
(`Groups.proto:95-102`)
```
oneof content {
  string title                        = 1
  bytes  avatar                       = 2
  uint32 disappearingMessagesDuration = 3
  string descriptionText             = 4
}
```
Encode the blob → `ClientZkGroupCipher.encryptBlob` → put bytes in the corresponding `Group`/
`Action` field (e.g. `encryptTitle`, `GroupsV2Operations.java:988-996`).

### 4.8 `GroupInviteLink` (`Groups.proto:104-113`)
```
message GroupInviteLinkContentsV1 { bytes groupMasterKey = 1; bytes inviteLinkPassword = 2; }
oneof contents { GroupInviteLinkContentsV1 contentsV1 = 1; }
```
This is what a `signal.group://` / `signal.me` group link encodes (master key + link password).

### 4.9 `GroupJoinInfo` (link preview) (`Groups.proto:115-126`)
```
bytes                        publicKey            = 1   // GroupPublicParams
bytes                        title                = 2   // enc
bytes                        description          = 8   // enc
string                       avatar               = 3
uint32                       memberCount          = 4
AccessControl.AccessRequired addFromInviteLink    = 5
uint32                       version              = 6
bool                         pendingAdminApproval = 7
// next: 10
```

### 4.10 `GroupChange` (signed delta) (`Groups.proto:130-281`)
```
bytes  actions         = 1   // serialized GroupChange.Actions (signed bytes)
bytes  serverSignature = 2   // server NotarySignature over `actions`
uint32 changeEpoch     = 3   // min epoch a client needs to understand this change
```
The client **verifies** `serverSignature` over `actions` using `serverPublicParams.verifySignature`
before trusting a change (`GroupsV2Operations.getVerifiedActions`, `:1110-1126`). `actions` is then
protobuf-decoded as `GroupChange.Actions`.

### 4.11 `GroupChange.Actions` — every action type + fields (`Groups.proto:132-276`)

Top-level fields:
```
bytes  sourceUserId = 1   // enc ACI of the editor (server-provided)
bytes  group_id     = 25  // server-only; client MUST NOT set (server 400s if set) — binds signature
uint32 version      = 2   // target revision
```
Action lists/singletons (field number → action type → its fields):

| # | Field | Action message | Fields | epoch |
|---|---|---|---|---|
| 3 | `addMembers` (rep) | `AddMemberAction` | `Member added=1; bool joinFromInviteLink=2` | 0 |
| 4 | `deleteMembers` (rep) | `DeleteMemberAction` | `bytes deletedUserId=1` | 0 |
| 5 | `modifyMemberRoles` (rep) | `ModifyMemberRoleAction` | `bytes userId=1; Member.Role role=2` | 0 |
| 6 | `modifyMemberProfileKeys` (rep) | `ModifyMemberProfileKeyAction` | `bytes presentation=1; bytes user_id=2; bytes profile_key=3` | 0 |
| 7 | `addMembersPendingProfileKey` (rep) | `AddMemberPendingProfileKeyAction` | `MemberPendingProfileKey added=1` | 0 |
| 8 | `deleteMembersPendingProfileKey` (rep) | `DeleteMemberPendingProfileKeyAction` | `bytes deletedUserId=1` | 0 |
| 9 | `promoteMembersPendingProfileKey` (rep) | `PromoteMemberPendingProfileKeyAction` | `bytes presentation=1; bytes user_id=2; bytes profile_key=3` | 0 |
| 10 | `modifyTitle` | `ModifyTitleAction` | `bytes title=1` (enc blob) | 0 |
| 11 | `modifyAvatar` | `ModifyAvatarAction` | `string avatar=1` (CDN key) | 0 |
| 12 | `modifyDisappearingMessageTimer` | `ModifyDisappearingMessageTimerAction` | `bytes timer=1` (enc blob) | 0 |
| 13 | `modifyAttributesAccess` | `ModifyAttributesAccessControlAction` | `AccessControl.AccessRequired attributesAccess=1` | 0 |
| 14 | `modifyMemberAccess` | `ModifyMembersAccessControlAction` | `AccessControl.AccessRequired membersAccess=1` | 0 |
| 15 | `modifyAddFromInviteLinkAccess` | `ModifyAddFromInviteLinkAccessControlAction` | `AccessControl.AccessRequired addFromInviteLinkAccess=1` | 1 |
| 16 | `addMembersPendingAdminApproval` (rep) | `AddMemberPendingAdminApprovalAction` | `MemberPendingAdminApproval added=1` | 1 |
| 17 | `deleteMembersPendingAdminApproval` (rep) | `DeleteMemberPendingAdminApprovalAction` | `bytes deletedUserId=1` | 1 |
| 18 | `promoteMembersPendingAdminApproval` (rep) | `PromoteMemberPendingAdminApprovalAction` | `bytes userId=1; Member.Role role=2` | 1 |
| 19 | `modifyInviteLinkPassword` | `ModifyInviteLinkPasswordAction` | `bytes inviteLinkPassword=1` | 1 |
| 20 | `modifyDescription` | `ModifyDescriptionAction` | `bytes description=1` (enc blob) | 2 |
| 21 | `modify_announcements_only` | `ModifyAnnouncementsOnlyAction` | `bool announcements_only=1` | 3 |
| 22 | `add_members_banned` (rep) | `AddMemberBannedAction` | `MemberBanned added=1` | 4 |
| 23 | `delete_members_banned` (rep) | `DeleteMemberBannedAction` | `bytes deletedUserId=1` | 4 |
| 24 | `promote_members_pending_pni_aci_profile_key` (rep) | `PromoteMemberPendingPniAciProfileKeyAction` | `bytes presentation=1; bytes user_id=2; bytes pni=3; bytes profile_key=4` | 5 |
| 26 | `modifyMemberLabels` (rep) | `ModifyMemberLabelAction` | `bytes userId=1; bytes labelEmoji=2; bytes labelString=3` | 6 |
| 27 | `modifyMemberLabelAccess` | `ModifyMemberLabelAccessControlAction` | `AccessControl.AccessRequired memberLabelAccess=1` | 6 |
| 28 | `terminate_group` | `TerminateGroupAction` | (empty) | 7 |

(epoch column = the `// change epoch = N` comments in the proto; field 25 is `group_id`, reserved
server-side, hence the gap before 26.)

The task brief named the action **`modifyAddFromInviteLinkAccess`** (field 15, present),
**`addRequestingMembers`/`deleteRequestingMembers`/`promoteRequestingMembers`** — these are the
**"pending admin approval"** actions (fields 16/17/18): a "requesting member" in the decrypted view
== a `MemberPendingAdminApproval` on the wire. **`promotePendingPniAciMembers`** == field 24
`promote_members_pending_pni_aci_profile_key`.

### 4.12 API response wrappers (`Groups.proto:285-309`)
```
message ExternalGroupCredential { string token = 1; }

message GroupResponse { Group group = 1; bytes group_send_endorsements_response = 2; }

message GroupChanges {
  message GroupChangeState { GroupChange groupChange = 1; Group groupState = 2; }
  repeated GroupChangeState groupChanges = 1;
  bytes group_send_endorsements_response = 2;
}

message GroupChangeResponse { GroupChange group_change = 1; bytes group_send_endorsements_response = 2; }

message AvatarUploadAttributes {            // CDN presigned POST form
  string key=1; string credential=2; string acl=3; string algorithm=4;
  string date=5; string policy=6; string signature=7;
}
```
`group_send_endorsements_response` (field 2 on each) carries a `GroupSendEndorsementsResponse` (§9).

---

## 5. Field encryption (cite zkgroup Rust)

Two distinct schemes are used inside a `Group`:

### 5.1 Identity & profile-key ciphertexts (Ristretto255, verifiable, deterministic)

These use the CPZ §4.1 ElGamal-like verifiable encryption (NOT AES), with the group's per-domain
keypairs derived in §1.1. `zkcredential::attributes` computes `E_A1 = a1·M1`, `E_A2 = a2·E_A1 + M2`
(`zkcredential/attributes.rs:180,287-306`).

- **`userId` = encrypted ACI/PNI** → `UuidCiphertext` (`UUID_CIPHERTEXT_LEN = 65` = 1 reserved
  byte + two 32-byte Ristretto points). `GroupSecretParams.encrypt_service_id`
  (`group_params.rs:105-122`). The service-id binary (which encodes ACI vs PNI) is hashed into
  `M1 = hash_to_ristretto("Signal_ZKGroup_20200424_UID_CalcM1" ‖ service_id_binary)`
  (`uid_struct.rs:46`); `M2 = lizard_encode(raw_uuid_16)` (reversible). Decrypt recovers the 16
  UUID bytes and **tries both ACI and PNI candidates**, constant-time matching `M1`
  (`uid_encryption.rs:71-108`). Client wrappers `encryptServiceId`/`decryptServiceId`
  (`GroupsV2Operations.java:944-954`).
- **`profileKey` = encrypted profile key bound to its owner ACI** → `ProfileKeyCiphertext`
  (`PROFILE_KEY_CIPHERTEXT_LEN = 65`). `encrypt_profile_key(profile_key, user_id)`
  (`group_params.rs:134-156`); `M3 = hash(profile_key‖uid)`, `M4 = single_elligator(profile_key)`
  (`profile_key_struct.rs:24-53`). Decrypt **requires the owner's ACI** as input
  (`group_params.rs:158-172`).

These are **deterministic given the keypair and plaintext** (no per-message nonce), which is what
lets the server dedup/compare encrypted members. They are domain-separated:
`"Signal_ZKGroup_20230419_UidEncryption"` (`uid_encryption.rs:62`),
`"Signal_ZKGroup_20231011_ProfileKeyEncryption"` (`profile_key_encryption.rs:63`).

### 5.2 Attribute blobs (title / description / avatar / timer / member labels) — **AES-256-GCM-SIV**

`GroupAttributeBlob` is protobuf-encoded then encrypted with `ClientZkGroupCipher.encryptBlob`
→ `GroupSecretParams.encrypt_blob` (`group_params.rs:174-184`):

```
sho   = Sho::new(b"Signal_ZKGroup_20200424_Random_GroupSecretParams_EncryptBlob", randomness)
nonce = sho.squeeze(AESGCM_NONCE_LEN = 12)                       // line 179
ct    = AES-256-GCM-SIV(key = blob_key (32 B from §1.1),         // line 180,233-240
                        nonce = nonce, plaintext = blob_bytes)   //   (cipher = Aes256GcmSiv)
output = ct ‖ nonce(12) ‖ 0x00(reserved)                         // lines 181-183
```

Wire layout of an encrypted blob: **`AES-GCM-SIV ciphertext(=plaintext_len+16-byte tag) ‖
12-byte nonce ‖ 1 reserved byte`**. Decrypt = strip reserved byte, split off trailing 12-byte
nonce, AES-256-GCM-SIV-decrypt with `blob_key` (`group_params.rs:201-211`). `AESGCM_TAG_LEN = 16`,
`AESGCM_NONCE_LEN = 12`, `AES_KEY_LEN = 32` (`constants.rs:15-18`).

There is also a **padded** variant `encrypt_blob_with_padding(randomness, plaintext, padding_len)`
(`group_params.rs:186-199`): prepends a 4-byte big-endian `padding_len`, then `padding_len` zero
bytes, before the same `encrypt_blob`. (Used for length-hiding of titles/descriptions; Android
calls plain `encryptBlob` for most fields.)

> AES-GCM-SIV (RFC 8452) — **not** plain AES-GCM. Nonce-misuse-resistant. The Rust uses crate
> `aes-gcm-siv` 0.11.1. A TS port would need an AES-GCM-SIV implementation (not in WebCrypto;
> would need a JS lib or the native package).

Member-specific labels are encrypted as **raw UTF-8 bytes** (not wrapped in a `GroupAttributeBlob`)
via the same `encryptBlob` (`GroupsV2Operations.encryptString`, `:1062-1072`).

---

## 6. `DecryptedGroups.proto` — client-side decrypted view

File: `Signal-Android/lib/libsignal-service/src/main/protowire/DecryptedGroups.proto`. This is the
**local plaintext** representation a client builds after decrypting a `Group`/`GroupChange`. (Field
numbers deliberately mirror the encrypted proto where noted.)

### 6.1 Messages + key fields

`DecryptedMember` (`:17-25`): `bytes aciBytes=1; Member.Role role=2; bytes profileKey=3;
uint32 joinedAtRevision=5; bytes pniBytes=6; string labelEmoji=7; string labelString=8`.

`DecryptedPendingMember` (`:27-33`): `bytes serviceIdBytes=1; Member.Role role=2;
bytes addedByAci=3; uint64 timestamp=4; bytes serviceIdCipherText=5`.

`DecryptedRequestingMember` (`:35-39`): `bytes aciBytes=1; bytes profileKey=2; uint64 timestamp=4`.

`DecryptedBannedMember` (`:41-44`): `bytes serviceIdBytes=1; uint64 timestamp=2`.

`DecryptedPendingMemberRemoval` (`:46-49`): `bytes serviceIdBytes=1; bytes serviceIdCipherText=2`.

`DecryptedApproveMember` (`:51-54`): `bytes aciBytes=1; Member.Role role=2`.

`DecryptedModifyMemberRole` (`:56-59`): `bytes aciBytes=1; Member.Role role=2`.

`DecryptedModifyMemberLabel` (`:61-65`): `bytes aciBytes=1; string labelEmoji=2; string labelString=3`.

`DecryptedGroup` (`:69-84`):
```
string                    title                     = 2
string                    avatar                    = 3
DecryptedTimer            disappearingMessagesTimer = 4
AccessControl             accessControl             = 5   // reused from Groups.proto
uint32                    revision                  = 6
repeated DecryptedMember           members           = 7
repeated DecryptedPendingMember    pendingMembers    = 8
repeated DecryptedRequestingMember requestingMembers = 9
bytes                     inviteLinkPassword        = 10
string                    description               = 11
EnabledState              isAnnouncementGroup       = 12
repeated DecryptedBannedMember     bannedMembers     = 13
bool                      terminated                = 14
bool                      isPlaceholderGroup        = 64   // local-only sentinel
```

`DecryptedGroupChange` (`:88-117`): editor + per-action decrypted lists, e.g.
`bytes editorServiceIdBytes=1; uint32 revision=2; repeated DecryptedMember newMembers=3;
repeated bytes deleteMembers=4; repeated DecryptedModifyMemberRole modifyMemberRoles=5;
repeated DecryptedMember modifiedProfileKeys=6; newPendingMembers=7; deletePendingMembers=8;
promotePendingMembers=9; DecryptedString newTitle=10; newAvatar=11; DecryptedTimer newTimer=12;
newAttributeAccess=13; newMemberAccess=14; newInviteLinkAccess=15; newRequestingMembers=16;
deleteRequestingMembers=17; promoteRequestingMembers=18; bytes newInviteLinkPassword=19;
DecryptedString newDescription=20; EnabledState newIsAnnouncementGroup=21; newBannedMembers=22;
deleteBannedMembers=23; promotePendingPniAciMembers=24; modifyMemberLabels=26;
newMemberLabelAccess=27; bool terminateGroup=28`. (Field 25 reserved — server-only group id.)

Helpers: `DecryptedString{value=1}` (`:119-121`), `DecryptedTimer{duration=1}` (`:123-125`),
`DecryptedGroupJoinInfo` (`:127-136`), `enum EnabledState { UNKNOWN=0; ENABLED=1; DISABLED=2; }`
(`:138-142`).

### 6.2 Decrypt pipeline (`Group` → `DecryptedGroup`)

`GroupsV2Operations.GroupOperations.decryptGroup(Group)` (`:458-504`):
1. For each `Member`: `decryptMember` → `userId` via `decryptServiceId` (UuidCiphertext),
   `profileKey` via `clientZkGroupCipher.decrypt(ProfileKeyCiphertext, aci)`, copy role/joinedAt,
   decrypt labels.
2. For each `MemberPendingProfileKey` / `MemberPendingAdminApproval` / `MemberBanned`: decrypt the
   embedded service-ids (`:477-487`).
3. Decrypt attribute blobs: `decryptTitle`/`decryptDescription`/`decryptDisappearingMessagesTimer`
   each call `decryptBlob` → `clientZkGroupCipher.decryptBlob` → parse `GroupAttributeBlob`
   (`:998-1046`). `accessControl` is copied as-is (not encrypted). `avatar` stays the CDN URL
   (its *content* is decrypted lazily via `decryptAvatar`, `:1023-1025`).
4. Assemble `DecryptedGroup` (`:489-503`).

`decryptChange(GroupChange, verificationMode)` (`:513-...`): if `changeEpoch > HIGHEST_KNOWN_EPOCH`
→ return empty (caller refetches snapshot); else verify `serverSignature` (unless trusted),
decode `Actions`, decrypt each action list into the `DecryptedGroupChange` shape. Version-0 changes
are unsigned/empty and skipped from verification (comment `:508-509`).

---

## 7. The `groupV2` context in `DataMessage`

`SignalService.proto:927-930`:
```
message GroupContextV2 {
  optional bytes  masterKey   = 1   // 32-byte GroupMasterKey
  optional uint32 revision    = 2   // sender's group revision when sending
  optional bytes  groupChange = 3   // OPTIONAL inline signed GroupChange for fast P2P propagation
}
```
Referenced from `DataMessage.groupV2 = 15` (`SignalService.proto:419`) and
`StoryMessage.group = 2` (`:475`).

**Dual update path** (how a peer that receives a group message keeps state in sync):
- Every group `DataMessage` carries `masterKey` (so a brand-new device can derive
  `GroupSecretParams` and fetch state) and the sender's `revision`.
- If `groupChange` is present, it is a **full signed `GroupChange`** (server-signed `actions` +
  `serverSignature`). A receiving peer can **verify and apply it inline** to advance exactly one
  revision — no round-trip. This is the fast path for the common "someone added X / changed title"
  case (the editing client got the signed change back from `PATCH` and re-broadcasts it).
- If `groupChange` is absent, or the peer is **more than one revision behind**, or the change fails
  verification / is a higher epoch, the peer falls back to **`GET /v2/groups/logs/{fromRevision}`**
  (§3) to fetch and apply all intermediate `GroupChange`s, or `GET /v2/groups/` for a full
  snapshot if it cannot reconcile.

The `masterKey` here is the *only* link between an opaque P2P message and the group's full
crypto/state; it equals `GroupV2Record.masterKey` from storage-service sync (agent 6,
`StorageService.proto:164`).

---

## 8. Admin operations & access semantics

Who may perform an action is governed by `Group.accessControl` (§4.5) plus the actor's `Member.role`.
The **server enforces** these (the client-side `groupsv2/` package builds the actions; the storage
service validates — ⚠️ server validation source not in clone). Practical rules:

- **`attributes` access** (`AccessControl.attributes`): who may run `modifyTitle`,
  `modifyDescription`, `modifyAvatar`, `modifyDisappearingMessageTimer`. `MEMBER` → any member;
  `ADMINISTRATOR` → admins only. New groups default both `attributes` and `members` to `MEMBER`
  (`GroupsV2Operations.createNewGroup`, `:120-123`).
- **`members` access**: who may `addMembers` / `deleteMembers` (beyond removing yourself).
- **`addFromInviteLink` access**: gates joining via the invite link without admin approval
  (`ANY`/`MEMBER` vs needing approval). `UNSATISFIABLE` effectively disables a capability.
- **Promote/demote admins:** `modifyMemberRoles` (field 5) with `role = ADMINISTRATOR` / `DEFAULT`.
  Only admins may change roles. Leaving while sole admin requires promoting someone:
  `createLeaveAndPromoteMembersToAdmin` (`:265`).
- **Invite links:** an admin sets a random `inviteLinkPassword` (`modifyInviteLinkPassword`, field
  19) and an `addFromInviteLink` access level (field 15). The shareable link encodes
  `GroupInviteLinkContentsV1{groupMasterKey, inviteLinkPassword}` (§4.8). A joiner previews via
  `GET /v2/groups/join/{password}` (`GroupJoinInfo`), then:
  - if `addFromInviteLink = ANY/MEMBER`: joins directly (`createGroupJoinDirect`, `:220`) →
    `addMembers` with `joinFromInviteLink=true`;
  - if approval required: `createGroupJoinRequest` (`:211`) → an `AddMemberPendingAdminApproval`
    (becomes a `requestingMember`).
- **Requesting-member approval:** an admin runs `promoteMembersPendingAdminApproval` (field 18,
  `createApproveGroupJoinRequest`, `:242`) to turn a join-request into a full `Member`, or
  `deleteMembersPendingAdminApproval` (field 17) to refuse (`createRefuseGroupJoinRequest`, `:229`,
  optionally also banning).
- **Banning:** `add_members_banned` / `delete_members_banned` (fields 22/23,
  `createBanServiceIdsChange` `:366`, `createUnbanServiceIdsChange` `:394`). Banning a requester
  typically also refuses their request.
- **Announcement-only:** `modify_announcements_only` (field 21) — when ENABLED, only admins may
  send messages to the group (enforced by clients honoring `Group.announcements_only`).
- **PNI→ACI promotion:** when an invited-by-PNI member registers/links an ACI, the change
  `promote_members_pending_pni_aci_profile_key` (field 24) migrates them (`createAcceptPniInviteChange`,
  `:300`).

---

## 9. Sending to a group (relationship to other layers)

Group messages are **not** sent through the group server. The group server only holds **state**.
Actual message delivery is **fan-out to each member's device** using:
- **Sender Keys** + `SenderKeyDistributionMessage` for efficient group encryption — **agent 3**.
- **Multi-recipient sealed sender** for the transport envelope — **agent 1**.

The group `DataMessage` body carries the `GroupContextV2` (§7) so recipients know which group and
revision the message belongs to.

### 9.1 Group send endorsements (the newer access mechanism) — present in this clone

`group_send_endorsements_response` appears on `GroupResponse`, `GroupChanges`,
`GroupChangeResponse` (§4.12). Purpose: let a client prove to the **chat (message) server** that it
is allowed to send to specific group members **without revealing which group** — replacing the older
per-recipient "group access key" check for sealed-sender multi-recipient sends.

- Crypto primitive: `zkcredential::endorsements` — a PrivacyPass/3HashSDHI-style keyed MAC over a
  single Ristretto point (cheaper than the full KVAC). Tag label
  `b"20240215_Signal_GroupSendEndorsement"` (`group_send_endorsement.rs:48`).
- Flow:
  1. Group server issues a `GroupSendEndorsementsResponse` (one endorsement per member, identical
     for every requester ⇒ cacheable; hence the `Cached-Send-Endorsements` request header) with an
     `expiration` (day-aligned).
  2. Client `receiveGroupSendEndorsements(selfAci, decryptedGroup, response)`
     (`GroupsV2Operations.java:1184-1207`) validates and gets per-member `GroupSendEndorsement`s.
  3. Endorsements can be `combine`/`remove`d to cover an arbitrary recipient subset, then
     `to_token(groupSecretParams)` → `GroupSendToken` → `into_full_token(expiration)`
     → **`GroupSendFullToken`** (16-byte core token). Sent to the chat server with the
     multi-recipient send.
  4. Chat server `GroupSendFullToken.verify(user_ids, now, key_pair)` checks expiry + that the
     token covers exactly those recipients.
- Server-side helpers exist in the cloned chat server:
  `auth/GroupSendTokenHeader.java`, `grpc/GroupSendTokenUtil.java`. The HTTP header name and exact
  multi-recipient-send wiring are **agent 1's** territory (transport). ⚠️ Header name not quoted
  here — confirm with agent 1.

If a client passes `null` for endorsements, Android tolerates it and falls back to the legacy access
path (`receiveGroupSendEndorsements` returns `null`, `:1196`).

---

## 10. Worked sequences

**Create a group (`PUT /v2/groups/`):**
1. Generate `GroupSecretParams` (random) → derive id/keys.
2. `createNewGroup(...)` builds `Group{version:0, publicKey:serialize(pubParams),
   title:enc, disappearingMessagesTimer:enc, accessControl:{MEMBER,MEMBER}, members:[self as
   ADMINISTRATOR + each invitee], membersPendingProfileKey:[invitees w/o profile-key cred]}`
   (`GroupsV2Operations.java:100-144`). Self/members are added by **`presentation`** (profile-key
   credential), server derives encrypted `userId`/`profileKey`.
3. If avatar: upload form → encrypt blob → POST CDN → set `avatarUrl=form.key`.
4. `PUT` with the §2.3 auth header. 409 = already exists. Response `GroupResponse{group,
   endorsements}` → `decryptGroup`.

**Edit (`PATCH /v2/groups/`):**
1. Build a `GroupChange.Actions` via the `create…` helpers (each encrypts its fields), set
   `version = currentRevision + 1`. Do **not** set `group_id` (field 25).
2. `PATCH` (optionally `?inviteLinkPassword=` when joining by link). On success the server returns
   `GroupChangeResponse.group_change` — a fully **server-signed** `GroupChange` you can verify,
   apply locally, and re-broadcast inline via `GroupContextV2.groupChange` (§7).
3. On 400 (`GroupPatchNotAccepted`) inspect `{message}`; on revision conflict, refetch + rebase.
   423 = group terminated.

---

## 11. zkgroup feasibility — mandatory analysis

### What zkgroup actually is
A self-contained anonymous-credential cryptosystem layered on three Signal crates
(`/tmp/libsignal/rust/zkgroup/Cargo.toml`):
- **`curve25519-dalek-signal`** — a **fork** of curve25519-dalek over **Ristretto255**, adding
  non-mainline functions: `lizard_encode/decode`, `from_uniform_bytes_single_elligator`,
  `decode_253_bits`, `double_and_compress_batch`. These are central to UID/profile-key encryption
  and are **absent from every standard JS curve25519 library**.
- **`poksho`** — the `ShoHmacSha256` SHO (§1.1) + a Schnorr/Sigma NIZK engine (Fiat–Shamir).
- **`zkcredential`** — generic Chase–Perrin–Zaverucha KVAC, verifiable ElGamal-like encryption, and
  the endorsement primitive.
- Plus `aes-gcm-siv`, `hkdf`, `sha2`, and **`bincode`** (fixint little-endian) for serialization —
  any reimpl must match bincode byte-for-byte.

### Is there an npm package? — YES, and it's the answer
**`@signalapp/libsignal-client`** (npm; latest seen **0.96.1**, AGPL-3.0). Verified from the
packed tarball:
- It is a **Node native addon** loaded via `node-gyp-build` (`dist/Native.js:25`), shipping
  **prebuilt binaries for all desktop targets**: `prebuilds/{linux,darwin,win32}-{x64,arm64}/
  @signalapp+libsignal-client.node`. So **no Rust toolchain needed** to install on those platforms.
- It **exports the entire zkgroup surface** we need:
  `dist/zkgroup/groups/{GroupMasterKey, GroupSecretParams, GroupPublicParams, GroupIdentifier,
  ClientZkGroupCipher, UuidCiphertext, ProfileKeyCiphertext}`,
  `dist/zkgroup/auth/{AuthCredentialWithPniResponse, AuthCredentialWithPni, AuthCredentialPresentation,
  ClientZkAuthOperations}`, and `dist/zkgroup/groupsend/{GroupSendEndorsementsResponse,
  GroupSendToken, GroupSendFullToken}`. This is a 1:1 match for the Android API used above.
- ⚠️ **There is NO wasm/browser build in `dist/`** — it is Node-only. Fine for this Electron
  codebase (Node main process), unusable in a pure renderer/browser context.
- It is **NOT currently installed** here: `/workspace/app/node_modules/@signalapp` does not exist.
  The same package also provides the core Signal-Protocol primitives, so adding it may let us
  consolidate other crypto too.

### How hard is a pure-TS port? — Very hard, not recommended
You would have to reimplement: Ristretto255 **with** Lizard + single-Elligator + `decode_253_bits`
+ batch compress (no existing JS lib has these), the poksho SHO **and** Sigma-proof transcript
engine (transcript ordering is load-bearing), the CPZ KVAC issuance+presentation proofs, AES-256-
GCM-SIV (not in WebCrypto), and bincode-exact serialization — all matching Signal's hardcoded
system params and domain labels exactly, or the server rejects everything. This is a multi-month,
high-risk effort with cross-impl test-vector validation required.

### Realistic options (ranked)
1. **Add `@signalapp/libsignal-client` and call its native zkgroup API.** Lowest risk, exact wire
   compatibility, prebuilt for our platforms. **Recommended.** Cost: a native dependency in the
   Node/Electron process; renderer must call it via IPC/JPC (cf. `backend.ts` one-liners rule —
   expose it through JPC, keep protocol/app logic in `app/logic/`).
2. Vendor the Rust and compile our own napi binding — only if (1)'s prebuilds don't cover a target.
3. Pure-TS port — not feasible for a realistic timeline.

**Verdict: Groups V2 is feasible *only* by depending on `@signalapp/libsignal-client` for zkgroup.**
Everything non-zk (the protos, endpoints, the `GroupContextV2` dual-update logic, decrypt pipeline
orchestration) we implement ourselves in TS; all zk/AES-GCM-SIV crypto delegates to that package.

---

## 12. Major ⚠️ uncertainties / TODO

- ⚠️ **GroupsController server source absent** — `/v2/groups...` request/response *formats* are
  client-authoritative (verified), but server-side validation rules and the exact non-success codes
  for revision conflicts (400 vs 409) are partly inferred. Only `PUT 409`, `PATCH 400/423`,
  `GET 403/404`, `JOIN 403/423` are confirmed from the client handlers.
- ⚠️ **Group-send-endorsement HTTP header** for multi-recipient sends — name/wiring is agent 1's
  (transport). Confirm there.
- ⚠️ The v4 auth-credential-presentation serialized length has no single named constant; rely on the
  library to size it.
- ⚠️ `joinedAtVersion` (wire) vs `joinedAtRevision` (decrypted) naming differs but maps 1:1.
- ⚠️ Avatar **content** decryption (`decryptAvatar`) is separate from the `Group` decrypt (lazy CDN
  fetch); CDN download/auth flow not covered here.

---

## Source files (GitHub permalinks)

Signal-Android @ `d6871f8dc2d12a5b74ac0501bcf73ccec38064fd`:
- Groups.proto — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/protowire/Groups.proto
- DecryptedGroups.proto — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/protowire/DecryptedGroups.proto
- SignalService.proto (GroupContextV2 L927) — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/protowire/SignalService.proto#L927
- StorageService.proto (GroupV2Record L157) — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/protowire/StorageService.proto#L157
- GroupsV2Api.java — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/groupsv2/GroupsV2Api.java
- GroupsV2Operations.java — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/groupsv2/GroupsV2Operations.java
- GroupsV2ApiHelper.kt — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/groupsv2/GroupsV2ApiHelper.kt
- GroupsV2AuthorizationString.java — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/api/groupsv2/GroupsV2AuthorizationString.java
- PushServiceSocket.java (endpoint consts L168, handlers L1885) — https://github.com/signalapp/Signal-Android/blob/d6871f8dc2d12a5b74ac0501bcf73ccec38064fd/lib/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/PushServiceSocket.java#L168

libsignal @ `a85f3c0d892a14d32b76fd724d07fec4a23821f0`:
- group_params.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/api/groups/group_params.rs
- uid_encryption.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/crypto/uid_encryption.rs
- uid_struct.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/crypto/uid_struct.rs
- profile_key_encryption.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/crypto/profile_key_encryption.rs
- profile_key_struct.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/crypto/profile_key_struct.rs
- common/constants.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/common/constants.rs
- common/sho.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/common/sho.rs
- auth/auth_credential_with_pni/zkc.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/api/auth/auth_credential_with_pni/zkc.rs
- auth/auth_credential_presentation.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/api/auth/auth_credential_presentation.rs
- groups/group_send_endorsement.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkgroup/src/api/groups/group_send_endorsement.rs
- poksho/src/shohmacsha256.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/poksho/src/shohmacsha256.rs
- zkcredential/src/attributes.rs — https://github.com/signalapp/libsignal/blob/a85f3c0d892a14d32b76fd724d07fec4a23821f0/rust/zkcredential/src/attributes.rs

Signal-Server (chat server) @ `adb5b6a4ea01bae52d0d6479541435697a1bcce7`:
- CertificateController.java (group auth creds, /v1/certificate/auth/group L90) — https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/controllers/CertificateController.java#L90
- entities/GroupCredentials.java — https://github.com/signalapp/Signal-Server/blob/adb5b6a4ea01bae52d0d6479541435697a1bcce7/service/src/main/java/org/whispersystems/textsecuregcm/entities/GroupCredentials.java
- (⚠️ GroupsController lives in the separate `signalapp/storage-service` repo — not cloned)

npm:
- @signalapp/libsignal-client — https://www.npmjs.com/package/@signalapp/libsignal-client (0.96.1, Node native addon, prebuilt linux/darwin/win × x64/arm64, exports full zkgroup; NOT installed in this repo)
