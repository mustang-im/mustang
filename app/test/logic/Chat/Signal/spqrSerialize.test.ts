import { encodeVarint, decodeVarint, serializeMessage, deserializeMessage, PayloadKind, VERSION_V1, MessageType } from "../../../../logic/Chat/Signal/Encryption/SPQR/serialize";
import { expect, test } from "vitest";

// KATs from states/serialize.rs:289-310.
test("SPQR varint: encode 0x012C == [0xAC, 0x02]", () => {
  let out: number[] = [];
  encodeVarint(0x012C, out);
  expect(out).toEqual([0xAC, 0x02]);
});

test("SPQR varint: decode [0xFF,0xAC,0x02,0xFF] at=1 == 0x012C, advances to 3", () => {
  let from = new Uint8Array([0xFF, 0xAC, 0x02, 0xFF]);
  let pos = { at: 1 };
  expect(decodeVarint(from, pos)).toBe(0x012C);
  expect(pos.at).toBe(3);
});

test("SPQR varint: decode [0x00] at=0 == 0, advances to 1", () => {
  let from = new Uint8Array([0x00]);
  let pos = { at: 0 };
  expect(decodeVarint(from, pos)).toBe(0);
  expect(pos.at).toBe(1);
});

test("SPQR varint: round-trips arbitrary values", () => {
  for (let trial = 0; trial < 1000; trial++) {
    let n = Math.floor(Math.random() * 0xFFFFFFFF);
    let out: number[] = [];
    encodeVarint(n, out);
    let pos = { at: 0 };
    expect(decodeVarint(new Uint8Array(out), pos)).toBe(n);
    expect(pos.at).toBe(out.length);
  }
});

// Wire-message round-trip: a chunk-carrying message and a bare-ack message.
test("SPQR wire message: serialize/deserialize a Ct1 chunk message", () => {
  let data = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    data[i] = i;
  }
  let msg = { epoch: 300, payload: { kind: PayloadKind.Ct1, chunk: { index: 0x012C, data } } };
  let wire = serializeMessage(msg, 7);
  expect(wire[0]).toBe(VERSION_V1);
  let { msg: back, index } = deserializeMessage(wire);
  expect(index).toBe(7);
  expect(back.epoch).toBe(300);
  expect(back.payload.kind).toBe(PayloadKind.Ct1);
  expect(back.payload.chunk!.index).toBe(0x012C);
  expect([...back.payload.chunk!.data]).toEqual([...data]);
});

test("SPQR wire message: Ct1Ack carries no chunk and decodes to ack", () => {
  let msg = { epoch: 1, payload: { kind: PayloadKind.Ct1Ack } };
  let wire = serializeMessage(msg, 0);
  // [version][epoch=1][index=0][type=Ct1Ack(4)] = 4 bytes, no chunk.
  expect([...wire]).toEqual([VERSION_V1, 1, 0, MessageType.Ct1Ack]);
  let { msg: back } = deserializeMessage(wire);
  expect(back.payload.kind).toBe(PayloadKind.Ct1Ack);
});

test("SPQR wire message: trailing bytes are tolerated (forward-compat)", () => {
  let msg = { epoch: 1, payload: { kind: PayloadKind.None } };
  let wire = serializeMessage(msg, 0);
  let withTrailing = new Uint8Array([...wire, 0xDE, 0xAD]);
  let { msg: back } = deserializeMessage(withTrailing);
  expect(back.payload.kind).toBe(PayloadKind.None);
});
