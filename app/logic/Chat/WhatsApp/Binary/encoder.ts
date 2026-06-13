/** Encodes a WANode tree into WhatsApp's tokenized binary XMPP format.
 * The algorithm is described in the protocol research; constants live in tokens.ts. */
import { WANode } from "./WANode";
import { JID } from "./JID";
import { kSingleByteTokens, kDoubleByteTokens, kTokenIndex } from "./tokens";

const kTag = {
  LIST_EMPTY: 0, DICTIONARY_0: 236, AD_JID: 247,
  LIST_8: 248, LIST_16: 249, JID_PAIR: 250, HEX_8: 251,
  BINARY_8: 252, BINARY_20: 253, BINARY_32: 254, NIBBLE_8: 255,
};

class Encoder {
  protected out: number[] = [];

  encode(node: WANode): Uint8Array {
    this.writeNode(node);
    return Uint8Array.from(this.out);
  }

  protected writeNode(node: WANode) {
    let attrKeys = Object.keys(node.attrs).filter(k => node.attrs[k] != null && node.attrs[k] !== "");
    let hasContent = node.content != null;
    this.writeListStart(2 * attrKeys.length + 1 + (hasContent ? 1 : 0));
    this.writeString(node.tag);
    for (let key of attrKeys) {
      this.writeString(key);
      this.writeValue(node.attrs[key]);
    }
    if (hasContent) {
      this.writeContent(node.content);
    }
  }

  protected writeListStart(length: number) {
    if (length == 0) {
      this.out.push(kTag.LIST_EMPTY);
    } else if (length < 256) {
      this.out.push(kTag.LIST_8, length);
    } else {
      this.out.push(kTag.LIST_16, (length >> 8) & 0xFF, length & 0xFF);
    }
  }

  /** A value that may be a JID (attribute values and string content). */
  protected writeValue(value: string) {
    if (value.includes("@")) {
      this.writeJID(JID.parse(value));
    } else {
      this.writeString(value);
    }
  }

  protected writeString(value: string) {
    let token = kTokenIndex.get(value);
    if (token) {
      if (token.dict == null) {
        this.out.push(token.index);
      } else {
        this.out.push(kTag.DICTIONARY_0 + token.dict, token.index);
      }
      return;
    }
    if (value.length <= 127 && /^[0-9.-]+$/.test(value)) {
      this.writePacked(kTag.NIBBLE_8, value);
    } else if (value.length <= 127 && /^[0-9A-F]+$/.test(value)) {
      this.writePacked(kTag.HEX_8, value);
    } else {
      this.writeBytes(new TextEncoder().encode(value));
    }
  }

  protected writeBytes(bytes: Uint8Array) {
    if (bytes.length < 256) {
      this.out.push(kTag.BINARY_8, bytes.length);
    } else if (bytes.length < (1 << 20)) {
      this.out.push(kTag.BINARY_20, (bytes.length >> 16) & 0x0F, (bytes.length >> 8) & 0xFF, bytes.length & 0xFF);
    } else {
      this.out.push(kTag.BINARY_32, (bytes.length >> 24) & 0xFF, (bytes.length >> 16) & 0xFF, (bytes.length >> 8) & 0xFF, bytes.length & 0xFF);
    }
    for (let b of bytes) {
      this.out.push(b);
    }
  }

  protected writeContent(content: WANode[] | Uint8Array | string) {
    if (typeof content == "string") {
      this.writeValue(content);
    } else if (content instanceof Uint8Array) {
      this.writeBytes(content);
    } else {
      this.writeListStart(content.length);
      for (let child of content) {
        this.writeNode(child);
      }
    }
  }

  protected writePacked(tag: number, value: string) {
    this.out.push(tag);
    let odd = value.length % 2 != 0;
    this.out.push((odd ? 0x80 : 0) | Math.ceil(value.length / 2));
    let pack = tag == kTag.NIBBLE_8 ? packNibble : packHex;
    for (let i = 0; i < value.length - 1; i += 2) {
      this.out.push((pack(value[i]) << 4) | pack(value[i + 1]));
    }
    if (odd) {
      this.out.push((pack(value[value.length - 1]) << 4) | 0x0F);
    }
  }

  protected writeJID(jid: JID) {
    let agent = JID.agentForServer(jid.server);
    if (jid.device > 0 && agent != null) {
      this.out.push(kTag.AD_JID, agent, jid.device & 0xFF);
      this.writeString(jid.user);
    } else {
      this.out.push(kTag.JID_PAIR);
      if (jid.user) {
        this.writeString(jid.user);
      } else {
        this.out.push(kTag.LIST_EMPTY);
      }
      this.writeString(jid.server);
    }
  }
}

function packNibble(c: string): number {
  if (c >= "0" && c <= "9") {
    return c.charCodeAt(0) - 48;
  }
  if (c == "-") {
    return 10;
  }
  if (c == ".") {
    return 11;
  }
  return 15;
}

function packHex(c: string): number {
  if (c >= "0" && c <= "9") {
    return c.charCodeAt(0) - 48;
  }
  if (c >= "A" && c <= "F") {
    return c.charCodeAt(0) - 55;
  }
  return 15;
}

/** Encodes a node tree to binary (without the leading stanza flag byte). */
export function encodeNode(node: WANode): Uint8Array {
  return new Encoder().encode(node);
}
