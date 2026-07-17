/** SPQR "Triple Ratchet" glue (clean-room port of SparsePostQuantumRatchet
 * `src/lib.rs` send/recv wiring + libsignal `ratchet/keys.rs` message-key mix).
 *
 * SPQR is the post-quantum *public* ratchet: send/recv consume a serialized
 * state + per-message wire blob (SignalMessage.pq_ratchet) and emit an optional
 * 32-byte per-epoch key. The messaging layer mixes that key into its Double
 * Ratchet output via HKDF (SPQR key = salt, DR chain output = IKM,
 * info "WhisperMessageKeys").
 *
 * State here is a self-interop compact binary blob (braid state || chain),
 * since we control both ends and avoid a protobuf dependency. The wire message
 * format matches the reference exactly (see serialize.ts). */
import { Chain, Direction, DEFAULT_CHAIN_PARAMS, type ChainParams, type EpochSecret, SPQRError } from "./chain";
import {
  initA, initB, send as braidSend, recv as braidRecv,
  serializeState, deserializeState, type BraidState,
} from "./braid";
import { serializeMessage, deserializeMessage } from "./serialize";
import { hkdfSHA256, concatBytes } from "../../Crypto/primitives";

export { Direction, DEFAULT_CHAIN_PARAMS } from "./chain";
export type { ChainParams } from "./chain";

let WHISPER_MESSAGE_KEYS = new TextEncoder().encode("WhisperMessageKeys");

export interface SPQRState {
  braid: BraidState;
  chain: Chain;
  authKey: Uint8Array; // kept for chain (re)creation symmetry; chain already built
}

export interface InitialParams {
  direction: Direction;
  authKey: Uint8Array;
  chainParams?: ChainParams;
}

/** Build the initial SPQR state. The chain is created eagerly from auth_key
 * (the reference builds it lazily from version_negotiation on first use; eager
 * is equivalent for our V1-always sessions). */
export function initialState(params: InitialParams): SPQRState {
  let chainParams = params.chainParams ?? DEFAULT_CHAIN_PARAMS;
  let braid = params.direction == Direction.A2B ? initA(params.authKey) : initB(params.authKey);
  let chain = Chain.newChain(params.authKey, params.direction, chainParams);
  return { braid: braid, chain: chain, authKey: params.authKey.slice() };
}

export interface SendOutput {
  state: SPQRState;
  msg: Uint8Array; // goes on the wire as SignalMessage.pq_ratchet
  key: Uint8Array | null; // 32-byte SPQR per-epoch key, or null until first epoch lands
}

/** Produce the next outgoing pq_ratchet blob and (once an epoch completes) the
 * per-epoch key to mix into the message keys. */
export function send(state: SPQRState): SendOutput {
  let result = braidSend(state.braid);
  let chain = state.chain;
  if (result.key) {
    chain.addEpoch(result.key);
  }
  // chain epoch is one behind braid epoch (braid negotiates the next epoch).
  let { index, key } = chain.sendKey(result.msg.epoch - 1);
  let wire = serializeMessage(result.msg, index);
  return {
    state: { braid: result.state, chain: chain, authKey: state.authKey },
    msg: wire,
    key: key,
  };
}

export interface RecvOutput {
  state: SPQRState;
  key: Uint8Array | null;
}

/** Consume an incoming pq_ratchet blob, advancing the braid + chain and
 * returning the per-epoch key to mix in (or null). The state passed in must NOT
 * be committed by the caller unless decrypt/MAC succeeds downstream — but the
 * braid itself never throws on benign reorder, only on real tampering. */
export function recv(state: SPQRState, msg: Uint8Array): RecvOutput {
  let { msg: sckaMsg, index } = deserializeMessage(msg);
  let result = braidRecv(state.braid, sckaMsg);
  let chain = state.chain;
  if (result.key) {
    chain.addEpoch(result.key);
  }
  let msgKeyEpoch = sckaMsg.epoch - 1;
  let key: Uint8Array | null;
  if (msgKeyEpoch == 0 && index == 0) {
    key = null;
  } else {
    key = chain.recvKey(msgKeyEpoch, index);
  }
  return { state: { braid: result.state, chain: chain, authKey: state.authKey }, key: key };
}

// ---------------- state serialization ----------------

function u32BE(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF]);
}

export function serializeSPQRState(state: SPQRState): Uint8Array {
  let braidBytes = serializeState(state.braid);
  let chainBytes = state.chain.serialize();
  return concatBytes(u32BE(braidBytes.length), braidBytes, u32BE(chainBytes.length), chainBytes);
}

export function deserializeSPQRState(bytes: Uint8Array): SPQRState {
  let read32 = (at: number) => ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;
  let bLen = read32(0);
  let braid = deserializeState(bytes.subarray(4, 4 + bLen));
  let at = 4 + bLen;
  let cLen = read32(at);
  let chain = Chain.deserialize(bytes.subarray(at + 4, at + 4 + cLen));
  return { braid: braid, chain: chain, authKey: braid.auth.rootKey.slice() };
}

// ---------------- Triple-Ratchet message-key mix ----------------

export interface MessageKeys {
  cipherKey: Uint8Array; // 32
  macKey: Uint8Array; // 32
  iv: Uint8Array; // 16
}

/** Mix the SPQR per-epoch key (HKDF salt) into the Double-Ratchet message-key
 * seed (HKDF IKM). When `pqrKey` is null (before the first epoch completes),
 * the result equals the legacy Double-Ratchet message keys (zero/None salt),
 * so a new session stays bit-compatible with pre-SPQR derivation.
 *
 * @param drSeed the classic per-message key seed (HMAC(chain_key, 0x01)). */
export function deriveTripleRatchetKeys(drSeed: Uint8Array, pqrKey: Uint8Array | null): MessageKeys {
  // @noble's hkdf treats an undefined salt as RFC-5869 zero salt, matching the
  // reference's Option<&[u8]> == None case.
  let salt = pqrKey ?? new Uint8Array(0);
  let out = hkdfSHA256(drSeed, salt, WHISPER_MESSAGE_KEYS, 80);
  return {
    cipherKey: out.subarray(0, 32).slice(),
    macKey: out.subarray(32, 64).slice(),
    iv: out.subarray(64, 80).slice(),
  };
}

export { SPQRError };
