# Signal (Android) Wire Protocol — Messaging Content Layer

**Based on main-branch clones, 2026-06-16.**

This document covers the **end-to-end content** that rides inside `Envelope.content` *after* the
transport/crypto layers have done their job: the `Content` message and everything it can carry
(`DataMessage`, `SyncMessage`, receipts, typing, etc.), the message-layer wrappers around the
already-implemented Double Ratchet / sender keys, plaintext padding, sealed sender (v1 + v2), and the
`Envelope.type → CiphertextMessage` mapping.

**Scope boundaries (see other agents):**

| Out of scope | Owner |
|---|---|
| Transport framing, send/receive REST + websocket endpoints, registration | agent 1 |
| Attachment CDN upload/download + attachment encryption (key/digest/IV usage) | agent 5 |
| Group crypto, zkgroup, `GroupContextV2` internals, group changes | agent 4 |
| Calling (`CallMessage` body, RingRTC) | agent 7 |
| The Double Ratchet / X3DH / sender-key *math* itself | already in `app/logic/Chat/Signal/Crypto/*` |

Everything below is the structural/message layer that *wraps* that math.

All proto field numbers are proto2. Unless noted, every field is `optional`.

---

## 1. The `Content` message

After the `Envelope.content` bytes are decrypted (see §9) and the plaintext padding is stripped
(see §8), the remaining bytes are a protobuf-encoded `Content` (`SignalService.proto:106-121`).

```proto
message Content {
  oneof content {
    DataMessage   dataMessage             = 1;
    SyncMessage   syncMessage             = 2;
    CallMessage   callMessage             = 3;   // agent 7
    NullMessage   nullMessage             = 4;
    ReceiptMessage receiptMessage         = 5;
    TypingMessage typingMessage           = 6;
    bytes /*DecryptionErrorMessage*/ decryptionErrorMessage = 8;
    StoryMessage  storyMessage            = 9;   // name only — story feature
    EditMessage   editMessage             = 11;
  }
  optional bytes /*SenderKeyDistributionMessage*/ senderKeyDistributionMessage = 7;
  optional PniSignatureMessage pniSignatureMessage = 10;
}
```

| # | Field | Type | Notes |
|---|---|---|---|
| 1 | `dataMessage` | `DataMessage` | The user-visible message: text, attachments, reactions, edits-as-data, etc. §2. |
| 2 | `syncMessage` | `SyncMessage` | Linked-device synchronization (our own sent transcripts, read marks, config, keys). §5. |
| 3 | `callMessage` | `CallMessage` | Call signaling (Offer/Answer/IceUpdate/Busy/Hangup/Opaque). **Body = agent 7.** |
| 4 | `nullMessage` | `NullMessage` | Decoy/keep-alive; one field `padding`. §6. |
| 5 | `receiptMessage` | `ReceiptMessage` | Delivery / read / viewed receipts. §6. |
| 6 | `typingMessage` | `TypingMessage` | Typing indicator. §6. |
| 8 | `decryptionErrorMessage` | `bytes` (a serialized `DecryptionErrorMessage`) | Resend request after a failed decrypt. Carried as opaque bytes here, decoded separately. §6. |
| 9 | `storyMessage` | `StoryMessage` | Stories. Name only for our scope; fields exist (`profileKey=1`, `group=2`, `fileAttachment=3`/`textAttachment=4`, `allowsReplies=5`, `bodyRanges=6` at `SignalService.proto:473-482`). |
| 11 | `editMessage` | `EditMessage` | Edit an earlier message. §4. |
| 7 | `senderKeyDistributionMessage` | `bytes` (serialized SKDM) | **Not in the `oneof`** — it can ride *alongside* any of the `oneof` members. Distributes a sender key for group fan-out; the math is in `Crypto/GroupCipher`. Wire structure = `wire.proto SenderKeyDistributionMessage{distribution_uuid=1, chain_id=2, iteration=3, chain_key=4, signing_key=5}`. |
| 10 | `pniSignatureMessage` | `PniSignatureMessage` | Also outside the `oneof`. `{pni=1 (bytes), signature=2 (bytes)}` — a signature *by* the PNI identity key *of* the ACI identity key (`SignalService.proto:972-976`), used to prove the same person owns both ACI and PNI. |

> ⚠️ Note the libsignal Rust `service.proto` declares a **different, older** `Content` (all fields
> `bytes`, only fields 1-8, with snake_case names) — that copy exists only so libsignal can wrap a
> `DecryptionErrorMessage` into `PlaintextContent` (see §8). The **authoritative** `Content` for the
> messaging layer is the one in Signal-Android's `SignalService.proto` above.

### Padding note (where it lives)

The padding scheme (`0x80 0x00…`) is applied to the **plaintext `Content` bytes before they enter
the Double Ratchet / GroupCipher / sealed-sender**, and stripped after decryption. It is *not* a
field inside `Content`. Full details in §8. Several messages *also* carry their own internal
`padding` field (`NullMessage.padding`, `SyncMessage.padding`, `Verified.nullMessage`) to obscure the
length of an otherwise tiny message; that is independent of the transport padding in §8.

---

## 2. `DataMessage` in full

`SignalService.proto:188-445`. This is the workhorse: text, attachments, quotes, reactions, edits,
remote-deletes, etc. All fields optional/repeated.

| # | Field | Type | Meaning |
|---|---|---|---|
| 1 | `body` | `string` | The message text (UTF-8). |
| 2 | `attachments` | repeated `AttachmentPointer` | Media. Fields listed below; **CDN/encryption details = agent 5.** |
| 15 | `groupV2` | `GroupContextV2` | Group identity `{masterKey=1, revision=2, groupChange=3}`. **Contents = agent 4.** Presence ⇒ group message; absence ⇒ 1:1. |
| 4 | `flags` | `uint32` | Bitfield of `DataMessage.Flags`. See below. |
| 5 | `expireTimer` | `uint32` | Disappearing-message timer in **seconds**. |
| 23 | `expireTimerVersion` | `uint32` | Monotonic version of the expire timer to resolve concurrent timer changes (newer wins). |
| 6 | `profileKey` | `bytes` | Sender's profile key (32 bytes), included so the recipient can fetch/decrypt the sender's profile + derive unidentified-access key (§7). |
| 7 | `timestamp` | `uint64` | The message's **sent timestamp** (ms). This is the canonical identity of a message (used by quotes, reactions, deletes, edits, receipts). |
| 8 | `quote` | `Quote` | Reply quoting an earlier message. §3. |
| 9 | `contact` | repeated `Contact` | Shared contact card(s). §3. |
| 10 | `preview` | repeated `Preview` | Link previews. §3. |
| 11 | `sticker` | `Sticker` | A sticker. §3. |
| 12 | `requiredProtocolVersion` | `uint32` | Minimum `ProtocolVersion` the receiver must support to render correctly; if the receiver's `CURRENT` is lower, it shows an "update to view" placeholder. Enum `ProtocolVersion` `INITIAL=0 … POLLS=8, CURRENT=8` (`:361-374`). |
| 14 | `isViewOnce` | `bool` | View-once media (single attachment, deleted after viewing). |
| 16 | `reaction` | `Reaction` | An emoji reaction to another message. §3. |
| 17 | `delete` | `Delete` | A *remote delete* of an earlier message. §3. |
| 18 | `bodyRanges` | repeated `BodyRange` | Mentions + text styles over `body`. §3. |
| 19 | `groupCallUpdate` | `GroupCallUpdate` | Notifies the group that a group call started/changed. `{eraId=1}`. §3. |
| 20 | `payment` | `Payment` | MobileCoin payment notification/activation. §3. |
| 21 | `storyContext` | `StoryContext` | This message is a reply to a story. `{authorAci=1, sentTimestamp=2, authorAciBinary=3}`. |
| 22 | `giftBadge` | `GiftBadge` | A gift badge (donation). §3. |
| 24 | `pollCreate` | `PollCreate` | Poll creation `{question=1, allowMultiple=2, options[]=3}`. (newer; POLLS protocol version) |
| 25 | `pollTerminate` | `PollTerminate` | End a poll `{targetSentTimestamp=1}`. |
| 26 | `pollVote` | `PollVote` | Vote `{targetAuthorAciBinary=1, targetSentTimestamp=2, optionIndexes[]=3, voteCount=4}`. |
| 27 | `pinMessage` | `PinMessage` | Pin a message; `{targetAuthorAciBinary=1, targetSentTimestamp=2, oneof pinDuration{pinDurationSeconds=3, pinDurationForever=4}}`. |
| 28 | `unpinMessage` | `UnpinMessage` | `{targetAuthorAciBinary=1, targetSentTimestamp=2}`. |
| 29 | `adminDelete` | `AdminDelete` | Group-admin delete of another member's message `{targetAuthorAciBinary=1, targetSentTimestamp=2}`. |

