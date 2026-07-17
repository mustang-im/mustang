/** SPQR symmetric key chain (clean-room port of SparsePostQuantumRatchet
 * `src/chain.rs` + `src/kdf.rs`). Turns each per-epoch ML-KEM secret into a
 * per-message-index key stream, tolerating out-of-order delivery via a key
 * history. KDF = HKDF-SHA256; the info labels are byte-exact, including the
 * DOUBLE SPACE in "Signal PQ Ratchet V1 Chain  Start". */
import { hkdfSHA256, concatBytes } from "../../Crypto/primitives";

export enum Direction {
  A2B = 0,
  B2A = 1,
}

function switchDirection(d: Direction): Direction {
  return d == Direction.A2B ? Direction.B2A : Direction.A2B;
}

export interface ChainParams {
  maxJump: number;
  maxOOOKeys: number;
}

export const DEFAULT_CHAIN_PARAMS: ChainParams = { maxJump: 25_000, maxOOOKeys: 2_000 };

export interface EpochSecret {
  epoch: number; // u64 (kept < 2^53 in practice)
  secret: Uint8Array;
}

let ZERO_SALT = new Uint8Array(32);
let LABEL_START = textBytes("Signal PQ Ratchet V1 Chain  Start"); // note the double space
let LABEL_ADD_EPOCH = textBytes("Signal PQ Ratchet V1 Chain Add Epoch");
let LABEL_NEXT = textBytes("Signal PQ Ratchet V1 Chain Next");

function textBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function u64BE(n: number): Uint8Array {
  let out = new Uint8Array(8);
  let v = BigInt(n);
  for (let i = 7; i >= 0; i--) {
    out[i] = Number(v & 0xFFn);
    v >>= 8n;
  }
  return out;
}

function u32BE(n: number): Uint8Array {
  let out = new Uint8Array(4);
  out[0] = (n >>> 24) & 0xFF;
  out[1] = (n >>> 16) & 0xFF;
  out[2] = (n >>> 8) & 0xFF;
  out[3] = n & 0xFF;
  return out;
}

export class SPQRError extends Error {}

const KEY_SIZE = 4 + 32; // [BE32 index][32-byte key]

/** History of skipped (out-of-order) message keys, stored as packed
 * [index][key] records and GC'd beyond maxOOOKeys behind the current ctr. */
class KeyHistory {
  data: number[]; // bytes

  constructor(data: number[] = []) {
    this.data = data;
  }

  private trimSize(params: ChainParams): number {
    let maxOOO = params.maxOOOKeys || DEFAULT_CHAIN_PARAMS.maxOOOKeys;
    return Math.floor((maxOOO * 11) / 10) + 1;
  }

  add(index: number, key: Uint8Array): void {
    for (let b of u32BE(index)) {
      this.data.push(b);
    }
    for (let b of key) {
      this.data.push(b);
    }
  }

  clear(): void {
    this.data = [];
  }

  private removeAt(at: number): void {
    if (at + KEY_SIZE < this.data.length) {
      // Move the last record into the gap.
      let newEnd = this.data.length - KEY_SIZE;
      for (let i = 0; i < KEY_SIZE; i++) {
        this.data[at + i] = this.data[newEnd + i];
      }
      this.data.length = newEnd;
    } else {
      this.data.length = at;
    }
  }

  gc(currentKey: number, params: ChainParams): void {
    let maxOOO = params.maxOOOKeys || DEFAULT_CHAIN_PARAMS.maxOOOKeys;
    if (this.data.length >= this.trimSize(params) * KEY_SIZE) {
      let horizon = currentKey - maxOOO;
      let i = 0;
      while (i < this.data.length) {
        let idx = (this.data[i] << 24) | (this.data[i + 1] << 16) | (this.data[i + 2] << 8) | this.data[i + 3];
        if ((idx >>> 0) < horizon) {
          this.removeAt(i);
        } else {
          i += KEY_SIZE;
        }
      }
    }
  }

  get(at: number, currentCtr: number, params: ChainParams): Uint8Array {
    let maxOOO = params.maxOOOKeys || DEFAULT_CHAIN_PARAMS.maxOOOKeys;
    if (at + maxOOO < currentCtr) {
      throw new SPQRError(`SPQR key trimmed: ${at}`);
    }
    for (let i = 0; i < this.data.length; i += KEY_SIZE) {
      let idx = ((this.data[i] << 24) | (this.data[i + 1] << 16) | (this.data[i + 2] << 8) | this.data[i + 3]) >>> 0;
      if (idx == at) {
        let out = new Uint8Array(this.data.slice(i + 4, i + KEY_SIZE));
        this.removeAt(i);
        return out;
      }
    }
    throw new SPQRError(`SPQR key already requested: ${at}`);
  }
}

