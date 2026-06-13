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

/** Toggles the wire trace below. Flipped via `WhatsAppAccount.enableDebug`; kept
 * here (a leaf module) so the connection and history code can read it without
 * importing the account and creating a cycle. */
export const waDebugState = { enabled: false };

/** Logs the stanzas we send and receive, when {@link waDebugState} is on. Off by
 * default, so it costs nothing in production. Genuine errors/unexpected states
 * are logged unconditionally with `console.error`/`console.warn` instead. */
export function waLog(...args: any[]): void {
  if (waDebugState.enabled) {
    console.log("[WhatsApp]", ...args);
  }
}

/** A compact one-line preview of a stanza: tag, attributes, and child tags or
 * content size — enough to see what crossed the wire without dumping bytes. */
export function nodePreview(node: WANode): string {
  let attrs = Object.entries(node.attrs ?? {}).map(([key, value]) => `${key}="${value}"`).join(" ");
  let inner = "";
  if (Array.isArray(node.content)) {
    inner = ` {${node.content.map(child => child.tag).join(", ")}}`;
  } else if (node.content instanceof Uint8Array) {
    inner = ` [${node.content.length} bytes]`;
  } else if (typeof node.content == "string") {
    inner = ` "${node.content.slice(0, 60)}"`;
  }
  return `<${node.tag}${attrs ? " " + attrs : ""}>${inner}`;
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
