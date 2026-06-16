/** SPQR v1 ML-KEM "Braid" public-ratchet state machine (clean-room port of
 * `src/v1/chunked/states.rs` + `chunked/{send_ek,send_ct}.rs` +
 * `unchunked/{send_ek,send_ct}.rs`). Each epoch establishes one fresh ML-KEM
 * shared secret; the two sides alternate the send_ek (keypair owner) and
 * send_ct (encapsulator) roles. Large objects (hdr+mac, ek, ct1, ct2+mac) are
 * streamed via the Reed-Solomon encoder/decoder, one 32-byte chunk per message.
 *
 * The 11 states collapse the chunked + unchunked layers; transitions and the
 * epoch-compare branches follow the reference exactly. */
import {
  PolyEncoder, PolyDecoder, type Chunk,
} from "./reedSolomon";
import {
  generate, ekMatchesHeader, encaps1, encaps2, decaps,
  HEADER_SIZE, ENCAPSULATION_KEY_SIZE, CIPHERTEXT1_SIZE, CIPHERTEXT2_SIZE,
} from "./incrementalMlKem";
import { Authenticator, MAC_SIZE } from "./authenticator";
import { hkdfSHA256, concatBytes } from "../../Crypto/primitives";
import { type EpochSecret, SPQRError } from "./chain";
import { PayloadKind, type SCKAMessage, type MessagePayload } from "./serialize";

let ZERO_SALT = new Uint8Array(32);
let LABEL_SCKA_KEY = new TextEncoder().encode("Signal_PQCKA_V1_MLKEM768:SCKA Key");

function u64BE(n: number): Uint8Array {
  let out = new Uint8Array(8);
  let v = BigInt(n);
  for (let i = 7; i >= 0; i--) {
    out[i] = Number(v & 0xFFn);
    v >>= 8n;
  }
  return out;
}

/** Derive the per-epoch SCKA key from the raw ML-KEM shared secret. */
function deriveEpochSecret(rawSS: Uint8Array, epoch: number): Uint8Array {
  let info = concatBytes(LABEL_SCKA_KEY, u64BE(epoch));
  return hkdfSHA256(rawSS, ZERO_SALT, info, 32);
}

export enum StateKind {
  // send_ek role (A starts here on epoch 1)
  KeysUnsampled = "KeysUnsampled",
  KeysSampled = "KeysSampled",
  HeaderSent = "HeaderSent",
  Ct1Received = "Ct1Received",
  EkSentCt1Received = "EkSentCt1Received",
  // send_ct role (B starts here on epoch 1)
  NoHeaderReceived = "NoHeaderReceived",
  HeaderReceived = "HeaderReceived",
  Ct1Sampled = "Ct1Sampled",
  EkReceivedCt1Sampled = "EkReceivedCt1Sampled",
  Ct1Acknowledged = "Ct1Acknowledged",
  Ct2Sampled = "Ct2Sampled",
}

/** All per-state fields, only some of which are populated for any given kind. */
export interface BraidState {
  kind: StateKind;
  epoch: number;
  auth: Authenticator;
  // send_ek
  ek?: Uint8Array;
  dk?: Uint8Array;
  ct1?: Uint8Array; // received ct1 (commitment) on send_ek side
  sendingHdr?: PolyEncoder;
  sendingEk?: PolyEncoder;
  receivingCt1?: PolyDecoder;
  receivingCt2?: PolyDecoder;
  // send_ct
  hdr?: Uint8Array;
  es?: Uint8Array;
  ct1Local?: Uint8Array; // our own ct1 commitment
  sendingCt1?: PolyEncoder;
  sendingCt2?: PolyEncoder;
  receivingHdr?: PolyDecoder;
  receivingEk?: PolyDecoder;
}

export function initA(authKey: Uint8Array): BraidState {
  return { kind: StateKind.KeysUnsampled, epoch: 1, auth: Authenticator.newAuth(authKey, 1) };
}

export function initB(authKey: Uint8Array): BraidState {
  return {
    kind: StateKind.NoHeaderReceived, epoch: 1, auth: Authenticator.newAuth(authKey, 1),
    receivingHdr: PolyDecoder.newForLength(HEADER_SIZE + MAC_SIZE),
  };
}

export interface SendResult {
  state: BraidState;
  msg: SCKAMessage;
  key: EpochSecret | null;
}

export interface RecvResult {
  state: BraidState;
  key: EpochSecret | null;
}

