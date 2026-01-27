
export function assert(test: boolean | Object | null | undefined, errorMessage: string): asserts test {
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

export function stringToShortHashKey(str: string): string {
  let hash = 0x811c9dc5; // FNV offset basis

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // 0x01000193 is the FNV prime
    hash = Math.imul(hash, 0x01000193);
  }

  // Return as unsigned 32-bit base36 string for maximum compactness
  return (hash >>> 0).toString(36);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  let dataURL = await blobToDataURL(blob)
  return dataURL.split(",")[1];
}

export async function blobToDataURL(blob: Blob): Promise<URLString> {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onloadend = () => {
      let dataURL = reader.result as string;
      resolve(dataURL);
    }
    reader.readAsDataURL(blob);
  });
}

export async function base64ToArrayBuffer(base64: string, mimetype: string): Promise<ArrayBuffer> {
  let res = await fetch(`data:${mimetype};base64,` + base64);
  return await res.arrayBuffer();
}

export async function dataURLToBlob(dataURL: URLString): Promise<Blob> {
  let res = await fetch(dataURL);
  return await res.blob();
}

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
 * Some network exceptions are read-only and setting `ex.message` will throw.
export function exMessage(ex: Error, message: string): Error {
  try {
    ex.message = message;
    return ex;
  } catch (e2) {
    let e = new Error(message);
    Object.assign(e, ex);
    e.message = message;
    return e;
  }
}*/

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
