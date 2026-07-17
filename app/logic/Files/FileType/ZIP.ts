/**
 * Minimal ZIP reader
 * Reads one named entry from a ZIP archive in memory.
 * Supports STORE (0) and DEFLATE (8).
 * Uses the browser's native DecompressionStream; no library dependency.
 */
export async function readZipEntry(buffer: ArrayBuffer, fileName: string): Promise<string> {
  let view = new DataView(buffer);
  let u8 = new Uint8Array(buffer);
  let dec = new TextDecoder();

  // Find End of Central Directory record (signature PK\x05\x06). Comment may be up to 65535 bytes.
  let eocd = -1;
  let searchEnd = Math.max(0, buffer.byteLength - 65557);
  for (let i = buffer.byteLength - 22; i >= searchEnd; i--) {
    if (view.getUint32(i, true) == 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) {
    throw new Error("Not a ZIP file");
  }
  let cdSize = view.getUint32(eocd + 12, true);
  let cdOff = view.getUint32(eocd + 16, true);

  // Walk Central Directory entries (signature PK\x01\x02).
  let p = cdOff;
  while (p < cdOff + cdSize) {
    if (view.getUint32(p, true) != 0x02014b50) {
      break;
    }
    let method = view.getUint16(p + 10, true);
    let compSize = view.getUint32(p + 20, true);
    let nameLen = view.getUint16(p + 28, true);
    let extraLen = view.getUint16(p + 30, true);
    let commentLen = view.getUint16(p + 32, true);
    let localOff = view.getUint32(p + 42, true);
    let name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
    if (name == fileName) {
      // Local header has its own name/extra lengths; data starts after them.
      let lhNameLen = view.getUint16(localOff + 26, true);
      let lhExtraLen = view.getUint16(localOff + 28, true);
      let dataStart = localOff + 30 + lhNameLen + lhExtraLen;
      let comp = u8.subarray(dataStart, dataStart + compSize);
      if (method == 0) {
        return dec.decode(comp);
      } else if (method == 8) {
        let stream = new Blob([comp]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
        return dec.decode(await new Response(stream).arrayBuffer());
      } else {
        throw new Error("Unsupported ZIP compression method: " + method);
      }
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error("Entry not found in archive: " + fileName);
}
