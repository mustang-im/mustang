import type { URLString } from "../../logic/util/util";

export function onKeyEnter(event: KeyboardEvent, onEnter: () => void) {
  if (event.key == "Enter") {
    onEnter();
    event.preventDefault();
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
  a.setAttribute("filename", sanitizeFilename(filename));
  a.setAttribute("target", "_blank");
  a.click();
  a.href = '';
}

/** Removes potentially dangerous parts of the file name, e.g.
 * \ / : . ' " ! ? * |
 * See <https://kizu514.com/blog/forbidden-file-names-on-windows-10/>
 * but there are many others. */
export function sanitizeFilename(label: string): string {
  let filename = label.replace(/[^a-zA-Z0-9 \.\-\_]/g, "");
  const kDeviceNames = ['NUL', 'AUX', 'PRN', 'CON', 'COM', 'LPT', 'COM1', 'LPT1', 'COM2', 'LPT2'];
  if (filename.length < 5 && kDeviceNames.includes(filename)) {
    filename = "file";
  }
  return filename;
}
