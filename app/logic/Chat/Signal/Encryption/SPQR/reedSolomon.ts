/** Reed-Solomon erasure code over GF(2¹⁶) used by SPQR to stream a fixed-length
 * message (e.g. the 1152-byte ML-KEM encapsulation key) as an unbounded stream
 * of 32-byte chunks, where any ceil(len/32) distinct chunks reconstruct it.
 *
 * Clean-room port of SparsePostQuantumRatchet `src/encoding/polynomial.rs`
 * (+ `round_robin.rs` semantics): the message is read as 2-byte big-endian
 * GF(2¹⁶) elements, round-robin distributed across NUM_POLYS=16 independent
 * polynomials; chunk idx = all 16 polynomials evaluated at X=idx. The first
 * chunks are the original data (systematic); later chunks are parity. */
import { gfAdd, gfMul, gfDiv } from "./gf";

export const CHUNK_SIZE = 32;
export const NUM_POLYS = CHUNK_SIZE / 2; // 16

export interface Chunk {
  index: number; // u16
  data: Uint8Array; // 32 bytes
}

interface Pt {
  x: number;
  y: number;
}

/** Lagrange-interpolate a polynomial (coefficients little-endian, index 0 =
 * constant term) through points with distinct X values. O(N²). */
function lagrangeInterpolate(pts: Pt[]): number[] {
  let n = pts.length;
  let out = new Array<number>(n).fill(0);
  if (n == 0) {
    return out;
  }
  for (let i = 0; i < n; i++) {
    let pi = pts[i];
    // denominator = PRODUCT_{j != i} (pi.x - pj.x)
    let denom = 1;
    for (let j = 0; j < n; j++) {
      if (j == i) {
        continue;
      }
      denom = gfMul(denom, gfAdd(pi.x, pts[j].x));
    }
    let scale = gfDiv(pi.y, denom);
    // basis = scale * PRODUCT_{j != i} (x - pj.x)
    let basis = new Array<number>(n).fill(0);
    basis[0] = scale;
    let deg = 0;
    for (let j = 0; j < n; j++) {
      if (j == i) {
        continue;
      }
      // multiply basis by (x - pts[j].x) = (x + pts[j].x) over GF(2^k)
      let xj = pts[j].x;
      for (let k = deg + 1; k >= 1; k--) {
        basis[k] = gfAdd(basis[k - 1], gfMul(basis[k], xj));
      }
      basis[0] = gfMul(basis[0], xj);
      deg++;
    }
    for (let k = 0; k < n; k++) {
      out[k] = gfAdd(out[k], basis[k]);
    }
  }
  return out;
}

/** Evaluate a polynomial (little-endian coefficients) at x. */
function computeAt(coefficients: number[], x: number): number {
  // Horner's method.
  let out = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    out = gfAdd(gfMul(out, x), coefficients[i]);
  }
  return out;
}

/** Serialize a polynomial's coefficients as 2 big-endian bytes each. */
export function serializePoly(coefficients: number[]): Uint8Array {
  let out = new Uint8Array(coefficients.length * 2);
  for (let i = 0; i < coefficients.length; i++) {
    out[i * 2] = (coefficients[i] >> 8) & 0xFF;
    out[i * 2 + 1] = coefficients[i] & 0xFF;
  }
  return out;
}

export function deserializePoly(bytes: Uint8Array): number[] {
  let out = new Array<number>(bytes.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = (bytes[i * 2] << 8) | bytes[i * 2 + 1];
  }
  return out;
}

/** Serialize a point as X(2 BE) || Y(2 BE). */
export function serializePt(x: number, y: number): Uint8Array {
  return new Uint8Array([(x >> 8) & 0xFF, x & 0xFF, (y >> 8) & 0xFF, y & 0xFF]);
}

/** Streams a fixed message as 32-byte chunks. Once a requested X exceeds the
 * stored data range, each poly is interpolated once and evaluated thereafter. */
export class PolyEncoder {
  protected idx = 0;
  /** As-received y-values per poly (X = 0,1,2,…), or null once interpolated. */
  protected points: number[][];
  protected polys: (number[] | null)[];

  constructor(points: number[][]) {
    this.points = points;
    this.polys = new Array(NUM_POLYS).fill(null);
  }