Field 3 (`groupV1`) is **reserved/removed** — groups are V2-only now.

### `DataMessage.Flags` (field 4, bitfield) — `:189-194`

| Value | Name | Meaning |
|---|---|---|
| 1 | `END_SESSION` | **reserved/removed.** Historically: archive the Signal session, start fresh. The enum value 1 is now `reserved`, so it is no longer emitted by current clients. ⚠️ For interop you may still *receive* it from old peers — treat as "reset session". |
| 2 | `EXPIRATION_TIMER_UPDATE` | This message carries only an `expireTimer` change (no body). Apply the new timer to the conversation. |
| 4 | `PROFILE_KEY_UPDATE` | This message exists only to deliver an updated `profileKey`. |
| 8 | `FORWARD` | The message was forwarded. |

### `AttachmentPointer` (referenced from many places) — `:892-925`

Fields listed for completeness; **CDN selection, encryption (`key`/`digest`/`incrementalMac`),
upload, download = agent 5.**

| # | Field | Type | Note |
|---|---|---|---|
| 1 | `cdnId` | `fixed64` | `oneof attachment_identifier` (CDN v2). |
| 15 | `cdnKey` | `string` | `oneof attachment_identifier` (CDN v3+). |
| 20 | `clientUuid` | `bytes` | Cross-client id of this attachment within the owning message. |
| 2 | `contentType` | `string` | MIME type. |
| 3 | `key` | `bytes` | Encryption key material (agent 5). |
| 4 | `size` | `uint32` | Plaintext size. |
| 5 | `thumbnail` | `bytes` | |
| 6 | `digest` | `bytes` | (agent 5) |
| 19 | `incrementalMac` | `bytes` | (agent 5) |
| 17 | `chunkSize` | `uint32` | (agent 5) |
| 7 | `fileName` | `string` | |
| 8 | `flags` | `uint32` | `VOICE_MESSAGE=1, BORDERLESS=2, GIF=8`. |
| 9 | `width` | `uint32` | |
| 10 | `height` | `uint32` | |
| 11 | `caption` | `string` | |
| 12 | `blurHash` | `string` | |
| 13 | `uploadTimestamp` | `uint64` | |
| 14 | `cdnNumber` | `uint32` | Which CDN (agent 5). |

---

## 3. `DataMessage` sub-messages in full

### Reaction — `:338-345`

```proto
message Reaction {
  optional string emoji               = 1;
  optional bool   remove              = 2;
  reserved /*targetAuthorE164*/ 3;
  optional string targetAuthorAci     = 4;   // ACI (UUID string) of the author of the reacted-to message
  optional uint64 targetSentTimestamp = 5;   // DataMessage.timestamp of the reacted-to message
  optional bytes  targetAuthorAciBinary = 6; // 16-byte UUID (binary form of field 4)
}
```

Semantics: the pair `(targetAuthorAci, targetSentTimestamp)` uniquely identifies the message being
reacted to (in a group, the original author may not be the conversation peer). `remove=true` ⇒ remove
this user's previous reaction; otherwise add/replace with `emoji`. A user has at most one reaction per
target. `targetAuthorAciBinary` (field 6) is the modern binary form; field 4 is the legacy string
form — emit the binary one, but accept either.

### Quote — `:239-260`

```proto
message Quote {
  enum Type { NORMAL = 0; GIFT_BADGE = 1; POLL = 2; }
  message QuotedAttachment {
    optional string contentType = 1;
    optional string fileName    = 2;
    optional AttachmentPointer thumbnail = 3;
  }
  optional uint64 id              = 1;   // DataMessage.timestamp of the quoted message
  reserved /*authorE164*/ 2;
  optional string authorAci       = 5;
  optional string text            = 3;   // a copy of the quoted text (so it renders even if original is gone)
  repeated QuotedAttachment attachments = 4;
  repeated BodyRange bodyRanges   = 6;   // styles/mentions over `text`
  optional Type   type            = 7;   // NORMAL / GIFT_BADGE / POLL
  optional bytes  authorAciBinary = 8;   // 16-byte UUID
}
```

`id` + `authorAci` identify the quoted message. `text` and `attachments` are *snapshots* the sender
includes so the quote renders even if the recipient never had the original (the recipient may also
look up the real message by `id`+author to "jump to" it).

### BodyRange — `:983-1001` (mentions vs styles)

```proto
message BodyRange {
  enum Style { NONE=0; BOLD=1; ITALIC=2; SPOILER=3; STRIKETHROUGH=4; MONOSPACE=5; }
  optional uint32 start  = 1;   // start index in UTF-16 code units of the raw string
  optional uint32 length = 2;   // length in UTF-16 code units
  oneof associatedValue {
    string mentionAci       = 3;   // a @mention of this ACI
    Style  style            = 4;   // a text style
    bytes  mentionAciBinary = 5;   // 16-byte UUID form of mentionAci
  }
}
```

A `BodyRange` annotates `[start, start+length)` of `DataMessage.body` (indices are **UTF-16 code
units**, not bytes or codepoints — important when the runtime string type differs). Two mutually
exclusive uses via the `oneof`:

- **Mention** (`mentionAci` / `mentionAciBinary`): the substring is a placeholder for a person; the
  client renders the mentioned user's display name. By convention the mentioned span in `body` is a
  single replacement character (`U+FFFC` / `￼`). The presence of a mention requires
  `requiredProtocolVersion >= MENTIONS (6)`.
- **Style** (`style`): the substring is formatted `BOLD`/`ITALIC`/`SPOILER`/`STRIKETHROUGH`/
  `MONOSPACE`. Ranges may overlap (e.g. bold+italic) by sending multiple `BodyRange`s.

> ⚠️ Mentions and styles can both appear in the same message as separate `BodyRange` entries; one
> `BodyRange` is *either* a mention *or* a style, never both.

### Delete (remote delete) — `:347-349`