/** One direction (send or recv) of one epoch's key chain. */
class ChainEpochDirection {
  ctr = 0;
  next: Uint8Array; // 32, empty once cleared
  prev: KeyHistory;

  constructor(key: Uint8Array, ctr = 0, prev?: KeyHistory) {
    this.next = key.slice();
    this.ctr = ctr;
    this.prev = prev ?? new KeyHistory();
  }

  private static nextKeyInternal(self: ChainEpochDirection): { index: number; key: Uint8Array } {
    self.ctr += 1;
    let info = concatBytes(u32BE(self.ctr), LABEL_NEXT);
    let out = hkdfSHA256(self.next, ZERO_SALT, info, 64);
    self.next = out.subarray(0, 32).slice();
    return { index: self.ctr, key: out.subarray(32, 64).slice() };
  }

  nextKey(): { index: number; key: Uint8Array } {
    return ChainEpochDirection.nextKeyInternal(this);
  }

  key(at: number, params: ChainParams): Uint8Array {
    let maxJump = params.maxJump || DEFAULT_CHAIN_PARAMS.maxJump;
    let maxOOO = params.maxOOOKeys || DEFAULT_CHAIN_PARAMS.maxOOOKeys;
    if (at > this.ctr) {
      if (at - this.ctr > maxJump) {
        throw new SPQRError(`SPQR key jump: ${this.ctr} -> ${at}`);
      }
    } else if (at < this.ctr) {
      return this.prev.get(at, this.ctr, params);
    } else {
      throw new SPQRError(`SPQR key already requested: ${at}`);
    }
    if (at > this.ctr + maxOOO) {
      this.prev.clear();
    }
    while (at > this.ctr + 1) {
      let k = ChainEpochDirection.nextKeyInternal(this);
      if (this.ctr + maxOOO >= at) {
        this.prev.add(k.index, k.key);
      }
    }
    this.prev.gc(this.ctr, params);
    return ChainEpochDirection.nextKeyInternal(this).key;
  }

  clearNext(): void {
    this.next = new Uint8Array(0);
  }

  serialize(): Uint8Array {
    let nextLen = new Uint8Array([this.next.length]);
    let prevData = new Uint8Array(this.prev.data);
    let prevLen = u32BE(prevData.length);
    return concatBytes(u32BE(this.ctr), nextLen, this.next, prevLen, prevData);
  }

  static deserialize(c: { b: Uint8Array; at: number }): ChainEpochDirection {
    let ctr = ((c.b[c.at] << 24) | (c.b[c.at + 1] << 16) | (c.b[c.at + 2] << 8) | c.b[c.at + 3]) >>> 0;
    c.at += 4;
    let nextLen = c.b[c.at]; c.at += 1;
    let next = c.b.subarray(c.at, c.at + nextLen).slice(); c.at += nextLen;
    let prevLen = ((c.b[c.at] << 24) | (c.b[c.at + 1] << 16) | (c.b[c.at + 2] << 8) | c.b[c.at + 3]) >>> 0;
    c.at += 4;
    let prevData = Array.from(c.b.subarray(c.at, c.at + prevLen)); c.at += prevLen;
    let ced = new ChainEpochDirection(next, ctr, new KeyHistory(prevData));
    return ced;
  }
}

class ChainEpoch {
  send: ChainEpochDirection;
  recv: ChainEpochDirection;

  constructor(send: ChainEpochDirection, recv: ChainEpochDirection) {
    this.send = send;
    this.recv = recv;
  }
}

const EPOCHS_TO_KEEP_PRIOR_TO_SEND_EPOCH = 1;

export class Chain {
  dir: Direction;
  currentEpoch = 0;
  sendEpoch = 0;
  links: ChainEpoch[];
  nextRoot: Uint8Array; // 32
  params: ChainParams;

  private constructor(dir: Direction, links: ChainEpoch[], nextRoot: Uint8Array, params: ChainParams) {
    this.dir = dir;
    this.links = links;
    this.nextRoot = nextRoot;
    this.params = params;
  }

