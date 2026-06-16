/** A minimal protobuf writer/reader. Used directly where exact byte control
 * matters (the small Signal wire messages — version bytes, MAC coverage — and
 * the crypt15 backup header), and as the engine under the readable codec DSL
 * (codec.ts) that the larger WhatsApp message schemas (schema.ts) are built on.
 * No external protobuf library is used anywhere in app code. */

export class ProtoWriter {
  protected buffer: number[] = [];

  varint(field: number, value: number | bigint | undefined): this {
    if (value == null) {
      return this;
    }
    this.tag(field, 0);
    this.writeVarint(BigInt(value));
    return this;
  }

  bytes(field: number, value: Uint8Array | undefined): this {
    if (value == null) {
      return this;
    }
    this.tag(field, 2);
    this.writeVarint(BigInt(value.length));
    for (let b of value) {
      this.buffer.push(b);
    }
    return this;
  }

  /** A wire-type-1 fixed 64-bit value (little-endian), e.g. proto `fixed64`. */
  fixed64(field: number, value: number | bigint | undefined): this {
    if (value == null) {
      return this;
    }
    this.tag(field, 1);
    let v = BigInt(value) & 0xFFFFFFFFFFFFFFFFn;
    for (let i = 0; i < 8; i++) {
      this.buffer.push(Number((v >> BigInt(i * 8)) & 0xFFn));
    }
    return this;
  }

  /** A wire-type-5 fixed 32-bit value (little-endian), e.g. proto `fixed32`. */
  fixed32(field: number, value: number | undefined): this {
    if (value == null) {
      return this;
    }
    this.tag(field, 5);
    let v = value >>> 0;
    for (let i = 0; i < 4; i++) {
      this.buffer.push((v >>> (i * 8)) & 0xFF);
    }
    return this;
  }

  finish(): Uint8Array {
    return Uint8Array.from(this.buffer);
  }

  protected tag(field: number, wireType: number) {
    this.writeVarint(BigInt((field << 3) | wireType));
  }

  protected writeVarint(value: bigint) {
    while (value > 0x7Fn) {
      this.buffer.push(Number((value & 0x7Fn) | 0x80n));
      value >>= 7n;
    }
    this.buffer.push(Number(value));
  }
}

export interface ProtoField {
  wireType: number;
  /** For wireType 0 (varint) */
  int?: bigint;
  /** For wireType 2 (length-delimited) */
  data?: Uint8Array;
}

/** Parses a protobuf message into a map of field number -> values (repeated). */
export function readProto(data: Uint8Array): Map<number, ProtoField[]> {
  let fields = new Map<number, ProtoField[]>();
  let pos = 0;
  function varint(): bigint {
    let result = 0n;
    let shift = 0n;
    while (pos < data.length) {
      let byte = data[pos++];
      result |= BigInt(byte & 0x7F) << shift;
      if (!(byte & 0x80)) {
        break;
      }
      shift += 7n;
    }
    return result;
  }
  while (pos < data.length) {
    let tag = varint();
    let field = Number(tag >> 3n);
    let wireType = Number(tag & 7n);
    let value: ProtoField = { wireType };
    if (wireType == 0) {
      value.int = varint();
    } else if (wireType == 2) {
      let len = Number(varint());
      value.data = data.subarray(pos, pos + len).slice();
      pos += len;
    } else if (wireType == 1) {
      let v = 0n;
      for (let i = 0; i < 8; i++) {
        v |= BigInt(data[pos + i]) << BigInt(i * 8);
      }
      pos += 8;
      value.int = v;
    } else if (wireType == 5) {
      let v = 0n;
      for (let i = 0; i < 4; i++) {
        v |= BigInt(data[pos + i]) << BigInt(i * 8);
      }
      pos += 4;
      value.int = v;
    } else {
      throw new Error(`Unsupported protobuf wire type ${wireType}`);
    }
    if (!fields.has(field)) {
      fields.set(field, []);
    }
    fields.get(field)!.push(value);
  }
  return fields;
}

export function getBytes(fields: Map<number, ProtoField[]>, field: number): Uint8Array | undefined {
  return fields.get(field)?.[0]?.data;
}

export function getInt(fields: Map<number, ProtoField[]>, field: number): number | undefined {
  let v = fields.get(field)?.[0]?.int;
  return v == null ? undefined : Number(v);
}

/** Convenience: the bytes of the first length-delimited field with this number. */
export function protobufField(data: Uint8Array, field: number): Uint8Array | undefined {
  return getBytes(readProto(data), field);
}
