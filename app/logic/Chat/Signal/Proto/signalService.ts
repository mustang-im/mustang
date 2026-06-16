/** The Signal end-to-end message schema (SignalService.proto), ported to our codec
 * DSL. Field numbers are authoritative — see Docs/03-messaging-content. This is
 * the messaging-essential subset (Envelope + Content + DataMessage and its core
 * sub-messages); rarely-used sub-structs (payments, polls, gift badges, stories,
 * the full SyncMessage/CallMessage) are referenced as raw bytes for now and can
 * be promoted to typed `sub(...)` schemas when those features are built.
 *
 * Note: uint64 fields are decoded as JS numbers; that is exact for timestamps
 * (ms since epoch) but would lose precision for full 64-bit random ids — none of
 * those are in this file (CallMessage.id lives in the calling layer). */
import { message, string, bytes, int, bool, fixed64, sub, repeated, type TypeOf } from "./codec";

// --- enums (values are authoritative; fields below use int()) ---

export enum EnvelopeType {
  Unknown = 0,
  DoubleRatchet = 1,        // content = versionByte | SignalMessage
  PreKeyMessage = 3,        // content = versionByte | PreKeySignalMessage
  ServerDeliveryReceipt = 5,
  UnidentifiedSender = 6,   // sealed sender (content = sealed-sender message)
  PlaintextContent = 8,     // content = versionByte | PlaintextContent (DecryptionErrorMessage)
}

export enum ReceiptType { Delivery = 0, Read = 1, Viewed = 2 }
export enum TypingAction { Started = 0, Stopped = 1 }
export enum QuoteType { Normal = 0, GiftBadge = 1, Poll = 2 }
export enum BodyRangeStyle { None = 0, Bold = 1, Italic = 2, Spoiler = 3, Strikethrough = 4, Monospace = 5 }

/** DataMessage.flags (bit values). */
export enum DataMessageFlags { EndSession = 1, ExpirationTimerUpdate = 2, ProfileKeyUpdate = 4 }

/** AttachmentPointer.flags (bit values). */
export enum AttachmentFlags { VoiceMessage = 1, Borderless = 2, Gif = 8 }

// --- attachments & group context ---

export const AttachmentPointer = message({
  cdnId: fixed64(1),          // legacy CDN0 id (oneof with cdnKey)
  cdnKey: string(15),         // CDN2/CDN3 key
  cdnNumber: int(14),
  contentType: string(2),
  key: bytes(3),              // 64-byte AES+MAC key (see AttachmentCipher)
  size: int(4),
  thumbnail: bytes(5),
  digest: bytes(6),
  incrementalMac: bytes(19),
  chunkSize: int(17),
  fileName: string(7),
  flags: int(8),
  width: int(9),
  height: int(10),
  caption: string(11),
  blurHash: string(12),
  uploadTimestamp: int(13),
  clientUuid: bytes(20),
});
export type AttachmentPointer = TypeOf<typeof AttachmentPointer>;

export const GroupContextV2 = message({
  masterKey: bytes(1),
  revision: int(2),
  groupChange: bytes(3),      // optional inline signed GroupChange for P2P propagation
});
export type GroupContextV2 = TypeOf<typeof GroupContextV2>;

// --- body ranges (mentions + styles) ---

export const BodyRange = message({
  start: int(1),
  length: int(2),
  mentionAci: string(3),      // oneof: a mention (UTF string ACI)
  style: int(4),              // oneof: a text style (BodyRangeStyle)
  mentionAciBinary: bytes(5),
});
export type BodyRange = TypeOf<typeof BodyRange>;

// --- quote ---

export const QuotedAttachment = message({
  contentType: string(1),
  fileName: string(2),
  thumbnail: sub(3, () => AttachmentPointer),
});

export const Quote = message({
  id: int(1),                 // target message's sent timestamp
  authorAci: string(5),
  text: string(3),
  attachments: repeated(sub(4, () => QuotedAttachment)),
  bodyRanges: repeated(sub(6, () => BodyRange)),
  type: int(7),
  authorAciBinary: bytes(8),
});
export type Quote = TypeOf<typeof Quote>;

