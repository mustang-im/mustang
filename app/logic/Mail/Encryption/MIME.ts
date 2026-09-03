import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

/**
 * Parse parameters from MIME header values
 * E.g. `Content-Type: text/plain; name=value; name2="value2"`
 *
 * - Quotes are removed
 * - Newlines and indentions are removed without spaces
 * - Spaces within the same line are preserved
 * - The type and the parameter names are lowercased, the values are not
 *
 * Generic function, unrelated to encryption.
 * postal-mime unfortunately doesn't parse parameters.
 *
 * @param headerValue e.g. `text/plain; name=value; name2="value2"`
 * @returns e.g. { $main: `text/plain`, name: `value``, name2: `value2` }
 */
export function parseHeaderParameters(headerValue: string | null | undefined): Record<string, string> {
  let params: Record<string, string> = {};
   // TODO ignore `;` and `=` within `"` quotes
  let paramsSplit = sanitize.string(headerValue, "").split(";");
  // The type and the parameter names are case-insensitive, the values are not,
  // e.g. the multipart boundary. RFC 2045 section 5.1
  params.$main = paramsSplit[0].includes("=")
    ? ""
    : paramsSplit.shift()?.trim().toLowerCase() ?? "";
  for (let paramStr of paramsSplit) {
    let pos = paramStr.indexOf("=");
    if (pos == -1) {
      continue;
    }
    let name = sanitize.nonemptystring(paramStr.substring(0, pos).trim(), null)?.toLowerCase();
    if (!name) {
      continue;
    }
    let value = sanitize.nonemptystring(paramStr.substring(pos + 1).trim(), "");
    if (value[0] == `"` && value.endsWith(`"`)) {
      value = value.slice(1, -1); // Remove " quotes
    }
    value = value.replace(/\r?\n[ \t]*/g, ""); // Remove newlines and indention (entirely, without space)
    params[name] = value;
  }
  return params;
}

/**
 * Returns the direct child contents of a MIME multipart,
 * verbatim, as text. Subparts are intentionally not parsed.
 *
 * Generic function, unrelated to encryption.
 * postal-mime unfortunately doesn't parse parameters.
 *
 * Accepts both CRLF and bare LF line endings
 *
 * @param mime The entire MIME message. May contain other multipart structures.
 * @param contentType Value of the Content-Type header for this particular part
 * @returns The multipart direct children. Each part as a single UTF8-string.
 *   You still need to split lines.
 */
export function parseMIMEDirectSubparts(mime: Uint8Array, contentType: string): string[] {
  return parseMIMEDirectSubpartsBytes(mime, contentType).map(part => new TextDecoder().decode(part));
}

/**
 * Same as `parseMIMEDirectSubparts()`, but returns the raw bytes of each part.
 * Needed wherever the exact bytes matter, e.g. for digesting signed content:
 * a UTF-8 decode/encode round-trip mangles 8-bit content like ISO-8859-1.
 */
export function parseMIMEDirectSubpartsBytes(mime: Uint8Array, contentType: string): Uint8Array[] {
  assert(mime && mime instanceof Uint8Array, "Need MIME");
  let parameters = parseHeaderParameters(contentType);
  assert(parameters.$main.startsWith("multipart/"), "Need multipart/* Content-Type, but got " + contentType);
  let boundary = parameters.boundary;
  assert(boundary, "No boundary found in Content-Type header " + contentType);
  // Bare LF, as NSS writes it, must work as well. The signature of a
  // `multipart/signed` is over the exact bytes of the part, so the caller
  // must be able to hand them on unchanged.
  let delimiter = Uint8Array.from("\n--" + boundary, c => c.charCodeAt(0));
  let parts: Uint8Array[] = [];
  let pos = indexOfBytes(mime, delimiter, 0); // Skip content before the first part
  assert(pos >= 0, "Start boundary not found");
  while (true) {
    let start = pos + delimiter.length;
    pos = indexOfBytes(mime, delimiter, start);
    if (pos < 0) { // Content after the last part
      let end = mime.subarray(start);
      // "--", followed by an optional CRLF and epilogue (RFC 2046 section 5.1.1)
      assert(end[0] == 0x2D && end[1] == 0x2D, "End boundary not found");
      break;
    }
    // The line ending before the boundary belongs to the delimiter
    parts.push(mime.subarray(start, mime[pos - 1] == 0x0D ? pos - 1 : pos));
  }
  // Remove newline after boundary
  return parts.map(part => part.subarray(part[0] == 0x0D ? 2 : 1));
}

function indexOfBytes(haystack: Uint8Array, needle: Uint8Array, from: number): number {
  outer:
  for (let i = from; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] != needle[j]) {
        continue outer;
      }
    }
    return i;
  }
  return -1;
}

export function toCRLF(content: string): string {
  if (/[^\r]\n|\r[^\n]/.test(content)) { // bare \n or \r
    return content
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n/g, "\r\n");
  } else { // already \r\n
    return content;
  }
}
