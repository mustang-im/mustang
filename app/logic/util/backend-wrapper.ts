// #if [MOBILE]
import { Directory, Filesystem } from "@capacitor/filesystem";
import { App } from "@capacitor/app";
// #else
import { appGlobal } from "../app";
// #endif

// #if [MOBILE]
let appID: string;
async function getAppID() {
  appID ??= (await App.getInfo()).id;
  return appID;
}
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
 * - Android: /data/user/USER/im.mustang.capa/files/
 */
export async function getConfigDir(): Promise<string> {
  // #if [MOBILE]
  let uriResult = await Filesystem.getUri({ path: "/", directory: Directory.Library });
  configDir ??= uriResult.uri.replace("file://", "");
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
 * - Android: /storage/emulated/USER/Documents/im.mustang.capa/
 */
export async function getFilesDir(): Promise<string> {
  // #if [MOBILE]
  let uriResult = await Filesystem.getUri({ path: `/${await getAppID()}`, directory: Directory.External });
  filesDir ??= uriResult.uri.replace("file://", "");
  // #else
  filesDir ??= await appGlobal.remoteApp.getFilesDir();
  // #endif
  return filesDir;
}