```proto
message Delete { optional uint64 targetSentTimestamp = 1; }
```

A `DataMessage` whose `delete` field is set is a *delete-for-everyone*. `targetSentTimestamp` is the
`DataMessage.timestamp` of the message to remove; the author is the sender of *this* DataMessage.
Android replaces the original with a "This message was deleted" tombstone (subject to a time-window
constraint, see `MessageConstraintsUtil`).

### Preview (link preview) — `:484-490`

```proto
message Preview {
  optional string url         = 1;
  optional string title       = 2;
  optional AttachmentPointer image = 3;
  optional string description = 4;
  optional uint64 date        = 5;
}
```
The `url` must appear in `body`. `image` (when present) is a CDN attachment (agent 5).

### Sticker — `:330-336`

```proto
message Sticker {
  optional bytes  packId    = 1;
  optional bytes  packKey   = 2;   // key to decrypt the sticker pack
  optional uint32 stickerId = 3;   // index within the pack
  optional AttachmentPointer data = 4;  // the actual sticker image (agent 5)
  optional string emoji     = 5;   // emoji the sticker represents
}
```

### Payment (MobileCoin) — `:196-237`

```proto
message Payment {
  message Amount { message MobileCoin { optional uint64 picoMob = 1; }  // 1e12 picoMob = 1 MOB
                   oneof Amount { MobileCoin mobileCoin = 1; } }
  message Notification {
    message MobileCoin { optional bytes receipt = 1; }
    oneof Transaction { MobileCoin mobileCoin = 1; }
    optional string note = 2;
  }
  message Activation { enum Type { REQUEST=0; ACTIVATED=1; } optional Type type = 1; }
  oneof Item {
    Notification notification = 1;   // a sent-payment receipt
    Activation   activation   = 2;   // request-to-activate / activated payments
  }
}
```
`Notification.mobileCoin.receipt` is the on-chain receipt blob; `note` is an optional memo.
Payment cryptography/ledger details are outside this doc's scope.

### GiftBadge — `:376-378`

```proto
message GiftBadge { optional bytes receiptCredentialPresentation = 1; }
```
A zkgroup receipt-credential presentation proving a donation badge was gifted. (zkgroup = agent 4.)

### Contact (shared contact card) — `:262-328`

```proto
message Contact {
  message Name { givenName=1; familyName=2; prefix=3; suffix=4; middleName=5; nickname=7; }  // all string
  message Phone { value=1(string); enum Type{HOME=1;MOBILE=2;WORK=3;CUSTOM=4} type=2; label=3(string); }
  message Email { value=1(string); Type type=2; label=3(string); }           // same Type enum
  message PostalAddress {
    enum Type { HOME=1; WORK=2; CUSTOM=3; }
    type=1; label=2; street=3; pobox=4; neighborhood=5; city=6; region=7; postcode=8; country=9;  // strings
  }
  message Avatar { optional AttachmentPointer avatar = 1; optional bool isProfile = 2; }
  optional Name    name         = 1;
  repeated Phone   number       = 3;
  repeated Email   email        = 4;
  repeated PostalAddress address = 5;
  optional Avatar  avatar       = 6;
  optional string  organization = 7;
}
```

### GroupCallUpdate — `:351-353`

```proto
message GroupCallUpdate { optional string eraId = 1; }
```
Sent into a group `DataMessage` to announce a group call. `eraId` identifies the call era (used to
correlate with `SyncMessage.CallEvent`/`CallLogEvent`). The RingRTC call itself = agent 7.

---

## 4. `EditMessage` — `:978-981`

```proto
message EditMessage {
  optional uint64      targetSentTimestamp = 1;   // identifies the message being edited
  optional DataMessage dataMessage         = 2;   // the replacement content
}
```

Semantics (from `EditMessageProcessor.kt`):

- **Target identification:** the original message is found by
  `(targetSentTimestamp, senderRecipient)` — i.e. the edit's author must equal the original's author
  (`validAuthor`, `EditMessageProcessor.kt:76`). Group membership must match (`validGroup`, `:77`).
- **What replaces what:** the *entire* `dataMessage` is the new content. Android inserts the edit as a
  **new message row linked to the original** (`insertEditMessageInbox`, `:167`/`:201`) rather than
  mutating in place — preserving an edit history. The latest edit is what the UI shows.
- **Preserved from the original (not from the edit):** thread, `expiresIn`/`expireStarted`,
  `parentStoryId`, received time, and (for media edits) the original quote shell. Body, body-ranges,
  link previews, mentions, and long-text attachment come from the **edit's** `dataMessage`.
- **Disallowed targets:** view-once, audio (voice notes), and shared-contact messages cannot be
  edited (`validTarget`, `:78`).
- **Timing:** there is a max age / max edit count enforced by
  `MessageConstraintsUtil.isValidEditMessageReceive` (`:75`).
- **Early-message handling:** if the target isn't found yet (edit arrived before original), the edit
  is stored in the early-message cache and retried (`:61-64`).
- **Edits also sync:** an outgoing edit is mirrored to linked devices via `SyncMessage.Sent.editMessage`
  (§5) and stored under `Content.editMessage` for the recipient.

---

## 5. `SyncMessage` in full — `:542-890`

Sent **between a user's own linked devices** (encrypted to oneself). Lets a linked device learn what
the primary (or another linked device) did: messages we sent, what we read, config changes, key
material, etc.

`oneof content` members:

| # | Field | Type | Meaning |
|---|---|---|---|
| 1 | `sent` | `Sent` | Transcript of a message *we* sent. The big one — see below. |
| 2 | `contacts` | `Contacts` | Legacy full contacts dump as an attachment blob. See below. |
| 4 | `request` | `Request` | Ask another device to send us `CONTACTS`/`BLOCKED`/`CONFIGURATION`/`KEYS`. |
| 6 | `blocked` | `Blocked` | The block list: `{numbers[]=1, acis[]=3, groupIds[]=2, acisBinary[]=4}`. |
| 7 | `verified` | `Verified` | Safety-number verification state of a contact. See `Verified` below. |
| 9 | `configuration` | `Configuration` | App settings: `{readReceipts=1, unidentifiedDeliveryIndicators=2, typingIndicators=3, linkPreviews=6}`. |
| 11 | `viewOnceOpen` | `ViewOnceOpen` | We opened a view-once message: `{senderAci=3, timestamp=2, senderAciBinary=4}`. |
| 12 | `fetchLatest` | `FetchLatest` | Tells device to re-fetch `LOCAL_PROFILE=1`/`STORAGE_MANIFEST=2`/`SUBSCRIPTION_STATUS=3`. |
| 13 | `keys` | `Keys` | Storage-service master key material. See below. |
| 14 | `messageRequestResponse` | `MessageRequestResponse` | How a message request was answered: `{threadAci=2, groupId=3, type=4 (ACCEPT/DELETE/BLOCK/BLOCK_AND_DELETE/SPAM/BLOCK_AND_SPAM), threadAciBinary=5}`. |
| 15 | `outgoingPayment` | `OutgoingPayment` | A payment we sent (MobileCoin details). |
| 18 | `pniChangeNumber` | `PniChangeNumber` | We changed phone number: serialized identity key pair / signed prekey / last-resort kyber prekey / registrationId / newE164. |
| 19 | `callEvent` | `CallEvent` | A call happened: conversationId, callId, timestamp, Type, Direction, Event. (call body = agent 7) |
| 20 | `callLinkUpdate` | `CallLinkUpdate` | `{rootKey=1, adminPasskey=2, type=3}`. |
| 21 | `callLogEvent` | `CallLogEvent` | Clear/mark-read call log. |
| 22 | `deleteForMe` | `DeleteForMe` | Local (this-account-only) deletes of messages/attachments/conversations, by `AddressableMessage`+`ConversationIdentifier`. |
| 23 | `deviceNameChange` | `DeviceNameChange` | `{deviceId=2}` changed its name. |
| 24 | `attachmentBackfillRequest` | `AttachmentBackfillRequest` | Ask another device to re-supply an attachment we lack. |
| 25 | `attachmentBackfillResponse` | `AttachmentBackfillResponse` | Reply with the attachment pointer(s) or an error/status. |
| 26 | `usernameChange` | `UsernameChange` | Empty marker — username changed; re-fetch. |

