import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

/**
 * Parse parameters from MIME header values
 * E.g. `Content-Type: text/plain; name=value; name2="value2"`
 *
 * - Quotes are removed
 * - Newlines and indentions are removed without spaces
 * - Spaces within the same line are preserved
 *
 * Generic function, unrelated to encryption.
 * postal-mime unfortunately doesn't parse parameters.
 *
 * @param headerValue e.g. `text/plain; name=value; name2="value2"`
 * @returns e.g. { $main: `text/plain`, name: `value``, name2: `value2` }
 */
export function parseHeaderParameters(headerValue: string): Record<string, string> {
  let params: Record<string, string> = {};
   // TODO ignore `;` and `=` within `"` quotes
  let paramsSplit = headerValue.split(";");
  params.$main = paramsSplit.shift() ?? "";
  for (let paramStr of paramsSplit) {
    let pos = paramStr.indexOf("=");
    if (pos == -1) {
      continue;
    }
    let name = sanitize.nonemptystring(paramStr.substring(0, pos).trim());
    let value = sanitize.nonemptystring(paramStr.substring(pos + 1).trim(), "");
    if (value[0] == `"` && value.endsWith(`"`)) {
      value = value.slice(1, -1); // Remove " quotes
    }
    value = value.replace(/\r?\n[ \t]*/g, ""); // Remove newlines and indention (entirely, without space)
    params[name] = value;
  }
  console.log("header params", params)
  return params;
}

/**
 * Returns the direct child contents of a MIME multipart,
 * verbatim, as text. Subparts are intentionally not parsed.
 *
 * Generic function, unrelated to encryption.
 * postal-mime unfortunately doesn't parse parameters.
 *
 * Assumes CRLF
 *
 * @param mime The entire MIME message. May contain other multipart structures.
 * @param contentType Value of the Content-Type header for this particular part
 * @returns The multipart direct children. Each part as a single UTF8-string.
 *   You still need to split lines.
 */
export function parseMIMEDirectSubparts(mime: Uint8Array, contentType: string): string[] {
  assert(mime && mime instanceof Uint8Array, "Need MIME");
  let parameters = parseHeaderParameters(contentType);
  assert(parameters.$main.startsWith("multipart/"), "Need multipart/* Content-Type, but got " + contentType);
  let boundary = parameters.boundary;
  assert(boundary, "No boundary found in Content-Type header " + contentType);
  let completeMail = new TextDecoder().decode(mime);
  let parts = completeMail.split("\r\n--" + boundary);
  let end = parts.pop(); // Remove content after the last part
  assert(end.startsWith("--\r\n"), "End boundary not found");
  parts.shift(); // Remove content before the first part
  parts = parts.map(part => part.replace(/^\r\n/, "")); // Remove newline after boundary
  return parts;
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
