/** Diagnostic tracing for the live WhatsApp connection.
 *
 * Set `kDebug = true` and reproduce the problem; every step of the
 * connect → Noise handshake → login → prekey upload → incoming stanzas →
 * decrypt → history-sync flow prints to the console, prefixed `[WhatsApp]`.
 * Off by default — every `waDebug()` call is a no-op when `kDebug` is false,
 * so there is no cost in production. */
import type { WANode } from "./Binary/WANode";

export const kDebug = true;

export function waDebug(...args: any[]): void {
  if (kDebug) {
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

/** First bytes of a buffer as hex — e.g. to check magic numbers (gzip = 1f 8b). */
export function hexPreview(data: Uint8Array, count = 8): string {
  return [...data.slice(0, count)].map(byte => byte.toString(16).padStart(2, "0")).join(" ");
}
