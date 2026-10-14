import { base64ToUint8Array, uint8ArrayToHex } from "../../util/util";

export class MAPIEntryID {
  readonly bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  static fromBase64<T extends MAPIEntryID>(this: new (bytes: Uint8Array) => T, base64: string | null | undefined): T | null {
    if (!base64) {
      return null;
    }
    return new this(base64ToUint8Array(base64));
  }

  get hex(): string {
    return uint8ArrayToHex(this.bytes).toUpperCase();
  }

  get providerUID(): string {
    return uint8ArrayToHex(this.bytes.subarray(4, 20)).toUpperCase();
  }

  protected readASCII(start: number): { text: string | null, end: number } {
    let end = this.bytes.indexOf(0, start);
    if (end < 0) {
      end = this.bytes.length;
    }
    let text = String.fromCharCode(...this.bytes.subarray(start, end)).trim();
    return { text: text || null, end };
  }
}
