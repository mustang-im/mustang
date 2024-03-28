import JPCWebSocket from '../lib/jpc-ws';
import { ImapFlow } from 'imapflow';
import { Database } from "@radically-straightforward/sqlite";
import ky from 'ky';
import nodemailer from 'nodemailer';
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import fsPromises, { FileHandle } from "node:fs/promises";

export async function startupBackend() {
  let appGlobal = await createSharedAppObject();
  let jpc = new JPCWebSocket(appGlobal);
  await jpc.listen(kSecret, 5455, false);
}

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

async function createSharedAppObject() {
  return {
    kyCreate,
    openFile,
    closeFile,
    fs: fsPromises,
    getConfigDir,
    createIMAPFlowConnection,
    getSQLiteDatabase,
    sendMailNodemailer,
    verifyServerNodemailer,
  };
}

/**
 * E.g. ```
 * let contents = new Blob(["test\n"], { type: "text/plain" });
 * let configDir = await appGlobal.remoteApp.configDir();
 * let testFile = await appGlobal.remoteApp.openFile(configDir + "test.txt", true);
 * await testFile.write(new Uint8Array(await contents.arrayBuffer()));
 * await appGlobal.remoteApp.closeFile(testFile);
 * ```
 */
async function openFile(path: string, write: boolean): Promise<FileHandle> {
  return await fsPromises.open(path, write ? "w" : "r");
}
async function closeFile(handle: FileHandle): Promise<void> {
  await handle.close(); // for some reason, only this function doesn't appear on FileHandle in JPC client
}

/**
 * @param defaultOptions
 * @return Object with get(url, options), post(), put() etc. functions
 *   Either options or defaultOptions contain
 *   `result = "text"` or "json", "formData", "blob", "arrayBuffer",
 *   then directly calls `text()`, so that you can do fetch in one step with a single `await`.
 *
 * E.g.
 * ```js
 * let ky = await remoteApp.kyCreate("https://api.example.com", { result: "json" });
 * let json = await ky.get("users/");
 * ```
 * or (identical)
 * ```js
 * let ky = await remoteApp.kyCreate();
 * let json = await ky.get(https://api.example.com/users", { result: "json" });
 * ```
 */
function kyCreate(defaultOptions) {
 /* `ky` (like axios) is both a function and acts like an object with functions get(), post() etc. as properties,
  * which confuses jpc, so make it only an object. */
  let kyObj = {};
  let kyFunc = ky.create(defaultOptions);
  for (let name in kyFunc) {
    kyObj[name] = async (input, options) => {
      let response = kyFunc[name](input, options);
      let resultType = options?.result || defaultOptions?.result;
      if (resultType &&
          ["text", "json", "formData", "blob", "arrayBuffer"].includes(resultType) &&
          ["get", "put", "post", "patch", "delete", "head"].includes(name)) {
        return await response[resultType]();
      } else {
        return response;
      }
    }
  }
  return kyObj;
}

function createIMAPFlowConnection(...args): ImapFlow {
  return new ImapFlow(...args);
}

function getSQLiteDatabase(filename: string): Database {
  return new Database(path.join(getConfigDir(), filename));
}

async function sendMailNodemailer(transport, mail) {
  let transporter = nodemailer.createTransport(transport);
  await transporter.sendMail(mail);
}

async function verifyServerNodemailer(transport) {
  let transporter = nodemailer.createTransport(transport);
  await transporter.verify();
}

const kAppConfigDir = "Mustang";
/**
 * Get the user config directory on disk.
 * Linux: /home/USER/.mustang/
 * Windows: C:\Users\USER\AppData\Mustang\
 */
function getConfigDir(): string {
  let dirname = os.platform() == "win32" || os.platform() == "darwin" ? kAppConfigDir : "." + kAppConfigDir.toLowerCase();
  let dir = path.join(os.homedir(), dirname);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
