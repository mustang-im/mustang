/** The Storage Service wire schema (`StorageService.proto`, package
 * `signalservice`), ported to our codec DSL. This is how Signal stores and
 * synchronizes the roster — contacts, groups, the own account record, story
 * lists — see Docs/06.
 *
 * Transport messages (StorageManifest/Item/...) carry AES-256-GCM ciphertext in
 * their `value`; the decrypted payloads are ManifestRecord (the id list) and
 * StorageRecord (one per item). `oneof`s are flattened: each member is its own
 * optional field and the codec only emits/reads the one that is set (mirrors
 * groups.ts / signalService.ts). uint64 version/timestamps decode as bigint
 * (`int64`) where they can exceed 2^53 (the manifest version feeds the manifest
 * key derivation); ms timestamps that fit in a JS number use `int`. Field
 * numbers are authoritative. */
import { message, string, bytes, int, int64, bool, sub, repeated, type TypeOf } from "./codec";

// --- enums (values authoritative; fields use int()) ---

export enum OptionalBool { Unset = 0, Enabled = 1, Disabled = 2 }

/** ManifestRecord.Identifier.Type — must match the StorageRecord oneof number. */
export enum RecordType {
  Unknown = 0,
  Contact = 1,
  GroupV1 = 2,
  GroupV2 = 3,
  Account = 4,
  StoryDistributionList = 5,
  CallLink = 7,
  ChatFolder = 8,
  NotificationProfile = 9,
}

export enum IdentityState { Default = 0, Verified = 1, Unverified = 2 }
export enum StorySendMode { Default = 0, Disabled = 1, Enabled = 2 }
export enum PhoneNumberSharingMode { Unknown = 0, Everybody = 1, Nobody = 2 }

// --- transport / container messages ---

export const StorageManifest = message({
  version: int64(1),          // monotonically increasing; feeds the manifest key
  value: bytes(2),            // AES-GCM(manifestKey, ManifestRecord bytes)
});
export type StorageManifest = TypeOf<typeof StorageManifest>;

export const StorageItem = message({
  key: bytes(1),              // the 16-byte raw id
  value: bytes(2),            // AES-GCM(itemKey, StorageRecord bytes)
});
export type StorageItem = TypeOf<typeof StorageItem>;

export const StorageItems = message({
  items: repeated(sub(1, () => StorageItem)),
});
export type StorageItems = TypeOf<typeof StorageItems>;

export const ReadOperation = message({   // body of PUT /v1/storage/read
  readKey: repeated(bytes(1)), // the raw 16-byte ids to fetch
});
export type ReadOperation = TypeOf<typeof ReadOperation>;

export const WriteOperation = message({  // body of PUT /v1/storage
  manifest: sub(1, () => StorageManifest), // the NEW manifest (version = old+1)
  insertItem: repeated(sub(2, () => StorageItem)),
  deleteKey: repeated(bytes(3)),
  clearAll: bool(4),
});
export type WriteOperation = TypeOf<typeof WriteOperation>;

// --- ManifestRecord (decrypted id list) ---

export const ManifestIdentifier = message({
  raw: bytes(1),              // the 16-byte storage id
  type: int(2),              // RecordType
});
export type ManifestIdentifier = TypeOf<typeof ManifestIdentifier>;

export const ManifestRecord = message({
  version: int64(1),          // == enclosing StorageManifest.version
  identifiers: repeated(sub(2, () => ManifestIdentifier)),
  sourceDevice: int(3),       // device id that wrote this manifest
  recordIkm: bytes(4),        // 32B; present => SSRE2 item-key scheme
});
export type ManifestRecord = TypeOf<typeof ManifestRecord>;

// --- ContactRecord — THE ROSTER ---

/** A user-set nickname {given, family}. */
export const ContactName = message({
  given: string(1),
  family: string(2),
});
export type ContactName = TypeOf<typeof ContactName>;

export const ContactRecord = message({
  aci: string(1),             // ACI UUID string (legacy text form)
  e164: string(2),            // phone number, +E.164
  pni: string(15),            // PNI as `PNI:`-style UUID string (legacy text form)
  profileKey: bytes(3),       // 32B profile key
  identityKey: bytes(4),      // the contact's identity public key
  identityState: int(5),      // IdentityState
  givenName: string(6),       // Signal-profile given name
  familyName: string(7),
  username: string(8),        // Signal username (name.NN)
  blocked: bool(9),
  whitelisted: bool(10),      // profile sharing / approved conversation
  archived: bool(11),
  markedUnread: bool(12),
  mutedUntilTimestamp: int64(13), // ms epoch; 0 = unmuted
  hideStory: bool(14),
  unregisteredAtTimestamp: int64(16), // ms; 0 = registered
  systemGivenName: string(17),    // from device address book
  systemFamilyName: string(18),
  systemNickname: string(19),
  hidden: bool(20),
  pniSignatureVerified: bool(21),
  nickname: sub(22, () => ContactName),
  note: string(23),
  avatarColor: int(24),       // AvatarColor (optional)
  aciBinary: bytes(25),       // 16-byte ACI UUID (preferred over #1)
  pniBinary: bytes(26),       // 16-byte PNI UUID (preferred over #15)
});
export type ContactRecord = TypeOf<typeof ContactRecord>;

