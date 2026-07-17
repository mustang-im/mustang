import { DEREncoder } from "./der";

export class PEMEncoder extends DEREncoder {
  enc = "pem";

  encodeBase64(data): string {
    const buf = this.encode(data);
    return buf.toBase64?.() ?? toBase64(buf);
  }

  encodePEM(data, options: { label: string }): string {
    const p = this.encodeBase64(data);
    const out = [ '-----BEGIN ' + options.label + '-----' ];
    for (let i = 0; i < p.length; i += 64)
      out.push(p.slice(i, i + 64));
    out.push('-----END ' + options.label + '-----');
    return out.join('\n');
  }
}

function toBase64(buf: Uint8Array) {
  // Chunk, because spreading a large array into String.fromCharCode overflows
  // the call stack for big DER blobs.
  let str = "";
  for (let i = 0; i < buf.length; i += 0x8000) {
    str += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  }
  return btoa(str);
}

declare global {
  interface Uint8Array {
    toBase64(): string;
  }
}