  static encodeBytes(msg: Uint8Array): PolyEncoder {
    if (msg.length % 2 != 0) {
      throw new Error("SPQR RS: message length must be even");
    }
    let points: number[][] = [];
    for (let p = 0; p < NUM_POLYS; p++) {
      points.push([]);
    }
    let count = msg.length / 2;
    for (let i = 0; i < count; i++) {
      let value = (msg[i * 2] << 8) | msg[i * 2 + 1];
      points[i % NUM_POLYS].push(value);
    }
    return new PolyEncoder(points);
  }

  protected pointAt(poly: number, idx: number): number {
    let pts = this.points[poly];
    if (this.polys[poly] == null && idx < pts.length) {
      return pts[idx];
    }
    if (this.polys[poly] == null) {
      // First point outside the stored range: interpolate this poly once.
      let interpolatePts: Pt[] = pts.map((y, x) => ({ x, y }));
      this.polys[poly] = lagrangeInterpolate(interpolatePts);
    }
    return computeAt(this.polys[poly]!, idx);
  }

  chunkAt(idx: number): Chunk {
    let data = new Uint8Array(CHUNK_SIZE);
    for (let i = 0; i < NUM_POLYS; i++) {
      // total_idx = idx*16 + i ⇒ poly = i, poly_idx = idx
      let y = this.pointAt(i, idx);
      data[i * 2] = (y >> 8) & 0xFF;
      data[i * 2 + 1] = y & 0xFF;
    }
    return { index: idx & 0xFFFF, data };
  }

  nextChunk(): Chunk {
    let out = this.chunkAt(this.idx & 0xFFFF);
    this.idx = (this.idx + 1) >>> 0;
    return out;
  }

  serialize(): Uint8Array {
    // [idx u32 BE][mode 1][16 entries: len u16 BE || bytes]
    // mode 0 = points, mode 1 = polys.
    let interpolated = this.polys.some(p => p != null);
    let parts: Uint8Array[] = [];
    let header = new Uint8Array(5);
    header[0] = (this.idx >>> 24) & 0xFF;
    header[1] = (this.idx >>> 16) & 0xFF;
    header[2] = (this.idx >>> 8) & 0xFF;
    header[3] = this.idx & 0xFF;
    header[4] = interpolated ? 1 : 0;
    parts.push(header);
    for (let i = 0; i < NUM_POLYS; i++) {
      let bytes = interpolated ? serializePoly(this.polys[i] ?? lagrangeInterpolate(this.points[i].map((y, x) => ({ x, y })))) : serializePoly(this.points[i]);
      let len = new Uint8Array(2);
      len[0] = (bytes.length >> 8) & 0xFF;
      len[1] = bytes.length & 0xFF;
      parts.push(len, bytes);
    }
    return concatChunks(parts);
  }

  static deserialize(bytes: Uint8Array): PolyEncoder {
    let idx = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    let interpolated = bytes[4] == 1;
    let at = 5;
    let arrays: number[][] = [];
    for (let i = 0; i < NUM_POLYS; i++) {
      let len = (bytes[at] << 8) | bytes[at + 1];
      at += 2;
      arrays.push(deserializePoly(bytes.subarray(at, at + len)));
      at += len;
    }
    let enc: PolyEncoder;
    if (interpolated) {
      enc = new PolyEncoder(new Array(NUM_POLYS).fill(0).map(() => []));
      enc.polys = arrays;
    } else {
      enc = new PolyEncoder(arrays);
    }
    enc.idx = idx >>> 0;
    return enc;
  }
}

/** Reconstructs a fixed-length message from any sufficient set of chunks. */
export class PolyDecoder {
  ptsNeeded: number; // total field elements
  protected pts: Map<number, number>[]; // per-poly X→Y
  protected isComplete = false;

  constructor(ptsNeeded: number, pts?: Map<number, number>[], isComplete = false) {
    this.ptsNeeded = ptsNeeded;
    this.pts = pts ?? new Array(NUM_POLYS).fill(0).map(() => new Map<number, number>());
    this.isComplete = isComplete;
  }

  static newForLength(lenBytes: number): PolyDecoder {
    if (lenBytes % 2 != 0) {
      throw new Error("SPQR RS: message length must be even");
    }
    return new PolyDecoder(lenBytes / 2);
  }

