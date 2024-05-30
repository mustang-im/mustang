import { HTTPServer } from './HTTPServer';
import JPCWebSocket from '../lib/jpc-ws';
import { ImapFlow } from 'imapflow';
import { Database } from "@radically-straightforward/sqlite"; // formerly @leafac/sqlite
import Zip from "adm-zip";
import ky from 'ky';
import { shell, nativeTheme, Notification, Tray, nativeImage } from "electron";
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import fsPromises, { FileHandle } from "node:fs/promises";
import childProcess from 'node:child_process';

export async function startupBackend() {
  let appGlobal = await createSharedAppObject();
  let jpc = new JPCWebSocket(appGlobal);
  await jpc.listen(kSecret, 5455, false);
}

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

async function createSharedAppObject() {
  return {
    kyCreate,
    postHTTP, // TODO Use ky
    newOSNotification,
    isOSNotificationSupported,
    newTrayIcon,
    shell,
    setDarkMode,
    getConfigDir,
    getFilesDir,
    openFileInExternalApp,
    createIMAPFlowConnection,
    getSQLiteDatabase,
    sendMailNodemailer,
    verifyServerNodemailer,
    getMIMENodemailer,
    newAdmZIP,
    newHTTPServer,
    readFile,
    writeFile,
    fs: fsPromises,
    os: {
      homedir: os.homedir,
      platform: os.platform,
    },
    path: {
      dirname: path.dirname,
      join: path.join,
    },
  };
}

async function readFile(path: string): Promise<Uint8Array> {
  let fileHandle = await fsPromises.open(path, "r");
  let { buffer } = await fileHandle.read();
  await fileHandle.close();
  return buffer;
}
async function writeFile(path: string, permissions: number, contents: Uint8Array): Promise<void> {
  let fileHandle = await fsPromises.open(path, "w", permissions);
  await fileHandle.write(contents);
  await fileHandle.close();
}
/**
 * E.g. ```
 * let contents = new Blob(["test\n"], { type: "text/plain" });
 * let configDir = await appGlobal.remoteApp.configDir();
 * let testFile = await appGlobal.remoteApp.openFile(configDir + "test.txt", true);
 * await testFile.write(new Uint8Array(await contents.arrayBuffer()));
 * await appGlobal.remoteApp.closeFile(testFile);
 * ```
 * /
async function openFile(path: string, write: boolean, mode?: string | number): Promise<FileHandle> {
  return await fsPromises.open(path, write ? "w" : "r", mode);
}
async function closeFile(handle: FileHandle): Promise<void> {
  await handle.close(); // for some reason, only this function doesn't appear on FileHandle in JPC client
}*/

async function openFileInExternalApp(filepath: string, appEXE: string): Promise<void> {
  let launcher = appEXE ??
    os.platform() == "win32" ? "explorer.exe" :
    os.platform() == "darwin" ? "open" :
    "xdg-open";
  //console.log("Launching", launcher, filepath);
  childProcess.spawn(launcher, [ filepath ], { shell: false });
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
 * let ky = await remoteApp.kyCreate({ prefixUrl: "https://api.example.com", result: "json" });
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

/**
 * @param responseType "text", "json", "formData", "blob", "arrayBuffer"
 *    @see <https://developer.mozilla.org/en-US/docs/Web/API/Response#instance_methods>
 * @param config ky config @see <https://github.com/sindresorhus/ky>
 */
async function postHTTP(url: string, data: any, responseType: string, config: any) {
  switch (config.headers['Content-Type']) {
  case 'application/x-www-form-urlencoded':
    config.body = new URLSearchParams(data);
    break;
  case 'application/json':
    config.json = data;
    break;
  default:
    config.body = data;
    break;
  }
  let response = await ky.post(url, config);
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data: await response[responseType](),
  };
}

function newHTTPServer() {
  return new HTTPServer();
}

/** <https://www.electronjs.org/docs/latest/api/tray> */
function newTrayIcon(imgDataURL: string): Tray {
  return new Tray(nativeImage.createFromDataURL(imgDataURL));
}

/** <https://www.electronjs.org/docs/latest/api/notification> */
function newOSNotification(options: any): Notification {
  return new Notification(options);
}

function isOSNotificationSupported(): boolean {
  return Notification.isSupported();
}

function setDarkMode(mode: "system" | "light" | "dark") {
  if (!["system", "light", "dark"].includes(mode)) {
    throw new Error("Bad dark mode " + mode);
  }
  nativeTheme.themeSource = mode;
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

async function getMIMENodemailer(mail): Promise<Uint8Array> {
  let composer = new MailComposer(mail);
  let buffer = await composer.compile().build();
  return buffer;
}

function newAdmZIP(filepath: string) {
  return new Zip(filepath);
}

const kAppDir = "Mustang";

/**
 * Get the user config directory on disk.
 *
 * The files in here are useful mostly to the app itself, in internal data formats,
 * and not really useful without the app.
 * Consequently, this is a directory that is usually *not* shown to the user,
 * but still accessible, if needed by technical people or for backups.
 *
 * Linux: /home/USER/.mustang/
 * Windows: C:\Users\USER\AppData\Mustang\
 * Mac OS: /Users/USER/Library/Application Support/Mustang
 */
function getConfigDir(): string {
  let dirname = os.platform() == "win32" || os.platform() == "darwin" ? kAppDir : "." + kAppDir.toLowerCase();
  let datadir = os.platform() == "darwin" ? path.join(os.homedir(), "Library/Application Support") : os.homedir();
  let dir = path.join(datadir, dirname);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

let filesDirEnsured = false;

/**
 * Get the directory on disk where we store the files that our user exchanged with others.
 * E.g. file sharing, email attachments, chat transfer files, and email backups.
 *
 * This should be a folder where the user can go to, but not right in the middle of his
 * personal documents and folders.
 *
 * TODO Change it
 * Linux: /home/USER/.mustang/
 * Windows: C:\Users\USER\AppData\Mustang\
 * Mac OS: /Users/USER/Mustang
 */
function getFilesDir(): string {
  let dirname = os.platform() == "win32" || os.platform() == "darwin" ? kAppDir : "." + kAppDir.toLowerCase();
  let dir = path.join(os.homedir(), dirname);
  if (!filesDirEnsured) {
    fs.mkdirSync(dir, { recursive: true });
    filesDirEnsured = true;
  }
  return dir;
}
