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
  a.setAttribute("download", sanitize.filename(filename, "file"));
  a.setAttribute("target", "_blank");
  a.click();
  a.href = '';
}

export async function stringToDataURL(mimetype: string, content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content);
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([bytes], { type: mimetype + ";charset=utf-8" }));
  });
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
 * @param url 
 * @returns 
 */
export async function fetchGzip(url: string) {
  let stream = (await fetch(url)).body;
  let decompressedStream = stream.pipeThrough(
    new DecompressionStream('gzip')
  );
  let blob = await new Response(decompressedStream).blob();
  return URL.createObjectURL(blob);
}