  protected necessaryPoints(poly: number): number {
    let perPoly = Math.floor(this.ptsNeeded / NUM_POLYS);
    let remaining = this.ptsNeeded % NUM_POLYS;
    return poly < remaining ? perPoly + 1 : perPoly;
  }

  addChunk(chunk: Chunk): void {
    for (let i = 0; i < NUM_POLYS; i++) {
      // total_idx = chunk.index*16 + i ⇒ poly = i, poly_idx = chunk.index
      let poly = i;
      let polyIdx = chunk.index;
      let y = (chunk.data[i * 2] << 8) | chunk.data[i * 2 + 1];
      let need = this.necessaryPoints(i);
      // Add only if it has a small index (decode without interpolation) or we
      // still lack enough points for this poly. Duplicate X dropped.
      if (polyIdx < need || this.pts[poly].size < need) {
        if (!this.pts[poly].has(polyIdx)) {
          this.pts[poly].set(polyIdx, y);
        }
      }
    }
  }

  decodedMessage(): Uint8Array | null {
    if (this.isComplete) {
      return null;
    }
    for (let i = 0; i < NUM_POLYS; i++) {
      if (this.pts[i].size < this.necessaryPoints(i)) {
        return null;
      }
    }
    let polys: (number[] | null)[] = new Array(NUM_POLYS).fill(null);
    let out = new Uint8Array(this.ptsNeeded * 2);
    for (let i = 0; i < this.ptsNeeded; i++) {
      let poly = i % NUM_POLYS;
      let polyIdx = Math.floor(i / NUM_POLYS);
      let y: number;
      if (this.pts[poly].has(polyIdx)) {
        y = this.pts[poly].get(polyIdx)!;
      } else {
        if (polys[poly] == null) {
          let need = this.necessaryPoints(poly);
          // Use the necessaryPoints lowest-X points (sorted) for interpolation.
          let sorted = [...this.pts[poly].entries()].sort((a, b) => a[0] - b[0]).slice(0, need);
          polys[poly] = lagrangeInterpolate(sorted.map(([x, yy]) => ({ x, y: yy })));
        }
        y = computeAt(polys[poly]!, polyIdx);
      }
      out[i * 2] = (y >> 8) & 0xFF;
      out[i * 2 + 1] = y & 0xFF;
    }
    return out;
  }

  serialize(): Uint8Array {
    // [ptsNeeded u32 BE][isComplete 1][16 entries: count u16 BE || count*(X,Y BE)]
    let parts: Uint8Array[] = [];
    let header = new Uint8Array(5);
    header[0] = (this.ptsNeeded >>> 24) & 0xFF;
    header[1] = (this.ptsNeeded >>> 16) & 0xFF;
    header[2] = (this.ptsNeeded >>> 8) & 0xFF;
    header[3] = this.ptsNeeded & 0xFF;
    header[4] = this.isComplete ? 1 : 0;
    parts.push(header);
    for (let i = 0; i < NUM_POLYS; i++) {
      let entries = [...this.pts[i].entries()].sort((a, b) => a[0] - b[0]);
      let buf = new Uint8Array(2 + entries.length * 4);
      buf[0] = (entries.length >> 8) & 0xFF;
      buf[1] = entries.length & 0xFF;
      let at = 2;
      for (let [x, y] of entries) {
        buf.set(serializePt(x, y), at);
        at += 4;
      }
      parts.push(buf);
    }
    return concatChunks(parts);
  }

  static deserialize(bytes: Uint8Array): PolyDecoder {
    let ptsNeeded = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    let isComplete = bytes[4] == 1;
    let at = 5;
    let pts: Map<number, number>[] = [];
    for (let i = 0; i < NUM_POLYS; i++) {
      let count = (bytes[at] << 8) | bytes[at + 1];
      at += 2;
      let m = new Map<number, number>();
      for (let j = 0; j < count; j++) {
        let x = (bytes[at] << 8) | bytes[at + 1];
        let y = (bytes[at + 2] << 8) | bytes[at + 3];
        m.set(x, y);
        at += 4;
      }
      pts.push(m);
    }
    return new PolyDecoder(ptsNeeded >>> 0, pts, isComplete);
  }
}

function concatChunks(arrays: Uint8Array[]): Uint8Array {
  let total = arrays.reduce((sum, a) => sum + a.length, 0);
  let result = new Uint8Array(total);
  let offset = 0;
  for (let a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}
