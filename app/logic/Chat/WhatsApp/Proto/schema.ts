/** WhatsApp E2E message schema. Each message reads top-to-bottom like a proto
 * definition; the TypeScript types are inferred from these declarations (see
 * codec.ts), so there is nothing to keep in sync by hand. To add a field, add
 * one line with its number. */
import { message, string, bytes, int, bool, sub, repeated, encode, decode, type TypeOf } from "../../Signal/Proto/codec";

/** ProtocolMessage.type values (used for edits and deletes). */
export enum ProtocolMessageType {
  Revoke = 0,
  EphemeralSetting = 3,
  HistorySyncNotification = 5,
  AppStateSyncKeyShare = 6,
  SharePhoneNumber = 11,
  MessageEdit = 14,
  PeerDataOperationRequest = 16,
}

/** HistorySyncNotification.syncType — which slice of history a notification's
 * blob carries. FULL is the entire retained history (what `requireFullSync`
 * elicits at link time); ON_DEMAND answers our paging requests for messages
 * older than that; NO_HISTORY means there is nothing (more) to send. */
export enum HistorySyncType {
  InitialBootstrap = 0,
  InitialStatusV3 = 1,
  Full = 2,
  Recent = 3,
  PushName = 4,
  NonBlockingData = 5,
  OnDemand = 6,
  NoHistory = 7,
}

/** PeerDataOperationRequestMessage.peerDataOperationRequestType — the kind of
 * device-to-device data request. We only use HISTORY_SYNC_ON_DEMAND. */
export enum PeerDataOperationRequestType {
  HistorySyncOnDemand = 3,
}

export const MessageKey = message({
  remoteJID: string(1),
  fromMe: bool(2),
  id: string(3),
  participant: string(4),
});
export type MessageKey = TypeOf<typeof MessageKey>;

// A WhatsApp message can quote or wrap another message, so the type is mutually
// recursive. WAMessage is declared by hand to anchor that recursion; every
// other shape below is inferred.
export interface WAMessage {
  conversation?: string;
  senderKeyDistributionMessage?: SenderKeyDistributionMessage;
  imageMessage?: ImageMessage;
  extendedTextMessage?: ExtendedTextMessage;
  documentMessage?: DocumentMessage;
  audioMessage?: AudioMessage;
  videoMessage?: VideoMessage;
  protocolMessage?: ProtocolMessage;
  stickerMessage?: StickerMessage;
  deviceSentMessage?: DeviceSentMessage;
  ephemeralMessage?: FutureProofMessage;
  reactionMessage?: ReactionMessage;
  viewOnceMessageV2?: FutureProofMessage;
  editedMessage?: FutureProofMessage;
}

export const ContextInfo = message({
  stanzaID: string(1),
  participant: string(2),
  quotedMessage: sub<WAMessage>(3, () => Message),
  remoteJID: string(4),
  mentionedJID: repeated(string(15)),
  forwardingScore: int(21),
  isForwarded: bool(22),
  expiration: int(25),
});
export type ContextInfo = TypeOf<typeof ContextInfo>;

export const ExtendedTextMessage = message({
  text: string(1),
  matchedText: string(2),
  canonicalURL: string(4),
  description: string(5),
  title: string(6),
  jpegThumbnail: bytes(16),
  contextInfo: sub(17, () => ContextInfo),
});
export type ExtendedTextMessage = TypeOf<typeof ExtendedTextMessage>;

export const ImageMessage = message({
  URL: string(1),
  mimetype: string(2),
  caption: string(3),
  fileSHA256: bytes(4),
  fileLength: int(5),
  height: int(6),
  width: int(7),
  mediaKey: bytes(8),
  fileEncSHA256: bytes(9),
  directPath: string(11),
  mediaKeyTimestamp: int(12),
  jpegThumbnail: bytes(16),
  contextInfo: sub(17, () => ContextInfo),
});
export type ImageMessage = TypeOf<typeof ImageMessage>;

export const VideoMessage = message({
  URL: string(1),
  mimetype: string(2),
  fileSHA256: bytes(3),
  fileLength: int(4),
  seconds: int(5),
  mediaKey: bytes(6),
  caption: string(7),
  gifPlayback: bool(8),
  height: int(9),
  width: int(10),
  fileEncSHA256: bytes(11),
  directPath: string(13),
  mediaKeyTimestamp: int(14),
  jpegThumbnail: bytes(16),
  contextInfo: sub(17, () => ContextInfo),
});
export type VideoMessage = TypeOf<typeof VideoMessage>;