function chunkPayload(kind: PayloadKind, chunk: Chunk): MessagePayload {
  return { kind: kind, chunk: chunk };
}

/** Pick the next chunk to emit for the current state, advancing encoders. */
export function send(s: BraidState): SendResult {
  let epoch = s.epoch;
  switch (s.kind) {
    // ---------------- send_ek ----------------
    case StateKind.KeysUnsampled: {
      // Sample keypair, MAC the header, start streaming hdr‖mac.
      let keys = generate();
      let mac = s.auth.macHdr(epoch, keys.hdr);
      let toSend = concatBytes(keys.hdr, mac);
      let sendingHdr = PolyEncoder.encodeBytes(toSend);
      let chunk = sendingHdr.nextChunk();
      return {
        state: { kind: StateKind.KeysSampled, epoch, auth: s.auth, ek: keys.ek, dk: keys.dk, sendingHdr: sendingHdr },
        msg: { epoch, payload: chunkPayload(PayloadKind.Hdr, chunk) },
        key: null,
      };
    }
    case StateKind.KeysSampled: {
      let chunk = s.sendingHdr!.nextChunk();
      return {
        state: s,
        msg: { epoch, payload: chunkPayload(PayloadKind.Hdr, chunk) },
        key: null,
      };
    }
    case StateKind.HeaderSent: {
      let chunk = s.sendingEk!.nextChunk();
      return { state: s, msg: { epoch, payload: chunkPayload(PayloadKind.Ek, chunk) }, key: null };
    }
    case StateKind.Ct1Received: {
      let chunk = s.sendingEk!.nextChunk();
      return { state: s, msg: { epoch, payload: chunkPayload(PayloadKind.EkCt1Ack, chunk) }, key: null };
    }
    case StateKind.EkSentCt1Received: {
      return { state: s, msg: { epoch, payload: { kind: PayloadKind.Ct1Ack } }, key: null };
    }

    // ---------------- send_ct ----------------
    case StateKind.NoHeaderReceived: {
      return { state: s, msg: { epoch, payload: { kind: PayloadKind.None } }, key: null };
    }
    case StateKind.HeaderReceived: {
      // encaps1 → emits the epoch secret; start streaming the real ct1.
      let e1 = encaps1(s.hdr!);
      let secret = deriveEpochSecret(e1.sharedSecret, epoch);
      let auth = s.auth.clone();
      auth.update(epoch, secret);
      let sendingCt1 = PolyEncoder.encodeBytes(e1.ct1);
      let chunk = sendingCt1.nextChunk();
      return {
        state: {
          kind: StateKind.Ct1Sampled, epoch, auth: auth, hdr: s.hdr, es: e1.state, ct1Local: e1.ct1,
          sendingCt1: sendingCt1, receivingEk: s.receivingEk,
        },
        msg: { epoch, payload: chunkPayload(PayloadKind.Ct1, chunk) },
        key: { epoch, secret: secret },
      };
    }
    case StateKind.Ct1Sampled: {
      let chunk = s.sendingCt1!.nextChunk();
      return { state: s, msg: { epoch, payload: chunkPayload(PayloadKind.Ct1, chunk) }, key: null };
    }
    case StateKind.EkReceivedCt1Sampled: {
      let chunk = s.sendingCt1!.nextChunk();
      return { state: s, msg: { epoch, payload: chunkPayload(PayloadKind.Ct1, chunk) }, key: null };
    }
    case StateKind.Ct1Acknowledged: {
      return { state: s, msg: { epoch, payload: { kind: PayloadKind.None } }, key: null };
    }
    case StateKind.Ct2Sampled: {
      let chunk = s.sendingCt2!.nextChunk();
      return { state: s, msg: { epoch, payload: chunkPayload(PayloadKind.Ct2, chunk) }, key: null };
    }
  }
}

/** Build the ct2 encoder over ct2‖mac. */
function sendCt2Encoder(ct2: Uint8Array, mac: Uint8Array): PolyEncoder {
  return PolyEncoder.encodeBytes(concatBytes(ct2, mac));
}

/** send_ct: finalize ct2 once ek is decoded. ct = ct1Local‖ct2; MAC over ct. */
function sendCt2(s: BraidState): { auth: Authenticator; ct2: Uint8Array; mac: Uint8Array } {
  let ct2 = encaps2(s.ek!, s.es!);
  let ct = concatBytes(s.ct1Local!, ct2);
  let mac = s.auth.macCt(s.epoch, ct);
  return { auth: s.auth, ct2: ct2, mac: mac };
}

