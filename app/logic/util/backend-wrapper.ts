import { appGlobal } from "../app";
import type { Database } from "../../../lib/rs-sqlite";
// #if [MOBILE]
import { Directory, Filesystem } from "@capacitor/filesystem";
// #endif

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
  configDir ??= await appGlobal.remoteApp.getConfigDir();
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
  filesDir ??= await appGlobal.remoteApp.getFilesDir();
  return filesDir;
}

export async function getSQLiteDatabase(filename: string, options?: any): Promise<Database> {
  return await appGlobal.remoteApp.getSQLiteDatabase(filename, options);
}