// --- group records ---

export const GroupV1Record = message({
  id: bytes(1),               // legacy group id
  blocked: bool(2),
  whitelisted: bool(3),
  archived: bool(4),
  markedUnread: bool(5),
  mutedUntilTimestamp: int64(6),
});
export type GroupV1Record = TypeOf<typeof GroupV1Record>;

export const GroupV2Record = message({
  masterKey: bytes(1),        // GV2 master key → derives group secrets (Docs/04)
  blocked: bool(2),
  whitelisted: bool(3),
  archived: bool(4),
  markedUnread: bool(5),
  mutedUntilTimestamp: int64(6),
  dontNotifyForMentionsIfMuted: bool(7),
  hideStory: bool(8),
  // 9 reserved (was storySendEnabled)
  storySendMode: int(10),     // StorySendMode
  avatarColor: int(11),
  verifiedNameHash: bytes(12),
});
export type GroupV2Record = TypeOf<typeof GroupV2Record>;

// --- AccountRecord (own profile + settings; key fields) ---

export const PinnedConversationContact = message({
  serviceId: string(1),
  e164: string(2),
  serviceIdBinary: bytes(3),
});

export const PinnedConversation = message({  // oneof identifier
  contact: sub(1, () => PinnedConversationContact),
  legacyGroupId: bytes(3),
  groupMasterKey: bytes(4),
  releaseNotes: bool(5),      // ReleaseNotes is an empty message; presence only
});
export type PinnedConversation = TypeOf<typeof PinnedConversation>;

export const Payments = message({
  enabled: bool(1),
  entropy: bytes(2),
});
export type Payments = TypeOf<typeof Payments>;

export const UsernameLink = message({
  entropy: bytes(1),          // 32B encryption entropy
  serverId: bytes(2),         // 16B server-encoded UUID
  color: int(3),
});
export type UsernameLink = TypeOf<typeof UsernameLink>;

export const AccountRecord = message({
  profileKey: bytes(1),       // OUR OWN 32B profile key
  givenName: string(2),
  familyName: string(3),
  avatarUrlPath: string(4),
  noteToSelfArchived: bool(5),
  readReceipts: bool(6),
  sealedSenderIndicators: bool(7),
  typingIndicators: bool(8),
  noteToSelfMarkedUnread: bool(10),
  linkPreviews: bool(11),
  phoneNumberSharingMode: int(12),
  unlistedPhoneNumber: bool(13),
  pinnedConversations: repeated(sub(14, () => PinnedConversation)),
  payments: sub(16, () => Payments),
  universalExpireTimer: int(17), // default disappearing-msg timer
  preferredReactionEmoji: repeated(string(20)),
  subscriberId: bytes(21),
  subscriberCurrencyCode: string(22),
  storiesDisabled: bool(29),
  username: string(33),
  usernameLink: sub(35, () => UsernameLink),
  backupTier: int64(40),
});
export type AccountRecord = TypeOf<typeof AccountRecord>;

// --- other record variants (field numbers per Docs/06 §2.6) ---

export const StoryDistributionListRecord = message({
  identifier: bytes(1),
  name: string(2),
  recipientServiceIds: repeated(string(3)),
  deletedAtTimestamp: int64(4),
  allowsReplies: bool(5),
  isBlockList: bool(6),
  recipientServiceIdsBinary: repeated(bytes(7)),
});
export type StoryDistributionListRecord = TypeOf<typeof StoryDistributionListRecord>;

export const CallLinkRecord = message({
  rootKey: bytes(1),
  adminPasskey: bytes(2),
  deletedAtTimestampMs: int64(3),
});
export type CallLinkRecord = TypeOf<typeof CallLinkRecord>;

// --- StorageRecord (decrypted per-item payload; oneof flattened) ---

export const StorageRecord = message({
  contact: sub(1, () => ContactRecord),
  groupV1: sub(2, () => GroupV1Record),
  groupV2: sub(3, () => GroupV2Record),
  account: sub(4, () => AccountRecord),
  storyDistributionList: sub(5, () => StoryDistributionListRecord),
  callLink: sub(7, () => CallLinkRecord),
});
export type StorageRecord = TypeOf<typeof StorageRecord>;