/** Consume an incoming message, transitioning state and possibly emitting the
 * epoch secret (on the send_ek side when it finishes decapsulation). */
export function recv(s: BraidState, msg: SCKAMessage): RecvResult {
  let key: EpochSecret | null = null;
  let epoch = s.epoch;
  let p = msg.payload;

  switch (s.kind) {
    // ---------------- send_ek ----------------
    case StateKind.KeysUnsampled:
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      return { state: s, key: null };

    case StateKind.KeysSampled: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      if (p.kind == PayloadKind.Ct1) {
        // recv_ct1_chunk: start decoding ct1, stop sending hdr, start sending ek.
        let receivingCt1 = PolyDecoder.newForLength(CIPHERTEXT1_SIZE);
        receivingCt1.addChunk(p.chunk!);
        let sendingEk = PolyEncoder.encodeBytes(s.ek!);
        let next: BraidState = {
          kind: StateKind.HeaderSent, epoch, auth: s.auth, ek: s.ek, dk: s.dk,
          sendingEk: sendingEk, receivingCt1: receivingCt1,
        };
        // ct1 may decode immediately if a single chunk suffices.
        let decoded = receivingCt1.decodedMessage();
        if (decoded) {
          next.kind = StateKind.Ct1Received;
          next.ct1 = decoded;
          next.receivingCt1 = undefined;
        }
        return { state: next, key: null };
      }
      return { state: s, key: null };
    }

    case StateKind.HeaderSent: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      if (p.kind == PayloadKind.Ct1) {
        s.receivingCt1!.addChunk(p.chunk!);
        let decoded = s.receivingCt1!.decodedMessage();
        if (decoded) {
          return {
            state: {
              kind: StateKind.Ct1Received, epoch, auth: s.auth, ek: s.ek, dk: s.dk,
              ct1: decoded, sendingEk: s.sendingEk,
            },
            key: null,
          };
        }
      }
      return { state: s, key: null };
    }

    case StateKind.Ct1Received: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      if (p.kind == PayloadKind.Ct2) {
        let receivingCt2 = PolyDecoder.newForLength(CIPHERTEXT2_SIZE + MAC_SIZE);
        receivingCt2.addChunk(p.chunk!);
        let next: BraidState = {
          kind: StateKind.EkSentCt1Received, epoch, auth: s.auth, ek: s.ek, dk: s.dk,
          ct1: s.ct1, receivingCt2: receivingCt2,
        };
        let done = tryFinishCt2(next);
        if (done) {
          return done;
        }
        return { state: next, key: null };
      }
      return { state: s, key: null };
    }

    case StateKind.EkSentCt1Received: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      if (p.kind == PayloadKind.Ct2) {
        s.receivingCt2!.addChunk(p.chunk!);
        let done = tryFinishCt2(s);
        if (done) {
          return done;
        }
      }
      return { state: s, key: null };
    }

    // ---------------- send_ct ----------------
    case StateKind.NoHeaderReceived: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      if (p.kind == PayloadKind.Hdr) {
        s.receivingHdr!.addChunk(p.chunk!);
        let decoded = s.receivingHdr!.decodedMessage();
        if (decoded) {
          let hdr = decoded.subarray(0, HEADER_SIZE);
          let mac = decoded.subarray(HEADER_SIZE, HEADER_SIZE + MAC_SIZE);
          if (!s.auth.verifyHdr(epoch, hdr, mac)) {
            throw new SPQRError("SPQR header MAC verify failed");
          }
          return {
            state: {
              kind: StateKind.HeaderReceived, epoch, auth: s.auth, hdr: hdr.slice(),
              receivingEk: PolyDecoder.newForLength(ENCAPSULATION_KEY_SIZE),
            },
            key: null,
          };
        }
      }
      return { state: s, key: null };
    }

    case StateKind.HeaderReceived: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      return { state: s, key: null };
    }

    case StateKind.Ct1Sampled: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      let chunk: Chunk | undefined;
      let ack = false;
      if (p.kind == PayloadKind.Ek) {
        chunk = p.chunk; ack = false;
      } else if (p.kind == PayloadKind.EkCt1Ack) {
        chunk = p.chunk; ack = true;
      }
      if (chunk) {
        s.receivingEk!.addChunk(chunk);
        let decoded = s.receivingEk!.decodedMessage();
        if (decoded) {
          if (!ekMatchesHeader(decoded, s.hdr!)) {
            throw new SPQRError("SPQR erroneous data received (ek mismatch)");
          }
          let withEk: BraidState = { ...s, ek: decoded };
          if (ack) {
            let r = sendCt2(withEk);
            return {
              state: {
                kind: StateKind.Ct2Sampled, epoch, auth: r.auth, es: s.es, hdr: s.hdr, ek: decoded,
                ct1Local: s.ct1Local, sendingCt2: sendCt2Encoder(r.ct2, r.mac),
              },
              key: null,
            };
          }
          return {
            state: {
              kind: StateKind.EkReceivedCt1Sampled, epoch, auth: s.auth, es: s.es, hdr: s.hdr,
              ek: decoded, ct1Local: s.ct1Local, sendingCt1: s.sendingCt1,
            },
            key: null,
          };
        } else if (ack) {
          return {
            state: {
              kind: StateKind.Ct1Acknowledged, epoch, auth: s.auth, es: s.es, hdr: s.hdr,
              ct1Local: s.ct1Local, receivingEk: s.receivingEk,
            },
            key: null,
          };
        }
        return { state: s, key: null };
      }
      return { state: s, key: null };
    }

    case StateKind.EkReceivedCt1Sampled: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      if (p.kind == PayloadKind.Ct1Ack || p.kind == PayloadKind.EkCt1Ack) {
        let r = sendCt2(s);
        return {
          state: {
            kind: StateKind.Ct2Sampled, epoch, auth: r.auth, es: s.es, hdr: s.hdr, ek: s.ek,
            ct1Local: s.ct1Local, sendingCt2: sendCt2Encoder(r.ct2, r.mac),
          },
          key: null,
        };
      }
      return { state: s, key: null };
    }

    case StateKind.Ct1Acknowledged: {
      if (msg.epoch > epoch) {
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      if (msg.epoch < epoch) {
        return { state: s, key: null };
      }
      let chunk: Chunk | undefined;
      if (p.kind == PayloadKind.Ek || p.kind == PayloadKind.EkCt1Ack) {
        chunk = p.chunk;
      }
      if (chunk) {
        s.receivingEk!.addChunk(chunk);
        let decoded = s.receivingEk!.decodedMessage();
        if (decoded) {
          if (!ekMatchesHeader(decoded, s.hdr!)) {
            throw new SPQRError("SPQR erroneous data received (ek mismatch)");
          }
          let withEk: BraidState = { ...s, ek: decoded };
          let r = sendCt2(withEk);
          return {
            state: {
              kind: StateKind.Ct2Sampled, epoch, auth: r.auth, es: s.es, hdr: s.hdr, ek: decoded,
              ct1Local: s.ct1Local, sendingCt2: sendCt2Encoder(r.ct2, r.mac),
            },
            key: null,
          };
        }
      }
      return { state: s, key: null };
    }

    case StateKind.Ct2Sampled: {
      if (msg.epoch > epoch) {
        if (msg.epoch == epoch + 1) {
          // role switch into the next epoch as send_ek/KeysUnsampled.
          return {
            state: { kind: StateKind.KeysUnsampled, epoch: epoch + 1, auth: s.auth },
            key: null,
          };
        }
        throw new SPQRError(`SPQR epoch out of range: ${msg.epoch}`);
      }
      return { state: s, key: null };
    }
  }
}

