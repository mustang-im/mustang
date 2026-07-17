import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { encodeNode } from "../../../../logic/Chat/WhatsApp/Binary/encoder";
import { decodeNode } from "../../../../logic/Chat/WhatsApp/Binary/decoder";
import { JID } from "../../../../logic/Chat/WhatsApp/Binary/JID";
import { kSingleByteTokens, kDoubleByteTokens } from "../../../../logic/Chat/WhatsApp/Binary/tokens";
import { bytesEqual, randomBytes } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

function roundtrip(node: WANode): WANode {
  return decodeNode(encodeNode(node));
}

test("token tables have the expected shape", () => {
  expect(kSingleByteTokens[3]).toBe("s.whatsapp.net");
  expect(kSingleByteTokens[19]).toBe("message");
  expect(kDoubleByteTokens.length).toBe(4);
  expect(kDoubleByteTokens.every(d => d.length == 256)).toBe(true);
});

test("simple stanza with tokenized tag/attrs round-trips", () => {
  let node = new WANode("iq", { to: "s.whatsapp.net", type: "get", id: "abc123", xmlns: "w:p" },
    [new WANode("ping")]);
  let decoded = roundtrip(node);
  expect(decoded.tag).toBe("iq");
  expect(decoded.attrs.to).toBe("s.whatsapp.net");
  expect(decoded.attrs.type).toBe("get");
  expect(decoded.attrs.id).toBe("abc123");
  expect(decoded.attrs.xmlns).toBe("w:p");
  expect(decoded.children().length).toBe(1);
  expect(decoded.child("ping")?.tag).toBe("ping");
});

test("the documented <message> example round-trips with packed phone numbers", () => {
  let node = new WANode("message",
    { to: "14155551001@s.whatsapp.net", from: "14155551000@s.whatsapp.net", id: "123456", type: "text", notify: "joe" },
    [new WANode("body", {}, "Body text of message.")]);
  let decoded = roundtrip(node);
  expect(decoded.attrs.to).toBe("14155551001@s.whatsapp.net");
  expect(decoded.attrs.from).toBe("14155551000@s.whatsapp.net");
  expect(decoded.attrs.id).toBe("123456");
  // <body> text comes back as bytes; decode it
  let body = decoded.child("body")!;
  expect(new TextDecoder().decode(body.contentBytes!)).toBe("Body text of message.");
});

test("binary content (e.g. <enc>) is preserved exactly", () => {
  let payload = randomBytes(300); // forces BINARY_20 length encoding
  let node = new WANode("message", { to: "123@s.whatsapp.net", id: "x" },
    [new WANode("enc", { v: "2", type: "msg" }, payload)]);
  let decoded = roundtrip(node);
  let enc = decoded.child("enc")!;
  expect(enc.attrs.type).toBe("msg");
  expect(bytesEqual(enc.contentBytes!, payload)).toBe(true);
});

test("device JID (AD_JID) round-trips with device id", () => {
  let node = new WANode("to", { jid: "4915123456:7@s.whatsapp.net" });
  let decoded = roundtrip(node);
  let jid = JID.parse(decoded.attrs.jid);
  expect(jid.user).toBe("4915123456");
  expect(jid.device).toBe(7);
  expect(jid.server).toBe("s.whatsapp.net");
});

test("lid and group JIDs round-trip", () => {
  let node = new WANode("x", { a: "12345-678@g.us", b: "998877@lid", c: "555:2@lid" });
  let decoded = roundtrip(node);
  expect(decoded.attrs.a).toBe("12345-678@g.us");
  expect(decoded.attrs.b).toBe("998877@lid");
  expect(JID.parse(decoded.attrs.c).device).toBe(2);
});

test("nested children round-trip", () => {
  let node = new WANode("message", { id: "1" }, [
    new WANode("participants", {}, [
      new WANode("to", { jid: "111:1@s.whatsapp.net" }, [new WANode("enc", { type: "pkmsg" }, randomBytes(50))]),
      new WANode("to", { jid: "222:2@s.whatsapp.net" }, [new WANode("enc", { type: "msg" }, randomBytes(60))]),
    ]),
    new WANode("device-identity", {}, randomBytes(40)),
  ]);
  let decoded = roundtrip(node);
  let participants = decoded.child("participants")!;
  expect(participants.children("to").length).toBe(2);
  expect(participants.children("to")[0].child("enc")!.attrs.type).toBe("pkmsg");
  expect(decoded.child("device-identity")!.contentBytes!.length).toBe(40);
});

test("non-tokenized free-text attribute round-trips", () => {
  let node = new WANode("x", { custom: "this is not a token and not a number!" });
  expect(roundtrip(node).attrs.custom).toBe("this is not a token and not a number!");
});

test("rejects deeply nested nodes instead of recursing without bound (DoS guard)", () => {
  // Each wrap is a node (LIST_8, size 2 = tag + content) whose content is a
  // one-child list (LIST_8, size 1); the innermost is a tag-only leaf.
  let bytes: number[] = [0xf8, 0x01, 0x01];
  for (let i = 0; i < 100; i++) {
    bytes = [0xf8, 0x02, 0x01, 0xf8, 0x01, ...bytes];
  }
  expect(() => decodeNode(new Uint8Array(bytes))).toThrow(/too deep/i);
});

test("rejects a binary length that overruns the frame (DoS guard)", () => {
  // A node whose content is a BINARY_32 (254) claiming ~2 GB, with nothing behind it.
  let bytes = new Uint8Array([0xf8, 0x02, 0x01, 254, 0x7F, 0xFF, 0xFF, 0xFF]);
  expect(() => decodeNode(bytes)).toThrow(/exceeds the data/i);
});
