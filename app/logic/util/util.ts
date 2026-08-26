
export function assert(test: boolean | object | string | number | null | undefined, errorMessage: string): asserts test {
  if (!test) {
    throw new Error(errorMessage);
  }
}

/**
 * Waits for a given number of seconds, then continues.
 */
export async function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}

export function arrayRemove<T>(array: T[], item: T) {
  let pos = array.indexOf(item);
  if (pos > -1) {
    array.splice(pos, 1);
  }
}

export function arrayRemoveAll<T>(array: T[], item: T) {
  let pos = -1;
  while ((pos = array.indexOf(item, pos)) != -1) {
    array.splice(pos, 1);
  }
}

export function ensureArray<Type>(val: Type[] | Type): Type[] {
  return val ? Array.isArray(val) ? val : [val] : [];
}

export function randomID(): string {
  return Date.now() + "-" + Math.ceil(Math.random() * 900000);
}

export function capitalizeStart(str: string): string {
  return str[0].toLocaleUpperCase() + str.substring(1);
}
export function capitalizeWords(str: string): string {
  return str.split(" ").map(word => capitalizeStart(word)).join(" ");
}

export async function blobToBase64(blob: Blob): Promise<string> {
  let dataURL = await blobToDataURL(blob)
  return dataURL.split(",")[1];
}

/** Scales an image down to `maxSize` pixels in each direction, and re-encodes
 * it as JPEG until its `data:` URL is at most `maxLength` characters long. */
export async function scaleImageToDataURL(file: Blob, maxSize: number, maxLength: number): Promise<URLString> {
  let image = new Image();
  image.src = await blobToDataURL(file);
  await image.decode();
  // An SVG may have only a `viewBox` and no size of its own
  let width = image.naturalWidth || maxSize;
  let height = image.naturalHeight || maxSize;
  let scale = Math.min(1, maxSize / Math.max(width, height));
  let canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  let context = canvas.getContext("2d");
  // JPEG has no transparency, and would show it as black
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let dataURL: URLString;
  // How well an image compresses varies wildly, so check the result
  for (let quality = 0.9; quality > 0.2; quality -= 0.2) {
    dataURL = canvas.toDataURL("image/jpeg", quality);
    if (dataURL.length <= maxLength) {
      break;
    }
  }
  return dataURL;
}

export async function blobToDataURL(blob: Blob): Promise<URLString> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    // The file may be gone or changed on disk, since the user picked it
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Decodes base64. */
export function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(base64);
  }
  // Fallback: node doesn't have it yet, unlike Electron
  // `Uint8Array.from()` with a map is 30x slower = 1.2s for a 20 MB mail
  let binary = atob(base64);
  let bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function dataURLToBlob(dataURL: URLString): Promise<Blob> {
  let res = await fetch(dataURL);
  return await res.blob();
}

/** TODO Implement this correctly */
export function fileExtensionForMIMEType(mimetype: string) {
  if (typeof (mimetype) == "string" && mimetype != "application/octet-stream") {
    let type = mimetype.split("/")[1];
    if (type) {
      return type;
    }
  }
  return ".ext";
}

/** Abstract class as base class for allowing more specific error classes */
export class SpecificError extends Error {
  constructor(ex: Error, message: string) {
    if (!message) {
      message = ex?.message ?? ex + "";
    }
    super(message);
    if (ex) {
      Object.assign(this, ex);
    }
    this.message = message;
  }
}

/** Replace the error message.
 * Some network exceptions are read-only and setting `ex.message` will throw. */
export function exMessage(ex: Error, message: string): Error {
  try {
    ex.message = message;
    return ex;
  } catch (exDummy) {
    let exNew = new Error(message);
    Object.assign(exNew, ex);
    exNew.name = ex.name;
    exNew.stack = ex.stack;
    exNew.cause = ex;
    exNew.message = message;
    return exNew;
  }
}

/** Used for if/else and switch statements
 * when they run into a case that should not happen */
export class NotReached extends Error {
  constructor(msg?: string) {
    super(msg ?? "Not reached: Unhandled case in code");
  }
}

export class NotImplemented extends Error {
  constructor(msg?: string) {
    super(msg ?? "Not yet implemented");
  }
}

export class NotSupported extends Error {
  constructor(msg?: string) {
    super(msg ?? "Operation not supported");
  }
}

export class UserError extends Error {
  isUserError = true;
}

export class UserCancelled extends UserError {
  doNotShow = true;
  constructor(msg?: string) {
    super(msg ?? "Cancelled");
  }
}

export class AbstractFunction extends Error {
  constructor() {
    super("Not yet implemented");
  }
}

export type URLString = string;
export type Json = { [key: string]: JsonValue } | JsonValue[];
type JsonValue = string | number | boolean | null | Json;
