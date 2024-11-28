import { HTTPServer } from './HTTPServer';
import JPCWebSocket from '../lib/jpc-ws';
import { ImapFlow } from 'imapflow';
import { Database } from "@radically-straightforward/sqlite"; // formerly @leafac/sqlite
import { AceBase, type DataReference } from "acebase";
import Zip from "adm-zip";
import ky from 'ky';
import { shell, nativeTheme, Notification, Tray, nativeImage, app, BrowserWindow, Menu, MenuItemConstructorOptions } from "electron";
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import childProcess from 'node:child_process';
import * as OWA from './owa';
import { AceBaseHandle } from './acebase';

export async function startupBackend() {
  let appGlobal = await createSharedAppObject();
  let jpc = new JPCWebSocket(appGlobal);
  await jpc.listen(kSecret, 5455, false);
}

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

async function createSharedAppObject() {
  return {
    kyCreate,
    optionsHTTP,
    postHTTP,
    streamHTTP,
    OWA,
    newOSNotification,
    isOSNotificationSupported,
    newTrayIcon,
    setBadgeCount,
    minimizeMainWindow,
    unminimizeMainWindow,
    shell,
    restartApp,
    setDarkMode,
    openMenu,
    getConfigDir,
    getFilesDir,
    openFileInExternalApp,
    createIMAPFlowConnection,
    sendMailNodemailer,
    verifyServerNodemailer,
    getMIMENodemailer,
    getSQLiteDatabase,
    getAceDatabase,
    newAdmZIP,
    newHTTPServer,
    readFile,
    writeFile,
    fs: fsPromises,
    directory,
    platform,
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
      // let resultKy = ky.post(input, options);
      let kyFetch = kyFunc[name](input, options);
      let resultType = options?.result || defaultOptions?.result;
      if (resultType &&
          ["text", "json", "formData", "blob", "arrayBuffer"].includes(resultType) &&
          ["get", "put", "post", "patch", "delete", "head"].includes(name)) {
        try {
          // console.log("Calling server", "input", input, "options", options, "defaults", defaultOptions);
          // let json = await resultKy.json();
          return await kyFetch[resultType]();
        } catch (ex) {
          throw new HTTPFetchError(ex);
        }
      } else {
        return kyFetch;
      }
    }
  }
  return kyObj;
}

export class HTTPFetchError extends Error {
  url: string;
  redirectedURL: string;
  code: string;
  httpCode: number;
  httpStatusText: string;
  httpMethod: string;
  hostname: string;

  constructor(ex: Error) {
    super(ex?.message ?? ex + "");
    let request = (ex as any).request;
    let response = (ex as any).response;
    let cause = (ex as any).cause
    if (request && response) {
      this.url = request.url;
      this.redirectedURL = response.url != request.url ? response.url : undefined;
      this.httpCode = response.status;
      this.httpStatusText = response.statusText;
      this.httpMethod = request.method;
      this.hostname = new URL(this.url).hostname;
      this.message = `HTTP ${this.httpMethod} <${this.url}>${this.redirectedURL ? ` redirected to <${this.redirectedURL}>` : ''} failed with ${this.httpCode} ${this.httpStatusText}`;
    } else if (cause) {
      this.code = cause.code;
      this.hostname = cause.hostname;
      if (cause.code == "ENOTFOUND") {
        this.message = `HTTP host ${cause.hostname} not found`;
      } else if (cause.code == "ECONNREFUSED") {
        this.message = `HTTP host ${cause.hostname} connection refused`;
      }
    }
  }
}

/**
 * Perform an OPTIONS request to check the ActiveSync version.
 * @param config ky config @see <https://github.com/sindresorhus/ky>
 */
async function optionsHTTP(url: string, config: any) {
  // Sadly OPTIONS is not directly supported by ky
  config.method = 'OPTIONS';
  let response = await ky(url, config);
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    WWWAuthenticate: response.headers.get("WWW-Authenticate"),
    MSASProtocolVersions: response.headers.get("MS-ASPRotocolVersions"),
    MSServerActiveSync: response.headers.get("MS-Server-ActiveSync"),
  };
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
    WWWAuthenticate: response.headers.get("WWW-Authenticate"),
  };
}

/**
 * @param config ky config @see <https://github.com/sindresorhus/ky>
 */
async function streamHTTP(url: string, data: any, config: any) {
  config.body = data;
  let response = await ky.post(url, config);
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: response.body.pipeThrough(new TextDecoderStream()),
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

function restartApp() {
  app.relaunch();
  app.quit();
}

function setDarkMode(mode: "system" | "light" | "dark") {
  if (!["system", "light", "dark"].includes(mode)) {
    throw new Error("Bad dark mode " + mode);
  }
  nativeTheme.themeSource = mode;
}

function openMenu(menuItems: MenuItemConstructorOptions[]): void {
  let menu = Menu.buildFromTemplate(menuItems);
  menu.popup();
}

function createIMAPFlowConnection(...args): ImapFlow {
  return new ImapFlow(...args);
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

function getSQLiteDatabase(filename: string, options: any): Database {
  if (!filename.startsWith("/")) {
    filename = path.join(getConfigDir(), filename);
  }
  return new Database(filename, options);
}

async function getAceDatabase(filename: string, options: any): Promise<AceBaseHandle> {
  let db = new AceBaseHandle();
  options ??= {};
  options.path ??= getConfigDir();
  await db.init(filename, options);
  return db;
}

function newAdmZIP(filepath: string) {
  return new Zip(filepath);
}

let mainWindow: BrowserWindow;

export function setMainWindow(mainWin: BrowserWindow) {
  mainWindow = mainWin;
}

function minimizeMainWindow() {
  mainWindow.minimize();
}

function unminimizeMainWindow() {
  mainWindow.restore();
}

function setBadgeCount(count: number) {
  app.setBadgeCount(count);
}

function platform(): string {
  return os.platform();
}

/** @param type
 *   e.g. "home", "appData" (`.config` and `%APPDATA%`), "userData" (app config)
 *   @see <https://www.electronjs.org/docs/latest/api/app#appgetpathname> */
function directory(type: string): string {
  return app.getPath(type as any);
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
  let platform = os.platform();
  let datadir = platform == "win32" || platform == "darwin"
    ? app.getPath("appData")
    : app.getPath("home");
  let dirname = platform == "win32" || platform == "darwin"
    ? kAppDir
    : "." + kAppDir.toLowerCase();
  let dir = path.join(datadir, dirname);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

let filesDirCreated = false;

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
 * Mac OS: /Users/USER/Library/Mustang
 */
function getFilesDir(): string {
  let platform = os.platform();
  let dirname =
    platform == "win32" ? kAppDir :
    platform == "darwin" ? "Library/" + kAppDir :
    "." + kAppDir.toLowerCase();
  let dir = path.join(os.homedir(), dirname);
  if (!filesDirCreated) {
    fs.mkdirSync(dir, { recursive: true });
    filesDirCreated = true;
  }
  return dir;
}
