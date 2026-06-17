/** The subset of Signal's message-backup format (`backup.proto`, libsignal) that we
 * import from a link-and-sync transfer archive: recipients (contacts + groups), 1:1
 * and group chats, and the human-content chat items — text, attachments, stickers,
 * view-once, shared contacts, quotes, reactions, edits, and remote deletes. System
 * "chat update" events (membership changes, call logs, …) are not modelled here yet;
 * see Docs/10-link-sync-message-backup.
 *
 * The decompressed backup is a varint-length-delimited stream: one {@link BackupInfo}
 * then a run of {@link Frame}s. Oneofs are modelled as independent optional fields —
 * the codec reads each field by number, and only the set one appears on the wire. */
import { message, string, bytes, int, int64, bool, sub, repeated, type TypeOf } from "./codec";

export const BackupInfo = message({
  version: int64(1),
  backupTimeMs: int64(2),
  mediaRootBackupKey: bytes(3),
});
export type BackupInfo = TypeOf<typeof BackupInfo>;

export const ContactName = message({
  given: string(1),
  family: string(2),
});

/** Only the identity + name fields we need; many more exist (blocked, profileKey, …). */
export const Contact = message({
  aci: bytes(1),                  // 16-byte ACI UUID (absent for PNI-only contacts)
  pni: bytes(2),                  // 16-byte PNI UUID
  username: string(3),
  e164: int64(4),
  profileGivenName: string(11),
  profileFamilyName: string(12),
  nickname: sub(16, () => ContactName),  // user-set name
  systemGivenName: string(18),    // from the device address book
  systemFamilyName: string(19),
});
export type Contact = TypeOf<typeof Contact>;

/** A group recipient. We only need the master key to address/resolve the room; its
 * title + members come from the live group state (`getOrCreateGroupRoom`). */
export const Group = message({
  masterKey: bytes(1),
});
export type Group = TypeOf<typeof Group>;

/** Note-to-self marker. */
export const Self = message({});
export const DirectionlessMessageDetails = message({});
export const RemoteDeletedMessage = message({});

export const Recipient = message({
  id: int(1),                     // file-local id referenced by Chat/ChatItem
  contact: sub(2, () => Contact),
  group: sub(3, () => Group),
  self: sub(5, () => Self),
});
export type Recipient = TypeOf<typeof Recipient>;

export const Chat = message({
  id: int(1),                     // file-local id referenced by ChatItem.chatId
  recipientId: int(2),
  expirationTimerMs: int64(5),    // disappearing-message timer (ms)
});
export type Chat = TypeOf<typeof Chat>;

// --- attachments ---

/** The CDN locator + crypto for an attachment. For a link-and-sync transfer the
 * recent media still lives on the *transit* CDN, so `transitCdnKey` + `key` +
 * `encryptedDigest` are set and map straight onto an AttachmentPointer download. */
export const LocatorInfo = message({
  key: bytes(1),                  // 64-byte AES+MAC key (AttachmentCipher)
  size: int(3),
  transitCdnKey: string(4),
  transitCdnNumber: int(5),
  plaintextHash: bytes(10),
  encryptedDigest: bytes(11),     // SHA-256 of the encrypted blob (AttachmentPointer.digest)
});
export type LocatorInfo = TypeOf<typeof LocatorInfo>;

export const FilePointer = message({
  contentType: string(4),
  fileName: string(7),
  width: int(8),
  height: int(9),
  locatorInfo: sub(13, () => LocatorInfo),
});
export type FilePointer = TypeOf<typeof FilePointer>;

export const MessageAttachment = message({
  pointer: sub(1, () => FilePointer),
  flag: int(2),                   // NONE | VOICE_MESSAGE | BORDERLESS | GIF
});
export type MessageAttachment = TypeOf<typeof MessageAttachment>;

export const Reaction = message({
  emoji: string(1),
  authorId: int(2),
  sentTimestamp: int64(3),
  sortOrder: int64(4),
});
export type Reaction = TypeOf<typeof Reaction>;

export const Text = message({
  body: string(1),
});

export const Quote = message({
  targetSentTimestamp: int64(1),  // null if the quoted message wasn't found
  authorId: int(2),
  text: sub(3, () => Text),
});
export type Quote = TypeOf<typeof Quote>;

export const StandardMessage = message({
  quote: sub(1, () => Quote),
  text: sub(2, () => Text),
  attachments: repeated(sub(3, () => MessageAttachment)),
  reactions: repeated(sub(6, () => Reaction)),
});
export type StandardMessage = TypeOf<typeof StandardMessage>;

export const Sticker = message({
  emoji: string(4),
  data: sub(5, () => FilePointer),
});

export const StickerMessage = message({
  sticker: sub(1, () => Sticker),
  reactions: repeated(sub(2, () => Reaction)),
});
export type StickerMessage = TypeOf<typeof StickerMessage>;

export const ViewOnceMessage = message({
  attachment: sub(1, () => MessageAttachment),  // null once viewed
  reactions: repeated(sub(2, () => Reaction)),
});
export type ViewOnceMessage = TypeOf<typeof ViewOnceMessage>;

export const ContactAttachmentName = message({
  givenName: string(1),
  familyName: string(2),
  nickname: string(6),
});

export const ContactAttachment = message({
  name: sub(1, () => ContactAttachmentName),
  organization: string(7),
});

export const ContactMessage = message({
  contact: sub(1, () => ContactAttachment),
  reactions: repeated(sub(2, () => Reaction)),
});
export type ContactMessage = TypeOf<typeof ContactMessage>;

export const AdminDeletedMessage = message({
  adminId: int(1),
});

export const IncomingMessageDetails = message({
  dateReceived: int64(1),
  read: bool(3),
});

export const OutgoingMessageDetails = message({
  dateReceived: int64(2),
});

export const ChatItem = message({
  chatId: int(1),
  authorId: int(2),
  dateSent: int64(3),
  expiresInMs: int64(5),
  revisions: repeated(sub(6, () => ChatItem)),  // past edits, oldest→newest
  incoming: sub(8, () => IncomingMessageDetails),
  outgoing: sub(9, () => OutgoingMessageDetails),
  directionless: sub(10, () => DirectionlessMessageDetails),
  standardMessage: sub(11, () => StandardMessage),
  contactMessage: sub(12, () => ContactMessage),
  stickerMessage: sub(13, () => StickerMessage),
  remoteDeletedMessage: sub(14, () => RemoteDeletedMessage),
  viewOnceMessage: sub(18, () => ViewOnceMessage),
  adminDeletedMessage: sub(22, () => AdminDeletedMessage),
  // updateMessage(15): system events (membership, calls, timers) — skipped, see Docs/10
});
export type ChatItem = TypeOf<typeof ChatItem>;

export const Frame = message({
  recipient: sub(2, () => Recipient),
  chat: sub(3, () => Chat),
  chatItem: sub(4, () => ChatItem),
  // account(1), stickerPack(5), adHocCall(6), notificationProfile(7), chatFolder(8) — skipped
});
export type Frame = TypeOf<typeof Frame>;
