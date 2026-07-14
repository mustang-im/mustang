import { appGlobal } from "../app";
import { webMail } from "../build";
import { Observable, notifyChangedProperty } from "./Observable";
import type { Database } from "../../../lib/rs-sqlite";
// #if [MOBILE]
import { Directory, Filesystem } from "@capacitor/filesystem";
// #endif

/** Tells us whether the computer is awake or in sleep mode.
 * When `isSleeping` switches back to false, the computer just woke up:
 * Our network connections may be dead, and e.g. new mail may have arrived. */
export class ComputerOn extends Observable {
  @notifyChangedProperty
  isSleeping = false;
}

/** Our app went into the background, or came back to the foreground */
class MobileComputerOn extends ComputerOn {
  constructor() {
    super();
    let capacitorApp = (globalThis as any).Capacitor?.Plugins?.App;
    capacitorApp?.addListener("pause", () => this.isSleeping = true);
    capacitorApp?.addListener("resume", () => this.isSleeping = false);
  }
}

/** The browser paused our page, and resumed it.
 * Page Lifecycle API, Chromium only. */
class WebMailComputerOn extends ComputerOn {
  constructor() {
    super();
    document.addEventListener("freeze", () => this.isSleeping = true);
    document.addEventListener("resume", () => this.isSleeping = false);
  }
}

let computerOn: ComputerOn;

/** Called by getStartObjects(), once `appGlobal.remoteApp` is connected */
export function getComputerOn(): ComputerOn {
  if (!computerOn) {
    if ((globalThis as any).Capacitor) {
      computerOn = new MobileComputerOn();
    } else if (webMail) {
      computerOn = new WebMailComputerOn();
    } else {
      // DesktopComputerOn, @see desktop/backend/backend.ts
      computerOn = appGlobal.remoteApp.computerOn;
    }
  }
  return computerOn;
}

let configDir: string;
/**
 * Get the user config directory on disk.
 *
 * The files in here are useful mostly to the app itself, in internal data formats,
 * and not really useful without the app.
 * Consequently, this is a directory that is usually *not* shown to the user,
 * but still accessible, if needed by technical people or for backups.
 *
 * - Linux: /home/USER/.mustang/
 * - Windows: C:\Users\USER\AppData\Mustang\
 * - Mac OS: /Users/USER/Library/Application Support/Mustang
 * - Android: /data/user/0/im.mustang.capa/files/
 */
export async function getConfigDir(): Promise<string> {
  // #if [MOBILE]
  if (!configDir) {
    let uriResult = await Filesystem.getUri({ path: "/", directory: Directory.Library });
    configDir = uriResult.uri.replace("file://", "");
  }
  // #else
  configDir ??= await appGlobal.remoteApp.getConfigDir();
  // #endif
  return configDir;
}

let filesDir: string;
/**
 * Get the directory on disk where we store the files that our user exchanged with others.
 * E.g. file sharing, email attachments, chat transfer files, and email backups.
 *
 * This should be a folder where the user can go to, but not right in the middle of his
 * personal documents and folders.
 *
 * TODO Change it
 * - Linux: /home/USER/.mustang/
 * - Windows: C:\Users\USER\AppData\Mustang\
 * - Mac OS: /Users/USER/Library/Mustang
 * - Android: /storage/emulated/0/Android/data/im.mustang.capa/files/
 */
export async function getFilesDir(): Promise<string> {
  // #if [MOBILE]
  if (!filesDir) {
    let uriResult = await Filesystem.getUri({ path: "/", directory: Directory.External });
    filesDir = uriResult.uri.replace("file://", "");
  }
  // #else
  filesDir ??= await appGlobal.remoteApp.getFilesDir();
  // #endif
  return filesDir;
}

/** @param filename Database file path, relative to the config dir.
 *   null, if `buffer` is given.
 * @param buffer The database file contents,
 *   which will be opened as an in-memory database. */
export async function getSQLiteDatabase(filename: string | null, options?: any, buffer?: Uint8Array): Promise<Database> {
  // #if [MOBILE]
  if (filename && !filename.startsWith("/")) {
    filename = await appGlobal.remoteApp.path.join(await getConfigDir(), filename);
  }
  // #endif
  return await appGlobal.remoteApp.getSQLiteDatabase(filename, options, buffer);
}