Outside the `oneof` (because protobuf forbids `repeated` in a `oneof`):

| # | Field | Type | Meaning |
|---|---|---|---|
| 5 | `read` | repeated `Read` | Messages we read. See below. |
| 10 | `stickerPackOperation` | repeated `StickerPackOperation` | `{packId=1, packKey=2, type=3 (INSTALL/REMOVE)}`. |
| 16 | `viewed` | repeated `Viewed` | Messages we viewed (e.g. view-once / stories): `{senderAci=3, timestamp=2, senderAciBinary=4}`. |
| 8 | `padding` | `bytes` | Length-obscuring padding for the sync message itself (independent of §8). |

Field 3 (`groups`) and 17 (`pniIdentity`) are reserved/removed.

### `SyncMessage.Sent` (the transcript) — `:543-574`

When we send a message, our other devices need a copy. This is it.

```proto
message Sent {
  message UnidentifiedDeliveryStatus {
    optional string destinationServiceId = 3;
    optional bool   unidentified         = 2;   // was the message delivered sealed-sender?
    optional bytes  destinationPniIdentityKey = 5; // only for PNI destinations
    optional bytes  destinationServiceIdBinary = 6;
  }
  message StoryMessageRecipient { destinationServiceId=1; distributionListIds[]=2; isAllowedToReply=3; destinationServiceIdBinary=5; }

  optional string      destinationE164          = 1;   // legacy
  optional string      destinationServiceId     = 7;   // the 1:1 recipient (absent for group msgs)
  optional uint64      timestamp                = 2;   // == the sent DataMessage.timestamp
  optional DataMessage message                  = 3;   // the message we sent (mutually exclusive with editMessage/storyMessage)
  optional uint64      expirationStartTimestamp = 4;   // when the disappearing timer started counting
  repeated UnidentifiedDeliveryStatus unidentifiedStatus = 5;  // per-recipient sealed-sender status
  optional bool        isRecipientUpdate        = 6 [default=false];
  optional StoryMessage storyMessage            = 8;
  repeated StoryMessageRecipient storyMessageRecipients = 9;
  optional EditMessage editMessage              = 10;
  optional bytes       destinationServiceIdBinary = 12;
}
```

Key points for **recording our own outgoing message from a linked device**:

- `message` (3) holds the actual `DataMessage` we sent — store it as an *outgoing* message in the
  conversation identified by `destinationServiceId` (1:1) or by `message.groupV2` (group).
- `timestamp` (2) equals the `DataMessage.timestamp`; use it as the message id.
- `expirationStartTimestamp` (4): for disappearing messages, the moment the timer began (set when the
  recipient list is finalized), so all our devices expire it at the same wall-clock time.
- `unidentifiedStatus` (5): one entry per recipient, telling us whether each got it sealed-sender. In
  groups this enumerates every recipient.
- `isRecipientUpdate` (6): when `true`, this `Sent` is *not* a new message — it only **adds more
  recipients / updates delivery status** for an already-synced `timestamp` (e.g. a group message that
  was re-sent to a member who came back online). Don't duplicate the message; merge status.
- For an **edit** we sent, `editMessage` (10) is set instead of `message`. For a **story** we sent,
  `storyMessage` (8) + `storyMessageRecipients` (9).

### `SyncMessage.Read` — `:602-607`

```proto
message Read {
  optional string senderAci       = 3;   // author of the message we read
  optional uint64 timestamp       = 2;   // that message's DataMessage.timestamp
  optional bytes  senderAciBinary = 4;
}
```
One per message we read on another device; lets all our devices clear unread state and (if read
receipts are on) lets us know to send/withhold read receipts. `Viewed` and `ViewOnceOpen` have the
identical `{senderAci, timestamp, senderAciBinary}` shape.

### `SyncMessage.Keys` — `:654-659`

```proto
message Keys {
  reserved /*storageService*/ 1;   // OLD: raw storage-service master key
  reserved /*master*/ 2;           // OLD: master key
  optional string accountEntropyPool = 3;   // AEP — root secret; all other keys derive from this
  optional bytes  mediaRootBackupKey = 4;   // root key for backup media
}
```

> ⚠️ **Migration note:** fields 1 (`storageService`) and 2 (`master`) are now **reserved/removed**.
> Current clients sync the **Account Entropy Pool (`accountEntropyPool`, field 3)** — a string from
> which the storage-service key, the master key, etc. are *derived* — plus `mediaRootBackupKey`. The
> prompt's "storageService master key + accountEntropyPool" reflects the historical shape; on
> main-branch the master/storageService keys are no longer sent directly. The actual derivation of
> the storage-service key from the AEP is a libsignal account-keys concern (not in this proto).

### `SyncMessage.Contacts` (legacy) — `:576-579`

```proto
message Contacts { optional AttachmentPointer blob = 1; optional bool complete = 2 [default=false]; }
```
A full contact dump delivered as a **CDN attachment** (`blob`), not inline. The blob is a length-
delimited stream of `ContactDetails` messages (`:933-953`: `number=1, aci=9, aciBinary=13, name=2,
avatar=3, expireTimer=8, expireTimerVersion=12, inboxPosition=10`). `complete=true` marks the final
chunk. Decoding the blob uses `ChunkedInputStream` framing (length-prefixed records). This is legacy —
modern contact/identity sync goes through storage service (`StorageService.proto`, separate doc).
The `groups` sync (`field 3`) is reserved/removed — there is no group attachment sync anymore.

### `Verified` — `:527-540`

```proto
message Verified {
  enum State { DEFAULT=0; VERIFIED=1; UNVERIFIED=2; }
  optional string destinationAci       = 5;
  optional bytes  identityKey          = 2;   // the contact's identity key we're attesting to
  optional State  state                = 3;
  optional bytes  nullMessage          = 4;   // padding to obscure length
  optional bytes  destinationAciBinary = 6;
}
```

---

## 6. Receipts, typing, null, decryption-error

### ReceiptMessage — `:451-460`

```proto
message ReceiptMessage {
  enum Type { DELIVERY=0; READ=1; VIEWED=2; }
  optional Type   type      = 1;
  repeated uint64 timestamp = 2;   // the DataMessage.timestamp(s) being acknowledged
}
```
A single receipt can acknowledge **many** messages at once (`timestamp` is repeated). `DELIVERY`
receipts are generated by the client on receipt; `READ` when the user reads (only if read receipts
enabled); `VIEWED` for view-once/stories. (Note: *server* delivery receipts for non-sealed messages
arrive as `Envelope.type = SERVER_DELIVERY_RECEIPT` with empty content — those are not `Content`
messages; see §9.)