// ---------------- state serialization (self-interop compact format) -------

let STATE_KINDS: StateKind[] = [
  StateKind.KeysUnsampled, StateKind.KeysSampled, StateKind.HeaderSent,
  StateKind.Ct1Received, StateKind.EkSentCt1Received, StateKind.NoHeaderReceived,
  StateKind.HeaderReceived, StateKind.Ct1Sampled, StateKind.EkReceivedCt1Sampled,
  StateKind.Ct1Acknowledged, StateKind.Ct2Sampled,
];

function pushU32(out: number[], n: number): void {
  out.push((n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF);
}
function readU32(b: Uint8Array, at: number): number {
  return ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;
}

/** Optional byte field: [present 1][len u32][bytes]. */
function pushOptBytes(out: number[], v: Uint8Array | undefined): void {
  if (v == null) {
    out.push(0);
  } else {
    out.push(1);
    pushU32(out, v.length);
    for (let x of v) {
      out.push(x);
    }
  }
}
function pushOptSer(out: number[], v: { serialize(): Uint8Array } | undefined): void {
  pushOptBytes(out, v ? v.serialize() : undefined);
}

interface Cursor { b: Uint8Array; at: number; }
function readOptBytes(c: Cursor): Uint8Array | undefined {
  let present = c.b[c.at]; c.at += 1;
  if (!present) {
    return undefined;
  }
  let len = readU32(c.b, c.at); c.at += 4;
  let out = c.b.subarray(c.at, c.at + len).slice(); c.at += len;
  return out;
}

export function serializeState(s: BraidState): Uint8Array {
  let out: number[] = [];
  out.push(STATE_KINDS.indexOf(s.kind));
  pushU32(out, s.epoch);
  // authenticator
  for (let x of s.auth.rootKey) {
    out.push(x);
  }
  for (let x of s.auth.macKey) {
    out.push(x);
  }
  pushOptBytes(out, s.ek);
  pushOptBytes(out, s.dk);
  pushOptBytes(out, s.ct1);
  pushOptBytes(out, s.hdr);
  pushOptBytes(out, s.es);
  pushOptBytes(out, s.ct1Local);
  pushOptSer(out, s.sendingHdr);
  pushOptSer(out, s.sendingEk);
  pushOptSer(out, s.sendingCt1);
  pushOptSer(out, s.sendingCt2);
  pushOptSer(out, s.receivingCt1);
  pushOptSer(out, s.receivingCt2);
  pushOptSer(out, s.receivingHdr);
  pushOptSer(out, s.receivingEk);
  return new Uint8Array(out);
}

export function deserializeState(bytes: Uint8Array): BraidState {
  let c: Cursor = { b: bytes, at: 0 };
  let kind = STATE_KINDS[c.b[c.at]]; c.at += 1;
  let epoch = readU32(c.b, c.at); c.at += 4;
  let rootKey = c.b.subarray(c.at, c.at + 32).slice(); c.at += 32;
  let macKey = c.b.subarray(c.at, c.at + 32).slice(); c.at += 32;
  let auth = Authenticator.fromKeys(rootKey, macKey);
  let ek = readOptBytes(c);
  let dk = readOptBytes(c);
  let ct1 = readOptBytes(c);
  let hdr = readOptBytes(c);
  let es = readOptBytes(c);
  let ct1Local = readOptBytes(c);
  let sendingHdr = optEnc(readOptBytes(c));
  let sendingEk = optEnc(readOptBytes(c));
  let sendingCt1 = optEnc(readOptBytes(c));
  let sendingCt2 = optEnc(readOptBytes(c));
  let receivingCt1 = optDec(readOptBytes(c));
  let receivingCt2 = optDec(readOptBytes(c));
  let receivingHdr = optDec(readOptBytes(c));
  let receivingEk = optDec(readOptBytes(c));
  return {
    kind, epoch, auth, ek, dk, ct1, hdr, es, ct1Local,
    sendingHdr, sendingEk, sendingCt1, sendingCt2,
    receivingCt1, receivingCt2, receivingHdr, receivingEk,
  };
}

function optEnc(b: Uint8Array | undefined): PolyEncoder | undefined {
  return b ? PolyEncoder.deserialize(b) : undefined;
}
function optDec(b: Uint8Array | undefined): PolyDecoder | undefined {
  return b ? PolyDecoder.deserialize(b) : undefined;
}

/** send_ek: try to finish receiving ct2, decapsulate, verify MAC, emit secret,
 * and switch to the send_ct role for the next epoch. */
function tryFinishCt2(s: BraidState): RecvResult | null {
  let decoded = s.receivingCt2!.decodedMessage();
  if (!decoded) {
    return null;
  }
  let ct2 = decoded.subarray(0, CIPHERTEXT2_SIZE);
  let mac = decoded.subarray(CIPHERTEXT2_SIZE, CIPHERTEXT2_SIZE + MAC_SIZE);
  let rawSS = decaps(s.dk!, s.ct1!, ct2);
  let secret = deriveEpochSecret(rawSS, s.epoch);
  let auth = s.auth.clone();
  auth.update(s.epoch, secret);
  let ct = concatBytes(s.ct1!, ct2);
  if (!auth.verifyCt(s.epoch, ct, mac)) {
    throw new SPQRError("SPQR ciphertext MAC verify failed");
  }
  return {
    state: {
      kind: StateKind.NoHeaderReceived, epoch: s.epoch + 1, auth: auth,
      receivingHdr: PolyDecoder.newForLength(HEADER_SIZE + MAC_SIZE),
    },
    key: { epoch: s.epoch, secret: secret },
  };
}