// --- reaction / remote delete / group-call signal ---

export const Reaction = message({
  emoji: string(1),
  remove: bool(2),
  targetAuthorAci: string(4),
  targetSentTimestamp: int(5),
  targetAuthorAciBinary: bytes(6),
});
export type Reaction = TypeOf<typeof Reaction>;

export const DeleteMessage = message({
  targetSentTimestamp: int(1),
});
export type DeleteMessage = TypeOf<typeof DeleteMessage>;

export const GroupCallUpdate = message({
  eraId: string(1),
});
export type GroupCallUpdate = TypeOf<typeof GroupCallUpdate>;

// --- the human message ---

export const DataMessage = message({
  body: string(1),
  attachments: repeated(sub(2, () => AttachmentPointer)),
  groupV2: sub(15, () => GroupContextV2),
  flags: int(4),
  expireTimer: int(5),
  expireTimerVersion: int(23),
  profileKey: bytes(6),
  timestamp: int(7),
  quote: sub(8, () => Quote),
  bodyRanges: repeated(sub(18, () => BodyRange)),
  reaction: sub(16, () => Reaction),
  delete: sub(17, () => DeleteMessage),
  isViewOnce: bool(14),
  requiredProtocolVersion: int(12),
  groupCallUpdate: sub(19, () => GroupCallUpdate),
  // TODO when those features land: contact=9, preview=10, sticker=11,
  // payment=20, storyContext=21, giftBadge=22, poll*=24..26.
});
export type DataMessage = TypeOf<typeof DataMessage>;

export const EditMessage = message({
  targetSentTimestamp: int(1),
  dataMessage: sub(2, () => DataMessage),
});
export type EditMessage = TypeOf<typeof EditMessage>;

// --- receipts / typing / null ---

export const ReceiptMessage = message({
  type: int(1),               // ReceiptType
  timestamp: repeated(int(2)),
});
export type ReceiptMessage = TypeOf<typeof ReceiptMessage>;

export const TypingMessage = message({
  timestamp: int(1),
  action: int(2),             // TypingAction
  groupId: bytes(3),
});
export type TypingMessage = TypeOf<typeof TypingMessage>;

export const NullMessage = message({
  padding: bytes(1),
});
export type NullMessage = TypeOf<typeof NullMessage>;

// --- the Content envelope (oneof modelled as optional fields) ---

export const Content = message({
  dataMessage: sub(1, () => DataMessage),
  syncMessage: bytes(2),                 // TODO: typed SyncMessage schema
  callMessage: bytes(3),                 // see Meet/Signal calling layer
  nullMessage: sub(4, () => NullMessage),
  receiptMessage: sub(5, () => ReceiptMessage),
  typingMessage: sub(6, () => TypingMessage),
  senderKeyDistributionMessage: bytes(7),
  decryptionErrorMessage: bytes(8),
  storyMessage: bytes(9),
  pniSignatureMessage: bytes(10),
  editMessage: sub(11, () => EditMessage),
});
export type Content = TypeOf<typeof Content>;

// --- the server delivery Envelope (the outer, plaintext frame) ---

export const Envelope = message({
  type: int(1),               // EnvelopeType
  sourceServiceId: string(11),
  sourceDeviceId: int(7),
  destinationServiceId: string(13),
  clientTimestamp: int(5),
  content: bytes(8),          // encrypted Content
  serverGuid: string(9),
  serverTimestamp: int(10),
  ephemeral: bool(12),
  urgent: bool(14),
  updatedPni: string(15),
  story: bool(16),
  reportSpamToken: bytes(17),
  sourceServiceIdBinary: bytes(19),
  destinationServiceIdBinary: bytes(20),
  serverGuidBinary: bytes(21),
  updatedPniBinary: bytes(22),
});
export type Envelope = TypeOf<typeof Envelope>;
