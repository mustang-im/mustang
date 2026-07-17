/** SPQR wire-message serialization (clean-room port of
 * `src/v1/chunked/states/serialize.rs`). This is the byte content of
 * SignalMessage.pq_ratchet — a hand-rolled compact format, NOT protobuf:
 *
 *   [version]      1 byte  = 0x01 (V1)
 *   [epoch]        varint  (LEB128 u64)
 *   [index]        varint  (LEB128 u32, the symmetric-chain message index)
 *   [message_type] 1 byte  0..6
 *   -- chunk-carrying types (Hdr/Ek/EkCt1Ack/Ct1/Ct2): --
 *   [chunk.index]  varint  (u16 RS chunk index)
 *   [chunk.data]   32 bytes
 *
 * Trailing bytes are tolerated for forward-compat. */
import type { Chunk } from "./reedSolomon";
import { CHUNK_SIZE } from "./reedSolomon";

export const VERSION_V1 = 1;

export enum MessageType {
  None = 0,
  Hdr = 1,
  Ek = 2,
  EkCt1Ack = 3,
  Ct1Ack = 4,
  Ct1 = 5,
  Ct2 = 6,
}

export enum PayloadKind {
  None,
  Hdr,
  Ek,
  EkCt1Ack,
  Ct1Ack,
  Ct1,
  Ct2,
}

export interface MessagePayload {
  kind: PayloadKind;
  chunk?: Chunk;
}

export interface SCKAMessage {
  epoch: number;
  payload: MessagePayload;
}

const MAX_VARINT_BYTES_LEN = 10;

export function encodeVarint(a: number, into: number[]): void {
  let v = BigInt(a);
  for (let i = 0; i < MAX_VARINT_BYTES_LEN; i++) {
    let byte = Number(v & 0x7Fn);
    if (v < 0x80n) {
      into.push(byte);
      break;
    } else {
      into.push(0x80 | byte);
      v >>= 7n;
    }
  }
}

/** Decode a LEB128 varint at `pos.at`, advancing `pos.at`. */
export function decodeVarint(from: Uint8Array, pos: { at: number }): number {
  let out = 0n;
  let startAt = pos.at;
  if (startAt >= from.length) {
    throw new Error("SPQR msg decode: varint past end");
  }
  let maxI = Math.min(MAX_VARINT_BYTES_LEN, from.length - startAt);
  let i = 0;
  let done = false;
  while (i < maxI && !done) {
    let byte = from[startAt + i];
    out |= (BigInt(byte) & 0x7Fn) << BigInt(7 * i);
    i += 1;
    done = (byte & 0x80) == 0;
  }
  if (!done) {
    throw new Error("SPQR msg decode: incomplete varint");
  }
  pos.at += i;
  return Number(out);
}

function payloadKindToType(kind: PayloadKind): MessageType {
  switch (kind) {
    case PayloadKind.None: return MessageType.None;
    case PayloadKind.Hdr: return MessageType.Hdr;
    case PayloadKind.Ek: return MessageType.Ek;
    case PayloadKind.EkCt1Ack: return MessageType.EkCt1Ack;
    case PayloadKind.Ct1Ack: return MessageType.Ct1Ack;
    case PayloadKind.Ct1: return MessageType.Ct1;
    case PayloadKind.Ct2: return MessageType.Ct2;
  }
}

function encodeChunk(c: Chunk, into: number[]): void {
  encodeVarint(c.index, into);
  for (let b of c.data) {
    into.push(b);
  }
}

function decodeChunk(from: Uint8Array, pos: { at: number }): Chunk {
  let index = decodeVarint(from, pos);
  let start = pos.at;
  pos.at += CHUNK_SIZE;
  if (pos.at > from.length || index > 65535) {
    throw new Error("SPQR msg decode: bad chunk");
  }
  return { index: index, data: from.subarray(start, pos.at).slice() };
}

/** Serialize an SCKA message with the given symmetric-chain `index`. */
export function serializeMessage(msg: SCKAMessage, index: number): Uint8Array {
  let into: number[] = [];
  into.push(VERSION_V1);
  encodeVarint(msg.epoch, into);
  encodeVarint(index, into);
  into.push(payloadKindToType(msg.payload.kind));
  let kind = msg.payload.kind;
  if (kind == PayloadKind.Hdr || kind == PayloadKind.Ek || kind == PayloadKind.EkCt1Ack || kind == PayloadKind.Ct1 || kind == PayloadKind.Ct2) {
    encodeChunk(msg.payload.chunk!, into);
  }
  return new Uint8Array(into);
}

export interface DeserializedMessage {
  msg: SCKAMessage;
  index: number;
}

export function deserializeMessage(from: Uint8Array): DeserializedMessage {
  if (from.length == 0 || from[0] != VERSION_V1) {
    throw new Error("SPQR msg decode: bad version");
  }
  let pos = { at: 1 };
  let epoch = decodeVarint(from, pos);
  if (epoch == 0) {
    throw new Error("SPQR msg decode: epoch 0");
  }
  let index = decodeVarint(from, pos);
  if (pos.at >= from.length) {
    throw new Error("SPQR msg decode: missing type");
  }
  let msgType = from[pos.at];
  pos.at += 1;
  let payload: MessagePayload;
  switch (msgType) {
    case MessageType.None: payload = { kind: PayloadKind.None }; break;
    case MessageType.Ct1Ack: payload = { kind: PayloadKind.Ct1Ack }; break;
    case MessageType.Hdr: payload = { kind: PayloadKind.Hdr, chunk: decodeChunk(from, pos) }; break;
    case MessageType.Ek: payload = { kind: PayloadKind.Ek, chunk: decodeChunk(from, pos) }; break;
    case MessageType.EkCt1Ack: payload = { kind: PayloadKind.EkCt1Ack, chunk: decodeChunk(from, pos) }; break;
    case MessageType.Ct1: payload = { kind: PayloadKind.Ct1, chunk: decodeChunk(from, pos) }; break;
    case MessageType.Ct2: payload = { kind: PayloadKind.Ct2, chunk: decodeChunk(from, pos) }; break;
    default: throw new Error("SPQR msg decode: bad type");
  }
  return { msg: { epoch: epoch, payload: payload }, index: index };
}
