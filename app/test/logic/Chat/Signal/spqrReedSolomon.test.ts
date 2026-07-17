import { PolyEncoder, PolyDecoder, serializePt } from "../../../../logic/Chat/Signal/Encryption/SPQR/reedSolomon";
import { expect, test } from "vitest";

// KAT from polynomial.rs:1009-1018 — Pt{x:0x1234,y:0x5678}.serialize().
test("SPQR RS: Pt serialize is X(2 BE) || Y(2 BE)", () => {
  expect([...serializePt(0x1234, 0x5678)]).toEqual([0x12, 0x34, 0x56, 0x78]);
});

// KAT from polynomial.rs:943-951 — encode "abcdefghij", decode using ONLY
// chunks 1 and 2 (NOT chunk 0), proving erasure recovery from non-systematic
// (parity) chunks.
test("SPQR RS: recover 'abcdefghij' from non-systematic chunks 1 and 2", () => {
  let msg = new TextEncoder().encode("abcdefghij");
  let enc = PolyEncoder.encodeBytes(msg);
  let dec = PolyDecoder.newForLength(10);
  dec.addChunk(enc.chunkAt(1));
  dec.addChunk(enc.chunkAt(2));
  let out = dec.decodedMessage();
  expect(out).not.toBeNull();
  expect(new TextDecoder().decode(out!)).toBe("abcdefghij");
});

// KAT from polynomial.rs:953-978 — encode [3;1088], feed only chunks at index
// >= 1088/32+1 = 35 (skipping all systematic chunks), reconstructs [3;1088].
test("SPQR RS: recover [3;1088] from parity chunks starting at index 35", () => {
  let msg = new Uint8Array(1088).fill(3);
  let enc = PolyEncoder.encodeBytes(msg);
  let dec = PolyDecoder.newForLength(1088);
  let needed = Math.floor(1088 / 32) + 1; // 35
  let recovered: Uint8Array | null = null;
  for (let i = needed; i <= needed * 2 + 1; i++) {
    dec.addChunk(enc.chunkAt(i));
    let out = dec.decodedMessage();
    if (out) {
      recovered = out;
      break;
    }
  }
  expect(recovered).not.toBeNull();
  expect([...recovered!]).toEqual([...msg]);
});

// Systematic property: chunk 0 = the first 32 message bytes verbatim.
test("SPQR RS: chunk 0 is the literal first 32 bytes (systematic)", () => {
  let msg = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    msg[i] = (i * 7 + 1) & 0xFF;
  }
  let enc = PolyEncoder.encodeBytes(msg);
  expect([...enc.chunkAt(0).data]).toEqual([...msg.subarray(0, 32)]);
  expect([...enc.chunkAt(1).data]).toEqual([...msg.subarray(32, 64)]);
});

// Encoder/decoder protobuf-style round-trip (mirrors polynomial.rs:1020-1042):
// serialize both mid-stream, deserialize, continue, still decodes.
test("SPQR RS: encoder/decoder survive serialize round-trip mid-stream", () => {
  let msg = new Uint8Array(1088).fill(3);
  let enc = PolyEncoder.encodeBytes(msg);
  let dec = PolyDecoder.newForLength(1088);
  let chunksNeeded = Math.floor(1088 / 32); // 34
  for (let i = 2; i < chunksNeeded; i++) {
    dec.addChunk(enc.chunkAt(i));
  }
  let enc2 = PolyEncoder.deserialize(enc.serialize());
  let dec2 = PolyDecoder.deserialize(dec.serialize());
  for (let i = 0; i < 2; i++) {
    dec2.addChunk(enc2.chunkAt(i + chunksNeeded));
  }
  let out = dec2.decodedMessage();
  expect(out).not.toBeNull();
  expect([...out!]).toEqual([...msg]);
});

// Random recovery from a sufficient, arbitrary subset of chunks.
test("SPQR RS: recover from a random sufficient subset (interop fuzz)", () => {
  for (let trial = 0; trial < 20; trial++) {
    let len = 2 * (1 + Math.floor(Math.random() * 200));
    let msg = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      msg[i] = Math.floor(Math.random() * 256);
    }
    let enc = PolyEncoder.encodeBytes(msg);
    let dec = PolyDecoder.newForLength(len);
    // Feed chunks in a shuffled order starting from a random offset.
    let start = Math.floor(Math.random() * 50);
    let recovered: Uint8Array | null = null;
    for (let i = 0; i < 100 && !recovered; i++) {
      dec.addChunk(enc.chunkAt(start + i));
      recovered = dec.decodedMessage();
    }
    expect(recovered, `len=${len}`).not.toBeNull();
    expect([...recovered!]).toEqual([...msg]);
  }
});
