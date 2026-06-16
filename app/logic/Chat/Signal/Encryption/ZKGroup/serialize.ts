/** bincode-exact (de)serialization for zkgroup wire types.
 *
 * libsignal configures bincode with fixed-int encoding, little-endian, and
 * reject-trailing-bytes (serialization.rs). The rules:
 *   - integers: fixed width, little-endian (u8→1, u32→4, u64→8 bytes LE)
 *   - [u8; N] / fixed arrays: raw N bytes, no length prefix
 *   - Vec<T>: u64-LE length, then elements
 *   - RistrettoPoint: 32-byte canonical compressed encoding
 *   - Scalar: 32-byte canonical little-endian (read rejects non-canonical)
 *   - struct: fields concatenated in declaration order, no names/padding
 *   - VersionByte<C> / ReservedByte: a single byte that must equal C on read
 *   - PhantomData / #[serde(skip)]: zero bytes
 */
import { ristretto255 } from "@noble/curves/ed25519.js";
import { numberToBytesLE, bytesToNumberLE } from "@noble/curves/utils.js";

const Point = ristretto255.Point;
const Fn = Point.Fn;
type Pt = InstanceType<typeof Point>;

/** A scalar serialized as 32 canonical little-endian bytes. */
export function scalarToBytes(s: bigint): Uint8Array {
  return numberToBytesLE(Fn.create(s), 32);
}

/** Reads a 32-byte canonical little-endian scalar; throws if ≥ ℓ. */
export function bytesToScalar(b: Uint8Array): bigint {
  let n = bytesToNumberLE(b);
  if (n >= Fn.ORDER) {
    throw new Error("non-canonical scalar");
  }
  return n;
}

/** A growable byte buffer that appends in bincode order. */
export class Writer {
  private parts: Uint8Array[] = [];

  u8(n: number): this {
    this.parts.push(Uint8Array.of(n & 0xFF));
    return this;
  }

  /** u64 little-endian. */
  u64(n: number | bigint): this {
    this.parts.push(numberToBytesLE(BigInt(n), 8));
    return this;
  }

  /** Raw fixed-width bytes, no length prefix. */
  bytes(b: Uint8Array): this {
    this.parts.push(b);
    return this;
  }

  scalar(s: bigint): this {
    this.parts.push(scalarToBytes(s));
    return this;
  }

  point(p: Pt): this {
    this.parts.push(p.toBytes());
    return this;
  }

  /** A Vec<RistrettoPoint>: u64-LE length, then 32 bytes per point. */
  pointVec(points: Pt[]): this {
    this.u64(points.length);
    for (let p of points) {
      this.point(p);
    }
    return this;
  }

  /** A Vec<u8>: u64-LE length, then the raw bytes. */
  byteVec(b: Uint8Array): this {
    this.u64(b.length);
    return this.bytes(b);
  }

  finish(): Uint8Array {
    let total = this.parts.reduce((sum, p) => sum + p.length, 0);
    let out = new Uint8Array(total);
    let offset = 0;
    for (let p of this.parts) {
      out.set(p, offset);
      offset += p.length;
    }
    return out;
  }
}

/** Reads bincode fields sequentially; rejects trailing bytes via {@link end}. */
export class Reader {
  private offset = 0;

  constructor(private readonly data: Uint8Array) {}

  u8(): number {
    return this.data[this.offset++];
  }

  /** Reads and asserts a VersionByte/ReservedByte equals `expected`. */
  versionByte(expected: number): void {
    let v = this.u8();
    if (v != expected) {
      throw new Error(`bad version byte: ${v}, expected ${expected}`);
    }
  }

  u64(): bigint {
    let b = this.bytes(8);
    return bytesToNumberLE(b);
  }

  bytes(n: number): Uint8Array {
    let b = this.data.subarray(this.offset, this.offset + n);
    if (b.length != n) {
      throw new Error("unexpected end of input");
    }
    this.offset += n;
    return b;
  }

  scalar(): bigint {
    return bytesToScalar(this.bytes(32));
  }

  point(): Pt {
    return Point.fromBytes(this.bytes(32));
  }

  pointVec(): Pt[] {
    let len = Number(this.u64());
    let out: Pt[] = [];
    for (let i = 0; i < len; i++) {
      out.push(this.point());
    }
    return out;
  }

  byteVec(): Uint8Array {
    let len = Number(this.u64());
    return this.bytes(len);
  }

  /** Throws unless the whole input has been consumed (bincode rejects trailing bytes). */
  end(): void {
    if (this.offset != this.data.length) {
      throw new Error("trailing bytes after deserialization");
    }
  }
}

/** Big-endian u64, used inside hashing (Timestamp::to_be_bytes, not the LE wire form). */
export function u64BE(n: number | bigint): Uint8Array {
  return new Uint8Array([...numberToBytesLE(BigInt(n), 8)].reverse());
}
