/** Small helpers shared across the WhatsApp live protocol code. */
import { WANode } from "./Binary/WANode";

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

/** A promise whose resolve/reject can be called from elsewhere — used to await
 * a specific incoming stanza from inside an event-driven read loop. */
export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  let promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** A human-readable reason from an error stanza, e.g. `<failure reason="401">`
 * or an `<iq type="error"><error text="…"/>`. Empty string if none. */
export function stanzaErrorText(node: WANode): string {
  let error = node.child("error") ?? node;
  let text = error.attrs.text ?? error.attrs.reason ?? error.attrs.code;
  return text ? `: ${text}` : "";
}

/** Big-endian fixed-width encoding, as the WhatsApp key ids on the wire use. */
export function bigEndian(value: number, byteCount: number): Uint8Array {
  let out = new Uint8Array(byteCount);
  for (let i = byteCount - 1; i >= 0; i--) {
    out[i] = value & 0xFF;
    value = Math.floor(value / 256);
  }
  return out;
}
