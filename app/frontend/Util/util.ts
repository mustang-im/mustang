import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import type { URLString } from "../../logic/util/util";

export function onKeyEnter(event: KeyboardEvent, onEnter: () => void) {
  if (event.key == "Enter") {
    event.preventDefault();
    onEnter();
  }
}

export function saveBlobAsFile(blob: Blob, filename?: string) {
  if (blob instanceof File) {
    filename = blob.name;
  }
  let url = URL.createObjectURL(blob);
  saveURLAsFile(url, filename);
  URL.revokeObjectURL(url); // otherwise we leak the entire blob
}

/** Opens a "Save as..." file picker dialog, with the `filename` prefilled,
 * allowing the user to select where to save the file.
 * The content of `url` will be saved in the file.
 */
export function saveURLAsFile(url: URLString, filename: string) {
  let a = document.createElement("a");
  a.href = url;
  a.setAttribute("filename", sanitize.filename(filename, "file"));
  a.setAttribute("target", "_blank");
  a.click();
  a.href = '';
}

/** Attention: You must call `URL.revokeObjectURL(), or we'll leak the entire blob. */
export function stringToBlobURL(mimetype: string, content: string): URLString {
  let blob = new Blob([content], { type: mimetype + ";charset=utf-8" });
  return URL.createObjectURL(blob);
}

/** Attention: Chrome doesn't support `data:` URLs larger than 2 MB.
 * @see <https://groups.google.com/a/chromium.org/g/chromium-dev/c/zYYSVvn6a5M/m/WyZUweM4BAAJ> */
export async function stringToDataURL(mimetype: string, content: string): Promise<URLString> {
  const bytes = new TextEncoder().encode(content);
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([bytes], { type: mimetype + ";charset=utf-8" }));
  });
}

export function stringFromDataURL(dataURL: URLString, mimetype: string): string | null {
  if (!dataURL || typeof (dataURL) != "string" ||
      dataURL.substring(0, "data:".length + mimetype.length).toLowerCase() != "data:text/html") {
    return null;
  }
  // There might be `;charset=utf-8` in-between
  let comma = dataURL.indexOf(",");
  if (comma < 1) {
    return null;
  }
  let htmlEncoded = dataURL.substring(comma + 1);
  if (!htmlEncoded) {
    return null;
  }
  return decodeURIComponent(htmlEncoded);
}

/** Use as tagged template string:
 * let id = "bar/buu";
 * let name = "Fred Flintstone";
 * URLPart`https://foo/?id=${id}&name=${name}`
 * -> "https://foo/?id=bar%2Fbuu&name=Fred%20Flintstone"
 *
 * Warning: Do *not* escape parts that you want to keep literally in the URL.
 * let baseURL = "https://foo/api"; // ":" and "/" would be escaped
 * let pathname = "com/sub"; // "/" would be escaped
 * URLPart`${baseURL}/${pathname}` // Wrong
 * -> "https%3A%2F%2Ffoo%2Fapi/com%2Fsub"
 */
export function URLPart(literals: TemplateStringsArray, ...values: any[]) {
  return literals.map((literal: string, i: number) => {
    let value = values[i] == undefined ? "" : encodeURIComponent(values[i]);
    return literal + value;
  }).join("");
}

/**
 * Gets the OS using the userAgent string.
 * @returns os name
 */
export function getOSName() {
  let userAgent = navigator.userAgent.toLocaleLowerCase();
  if (userAgent.includes("windows")) {
    return "windows";
  }
  if (userAgent.includes("macintosh")) {
    return "macintosh";
  }
  if (userAgent.includes("linux")) {
    return "linux";
  }
  return "unknown";
}

/**
 * Fetches and decompresses gzip files that are compressed
 */
export async function fetchGzip(url: string) {
  let stream = (await fetch(url)).body;
  let decompressedStream = stream.pipeThrough(
    new DecompressionStream('gzip')
  );
  let blob = await new Response(decompressedStream).blob();
  return URL.createObjectURL(blob);
}

/** @returns a new
 * `function isSame(check: T): boolean`
 * which returns
 * - true, if `check` is the same object or value as last time
 * - false, if it's different from the last call
 * - false, if `check` was null/undefined last time
 * - false, for the first call
 *
 * Usage:
 * ```
 * const isSamePerson = createIsSame<Person>();
 * function onInit(person: Person) {
 *   if (isSamePerson(person)) {
 *     return;
 *   }
 *   // do init...
 * }
 * ```
 */
export function createIsSame<T>() {
  let last: T;
  return (check: T) => {
    if (last === check && last !== null && last !== undefined) {
      return true;
    }
    last = check;
    return false;
  };
}