export const AudioMessage = message({
  URL: string(1),
  mimetype: string(2),
  fileSHA256: bytes(3),
  fileLength: int(4),
  seconds: int(5),
  PTT: bool(6),
  mediaKey: bytes(7),
  fileEncSHA256: bytes(8),
  directPath: string(9),
  mediaKeyTimestamp: int(10),
  contextInfo: sub(17, () => ContextInfo),
  waveform: bytes(19),
});
export type AudioMessage = TypeOf<typeof AudioMessage>;

export const DocumentMessage = message({
  URL: string(1),
  mimetype: string(2),
  title: string(3),
  fileSHA256: bytes(4),
  fileLength: int(5),
  pageCount: int(6),
  mediaKey: bytes(7),
  fileName: string(8),
  fileEncSHA256: bytes(9),
  directPath: string(10),
  mediaKeyTimestamp: int(11),
  jpegThumbnail: bytes(16),
  contextInfo: sub(17, () => ContextInfo),
  caption: string(20),
});
export type DocumentMessage = TypeOf<typeof DocumentMessage>;

export const StickerMessage = message({
  URL: string(1),
  fileSHA256: bytes(2),
  fileEncSHA256: bytes(3),
  mediaKey: bytes(4),
  mimetype: string(5),
  height: int(6),
  width: int(7),
  directPath: string(8),
  fileLength: int(9),
  mediaKeyTimestamp: int(10),
  isAnimated: bool(13),
  pngThumbnail: bytes(16),
  contextInfo: sub(17, () => ContextInfo),
});
export type StickerMessage = TypeOf<typeof StickerMessage>;

export const ReactionMessage = message({
  key: sub(1, () => MessageKey),
  text: string(2),
  groupingKey: string(3),
  senderTimestampMS: int(4),
});
export type ReactionMessage = TypeOf<typeof ReactionMessage>;

export const ProtocolMessage = message({
  key: sub(1, () => MessageKey),
  type: int(2),
  historySyncNotification: sub(6, () => HistorySyncNotification),
  appStateSyncKeyShare: sub(7, () => AppStateSyncKeyShare),
  editedMessage: sub<WAMessage>(14, () => Message),
  timestampMS: int(15),
  peerDataOperationRequestMessage: sub(16, () => PeerDataOperationRequestMessage),
});
export type ProtocolMessage = TypeOf<typeof ProtocolMessage>;

// --- app-state sync keys: the primary device shares these (inside a ProtocolMessage)
// so a companion can decrypt app-state patches (contacts, settings). ---

export const AppStateSyncKeyId = message({
  keyID: bytes(1),
});
export type AppStateSyncKeyId = TypeOf<typeof AppStateSyncKeyId>;

export const AppStateSyncKeyData = message({
  keyData: bytes(1),     // the 32-byte master key
  timestamp: int(3),
});
export type AppStateSyncKeyData = TypeOf<typeof AppStateSyncKeyData>;

export const AppStateSyncKey = message({
  keyID: sub(1, () => AppStateSyncKeyId),
  keyData: sub(2, () => AppStateSyncKeyData),
});
export type AppStateSyncKey = TypeOf<typeof AppStateSyncKey>;

export const AppStateSyncKeyShare = message({
  keys: repeated(sub(1, () => AppStateSyncKey)),
});
export type AppStateSyncKeyShare = TypeOf<typeof AppStateSyncKeyShare>;

// --- history sync (the chat list + recent messages a companion gets at link time) ---

/** Points at an encrypted, gzipped HistorySync blob on the media servers. */
export const HistorySyncNotification = message({
  fileSHA256: bytes(1),
  fileLength: int(2),
  mediaKey: bytes(3),
  fileEncSHA256: bytes(4),
  directPath: string(5),
  syncType: int(6),
  chunkOrder: int(7),
  originalMessageID: string(8),
});
export type HistorySyncNotification = TypeOf<typeof HistorySyncNotification>;

