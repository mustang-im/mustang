/** WhatsApp E2E message schema. Each message reads top-to-bottom like a proto
 * definition; the TypeScript types are inferred from these declarations (see
 * codec.ts), so there is nothing to keep in sync by hand. To add a field, add
 * one line with its number. */
import { message, string, bytes, int, bool, sub, repeated, encode, decode, type TypeOf } from "./codec";

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
 * older than that; NO_HISTORY means there is nothing (more) to send.
 * Source: whatsmeow WAWebProtobufsE2E.proto HistorySyncNotification.HistorySyncType. */
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
 * device-to-device data request. We only use HISTORY_SYNC_ON_DEMAND.
 * Source: whatsmeow WAWebProtobufsE2E.proto PeerDataOperationRequestType. */
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
  editedMessage: sub<WAMessage>(14, () => Message),
  timestampMS: int(15),
  peerDataOperationRequestMessage: sub(16, () => PeerDataOperationRequestMessage),
});
export type ProtocolMessage = TypeOf<typeof ProtocolMessage>;

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
  name: string(13),
});
export type Conversation = TypeOf<typeof Conversation>;

/** A contact's self-set display name ("push name"), as sent in history sync. */
export const Pushname = message({
  id: string(1),       // the contact's JID
  pushname: string(2), // their display name
});
export type Pushname = TypeOf<typeof Pushname>;

export const HistorySync = message({
  syncType: int(1),
  conversations: repeated(sub(2, () => Conversation)),
  progress: int(6),
  pushnames: repeated(sub(7, () => Pushname)),
});
export type HistorySync = TypeOf<typeof HistorySync>;

export function decodeHistorySync(data: Uint8Array): HistorySync {
  return decode(HistorySync, data);
}

// --- on-demand history paging (messages OLDER than the FULL dump) ---

/** Asks the phone for the `onDemandMsgCount` messages immediately before
 * `oldestMsgID` in `chatJID`. The phone answers with an ON_DEMAND history blob.
 * Despite the upstream field NAME, `oldestMsgTimestampSec` is in SECONDS (the
 * server expects `Timestamp.Unix()`; see whatsmeow BuildHistorySyncRequest). */
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