### TypingMessage — `:462-471`

```proto
message TypingMessage {
  enum Action { STARTED=0; STOPPED=1; }
  optional uint64 timestamp = 1;   // when the typing event occurred (also dedup key)
  optional Action action    = 2;
  optional bytes  groupId   = 3;   // present ⇒ typing in this group; absent ⇒ 1:1
}
```
Sent with `ContentHint = IMPLICIT` (no resend, no error UI). `STOPPED` is also sent when the user
sends the message.

### NullMessage — `:447-449`

```proto
message NullMessage { optional bytes padding = 1; }
```
A no-op message carrying only padding. Used to (a) keep a session "warm" / exercise the ratchet, and
(b) accompany a `Verified` sync so the verification message has a plausible length. Carries no
user-visible content.

### DecryptionErrorMessage + resend request — `service.proto:20-24`, `protocol.rs:873-960`

```proto
message DecryptionErrorMessage {
  optional bytes  ratchetKey = 1;  // public ratchet key from the SignalMessage that failed (1:1 only)
  optional uint64 timestamp  = 2;  // the failed message's timestamp
  optional uint32 deviceId   = 3;  // the sender device that produced the failed message
}
```

This is the "I couldn't decrypt your message, please resend" mechanism (a.k.a. retry receipt).

**How it's built (sender of the *error*, i.e. the original recipient)** —
`DecryptionErrorMessage::for_original` (`protocol.rs:881`):

- `ratchetKey` is extracted from the failed ciphertext:
  - `Whisper` (DOUBLE_RATCHET): `SignalMessage.sender_ratchet_key()`.
  - `PreKey`: `PreKeySignalMessage.message().sender_ratchet_key()`.
  - `SenderKey` (group): **`None`** — sender-key messages have no per-message ratchet key.
  - `Plaintext`: error — you cannot build a DEM for plaintext content.
- `timestamp` = the original message's timestamp; `deviceId` = the original sender's device.

**How it travels:** because the failed session is untrustworthy, the DEM is **not** encrypted in that
session. It is wrapped in a `PlaintextContent` (§8) and sent as `Envelope.type = PLAINTEXT_CONTENT`,
or — when sealed-sender — as a `UNIDENTIFIED_SENDER` message whose inner USMC type is
`PLAINTEXT_CONTENT`. On Android (`MessageDecryptor.kt:520-535`):

1. On a `ProtocolException` during decrypt, build `DecryptionErrorMessage.forOriginalMessage(
   originalContent, envelopeType, clientTimestamp, senderDevice)`.
2. The `originalContent`/`envelopeType` come from the failed `UnidentifiedSenderMessageContent` if
   sealed, else from the raw `envelope.content` + `envelope.type.toCiphertextMessageType()`
   (mapping at `:550-558`: DOUBLE_RATCHET→WHISPER, PREKEY_MESSAGE→PREKEY,
   UNIDENTIFIED_SENDER→SENDERKEY, PLAINTEXT_CONTENT→PLAINTEXT).
3. Enqueue `SendRetryReceiptJob(sender, groupId, decryptionErrorMessage)`.
4. Rate-limited: max `retryReceiptMaxCount` errors per sender within `retryReceiptMaxCountResetAge`
   (`:327-338`).

**On the original sender's side:** receiving a DEM means a peer failed to decrypt. The sender looks up
the message by `(timestamp, deviceId)`, archives the bad session (if `ratchetKey` matches the current
session — so stale DEMs are ignored), and **re-sends** the original content (subject to its
`ContentHint`: only `RESENDABLE` content is actually resent — see §7).

`extract_decryption_error_message_from_serialized_content` (`protocol.rs:961`) shows the inverse: a
serialized `Content` ending in the `0x80` padding byte, with `decryptionErrorMessage` set.

---

## 7. Sealed sender

Sealed sender hides the *sender's* identity from the **server** (the server sees only the recipient).
The recipient still learns who sent it, via a `SenderCertificate` inside the encrypted payload.
Source: `sealed_sender.proto`, `sealed_sender.rs`.

### Certificate chain

```
TrustRoot (hardcoded XEd25519 pubkey)
   └─signs→ ServerCertificate {id, key}
                 └─signs→ SenderCertificate {senderUuid, senderE164?, senderDevice, expires, identityKey}
```

**ServerCertificate** — `sealed_sender.proto:10-18`

```proto
message ServerCertificate {
  message Certificate { optional uint32 id = 1; optional bytes key = 2; }  // the server's signing pubkey
  optional bytes certificate = 1;   // serialized Certificate
  optional bytes signature   = 2;   // trust-root's signature over `certificate`
}
```
Validated against the trust root (`ServerCertificate::validate`, `sealed_sender.rs:159`). Revoked IDs
are rejected (`REVOKED_SERVER_CERTIFICATE_KEY_IDS = [0xDEADC357]`, `:47`). libsignal ships a table of
`KNOWN_SERVER_CERTIFICATES` (staging id 2, prod id 3, test id 0x7357C357 — `:58-87`) so a sender
certificate may *reference* a server cert by id instead of embedding it.

**SenderCertificate** — `sealed_sender.proto:20-38`

```proto
message SenderCertificate {
  message Certificate {
    optional string  senderE164    = 1;   // sender's phone number (optional)
    oneof senderUuid { string uuidString = 6; bytes uuidBytes = 7; }   // sender's ACI
    optional uint32  senderDevice  = 2;   // sender's device id
    optional fixed64 expires       = 3;   // expiry, epoch ms
    optional bytes   identityKey   = 4;   // sender's identity public key (must match the inner message)
    oneof signer { bytes /*ServerCertificate*/ certificate = 5; uint32 id = 8; }  // embedded or referenced
  }
  optional bytes certificate = 1;   // serialized Certificate
  optional bytes signature   = 2;   // ServerCertificate.key's signature over `certificate`
}
```
Validation (`SenderCertificate::validate_with_trust_roots`, `:332`): (1) the embedded/referenced
ServerCertificate is signed by *some* trust root (checked constant-time across all roots, `:339-350`);
(2) the server cert's key signed this sender certificate; (3) `validation_time <= expires`.

### UnidentifiedSenderMessageContent (the inner, signed payload)

Both v1 and v2 ultimately encrypt this protobuf (`UnidentifiedSenderMessage.Message`,
`sealed_sender.proto:42-63`):

```proto
message Message {
  enum Type { PREKEY_MESSAGE=1; MESSAGE=2; SENDERKEY_MESSAGE=7; PLAINTEXT_CONTENT=8; }
  enum ContentHint { /*0 reserved=Default*/ RESENDABLE=1; IMPLICIT=2; }
  optional Type        type              = 1;   // what kind of CiphertextMessage `content` is
  optional bytes /*SenderCertificate*/ senderCertificate = 2;
  optional bytes       content           = 3;   // the actual ciphertext (a SignalMessage/PreKeySignalMessage/SenderKeyMessage), or PlaintextContent
  optional ContentHint contentHint       = 4;
  optional bytes       groupId           = 5;   // for fan-out / resend routing
}
```

