/** Decodes WhatsApp's tokenized binary XMPP format into a WANode tree. */
import { WANode } from "./WANode";
import { JID } from "./JID";
import { kSingleByteTokens, kDoubleByteTokens } from "./tokens";

const kTag = {
  LIST_EMPTY: 0, DICTIONARY_0: 236, DICTIONARY_3: 239,
  INTEROP_JID: 245, FB_JID: 246, AD_JID: 247,
  LIST_8: 248, LIST_16: 249, JID_PAIR: 250, HEX_8: 251,
  BINARY_8: 252, BINARY_20: 253, BINARY_32: 254, NIBBLE_8: 255,
};

/** Hard cap on nested-node depth. The lengths and child counts in a stanza are
 * server-controlled, so a hostile (or corrupt) stanza could otherwise drive
 * unbounded recursion and exhaust the stack. Real stanzas nest only a handful
 * of levels deep. */
const kMaxNodeDepth = 64;

class Decoder {
  protected data: Uint8Array;
  protected pos = 0;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  protected readByte(): number {
    if (this.pos >= this.data.length) {
      throw new Error("WABinary: unexpected end of data");
    }
    return this.data[this.pos++];
  }

  protected readBytes(n: number): Uint8Array {
    // n is decoded from server-controlled length bytes (and a 32-bit length can
    // even come out negative): refuse anything that would read past the buffer,
    // so a bogus length cannot drive a huge allocation or read out of bounds.
    if (n < 0 || this.pos + n > this.data.length) {
      throw new Error(`WABinary: byte length ${n} exceeds the data`);
    }
    let bytes = this.data.subarray(this.pos, this.pos + n);
    this.pos += n;
    return bytes;
  }

  protected readListSize(tag: number): number {
    if (tag == kTag.LIST_EMPTY) {
      return 0;
    }
    if (tag == kTag.LIST_8) {
      return this.readByte();
    }
    if (tag == kTag.LIST_16) {
      return (this.readByte() << 8) | this.readByte();
    }
    throw new Error(`Invalid list size tag ${tag}`);
  }

  decodeNode(depth = 0): WANode {
    if (depth > kMaxNodeDepth) {
      throw new Error("WABinary: node nesting too deep");
    }
    let size = this.readListSize(this.readByte());
    let tag = this.readString();
    let attrs: Record<string, string> = {};
    let attrCount = (size - 1) >> 1;
    for (let i = 0; i < attrCount; i++) {
      let key = this.readString();
      attrs[key] = this.readString();
    }
    let content: WANode[] | Uint8Array | string | null = null;
    if (size % 2 == 0) {
      content = this.readContent(depth);
    }
    return new WANode(tag, attrs, content);
  }

  protected readString(): string {
    let tag = this.readByte();
    if (tag == kTag.LIST_EMPTY) {
      return "";
    }
    if (tag >= kTag.DICTIONARY_0 && tag <= kTag.DICTIONARY_3) {
      return kDoubleByteTokens[tag - kTag.DICTIONARY_0][this.readByte()];
    }
    if (tag == kTag.JID_PAIR) {
      return this.readJIDPair();
    }
    if (tag == kTag.AD_JID) {
      return this.readADJID();
    }
    if (tag == kTag.FB_JID || tag == kTag.INTEROP_JID) {
      return this.readExtendedJID(tag);
    }
    if (tag == kTag.BINARY_8) {
      return this.utf8(this.readBytes(this.readByte()));
    }
    if (tag == kTag.BINARY_20) {
      let len = ((this.readByte() & 0x0F) << 16) | (this.readByte() << 8) | this.readByte();
      return this.utf8(this.readBytes(len));
    }
    if (tag == kTag.BINARY_32) {
      let len = (this.readByte() << 24) | (this.readByte() << 16) | (this.readByte() << 8) | this.readByte();
      return this.utf8(this.readBytes(len));
    }
    if (tag == kTag.NIBBLE_8) {
      return this.readPacked(unpackNibble);
    }
    if (tag == kTag.HEX_8) {
      return this.readPacked(unpackHex);
    }
    if (tag >= 1 && tag < kSingleByteTokens.length) {
      return kSingleByteTokens[tag];
    }
    throw new Error(`Unknown WABinary token ${tag} at offset ${this.pos}`);
  }

  protected readContent(depth: number): WANode[] | Uint8Array | string {
    let tag = this.data[this.pos];
    if (tag == kTag.LIST_EMPTY || tag == kTag.LIST_8 || tag == kTag.LIST_16) {
      this.pos++;
      let size = this.readListSize(tag);
      let nodes: WANode[] = [];
      for (let i = 0; i < size; i++) {
        nodes.push(this.decodeNode(depth + 1));
      }
      return nodes;
    }
    if (tag == kTag.BINARY_8) {
      this.pos++;
      return this.readBytes(this.readByte()).slice();
    }
    if (tag == kTag.BINARY_20) {
      this.pos++;
      let len = ((this.readByte() & 0x0F) << 16) | (this.readByte() << 8) | this.readByte();
      return this.readBytes(len).slice();
    }
    if (tag == kTag.BINARY_32) {
      this.pos++;
      let len = (this.readByte() << 24) | (this.readByte() << 16) | (this.readByte() << 8) | this.readByte();
      return this.readBytes(len).slice();
    }
    return this.readString();
  }

  protected readPacked(unpack: (n: number) => string): string {
    let startByte = this.readByte();
    let count = startByte & 0x7F;
    let result = "";
    for (let i = 0; i < count; i++) {
      let byte = this.readByte();
      result += unpack(byte >> 4) + unpack(byte & 0x0F);
    }
    if (startByte & 0x80) {
      result = result.slice(0, -1);
    }
    return result;
  }

  protected readJIDPair(): string {
    let user = this.readString();
    let server = this.readString();
    return user ? `${user}@${server}` : server;
  }

  protected readADJID(): string {
    let agent = this.readByte();
    let device = this.readByte();
    let user = this.readString();
    return new JID(user, JID.serverForAgent(agent), device).toString();
  }

  protected readExtendedJID(tag: number): string {
    let user = this.readString();
    let device = (this.readByte() << 8) | this.readByte();
    if (tag == kTag.INTEROP_JID) {
      this.readByte();
      this.readByte(); // integrator (u16), not modeled
    }
    let server = this.readString();
    return new JID(user, server, device).toString();
  }

  protected utf8(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  }
}

// Each nibble yields exactly one character; a trailing padding nibble (15) is
// removed by readPacked()'s slice when the odd-length flag is set.
function unpackNibble(value: number): string {
  if (value <= 9) {
    return String.fromCharCode(48 + value);
  }
  if (value == 10) {
    return "-";
  }
  if (value == 11) {
    return ".";
  }
  return "\0"; // padding placeholder
}

function unpackHex(value: number): string {
  if (value <= 9) {
    return String.fromCharCode(48 + value);
  }
  return String.fromCharCode(55 + value); // 'A'..'F' for 10..15
}

/** Decodes a binary node tree (without the leading stanza flag byte). */
export function decodeNode(data: Uint8Array): WANode {
  return new Decoder(data).decodeNode();
}