  private static cedForDirection(genr8r: Uint8Array, dir: Direction): ChainEpochDirection {
    let slice = dir == Direction.A2B ? genr8r.subarray(32, 64) : genr8r.subarray(64, 96);
    return new ChainEpochDirection(slice);
  }

  static newChain(initialKey: Uint8Array, dir: Direction, params: ChainParams): Chain {
    let genr8r = hkdfSHA256(initialKey, ZERO_SALT, LABEL_START, 96);
    let links = [new ChainEpoch(
      Chain.cedForDirection(genr8r, dir),
      Chain.cedForDirection(genr8r, switchDirection(dir)),
    )];
    return new Chain(dir, links, genr8r.subarray(0, 32).slice(), params);
  }

  addEpoch(epochSecret: EpochSecret): void {
    if (epochSecret.epoch != this.currentEpoch + 1) {
      throw new SPQRError(`SPQR add_epoch out of order: ${epochSecret.epoch} vs ${this.currentEpoch}`);
    }
    let genr8r = hkdfSHA256(epochSecret.secret, this.nextRoot, LABEL_ADD_EPOCH, 96);
    this.currentEpoch = epochSecret.epoch;
    this.nextRoot = genr8r.subarray(0, 32).slice();
    this.links.push(new ChainEpoch(
      Chain.cedForDirection(genr8r, this.dir),
      Chain.cedForDirection(genr8r, switchDirection(this.dir)),
    ));
  }

  private epochIdx(epoch: number): number {
    if (epoch > this.currentEpoch) {
      throw new SPQRError(`SPQR epoch out of range: ${epoch}`);
    }
    let back = this.currentEpoch - epoch;
    if (back >= this.links.length) {
      throw new SPQRError(`SPQR epoch out of range: ${epoch}`);
    }
    return this.links.length - 1 - back;
  }

  sendKey(epoch: number): { index: number; key: Uint8Array } {
    if (epoch < this.sendEpoch) {
      throw new SPQRError(`SPQR send key epoch decreased: ${this.sendEpoch} -> ${epoch}`);
    }
    let epochIndex = this.epochIdx(epoch);
    if (this.sendEpoch != epoch) {
      this.sendEpoch = epoch;
      while (epochIndex > EPOCHS_TO_KEEP_PRIOR_TO_SEND_EPOCH) {
        this.links.shift();
        epochIndex -= 1;
      }
      for (let i = 0; i < epochIndex; i++) {
        this.links[i].send.clearNext();
      }
    }
    return this.links[epochIndex].send.nextKey();
  }

  recvKey(epoch: number, index: number): Uint8Array {
    let epochIndex = this.epochIdx(epoch);
    return this.links[epochIndex].recv.key(index, this.params);
  }

  serialize(): Uint8Array {
    // [dir 1][currentEpoch u32][sendEpoch u32][maxJump u32][maxOOO u32]
    // [nextRoot 32][numLinks u32]{ send-ced || recv-ced }*
    let parts: Uint8Array[] = [];
    let head = new Uint8Array(1 + 4 + 4 + 4 + 4 + 32 + 4);
    head[0] = this.dir;
    head.set(u32BE(this.currentEpoch), 1);
    head.set(u32BE(this.sendEpoch), 5);
    head.set(u32BE(this.params.maxJump), 9);
    head.set(u32BE(this.params.maxOOOKeys), 13);
    head.set(this.nextRoot, 17);
    head.set(u32BE(this.links.length), 49);
    parts.push(head);
    for (let link of this.links) {
      parts.push(link.send.serialize(), link.recv.serialize());
    }
    return concatBytes(...parts);
  }

  static deserialize(bytes: Uint8Array): Chain {
    let dir = bytes[0] as Direction;
    let read32 = (at: number) => ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;
    let currentEpoch = read32(1);
    let sendEpoch = read32(5);
    let maxJump = read32(9);
    let maxOOO = read32(13);
    let nextRoot = bytes.subarray(17, 49).slice();
    let numLinks = read32(49);
    let c = { b: bytes, at: 53 };
    let links: ChainEpoch[] = [];
    for (let i = 0; i < numLinks; i++) {
      let send = ChainEpochDirection.deserialize(c);
      let recv = ChainEpochDirection.deserialize(c);
      links.push(new ChainEpoch(send, recv));
    }
    let chain = new Chain(dir, links, nextRoot, { maxJump: maxJump, maxOOOKeys: maxOOO });
    chain.currentEpoch = currentEpoch;
    chain.sendEpoch = sendEpoch;
    return chain;
  }
}
