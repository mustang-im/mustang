
export function assert(test, errorMessage): asserts test {
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

export function arrayRemove(array, item) {
  let pos = array.indexOf(item);
  if (pos > -1) {
    array.splice(pos, 1);
  }
}

export function arrayRemoveAll(array, item) {
  let pos = -1;
  while ((pos = array.indexOf(item, pos)) != -1) {
    array.splice(pos, 1);
  }
}

export function randomID(): string {
  return Date.now() + "-" + Math.ceil(Math.random() * 900000);
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
  return filename.trim();
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

/** Replace the error message.
 * Some network exceptions are read-only and setting `ex.message` will throw. */
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

export class UserError extends Error {
  isUserError = true;
}

export class UserCancelled extends UserError {
  constructor(msg?: string) {
    super(msg ?? "Cancelled");
  }
}

export class AbstractFunction extends Error {
  constructor() {
    super("Not yet implemented in the subclass");
  }
}

export type URLString = string;
