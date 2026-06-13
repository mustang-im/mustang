/** Conformance checks against the published "DMA Interoperability Developer
 * Documentation: Overview of the Technical Framework" (WhatsApp). The binary
 * example in Part 2.1.2 pins exact token indices and nibble packing, so we can
 * verify our WABinary wire encoding byte-for-byte against the spec. */
import { kTokenIndex } from "../../../../logic/Chat/WhatsApp/Binary/tokens";
import { encodeNode } from "../../../../logic/Chat/WhatsApp/Binary/encoder";
import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { kDjbType } from "../../../../logic/Chat/WhatsApp/Crypto/curve";
import { expect, test } from "vitest";

test("single-byte tokens match the spec's documented indices", () => {
  let spec: Record<string, number> = {
    "s.whatsapp.net": 3, "type": 4, "from": 6, "id": 8, "to": 17, "message": 19, "notify": 24, "text": 56,
  };
  for (let [token, index] of Object.entries(spec)) {
    expect(kTokenIndex.get(token)).toEqual({ index });
  }
});

test("'body' is the spec's double-byte token (dictionary 1, index 117)", () => {
  expect(kTokenIndex.get("body")).toEqual({ dict: 1, index: 117 });
});

test("e2e key type is curve25519 (0x05), as the enlistment e_keytype requires", () => {
  expect(kDjbType).toBe(0x05);
});

test("encodes the spec's example <message> with byte-exact tokens and nibble packing", () => {
  // <message to='14155551001@s.whatsapp.net' from='14155551000@s.whatsapp.net'
  //          id='123456' type='text' notify='joe'><body>Body text of message.</body></message>
  let node = new WANode("message", {
    to: "14155551001@s.whatsapp.net",
    from: "14155551000@s.whatsapp.net",
    id: "123456", type: "text", notify: "joe",
  }, [new WANode("body", {}, new TextEncoder().encode("Body text of message."))]);

  let bytes = [...encodeNode(node)];
  // 248=LIST_8 of 12; 19=message; 17=to; 250=JID_PAIR; 255=NIBBLE_8; 0x86=odd-length flag|6 bytes;
  // 20,21,85,81,0,31 = nibble-packed "14155551001" (last nibble 0xF padding); 3='s.whatsapp.net'; 6=from
  expect(bytes.slice(0, 15)).toEqual([248, 12, 19, 17, 250, 255, 134, 20, 21, 85, 81, 0, 31, 3, 6]);
});