- `type` maps to `CiphertextMessageType` (`From<ProtoMessageType>`, `sealed_sender.rs:430-441`).
- `content` is the *already Double-Ratchet/sender-key-encrypted* message (the math layer's output) —
  sealed sender adds an outer envelope around it.
- **ContentHint** (`sealed_sender.proto:52-56`, Java enum `ContentHint.java`):
  - `DEFAULT (0)` — won't be resent; show decrypt errors immediately.
  - `RESENDABLE (1)` — sender will resend on a DEM; delay error UI.
  - `IMPLICIT (2)` — no real content (typing, receipts); never show an error.
  Stored in the USMC, *not* in `Content`. Note `Default` is encoded as **absent** (proto value 0 is
  reserved), so on the wire absence ⇒ Default (`ContentHint::to_proto`, `:467-473`).

### The version byte

Every sealed-sender blob begins with **one version byte** of the form `(requiredVersion << 4) |
currentVersion` (`sealed_sender.rs:1294-1305`):

| Byte | Meaning |
|---|---|
| `0x11` | Sealed Sender **v1** (`SEALED_SENDER_V1_FULL_VERSION`, `:631`). |
| `0x22` | Sealed Sender **v2**, recipients keyed by raw ACI UUID (`SEALED_SENDER_V2_UUID_FULL_VERSION`, `:633`). |
| `0x23` | Sealed Sender **v2**, recipients keyed by ServiceId fixed-width binary (`SEALED_SENDER_V2_SERVICE_ID_FULL_VERSION`, `:634`). **Current for sending.** |

`version = byte >> 4`; deserialize dispatches on the high nibble (`:641-644`). **v2 is current**; v1
is still accepted on receive.

### Sealed Sender v1 (single-recipient KEM)

Wire = version byte `0x11` ‖ protobuf `UnidentifiedSenderMessage`:

```proto
message UnidentifiedSenderMessage {
  optional bytes ephemeralPublic  = 1;   // E.pub
  optional bytes encryptedStatic  = 2;   // AES-CTR(senderIdentityPublic) ‖ mac10
  optional bytes encryptedMessage = 3;   // AES-CTR(serialized USMC) ‖ mac10
}
```

**KDF chain** (`EphemeralKeys::calculate` `:719-748`, `StaticKeys::calculate` `:782-805`):

- Salt prefix string, **verbatim**: `"UnidentifiedDelivery"` (`SALT_PREFIX`, `sealed_sender.rs:717`).
- **Ephemeral keys** — 96 bytes via `HKDF-SHA256`:
  - `ikm  = ECDH(theirIdentityPub, E.priv)`  (sending) / `ECDH(E.pub, ourIdentityPriv)` (receiving)
  - `salt = "UnidentifiedDelivery" ‖ recipientPub ‖ senderEphemeralPub`
    (sending order; receiving swaps the two pubkeys — `:729-733`)
  - `info = ""` (empty)
  - output 96 bytes → `(chain_key[32], cipher_key[32], mac_key[32])`.
- **Static keys** — 96 bytes via `HKDF-SHA256`, **first 32 bytes discarded**:
  - `ikm  = ECDH(recipientIdentityPub, senderIdentityPriv)`
  - `salt = chain_key ‖ encryptedStatic`  (the *ciphertext including its 10-byte MAC*, `:788`)
  - `info = ""`
  - output 96 bytes → `(_discard[32], cipher_key[32], mac_key[32])`.

**Symmetric cipher** = `aes256_ctr_hmacsha256` (`crypto.rs:30-81`):
- AES-256-**CTR** with a **16-byte all-zero nonce/IV** (`zero_nonce = [0u8;16]`, `Ctr32BE`, `:34-35`).
- Append **HMAC-SHA256 truncated to the first 10 bytes** over the ciphertext (`mac[..10]`, `:63`).
- So `encryptedStatic = AES_CTR(cipher_key, senderIdentityPublic) ‖ HMAC(mac_key, ct)[..10]`, and
  `encryptedMessage = AES_CTR(cipher_key, USMC) ‖ HMAC(mac_key, ct)[..10]`.

**Pseudocode** (verbatim from `sealed_sender.rs:954-965`):
```
e_pub, e_priv                  = X25519.generateEphemeral()
e_chain, e_cipherKey, e_macKey = HKDF(salt="UnidentifiedDelivery" || recipientIdentityPublic || e_pub, ikm=ECDH(recipientIdentityPublic, e_priv), info="")
e_ciphertext                   = AES_CTR(key=e_cipherKey, input=senderIdentityPublic)
e_mac                          = Hmac256(key=e_macKey, input=e_ciphertext)        // truncated to 10 bytes
s_cipherKey, s_macKey = HKDF(salt=e_chain || e_ciphertext || e_mac, ikm=ECDH(recipientIdentityPublic, senderIdentityPrivate), info="")
s_ciphertext          = AES_CTR(key=s_cipherKey, input=sender_certificate || message_ciphertext)
s_mac                 = Hmac256(key=s_macKey, input=s_ciphertext)                 // truncated to 10 bytes
message_to_send = s_ciphertext || s_mac
```
On decrypt, after recovering the USMC, libsignal asserts the recovered sender static key equals the
key inside the `SenderCertificate` (`:1916`).

### Sealed Sender v2 (multi-recipient KEM) — **current**

Used so the same message body is encrypted **once** but fanned out to many
recipients/devices. **Not protobuf** — a hand-packed flat format. The shared body is encrypted with
**AES-256-GCM-SIV** under a one-time key; per-recipient we only ship a 32-byte XOR-masked seed +
16-byte auth tag.

**Constants** (`sealed_sender.rs:1039-1044`): `MESSAGE_KEY_LEN=32`, `CIPHER_KEY_LEN=32` (AES-256),
`AUTH_TAG_LEN=16`, `PUBLIC_KEY_LEN=32` (Curve25519, no type byte).

**KDF labels, verbatim** (`:1034-1037`):
- `LABEL_R  = "Sealed Sender v2: r (2023-08)"`  → derives ephemeral private key `r`
- `LABEL_K  = "Sealed Sender v2: K"`            → derives the AES-GCM-SIV content key `K`
- `LABEL_DH = "Sealed Sender v2: DH"`           → per-recipient seed mask
- `LABEL_DH_S = "Sealed Sender v2: DH-sender"`  → per-recipient authentication tag

All four use `HKDF-SHA256` with **no salt** (`Hkdf::new(None, …)`).

- `DerivedKeys::new(M)` builds `HKDF(None, M)`; `derive_e()` expands `LABEL_R`→32 bytes→PrivateKey;
  `derive_k()` expands `LABEL_K`→32 bytes (`:1051-1077`).
- `apply_agreement_xor` (`:1085-1115`): `mask = HKDF(None, DH(ours, theirs) ‖ ourPub ‖ theirPub).
  expand(LABEL_DH, 32)`; result is `mask XOR input`. (sending vs receiving swap the two pubkeys.)
- `compute_authentication_tag` (`:1125-1154`): `AT = HKDF(None, DH(ourIdentity, theirIdentity) ‖
  E.pub ‖ encrypted_message_key ‖ ourPub ‖ theirPub).expand(LABEL_DH_S, 16)`.

**Content encryption** (`:1415-1431`): `Aes256GcmSiv(K).encrypt_in_place_detached(nonce=ALL_ZERO,
aad=EMPTY, USMC)`; the 16-byte GCM-SIV tag is appended after the ciphertext. **No nonce** (zero) and
**no AAD**, safe because `K` is single-use.

**Pseudocode** (verbatim `:1251-1275`):
```
ENCRYPT(message, R_i):
    M = Random(32)
    r = KDF(label_r, M, len=32)
    K = KDF(label_K, M, len=32)
    E = DeriveKeyPair(r)
    for i in num_recipients:
        C_i  = KDF(label_DH,   DH(E, R_i) || E.public || R_i.public, len=32) XOR M
        AT_i = KDF(label_DH_s, DH(S, R_i) || E.public || C_i || S.public || R_i.public, len=16)
    ciphertext = AEAD_Encrypt(K, message)
    return E.public, C_i, AT_i, ciphertext

DECRYPT(E.public, C, AT, ciphertext):
    M = KDF(label_DH, DH(E, R) || E.public || R.public, len=32) xor C
    r = KDF(label_r, M, len=32)
    K = KDF(label_K, M, len=32)
    E' = DeriveKeyPair(r)
    if E.public != E'.public:   return DecryptionError
    message = AEAD_Decrypt(K, ciphertext)   // includes S.public via the USMC's SenderCertificate
    AT' = KDF(label_DH_s, DH(S, R) || E.public || C || S.public || R.public, len=16)
    if AT != AT':               return DecryptionError
    return message
```

**On-wire encoding — SentMessage** (server-bound, multi-recipient; `:1322-1355`, builder `:1474-1613`):

```
SentMessage {
    version_byte: u8,            // 0x23 (or 0x22 legacy)
    count:        varint,        // number of recipient entries (protobuf-style unsigned varint)
    recipients:   [PerRecipientData | ExcludedRecipient; count],
    e_pub:        [u8; 32],      // shared ephemeral public key
    message:      [u8]           // shared AES-GCM-SIV(USMC) ‖ 16-byte tag  (remaining bytes)
}

PerRecipientData {
    recipient: [u8; 17],         // ServiceId fixed-width binary (1 prefix byte + 16 UUID); for 0x22 it's a bare 16-byte ACI
    devices:   [DeviceList…],    // last entry has has_more=0
    c:         [u8; 32],         // C_i  (the XOR-masked seed)
    at:        [u8; 16],         // AT_i (authentication tag)
}

ExcludedRecipient {              // recipient present but no devices targeted
    recipient: [u8; 17],
    no_devices_marker: u8 = 0,   // 0 is never a valid device id
}

DeviceList {                     // 3 bytes
    device_id:        u8,
    has_more:         u1,        // high bit of the next field
    unused:           u1,
    registration_id:  u14,       // big-endian; 'has_more' = 0x8000 bit, regId masked with 0x3FFF
}
```
Big-endian, unaligned, varint = protobuf varint (`:1357-1361`). The server splits this into one
**ReceivedMessage** per recipient device.

**On-wire encoding — ReceivedMessage** (what each recipient gets, `:1309-1317`):
```
ReceivedMessage {
    version_byte: u8,     // always 0x22 on delivery (format unchanged since)
    c:            [u8; 32],
    at:           [u8; 16],
    e_pub:        [u8; 32],
    message:      [u8]    // shared ciphertext ‖ tag
}
```
Note the field **order differs** between Sent (`recipients… ‖ e_pub ‖ message`) and Received
(`c ‖ at ‖ e_pub ‖ message`) — the recipient's `c`+`at` are pulled out front. Parsing/fan-out:
`SealedSenderV2SentMessage::parse` (`:1647`) and `received_message_parts_for_recipient` (`:1771`).
The in-memory v2 prefix the receiver parses is `C ‖ AT ‖ E.pub ‖ ciphertext` (`PrefixRepr`,
`:670-676`).

**v2 receive validation** (`:1924-1975`): recover `M` via `apply_agreement_xor`; re-derive `E'` and
require `E'.pub == E.pub`; AES-GCM-SIV-decrypt the shared message; then recompute `AT` from the
sender's identity key (taken from the decrypted USMC's `SenderCertificate`) and require it matches.
v2 **requires an existing `SessionRecord`** for each recipient (it reads their `registration_id`).

