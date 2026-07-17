# 10 — Link-and-sync message backup (format + crypto)

The blob a primary uploads for a newly linked device (Docs/02 §B.6) is a Signal
**message backup** encrypted with the one-time `ephemeralBackupKey` from the
`ProvisionMessage`. Same container format as Signal's full account backups, just
keyed off an ephemeral key with no forward-secrecy token. Verified against
libsignal `rust/message-backup` and `rust/account-keys` (commit `main`, 2026-06).

Our code: `Encryption/MessageBackupCipher.ts` (keys + decrypt), `Proto/backup.ts`
(frame protos), `Connection/MessageBackupImport.ts` (download + import).

## 1. Key derivation

`ephemeralBackupKey` (32 bytes) plays the role of `BackupKey`. With the account
`ACI`, derive a `BackupId` then a `MessageBackupKey` (HMAC key ‖ AES key). All
HKDF-SHA256, **salt = none** (zero-length), info = the labels concatenated. The
link transfer has **no** forward-secrecy token, so it uses the legacy encryption
label (`MessageBackupKey::derive(..., None)`).

```
backupId (16)  = HKDF(ikm=backupKey, salt=∅,
                      info="20241024_SIGNAL_BACKUP_ID:" ‖ aci.serviceIdBinary())   // ACI = bare 16-byte UUID
mbk (64)       = HKDF(ikm=backupKey, salt=∅,
                      info="20241007_SIGNAL_BACKUP_ENCRYPT_MESSAGE_BACKUP:" ‖ backupId)
hmacKey = mbk[0..32]   aesKey = mbk[32..64]
```

(A full account backup derives `backupKey` from the Account Entropy Pool via
`HKDF(ikm=AEP, salt=∅, info="20240801_SIGNAL_BACKUP_KEY")` → 32 bytes, then the
same two steps. The newer forward-secrecy variant uses salt = nonce and label
`20250708_…`. Neither is used for link-and-sync.)

### Known-answer vectors (libsignal test consts, see `messageBackup.test.ts`)

```
AEP        = "dtjs858asj6tv0jzsqrsmj0ubp335pisj98e9ssnss8myoc08drhtcktyawvx45l"
backupKey  = ea26a2ddb5dba5ef9e34e1b8dea1f5ae7f255306a6d2d883e542306eaa9fe985
ACI        = 659aa5f4a28dfcc11ea1b997537a3d95
backupId   = 8a624fbc45379043f39f1391cddc5fe8
mbk(legacy) hmacKey = f425e22a607c529717e1e1b29f9fe139f9d1c7e7d01e371c7753c544a3026649
            aesKey  = e143f4ad5668d8bfed2f88562f0693f53bda2c0e55c9d71730f30e24695fd6df
```

## 2. Encrypted file framing

Legacy layout (what link-and-sync produces — no magic number):

```
file = IV(16) ‖ AES-256-CBC-PKCS7(aesKey, IV, gzip(frameStream)) ‖ HMAC-SHA256(hmacKey, IV‖ciphertext)
```

- The trailing 32 bytes are the HMAC; it covers everything before it (IV ‖ ciphertext).
- The first 16 bytes after the HMAC check are the IV; AES-256-CBC with PKCS7 (WebCrypto
  removes the padding); then gzip-inflate the result to get the frame stream.
- ⚠️ A forward-secrecy backup instead begins with the 8-byte magic number
  `"SBACKUP\x01"` followed by an unencrypted metadata blob; that path needs the
  forward-secrecy token and is **not** what we receive. We detect the magic number
  and reject with a clear error.

(Reader chain in libsignal: `GzipDecoder<BufReader<Aes256CbcReader<HmacReader<Take<R>>>>>`.)

## 3. Frame stream

`gzip(frameStream)` decompresses to a sequence of **varint-length-delimited**
protos (each proto preceded by a `uint32` varint byte length):

1. exactly one `BackupInfo` (first), then
2. any number of `Frame`s (`AccountData`, `Recipient`, `Chat`, `ChatItem`, …).

Ordering rules we rely on: a `Recipient`/`Chat` referenced by id always precedes
the referencing frame, so a single forward pass with id→object maps works.

`Proto/backup.ts` defines the subset we import (`backup.proto`, libsignal):

- `Recipient{ id=1, contact=2, group=3, self=5 }`, `Contact{ aci=1, pni=2, e164=4, names }`,
  `Group{ masterKey=1 }`
- `Chat{ id=1, recipientId=2, expirationTimerMs=5 }`
- `ChatItem{ chatId=1, authorId=2, dateSent=3, revisions=6, incoming=8, outgoing=9,
  standardMessage=11, contactMessage=12, stickerMessage=13, remoteDeletedMessage=14,
  viewOnceMessage=18, adminDeletedMessage=22 }`
- `StandardMessage{ quote=1, text=2, attachments=3, reactions=6 }`,
  `MessageAttachment{ pointer=1 }`, `FilePointer{ contentType=4, fileName=7, locatorInfo=13 }`,
  `LocatorInfo{ key=1, size=3, transitCdnKey=4, transitCdnNumber=5, encryptedDigest=11 }`,
  `Reaction{ emoji=1, authorId=2 }`, `Quote{ targetSentTimestamp=1 }`

## 4. What we import (and what we skip)

`MessageBackupImport` does a single forward pass building `Recipient`/`Chat` id maps,
then turns each `ChatItem` into a `SignalChatMessage` — mirroring the live receive path.

Implemented:
- **1:1 chats** (contact recipient → `Signal1to1ChatRoom`), **group chats** (group
  recipient → `getOrCreateGroupRoom(masterKey)`, members/title from live group state),
  and **Note to Self** (self recipient).
- **Author** per item (self for outgoing, else the `authorId` recipient — the group
  member or 1:1 partner). Contact names seeded from the backup.
- **Text**, **attachments** (FilePointer transit-CDN locator → `SignalMedia.downloadFilePointer`,
  background download+decrypt+persist), **stickers**, **view-once media**, **shared
  contacts** (as a name placeholder).
- **Reactions** (`reactions.set(author, emoji)`), **edits** (`revisions` present →
  `edited`, outer item is the latest text), **quotes** (`inReplyTo`), **remote/admin
  deletes** (tombstone), **disappearing-message timer** (`Chat.expirationTimerMs`).
- Dedup by send timestamp against already-delivered live messages.

FilePointer note: a transfer archive references recent media on the **transit** CDN
(`transitCdnKey`+`key`+`encryptedDigest`), which maps straight onto an AttachmentPointer
download. Media-tier-only (`mediaTierCdnNumber` without a transit locator) or expired
(>45 days) attachments are skipped — no manual transfer can recover them.

Skipped (logged counts, TODO): `ChatUpdateMessage` **system events** (group membership
changes, call logs, profile/timer-change notices, session-switchover) — they map to the
separate `ChatRoomEvent` surface (~50 subtypes); plus polls, gift badges, payment
notifications, and story replies.