/** One stored message, as it appears inside a history-sync conversation. */
export const WebMessageInfo = message({
  key: sub(1, () => MessageKey),
  message: sub<WAMessage>(2, () => Message),
  messageTimestamp: int(3),
  pushName: string(16),
});
export type WebMessageInfo = TypeOf<typeof WebMessageInfo>;

export const HistorySyncMsg = message({
  message: sub(1, () => WebMessageInfo),
  msgOrderID: int(2),
});

/** A chat (1:1 or group) with its recent messages. `id` is the chat JID. */
export const Conversation = message({
  id: string(1),
  messages: repeated(sub(2, () => HistorySyncMsg)),
  unreadCount: int(6),
  name: string(13),        // chat name — group subject, or legacy 1:1 contact name
  displayName: string(38), // the contact's resolved display name (1:1, modern)
  username: string(43),
});
export type Conversation = TypeOf<typeof Conversation>;

/** A contact's self-set display name ("push name"), as sent in history sync. */
export const Pushname = message({
  id: string(1),       // the contact's JID
  pushname: string(2), // their display name
});
export type Pushname = TypeOf<typeof Pushname>;

/** A contact from the user's address book, sent in history sync. `fullName`/
 * `firstName` are the *saved* name — what the chat list shows for a saved contact. */
export const InlineContact = message({
  pnJID: string(1),    // phone-number JID
  lidJID: string(2),   // LID JID
  fullName: string(3),
  firstName: string(4),
  username: string(5),
});
export type InlineContact = TypeOf<typeof InlineContact>;

export const HistorySync = message({
  syncType: int(1),
  conversations: repeated(sub(2, () => Conversation)),
  progress: int(6),
  pushnames: repeated(sub(7, () => Pushname)),
  inlineContacts: repeated(sub(20, () => InlineContact)),
});
export type HistorySync = TypeOf<typeof HistorySync>;

export function decodeHistorySync(data: Uint8Array): HistorySync {
  return decode(HistorySync, data);
}

// --- on-demand history paging (messages OLDER than the FULL dump) ---

/** Asks the phone for the `onDemandMsgCount` messages immediately before
 * `oldestMsgID` in `chatJID`. The phone answers with an ON_DEMAND history blob.
 * Despite the upstream field NAME, `oldestMsgTimestampSec` is in SECONDS (the
 * server expects `Timestamp.Unix()`). */
export const HistorySyncOnDemandRequest = message({
  chatJID: string(1),
  oldestMsgID: string(2),
  oldestMsgFromMe: bool(3),
  onDemandMsgCount: int(4),
  oldestMsgTimestampSec: int(5), // field is named *MS upstream but carries seconds
});
export type HistorySyncOnDemandRequest = TypeOf<typeof HistorySyncOnDemandRequest>;

/** A device-to-device data request we send our own account as a peer message;
 * for history paging `peerDataOperationRequestType` is HISTORY_SYNC_ON_DEMAND. */
export const PeerDataOperationRequestMessage = message({
  peerDataOperationRequestType: int(1),
  historySyncOnDemandRequest: sub(4, () => HistorySyncOnDemandRequest),
});
export type PeerDataOperationRequestMessage = TypeOf<typeof PeerDataOperationRequestMessage>;

export const SenderKeyDistributionMessage = message({
  groupID: string(1),
  axolotlSenderKeyDistributionMessage: bytes(2),
});
export type SenderKeyDistributionMessage = TypeOf<typeof SenderKeyDistributionMessage>;

export const DeviceSentMessage = message({
  destinationJID: string(1),
  message: sub<WAMessage>(2, () => Message),
  phash: string(3),
});
export type DeviceSentMessage = TypeOf<typeof DeviceSentMessage>;

export const FutureProofMessage = message({
  message: sub<WAMessage>(1, () => Message),
});
export type FutureProofMessage = TypeOf<typeof FutureProofMessage>;

export const Message = message({
  conversation: string(1),
  senderKeyDistributionMessage: sub(2, () => SenderKeyDistributionMessage),
  imageMessage: sub(3, () => ImageMessage),
  extendedTextMessage: sub(6, () => ExtendedTextMessage),
  documentMessage: sub(7, () => DocumentMessage),
  audioMessage: sub(8, () => AudioMessage),
  videoMessage: sub(9, () => VideoMessage),
  protocolMessage: sub(12, () => ProtocolMessage),
  stickerMessage: sub(26, () => StickerMessage),
  deviceSentMessage: sub(31, () => DeviceSentMessage),
  ephemeralMessage: sub(40, () => FutureProofMessage),
  reactionMessage: sub(46, () => ReactionMessage),
  viewOnceMessageV2: sub(55, () => FutureProofMessage),
  editedMessage: sub(58, () => FutureProofMessage),
});