### Unidentified-access key derivation (from profile key)

`UnidentifiedAccess.deriveAccessKeyFrom(profileKey)` (`UnidentifiedAccess.java:52-66`):

```
nonce  = 12 zero bytes
input  = 16 zero bytes
cipher = AES/GCM/NoPadding, key = profileKey (32 bytes), iv = nonce, tagLen = 128 bits
ciphertext = cipher.doFinal(input)          // 16 bytes ciphertext + 16 bytes tag
accessKey  = first 16 bytes of ciphertext   // ByteUtil.trim(ciphertext, 16)
```

So the **unidentified access key = the first 16 bytes of AES-256-GCM(key=profileKey, iv=0¹², pt=0¹⁶)**.
The recipient publishes a *commitment* derived from this so the server can authorize sealed-sender
delivery without learning the sender. (The string "UnidentifiedDelivery" is the *KDF salt* in v1
above, a separate use — don't conflate it with this access-key derivation, which uses no string.)

> ⚠️ The prompt referenced an HKDF "UnidentifiedDelivery" key *from* the profile key. On main-branch
> Android the access key is the AES-GCM construction above (no HKDF, no "UnidentifiedDelivery" string).
> The "UnidentifiedDelivery" string is only the v1 sealed-sender KDF salt.

---

## 8. Plaintext padding (before Double Ratchet / sender-key encryption)

Source: `PushTransportDetails.java`, plus `protocol.rs:819-871` for the PlaintextContent variant.

The serialized `Content` is padded **before** it is handed to the encryption layer, and the padding is
stripped **after** decryption (`SignalServiceCipher.java:238` calls `getStrippedPaddingMessageBody`).

**Pad** (`getPaddedMessageBody`, `PushTransportDetails.java:37-46`):
1. Append a single terminator byte `0x80` right after the message.
2. Zero-pad with `0x00` up to a multiple of the block size, **80 bytes** (`PADDING_BLOCK_SIZE=80`).
   (The exact length math has a `+1/-1` fudge so the *outer* cipher's own block padding only adds one
   byte, not a whole block — `:38-41`.)

Result layout:
```
[ ...Content protobuf bytes... ][ 0x80 ][ 0x00 0x00 … 0x00 ]   total length ≡ 0 (mod 80) (modulo the fudge)
```

**Strip** (`getStrippedPaddingMessageBody`, `:18-35`): scan from the end; skip `0x00` bytes; the first
`0x80` from the end marks the boundary — everything before it is the message. If a non-`0x00`,
non-`0x80` byte is hit first, the padding is malformed and the buffer is returned unstripped.

`PlaintextContent` (libsignal, `protocol.rs:809-871`) uses the **same `0x80` boundary byte** but a
different leading marker: it prefixes a single identifier byte `0xC0`
(`PLAINTEXT_CONTEXT_IDENTIFIER_BYTE`) before the `Content` and appends one `0x80`
(`PADDING_BOUNDARY_BYTE`) — so a PlaintextContent body is `0xC0 ‖ Content ‖ 0x80`. (Its `body()`
strips the leading `0xC0`.) PlaintextContent is fixed-shape so it isn't block-padded.

---

## 9. `Envelope.type` → `CiphertextMessage` mapping

`Envelope` (`SignalService.proto:13-104`) carries the encrypted blob in `content` (field 8) and tells
us how to decrypt it via `type` (field 1). The mapping (decrypt side: `SignalServiceCipher.java:193-235`;
type enum: `CiphertextMessageType` in `protocol.rs:35-39`):

| `Envelope.Type` (value) | `content` is… | libsignal type | `CiphertextMessageType` | How it's decrypted |
|---|---|---|---|---|
| `UNKNOWN = 0` | — | — | — | Invalid. |
| `DOUBLE_RATCHET = 1` | version byte ‖ `SignalMessage` | `SignalMessage` | `Whisper = 2` | `SessionCipher.decrypt(SignalMessage)` — established session. |
| `PREKEY_MESSAGE = 3` | version byte ‖ `PreKeySignalMessage` | `PreKeySignalMessage` | `PreKey = 3` | `SessionCipher.decrypt(PreKeySignalMessage)` — establishes a new session. |
| `SERVER_DELIVERY_RECEIPT = 5` | empty | — | — | Server-generated delivery ack for a non-sealed message; **no `Content`**. clientTimestamp = original msg time, serverTimestamp = delivery time. |
| `UNIDENTIFIED_SENDER = 6` | version byte ‖ `UnidentifiedSenderMessage` (v1) **or** v2 multi-recipient blob | sealed sender | inner type from USMC (PreKey/Whisper/SenderKey/Plaintext) | `SealedSessionCipher.decrypt` → recover USMC → decrypt its `content` with the type the USMC declares. §7. |
| `PLAINTEXT_CONTENT = 8` | marker byte `0xC0` ‖ `Content` ‖ `0x80` | `PlaintextContent` | `Plaintext = 8` | Not encrypted; `PlaintextContent(content).getBody()`. Only used for `DecryptionErrorMessage` resend requests (§6). |

Reserved/removed envelope types: `2 (KEY_EXCHANGE)`, `7 (SENDERKEY_MESSAGE)`.

Notes:
- Sender-key (group) messages are **never** their own `Envelope.type`; they always travel inside
  `UNIDENTIFIED_SENDER`, with the USMC `type = SENDERKEY_MESSAGE (7)` → `CiphertextMessageType::SenderKey`.
- `CiphertextMessageType` raw values (`protocol.rs:36-39`): `Whisper=2, PreKey=3, SenderKey=7,
  Plaintext=8`. These line up with `Envelope.Type`/USMC `Type` except `PreKey` (3 in
  CiphertextMessageType, value 3 = `PREKEY_MESSAGE` in envelope but value 1 = `PREKEY_MESSAGE` in the
  USMC `Type` enum — see the `assert` in `From<ProtoMessageType>`, `:439`/`:453`).
- The non-payload `Envelope` fields most relevant here: `sourceServiceId`(11)/`sourceServiceIdBinary`(19),
  `sourceDeviceId`(7), `destinationServiceId`(13)/`destinationServiceIdBinary`(20),
  `clientTimestamp`(5), `serverTimestamp`(10), `serverGuid`(9)/`serverGuidBinary`(21), `urgent`(14),
  `story`(16), `ephemeral`(12), `updatedPni`(15)/`updatedPniBinary`(22). For `UNIDENTIFIED_SENDER`
  the source fields are **absent** (the whole point); the sender is learned from the decrypted
  `SenderCertificate`.

---

## ⚠️ Major uncertainties / TODOs

1. **`SyncMessage.Keys` shape changed.** On main-branch, `storageService` (field 1) and `master`
   (field 2) are **reserved/removed**; clients now sync `accountEntropyPool` (3) + `mediaRootBackupKey`
   (4). The storage-service / master keys are *derived* from the AEP via libsignal account-keys (not
   in this proto). If you need to interop with older builds, you may still encounter fields 1/2.
2. **Unidentified-access key:** it is `AES-256-GCM(profileKey, iv=0¹², pt=0¹⁶)[:16]`, **not** an HKDF
   "UnidentifiedDelivery" derivation. The "UnidentifiedDelivery" string is only the v1 sealed-sender
   KDF *salt*. Double-check this matches your server's access-key commitment expectations.
3. **`END_SESSION` flag (value 1) is reserved/removed** in current `DataMessage.Flags`. Modern
   clients don't emit it; decide whether your impl needs to handle receiving it from legacy peers.
4. **v2 version byte on send vs receive:** sending uses `0x23` (ServiceId binary recipients); the
   per-recipient ReceivedMessage handed back is tagged `0x22`. Don't assume the byte is constant.
5. **CallMessage / StoryMessage bodies** are documented by name only here (agents 7 / story feature).
6. The v2 SentMessage `count` and `DeviceList.registration_id` use protobuf varint / big-endian
   bit-packing respectively — verify endianness and the `0x8000` has_more / `0x3FFF` regId masks
   against `:1508-1524` when implementing the encoder.

---

## Source files

Signal-Android (`main`), repo `signalapp/Signal-Android`:
- `lib/libsignal-service/src/main/protowire/SignalService.proto`
  https://github.com/signalapp/Signal-Android/blob/main/libsignal-service/src/main/protowire/SignalService.proto
- `.../api/crypto/SignalServiceCipher.java` (envelope→ciphertext mapping, padding strip)
  https://github.com/signalapp/Signal-Android/blob/main/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/SignalServiceCipher.java
- `.../internal/push/PushTransportDetails.java` (0x80 padding)
  https://github.com/signalapp/Signal-Android/blob/main/libsignal-service/src/main/java/org/whispersystems/signalservice/internal/push/PushTransportDetails.java
- `.../api/crypto/UnidentifiedAccess.java` (access-key derivation)
  https://github.com/signalapp/Signal-Android/blob/main/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/UnidentifiedAccess.java
- `.../api/crypto/ContentHint.java`
  https://github.com/signalapp/Signal-Android/blob/main/libsignal-service/src/main/java/org/whispersystems/signalservice/api/crypto/ContentHint.java
- `app/src/main/java/org/thoughtcrime/securesms/messages/EditMessageProcessor.kt`
  https://github.com/signalapp/Signal-Android/blob/main/app/src/main/java/org/thoughtcrime/securesms/messages/EditMessageProcessor.kt
- `app/src/main/java/org/thoughtcrime/securesms/messages/MessageDecryptor.kt` (resend/DEM flow)
  https://github.com/signalapp/Signal-Android/blob/main/app/src/main/java/org/thoughtcrime/securesms/messages/MessageDecryptor.kt

libsignal (`main`), repo `signalapp/libsignal`:
- `rust/protocol/src/proto/sealed_sender.proto`
  https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/proto/sealed_sender.proto
- `rust/protocol/src/proto/service.proto`
  https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/proto/service.proto
- `rust/protocol/src/proto/wire.proto`
  https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/proto/wire.proto
- `rust/protocol/src/sealed_sender.rs` (v1 + v2 impl, KDF labels, wire layout)
  https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/sealed_sender.rs
- `rust/protocol/src/protocol.rs` (PlaintextContent, DecryptionErrorMessage, CiphertextMessageType,
  0x80/0xC0 marker bytes)
  https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/protocol.rs
- `rust/protocol/src/crypto.rs` (aes256_ctr_hmacsha256 — zero IV, 10-byte truncated HMAC)
  https://github.com/signalapp/libsignal/blob/main/rust/protocol/src/crypto.rs
