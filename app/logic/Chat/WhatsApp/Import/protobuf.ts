/** Minimal protobuf parser:
 * @returns the contents of the first length-delimited field
 *   with the given field number, at the top level of `buffer` */
export function protobufField(buffer: Uint8Array, fieldNumber: number): Uint8Array | null {
  let pos = 0;
  while (pos < buffer.length) {
    let tag = readVarint(buffer, pos);
    pos = tag.next;
    let field = Number(tag.value >> 3n);
    let wireType = Number(tag.value & 7n);
    if (wireType == 0) { // varint
      pos = readVarint(buffer, pos).next;
    } else if (wireType == 1) { // 64 bit
      pos += 8;
    } else if (wireType == 2) { // length-delimited
      let len = readVarint(buffer, pos);
      pos = len.next;
      let length = Number(len.value);
      if (field == fieldNumber) {
        return buffer.subarray(pos, pos + length);
      }
      pos += length;
    } else if (wireType == 5) { // 32 bit
      pos += 4;
    } else {
      return null; // corrupt header
    }
  }
  return null;
}

function readVarint(buffer: Uint8Array, pos: number): { value: bigint, next: number } {
  let value = 0n;
  let shift = 0n;
  while (pos < buffer.length) {
    let byte = buffer[pos++];
    value |= BigInt(byte & 0x7F) << shift;
    if (!(byte & 0x80)) {
      break;
    }
    shift += 7n;
  }
  return { value, next: pos };
}