export function encodeWAMessage(value: WAMessage): Uint8Array {
  return encode(Message, value);
}

export function decodeWAMessage(data: Uint8Array): WAMessage {
  return decode(Message, data);
}

// --- app-state sync: the encrypted records the server returns (waServerSync) and
// the decrypted actions they carry (waSyncAction). Field numbers verified against
// real `critical_unblock_low` bytes. Contact names live in ContactAction. ---

export const KeyId = message({
  id: bytes(1),
});
export type KeyId = TypeOf<typeof KeyId>;

/** Points at an encrypted app-state snapshot/mutations blob on the media CDN. */
export const ExternalBlobReference = message({
  mediaKey: bytes(1),
  directPath: string(2),
  handle: string(3),
  fileSizeBytes: int(4),
  fileSHA256: bytes(5),
  fileEncSHA256: bytes(6),
});
export type ExternalBlobReference = TypeOf<typeof ExternalBlobReference>;

export const SyncdVersion = message({
  version: int(1),
});

export const SyncdValue = message({
  blob: bytes(1), // IV(16) | AES-256-CBC ciphertext | valueMAC(32)
});

export const SyncdIndex = message({
  blob: bytes(1), // the 32-byte index MAC
});

export const SyncdRecord = message({
  index: sub(1, () => SyncdIndex),
  value: sub(2, () => SyncdValue),
  keyID: sub(3, () => KeyId),
});
export type SyncdRecord = TypeOf<typeof SyncdRecord>;

/** SyncdMutation.operation */
export enum SyncdOperation {
  Set = 0,
  Remove = 1,
}

export const SyncdMutation = message({
  operation: int(1), // SyncdOperation
  record: sub(2, () => SyncdRecord),
});
export type SyncdMutation = TypeOf<typeof SyncdMutation>;

/** The container an external-mutations blob decodes to. */
export const SyncdMutations = message({
  mutations: repeated(sub(1, () => SyncdMutation)),
});
export type SyncdMutations = TypeOf<typeof SyncdMutations>;

export const SyncdSnapshot = message({
  version: sub(1, () => SyncdVersion),
  records: repeated(sub(2, () => SyncdRecord)),
  mac: bytes(3),
  keyID: sub(4, () => KeyId),
});
export type SyncdSnapshot = TypeOf<typeof SyncdSnapshot>;

export const SyncdPatch = message({
  version: sub(1, () => SyncdVersion),
  mutations: repeated(sub(2, () => SyncdMutation)),
  externalMutations: sub(3, () => ExternalBlobReference),
  snapshotMAC: bytes(4),
  patchMAC: bytes(5),
  keyID: sub(6, () => KeyId),
  deviceIndex: int(8),
});
export type SyncdPatch = TypeOf<typeof SyncdPatch>;

/** A saved address-book contact. `fullName`/`firstName` are the names the chat
 * list shows; `lidJid`/`pnJid` link the LID and phone-number identities. */
export const ContactAction = message({
  fullName: string(1),
  firstName: string(2),
  lidJid: string(3),
  saveOnPrimaryAddressbook: bool(4),
});
export type ContactAction = TypeOf<typeof ContactAction>;

/** The decrypted action carried by a mutation. We only consume contactAction
 * (names) for now; other actions (mute/pin/star/…) share the same envelope. */
export const SyncActionValue = message({
  timestamp: int(1),
  contactAction: sub(3, () => ContactAction),
});
export type SyncActionValue = TypeOf<typeof SyncActionValue>;

/** The plaintext inside a mutation's value blob: the JSON index, the action, and
 * a version. `index` is the UTF-8 bytes of a JSON string array, e.g.
 * `["contact","<jid>"]`. */
export const SyncActionData = message({
  index: bytes(1),
  value: sub(2, () => SyncActionValue),
  padding: bytes(3),
  version: int(4),
});
export type SyncActionData = TypeOf<typeof SyncActionData>;
